import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Camera, Fingerprint, Loader2, XCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { startAuthentication } from '@simplewebauthn/browser';

interface BiometricAuthenticationProps {
  storedFaceDescriptor?: string;
  storedFingerprintId?: string;
  onSuccess: (method: 'face' | 'fingerprint', confidence?: number) => void;
  onFailure: (error: string) => void;
  onCancel: () => void;
}

export function BiometricAuthentication({
  storedFaceDescriptor,
  storedFingerprintId,
  onSuccess,
  onFailure,
  onCancel
}: BiometricAuthenticationProps) {
  const [currentMethod, setCurrentMethod] = useState<'choose' | 'face' | 'fingerprint'>('choose');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [authAttempts, setAuthAttempts] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const authIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_AUTH_ATTEMPTS = 3;
  const FACE_SIMILARITY_THRESHOLD = 0.6; // Adjust based on requirements

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setFaceModelsLoaded(true);
      } catch (err) {
        console.error('Error loading face-api models:', err);
      }
    };

    if (storedFaceDescriptor) {
      loadModels();
    }
  }, [storedFaceDescriptor]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch {
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (authIntervalRef.current) {
      clearInterval(authIntervalRef.current);
      authIntervalRef.current = null;
    }
  };

  const calculateFaceSimilarity = (descriptor1: Float32Array, descriptor2: Float32Array): number => {
    // Calculate Euclidean distance
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    const distance = Math.sqrt(sum);
    
    // Convert distance to similarity (0-1, where 1 is identical)
    return Math.max(0, 1 - distance);
  };

  const authenticateWithFace = async () => {
    if (!videoRef.current || !storedFaceDescriptor || !faceModelsLoaded) {
      onFailure('Face authentication not available');
      return;
    }

    setIsAuthenticating(true);
    setProgress(0);

    try {
      // Parse stored descriptor
      const storedDescriptor = new Float32Array(
        storedFaceDescriptor.split(',').map(Number)
      );

      setProgress(20);

      // Start continuous face detection
      let bestMatch = 0;
      let attempts = 0;
      const maxAttempts = 30; // 3 seconds at ~10fps

      authIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || attempts >= maxAttempts) {
          if (authIntervalRef.current) {
            clearInterval(authIntervalRef.current);
          }
          
          if (bestMatch >= FACE_SIMILARITY_THRESHOLD) {
            setProgress(100);
            setTimeout(() => {
              stopCamera();
              onSuccess('face', bestMatch);
            }, 500);
          } else {
            setAuthAttempts(prev => prev + 1);
            if (authAttempts + 1 >= MAX_AUTH_ATTEMPTS) {
              onFailure('Face authentication failed after maximum attempts');
            } else {
              setError(`Face not recognized. ${MAX_AUTH_ATTEMPTS - authAttempts - 1} attempts remaining.`);
              setIsAuthenticating(false);
            }
          }
          return;
        }

        try {
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceDescriptor();

          if (detection) {
            const similarity = calculateFaceSimilarity(storedDescriptor, detection.descriptor);
            bestMatch = Math.max(bestMatch, similarity);
            
            setProgress(Math.min(95, 30 + (attempts / maxAttempts) * 65));
            
            if (similarity >= FACE_SIMILARITY_THRESHOLD) {
              attempts = maxAttempts; // Trigger success
            }
          }
          
          attempts++;
        } catch {
          console.error('Face detection error');
        }
      }, 100);

    } catch {
      console.error('Face authentication error');
      onFailure('Face authentication failed');
      setIsAuthenticating(false);
    }
  };

  const authenticateWithFingerprint = async () => {
    if (!storedFingerprintId) {
      onFailure('Fingerprint authentication not available');
      return;
    }

    setIsAuthenticating(true);
    
    try {
      // Generate challenge from server (simplified for demo)
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const authResponse = await startAuthentication({
        optionsJSON: {
          challenge: btoa(String.fromCharCode.apply(null, Array.from(challenge) as number[])),
          allowCredentials: [{
            id: storedFingerprintId,
            type: 'public-key',
            transports: ['internal', 'hybrid'],
          }],
          userVerification: 'required',
          timeout: 60000,
        }
      });

      if (authResponse) {
        onSuccess('fingerprint', 1.0); // Perfect confidence for successful biometric auth
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      console.error('Fingerprint authentication error:', err);
      setAuthAttempts(prev => prev + 1);
      
      if (authAttempts + 1 >= MAX_AUTH_ATTEMPTS) {
        onFailure('Fingerprint authentication failed after maximum attempts');
      } else {
        setError(`Fingerprint not recognized. ${MAX_AUTH_ATTEMPTS - authAttempts - 1} attempts remaining.`);
        setIsAuthenticating(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (currentMethod === 'choose') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Secure Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Choose your authentication method:
          </p>
          
          <div className="space-y-3">
            {storedFaceDescriptor && (
              <Button
                className="w-full h-16 text-left"
                variant="outline"
                onClick={() => {
                  setCurrentMethod('face');
                  startCamera();
                }}
                disabled={!faceModelsLoaded}
              >
                <Camera className="w-6 h-6 mr-4" />
                <div>
                  <div className="font-medium">Face Recognition</div>
                  <div className="text-sm text-gray-500">Look at the camera</div>
                </div>
              </Button>
            )}

            {storedFingerprintId && (
              <Button
                className="w-full h-16 text-left"
                variant="outline"
                onClick={() => setCurrentMethod('fingerprint')}
              >
                <Fingerprint className="w-6 h-6 mr-4" />
                <div>
                  <div className="font-medium">Fingerprint</div>
                  <div className="text-sm text-gray-500">Touch sensor or use device biometrics</div>
                </div>
              </Button>
            )}

            {!storedFaceDescriptor && !storedFingerprintId && (
              <Alert>
                <AlertDescription>
                  No biometric data found. Please set up biometric authentication first.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex space-x-2 mt-6">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Use Manual Entry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentMethod === 'face') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Face Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg bg-black scale-x-[-1]"
            />
            
            {isAuthenticating && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <div>Authenticating...</div>
                  <Progress value={progress} className="w-32 mt-2" />
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-600">
            Look directly at the camera. Authentication will happen automatically.
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                stopCamera();
                setCurrentMethod('choose');
                setError('');
              }}
              className="flex-1"
              disabled={isAuthenticating}
            >
              Back
            </Button>
            <Button
              onClick={authenticateWithFace}
              disabled={isAuthenticating || !faceModelsLoaded}
              className="flex-1"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Start Authentication'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentMethod === 'fingerprint') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Fingerprint Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center py-8">
            <Fingerprint className="w-24 h-24 mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">
              {isAuthenticating ? 
                'Please complete the biometric prompt on your device.' : 
                'Touch the fingerprint sensor or use your device biometrics to authenticate.'
              }
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentMethod('choose');
                setError('');
              }}
              className="flex-1"
              disabled={isAuthenticating}
            >
              Back
            </Button>
            <Button
              onClick={authenticateWithFingerprint}
              disabled={isAuthenticating}
              className="flex-1"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Authenticate'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}