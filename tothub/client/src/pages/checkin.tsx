import { useState, useRef } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BiometricAuthentication } from "@/components/biometric-authentication";
import { BiometricEnrollment } from "@/components/biometric-enrollment";
import { 
  LogIn, 
  LogOut, 
  Search, 
  Clock, 
  Camera, 
  Fingerprint, 
  Users, 
  Smile, 
  Frown, 
  Meh, 
  Shield,
  Settings,
  MessageSquare,
  Mail
} from "lucide-react";
import { TeacherNotesPanel } from "@/components/teacher-notes";

interface CheckInData {
  childId: string;
  checkInBy: string;
  room: string;
  notes?: string;
  moodRating?: number;
  checkInPhotoUrl?: string;
  biometricMethod?: string;
  biometricConfidence?: string;
}

interface CheckOutData {
  attendanceId: string;
  checkOutBy: string;
  notes?: string;
  checkOutPhotoUrl?: string;
  activitiesCompleted?: string[];
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  room: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

interface AttendanceRecord {
  child: Child;
  id: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export default function CheckIn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'manual' | 'biometric' | 'photo'>('manual');
  const [useBiometric, setUseBiometric] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [checkInForm, setCheckInForm] = useState<CheckInData>({
    childId: "",
    checkInBy: "",
    room: "",
    notes: "",
    moodRating: undefined,
  });

  const [checkOutForm, setCheckOutForm] = useState<CheckOutData>({
    attendanceId: "",
    checkOutBy: "",
    notes: "",
    activitiesCompleted: [],
  });

  // Fetch data
  const { data: childrenResponse, isLoading: childrenLoading } = useQuery<Child[] | PaginatedResponse<Child>>({
    queryKey: ["/api/children"],
  });

  const { data: presentChildren = [], isLoading: presentLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/present"],
  });

  const { data: staffResponse } = useQuery<Staff[] | PaginatedResponse<Staff>>({
    queryKey: ["/api/staff"],
  });

  // Handle paginated responses
  const children = Array.isArray(childrenResponse) ? childrenResponse : (childrenResponse as PaginatedResponse<Child>)?.data || [];
  const staff = Array.isArray(staffResponse) ? staffResponse : (staffResponse as PaginatedResponse<Staff>)?.data || [];

