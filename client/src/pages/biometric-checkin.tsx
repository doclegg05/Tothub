import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { BiometricAuthentication } from '@/components/biometric-authentication';
import { BiometricEnrollment } from '@/components/biometric-enrollment';
import { 
  User, 
  UserCheck, 
  Clock, 
  Camera, 
  Fingerprint, 
  Shield, 
  Plus,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  biometricEnabled?: boolean;
  faceDescriptor?: string;
  fingerprintHash?: string;
}

export default function BiometricCheckIn() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [checkInMode, setCheckInMode] = useState<'in' | 'out'>('in');
  const [authMode, setAuthMode] = useState<'biometric' | 'manual' | 'enroll'>('biometric');
  const [manualName, setManualName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: children = [] } = useQuery({
    queryKey: ['/api/children'],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['/api/staff'],
  });

  const { data: presentChildren = [] } = useQuery({
    queryKey: ['/api/attendance/present'],
  });

  const checkInMutation = useMutation({
    mutationFn: async (data: {
      childId: string;
      checkInBy: string;
      biometricMethod?: string;
      biometricConfidence?: string;
    }) => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          checkInTime: new Date(),
          room: 'Main Room', // This should be selected by user
          date: new Date(),
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/present'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Check-in successful",
        description: `${selectedPerson?.firstName} ${selectedPerson?.lastName} has been checked in.`,
      });
      setSelectedPerson(null);
      setAuthMode('biometric');
      setManualName('');
    },
    onError: (error) => {
      toast({
        title: "Check-in failed",
        description: "Please try again or use manual entry.",
        variant: "destructive",
      });
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async (data: {
      attendanceId: string;
      checkOutBy: string;
      biometricMethod?: string;
      biometricConfidence?: string;
    }) => {
      const response = await fetch(`/api/attendance/${data.attendanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkOutTime: new Date(),
          checkOutBy: data.checkOutBy,
          biometricMethod: data.biometricMethod,
          biometricConfidence: data.biometricConfidence,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/present'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Check-out successful",
        description: `${selectedPerson?.firstName} ${selectedPerson?.lastName} has been checked out.`,
      });
      setSelectedPerson(null);
      setAuthMode('biometric');
      setManualName('');
    },
    onError: (error) => {
      toast({
        title: "Check-out failed",
        description: "Please try again or use manual entry.",
        variant: "destructive",
      });
    }
  });

  const enrollBiometricMutation = useMutation({
    mutationFn: async (data: {
      userType: 'child' | 'staff';
      userId: string;
      faceDescriptor?: string;
      fingerprintCredentialId?: string;
    }) => {
      const response = await fetch(`/api/biometric/enroll/${data.userType}/${data.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faceDescriptor: data.faceDescriptor,
          fingerprintCredentialId: data.fingerprintCredentialId,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Biometric enrollment successful",
        description: `${selectedPerson?.firstName} ${selectedPerson?.lastName} can now use biometric check-in.`,
      });
      setAuthMode('biometric');
    },
    onError: (error) => {
      toast({
        title: "Enrollment failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const allPeople = [
    ...(children as any[]).map((child: any) => ({ ...child, type: 'child' })),
    ...(staff as any[]).map((member: any) => ({ ...member, type: 'staff' }))
  ];

  const filteredPeople = allPeople.filter(person =>
    `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPresentChild = (childId: string) => {
    return (presentChildren as any[]).find((attendance: any) => attendance.childId === childId);
  };

  const handleBiometricSuccess = (method: 'face' | 'fingerprint', confidence?: number) => {
    if (!selectedPerson) return;

    const isChild = 'dateOfBirth' in selectedPerson;
    const authorizer = `Biometric ${method} (${(confidence || 0 * 100).toFixed(1)}% confidence)`;

    if (checkInMode === 'in') {
      checkInMutation.mutate({
        childId: selectedPerson.id,
        checkInBy: authorizer,
        biometricMethod: method,
        biometricConfidence: confidence?.toString(),
      });
    } else {
      const attendance = getPresentChild(selectedPerson.id);
      if (attendance) {
        checkOutMutation.mutate({
          attendanceId: attendance.id,
          checkOutBy: authorizer,
          biometricMethod: method,
          biometricConfidence: confidence?.toString(),
        });
      }
    }
  };

  const handleBiometricFailure = (error: string) => {
    toast({
      title: "Biometric authentication failed",
      description: error,
      variant: "destructive",
    });
    setAuthMode('manual');
  };

  const handleManualCheckIn = () => {
    if (!selectedPerson || !manualName.trim()) return;

    if (checkInMode === 'in') {
      checkInMutation.mutate({
        childId: selectedPerson.id,
        checkInBy: manualName.trim(),
      });
    } else {
      const attendance = getPresentChild(selectedPerson.id);
      if (attendance) {
        checkOutMutation.mutate({
          attendanceId: attendance.id,
          checkOutBy: manualName.trim(),
        });
      }
    }
  };

  const handleEnrollmentComplete = (data: { faceDescriptor?: string; fingerprintCredentialId?: string }) => {
    if (!selectedPerson) return;

    const isChild = 'dateOfBirth' in selectedPerson;
    enrollBiometricMutation.mutate({
      userType: isChild ? 'child' : 'staff',
      userId: selectedPerson.id,
      ...data,
    });
  };

  if (authMode === 'biometric' && selectedPerson) {
    const isPresent = getPresentChild(selectedPerson.id);
    const currentMode = isPresent ? 'out' : 'in';
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Biometric Check-{currentMode === 'in' ? 'In' : 'Out'}
            </h1>
            <p className="text-gray-600">
              {selectedPerson.firstName} {selectedPerson.lastName}
            </p>
          </div>

          <BiometricAuthentication
            userId={selectedPerson.id}
            userType={'dateOfBirth' in selectedPerson ? 'child' : 'staff'}
            storedFaceDescriptor={selectedPerson.faceDescriptor}
            storedFingerprintId={selectedPerson.fingerprintHash}
            onSuccess={handleBiometricSuccess}
            onFailure={handleBiometricFailure}
            onCancel={() => {
              setSelectedPerson(null);
              setAuthMode('biometric');
            }}
          />
        </div>
      </div>
    );
  }

  if (authMode === 'enroll' && selectedPerson) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Biometric Enrollment
            </h1>
            <p className="text-gray-600">
              Setting up biometric authentication for {selectedPerson.firstName} {selectedPerson.lastName}
            </p>
          </div>

          <BiometricEnrollment
            userId={selectedPerson.id}
            userType={'dateOfBirth' in selectedPerson ? 'child' : 'staff'}
            onComplete={handleEnrollmentComplete}
            onCancel={() => {
              setSelectedPerson(null);
              setAuthMode('biometric');
            }}
          />
        </div>
      </div>
    );
  }

  if (authMode === 'manual' && selectedPerson) {
    const isPresent = getPresentChild(selectedPerson.id);
    const currentMode = isPresent ? 'out' : 'in';

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Manual Check-{currentMode === 'in' ? 'In' : 'Out'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  {selectedPerson.firstName} {selectedPerson.lastName}
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentMode === 'in' ? 'Authorized by (Parent/Guardian)' : 'Picked up by'}
                </label>
                <Input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPerson(null);
                    setAuthMode('biometric');
                    setManualName('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleManualCheckIn}
                  disabled={!manualName.trim() || checkInMutation.isPending || checkOutMutation.isPending}
                  className="flex-1"
                >
                  {checkInMutation.isPending || checkOutMutation.isPending ? 'Processing...' : `Check ${currentMode}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Biometric Check-In System
          </h1>
          <p className="text-gray-600">
            Select a person to check in or out using biometric authentication
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => {
            const isChild = 'dateOfBirth' in person;
            const isPresent = isChild ? getPresentChild(person.id) : false;
            const hasBiometric = person.biometricEnabled;

            return (
              <Card
                key={person.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPerson(person)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {person.firstName} {person.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {isChild ? 'Child' : 'Staff'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1">
                      {isPresent ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Present
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          Absent
                        </Badge>
                      )}
                      
                      {hasBiometric && (
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">Biometric</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {hasBiometric ? (
                        <>
                          {person.faceDescriptor && <Camera className="w-4 h-4" />}
                          {person.fingerprintHash && <Fingerprint className="w-4 h-4" />}
                          <span>Ready for biometric auth</span>
                        </>
                      ) : (
                        <span className="text-amber-600">No biometric data</span>
                      )}
                    </div>

                    {!hasBiometric && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPerson(person);
                          setAuthMode('enroll');
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Setup
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPeople.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No people found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms.' : 'No children or staff members available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}