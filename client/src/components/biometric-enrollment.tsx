import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Camera, Fingerprint, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { startRegistration } from '@simplewebauthn/browser';

interface BiometricEnrollmentProps {
  userId: string;
  userType: 'child' | 'staff';
  onComplete: (data: { faceDescriptor?: string; fingerprintCredentialId?: string }) => void;
  onCancel: () => void;
}

export function BiometricEnrollment({ userId, userType, onComplete, onCancel }: BiometricEnrollmentProps) {
  const [currentStep, setCurrentStep] = useState<'choose' | 'face' | 'fingerprint' | 'complete'>('choose');
  const [isLoading, setIsLoading] = useState(false);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<{
    faceDescriptor?: string;
    fingerprintCredentialId?: string;
  }>({});
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load face-api.js models on component mount
  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      try {
        const MODEL_URL = '/models'; // You'll need to add face-api.js models to public/models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setFaceModelsLoaded(true);
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Failed to load face recognition models. Using fallback method.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFaceDescriptor = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsLoading(true);
    setProgress(10);

    try {
      if (!faceModelsLoaded) {
        // Fallback: capture image without face recognition
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setEnrollmentData(prev => ({ ...prev, faceDescriptor: imageData }));
        setProgress(100);
        
        setTimeout(() => {
          setCurrentStep('complete');
          setIsLoading(false);
        }, 1000);
        return;
      }

      setProgress(30);
      
      // Detect face in video
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      setProgress(60);

      if (!detection) {
        setError('No face detected. Please position your face clearly in the camera view.');
        setIsLoading(false);
        return;
      }

      setProgress(80);

      // Convert descriptor to string for storage
      const descriptorString = Array.from(detection.descriptor).join(',');
      setEnrollmentData(prev => ({ ...prev, faceDescriptor: descriptorString }));
      
      setProgress(100);
      
      setTimeout(() => {
        setCurrentStep('complete');
        setIsLoading(false);
      }, 1000);

    } catch (err) {
      console.error('Face capture error:', err);
      setError('Failed to capture face data. Please try again.');
      setIsLoading(false);
    }
  };

  const enrollFingerprint = async () => {
    setIsLoading(true);
    try {
      // Generate challenge from server (simplified for demo)
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const registrationResponse = await startRegistration({
        optionsJSON: {
          rp: {
            name: 'KidSign Pro',
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: `${userType}-${userId}`,
            displayName: `${userType} ${userId}`,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          challenge: btoa(String.fromCharCode.apply(null, Array.from(challenge) as number[])),
          timeout: 60000,
          attestation: 'direct',
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
        }
      });

      if (registrationResponse) {
        setEnrollmentData(prev => ({ 
          ...prev, 
          fingerprintCredentialId: registrationResponse.id 
        }));
        setCurrentStep('complete');
      }
    } catch (err) {
      console.error('Fingerprint enrollment error:', err);
      setError('Fingerprint enrollment failed. Please try again or use face recognition.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    stopCamera();
    onComplete(enrollmentData);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (currentStep === 'choose') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Biometric Enrollment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Choose how you'd like to set up secure check-in:
          </p>
          
          <div className="space-y-3">
            <Button
              className="w-full h-16 text-left"
              variant="outline"
              onClick={() => {
                setCurrentStep('face');
                startCamera();
              }}
              disabled={isLoading}
            >
              <Camera className="w-6 h-6 mr-4" />
              <div>
                <div className="font-medium">Face Recognition</div>
                <div className="text-sm text-gray-500">Quick and contactless</div>
              </div>
            </Button>

            <Button
              className="w-full h-16 text-left"
              variant="outline"
              onClick={() => setCurrentStep('fingerprint')}
              disabled={isLoading}
            >
              <Fingerprint className="w-6 h-6 mr-4" />
              <div>
                <div className="font-medium">Fingerprint</div>
                <div className="text-sm text-gray-500">Most secure option</div>
              </div>
            </Button>
          </div>

          <div className="flex space-x-2 mt-6">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'face') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Face Recognition Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg bg-black"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <div>Analyzing face...</div>
                  <Progress value={progress} className="w-32 mt-2" />
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-600">
            Position your face clearly in the camera view and click capture when ready.
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                stopCamera();
                setCurrentStep('choose');
                setError('');
              }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={captureFaceDescriptor}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Capturing...
                </>
              ) : (
                'Capture Face'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'fingerprint') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Fingerprint Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center py-8">
            <Fingerprint className="w-24 h-24 mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">
              Follow your device's prompts to register your fingerprint or use your device's biometric authentication.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep('choose');
                setError('');
              }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={enrollFingerprint}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Start Enrollment'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Enrollment Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <CheckCircle className="w-24 h-24 mx-auto text-green-600 mb-4" />
            <p className="text-gray-600">
              Your biometric data has been successfully enrolled. You can now use it for secure check-ins and check-outs.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            {enrollmentData.faceDescriptor && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Face recognition enrolled
              </div>
            )}
            {enrollmentData.fingerprintCredentialId && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Fingerprint enrolled
              </div>
            )}
          </div>

          <Button onClick={handleComplete} className="w-full">
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}