  // Filter children based on search
  const filteredPresentChildren = (presentChildren as any[]).filter((attendance: any) =>
    `${attendance.child.firstName} ${attendance.child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.child.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const absentChildren = (children as any[]).filter((child: any) =>
    !(presentChildren as any[]).some((attendance: any) => attendance.child.id === child.id) &&
    `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutations
  const checkInMutation = useMutation({
    mutationFn: async (data: CheckInData) => {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          checkInTime: new Date(),
          date: new Date(),
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/present"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setCheckInModalOpen(false);
      setCheckInForm({
        childId: "",
        checkInBy: "",
        room: "",
        notes: "",
        moodRating: undefined,
      });
      setCapturedPhoto(null);
      setUseBiometric(false);
      toast({ title: "Check-in successful" });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (data: CheckOutData) => {
      const response = await fetch(`/api/attendance/${data.attendanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkOutTime: new Date(),
          checkOutBy: data.checkOutBy,
          notes: data.notes,
          checkOutPhotoUrl: data.checkOutPhotoUrl,
          activitiesCompleted: data.activitiesCompleted,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/present"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setCheckOutModalOpen(false);
      setCheckOutForm({
        attendanceId: "",
        checkOutBy: "",
        notes: "",
        activitiesCompleted: [],
      });
      setCapturedPhoto(null);
      toast({ title: "Check-out successful" });
    },
  });

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const photoDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedPhoto(photoDataUrl);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleCheckIn = (child: any) => {
    setSelectedChild(child);
    setCheckInForm(prev => ({ ...prev, childId: child.id }));
    setCheckInModalOpen(true);
  };

  const handleCheckOut = (attendance: any) => {
    setSelectedAttendance(attendance);
    setCheckOutForm(prev => ({ ...prev, attendanceId: attendance.id }));
    setCheckOutModalOpen(true);
  };

  const submitCheckIn = () => {
    if (!checkInForm.childId || !checkInForm.checkInBy) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      ...checkInForm,
      checkInPhotoUrl: capturedPhoto || undefined,
    };

    checkInMutation.mutate(data);
  };

  const submitCheckOut = () => {
    if (!checkOutForm.checkOutBy) {
      toast({
        title: "Missing Information", 
        description: "Please enter who is checking out the child.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      ...checkOutForm,
      checkOutPhotoUrl: capturedPhoto || undefined,
    };

    checkOutMutation.mutate(data);
  };

  const handleBiometricSuccess = (method: 'face' | 'fingerprint', confidence?: number) => {
    setCheckInForm(prev => ({
      ...prev,
      biometricMethod: method,
      biometricConfidence: confidence?.toString(),
    }));
    setAuthMethod('manual'); // Continue with manual form after biometric auth
    toast({
      title: "Biometric Authentication Successful",
      description: `Authenticated using ${method} recognition${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`,
    });
  };

  const sendAllDailyReports = async () => {
    try {
      const response = await apiRequest('/api/daily-reports/send-all', 'POST', { date: new Date() });
      toast({
        title: "Daily Reports Started",
        description: "Daily report emails are being sent to parents of all present children.",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Reports",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleBiometricFailure = (error: string) => {
    toast({
      title: "Biometric Authentication Failed",
      description: error,
      variant: "destructive",
    });
    setAuthMethod('manual'); // Fall back to manual entry
  };

  const getMoodIcon = (rating?: number) => {
    if (!rating) return <Meh className="w-4 h-4" />;
    if (rating >= 4) return <Smile className="w-4 h-4 text-green-500" />;
    if (rating <= 2) return <Frown className="w-4 h-4 text-red-500" />;
    return <Meh className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <>
      <Header title="Check-In/Out" subtitle="Unified attendance management with optional biometric security" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search children..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <div className="text-sm text-gray-600">
              <Clock className="inline w-4 h-4 mr-1" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => sendAllDailyReports()}>
              <Mail className="w-4 h-4 mr-2" />
              Send Daily Reports
            </Button>
            <Button onClick={() => setCheckInModalOpen(true)}>
              <LogIn className="w-4 h-4 mr-2" />
              New Check-In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Currently Present */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Currently Present ({filteredPresentChildren.length})</span>
                <Badge variant="secondary">{filteredPresentChildren.length} children</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPresentChildren.map((attendance: any) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">
                          {attendance.child.firstName[0]}{attendance.child.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {attendance.child.firstName} {attendance.child.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {attendance.child.room} • Checked in at{" "}
                          {new Date(attendance.checkInTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {attendance.biometricMethod && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Shield className="w-3 h-3" />
                            Verified via {attendance.biometricMethod}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckOut(attendance)}
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Check Out
                    </Button>
                  </div>
                ))}
                {filteredPresentChildren.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No children currently present
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available to Check In */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available to Check In ({absentChildren.length})</span>
                <Badge variant="outline">{absentChildren.length} children</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {absentChildren.map((child: any) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {child.firstName[0]}{child.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {child.firstName} {child.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {child.room} • {child.ageGroup.replace('_', ' ')}
                        </div>
                        {child.biometricEnabled && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Fingerprint className="w-3 h-3" />
                            Biometric enrolled
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleCheckIn(child)}
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Check In
                    </Button>
                  </div>
                ))}
                {absentChildren.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    All children are checked in
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check-In Modal */}
        <Dialog open={checkInModalOpen} onOpenChange={setCheckInModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Check In {selectedChild?.firstName} {selectedChild?.lastName}
              </DialogTitle>
            </DialogHeader>

            <Tabs value={authMethod} onValueChange={setAuthMethod as any}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="biometric" disabled={!selectedChild?.biometricEnabled}>
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Biometric
                </TabsTrigger>
                <TabsTrigger value="photo">
                  <Camera className="w-4 h-4 mr-2" />
                  Photo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="biometric" className="space-y-4">
                {selectedChild?.biometricEnabled ? (
                  <BiometricAuthentication
                    userId={selectedChild.id}
                    userType="child"
                    onSuccess={handleBiometricSuccess}
                    onFailure={handleBiometricFailure}
                    onCancel={() => setAuthMethod('manual')}
                  />
                ) : (
                  <Alert>
                    <AlertDescription>
                      Biometric authentication is not set up for this child.
                      <Button
                        variant="link"
                        className="p-0 ml-2"
                        onClick={() => setAuthMethod('manual')}
                      >
                        Use manual entry instead
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="photo" className="space-y-4">
                <div className="space-y-4">
                  <Label>Check-in Photo</Label>
                  {!cameraActive && !capturedPhoto && (
                    <Button onClick={startCamera} variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  )}
                  
                  {cameraActive && (
                    <div className="space-y-2">
                      <video ref={videoRef} autoPlay className="w-full max-w-md rounded" />
                      <Button onClick={capturePhoto}>Capture Photo</Button>
                    </div>
                  )}
                  
                  {capturedPhoto && (
                    <div className="space-y-2">
                      <img src={capturedPhoto} alt="Captured" className="w-full max-w-md rounded" />
                      <Button 
                        onClick={() => {
                          setCapturedPhoto(null);
                          startCamera();
                        }} 
                        variant="outline"
                      >
                        Retake Photo
                      </Button>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkInBy">Checked in by</Label>
                    <Input
                      id="checkInBy"
                      value={checkInForm.checkInBy}
                      onChange={(e) => setCheckInForm(prev => ({ ...prev, checkInBy: e.target.value }))}
                      placeholder="Staff member name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room">Room</Label>
                    <Select value={checkInForm.room} onValueChange={(value) => setCheckInForm(prev => ({ ...prev, room: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Infant Room A">Infant Room A</SelectItem>
                        <SelectItem value="Infant Room B">Infant Room B</SelectItem>
                        <SelectItem value="Toddler Room A">Toddler Room A</SelectItem>
                        <SelectItem value="Toddler Room B">Toddler Room B</SelectItem>
                        <SelectItem value="Preschool Room A">Preschool Room A</SelectItem>
                        <SelectItem value="School Age Room">School Age Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="moodRating">Mood Rating (1-5)</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        variant={checkInForm.moodRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCheckInForm(prev => ({ ...prev, moodRating: rating }))}
                      >
                        {rating === 1 && <Frown className="w-4 h-4" />}
                        {rating === 2 && <Frown className="w-4 h-4" />}
                        {rating === 3 && <Meh className="w-4 h-4" />}
                        {rating === 4 && <Smile className="w-4 h-4" />}
                        {rating === 5 && <Smile className="w-4 h-4" />}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={checkInForm.notes}
                    onChange={(e) => setCheckInForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any notes about the child's arrival..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCheckInModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitCheckIn} disabled={checkInMutation.isPending}>
                    {checkInMutation.isPending ? "Checking In..." : "Check In"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Check-Out Modal */}
        <Dialog open={checkOutModalOpen} onOpenChange={setCheckOutModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Check Out {selectedAttendance?.child?.firstName} {selectedAttendance?.child?.lastName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="checkOutBy">Checked out by</Label>
                <Input
                  id="checkOutBy"
                  value={checkOutForm.checkOutBy}
                  onChange={(e) => setCheckOutForm(prev => ({ ...prev, checkOutBy: e.target.value }))}
                  placeholder="Parent/guardian name"
                />
              </div>

              <div>
                <Label htmlFor="checkOutNotes">Notes (optional)</Label>
                <Textarea
                  id="checkOutNotes"
                  value={checkOutForm.notes}
                  onChange={(e) => setCheckOutForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any notes about pickup..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCheckOutModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitCheckOut} disabled={checkOutMutation.isPending}>
                  {checkOutMutation.isPending ? "Checking Out..." : "Check Out"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}