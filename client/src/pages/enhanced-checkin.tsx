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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, LogIn, LogOut, Clock, Users, Smile, Frown, Meh, Star, Heart } from "lucide-react";

interface CheckInData {
  childId: string;
  checkInBy: string;
  room: string;
  notes?: string;
  moodRating?: number;
  checkInPhotoUrl?: string;
}

interface CheckOutData {
  attendanceId: string;
  checkOutBy: string;
  notes?: string;
  checkOutPhotoUrl?: string;
  activitiesCompleted?: string[];
}

export default function EnhancedCheckIn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
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
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["/api/children"],
  });

  const { data: presentChildren = [], isLoading: presentLoading } = useQuery({
    queryKey: ["/api/attendance/present"],
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
        description: "Unable to access camera. Photo capture disabled.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoData);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Mutations
  const checkInMutation = useMutation({
    mutationFn: (data: CheckInData) => apiRequest("POST", "/api/attendance/checkin", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/present"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Child checked in successfully!",
      });
      resetCheckInForm();
      setCheckInModalOpen(false);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: CheckOutData) => apiRequest("POST", "/api/attendance/checkout", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/present"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Child checked out successfully!",
      });
      resetCheckOutForm();
      setCheckOutModalOpen(false);
    },
  });

  const resetCheckInForm = () => {
    setCheckInForm({
      childId: "",
      checkInBy: "",
      room: "",
      notes: "",
      moodRating: undefined,
    });
    setCapturedPhoto(null);
    setCameraActive(false);
  };

  const resetCheckOutForm = () => {
    setCheckOutForm({
      attendanceId: "",
      checkOutBy: "",
      notes: "",
      activitiesCompleted: [],
    });
    setCapturedPhoto(null);
    setCameraActive(false);
    setSelectedAttendance(null);
  };

  const handleCheckIn = () => {
    const data = {
      ...checkInForm,
      checkInPhotoUrl: capturedPhoto || undefined,
    };
    checkInMutation.mutate(data);
  };

  const handleCheckOut = () => {
    const data = {
      ...checkOutForm,
      checkOutPhotoUrl: capturedPhoto || undefined,
    };
    checkOutMutation.mutate(data);
  };

  const openCheckOutModal = (attendance: any) => {
    setSelectedAttendance(attendance);
    setCheckOutForm({
      attendanceId: attendance.id,
      checkOutBy: "",
      notes: "",
      activitiesCompleted: [],
    });
    setCheckOutModalOpen(true);
  };

  const getMoodIcon = (rating: number) => {
    switch (rating) {
      case 1: return <Frown className="w-5 h-5 text-red-500" />;
      case 2: return <Meh className="w-5 h-5 text-orange-500" />;
      case 3: return <Smile className="w-5 h-5 text-yellow-500" />;
      case 4: return <Smile className="w-5 h-5 text-green-500" />;
      case 5: return <Heart className="w-5 h-5 text-pink-500" />;
      default: return <Meh className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <>
      <Header 
        title="Enhanced Check-In/Out" 
        subtitle="Digital attendance with photo capture and daily notes"
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Dialog open={checkInModalOpen} onOpenChange={setCheckInModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={resetCheckInForm}>
                <LogIn className="w-5 h-5 mr-2" />
                New Check-In
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Check-In Child</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Child Selection */}
                <div>
                  <Label htmlFor="childId">Select Child</Label>
                  <Select 
                    value={checkInForm.childId} 
                    onValueChange={(value) => {
                      setCheckInForm({...checkInForm, childId: value});
                      const child = (children as any[]).find(c => c.id === value);
                      if (child) {
                        setCheckInForm(prev => ({...prev, room: child.room}));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {(children as any[]).map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.firstName} {child.lastName} - {child.room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Parent/Guardian Name */}
                <div>
                  <Label htmlFor="checkInBy">Checked In By</Label>
                  <Input
                    id="checkInBy"
                    value={checkInForm.checkInBy}
                    onChange={(e) => setCheckInForm({...checkInForm, checkInBy: e.target.value})}
                    placeholder="Parent/Guardian name"
                  />
                </div>

                {/* Mood Rating */}
                <div>
                  <Label>Child's Mood</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={checkInForm.moodRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCheckInForm({...checkInForm, moodRating: rating})}
                      >
                        {getMoodIcon(rating)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Photo Capture */}
                <div>
                  <Label>Check-In Photo</Label>
                  {!capturedPhoto && !cameraActive && (
                    <Button variant="outline" onClick={startCamera} className="w-full mt-2">
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  )}
                  
                  {cameraActive && (
                    <div className="mt-2 space-y-2">
                      <video ref={videoRef} autoPlay className="w-full rounded-lg" />
                      <div className="flex gap-2">
                        <Button onClick={capturePhoto}>Capture</Button>
                        <Button variant="outline" onClick={() => {
                          setCameraActive(false);
                          const stream = videoRef.current?.srcObject as MediaStream;
                          stream?.getTracks().forEach(track => track.stop());
                        }}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {capturedPhoto && (
                    <div className="mt-2 space-y-2">
                      <img src={capturedPhoto} alt="Check-in photo" className="w-full rounded-lg max-h-48 object-cover" />
                      <Button variant="outline" onClick={retakePhoto} size="sm">
                        Retake Photo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={checkInForm.notes}
                    onChange={(e) => setCheckInForm({...checkInForm, notes: e.target.value})}
                    placeholder="Any special instructions or notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleCheckIn}
                    disabled={!checkInForm.childId || !checkInForm.checkInBy || checkInMutation.isPending}
                    className="flex-1"
                  >
                    {checkInMutation.isPending ? "Checking In..." : "Check In"}
                  </Button>
                  <Button variant="outline" onClick={() => setCheckInModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Currently Present Children */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Currently Present ({(presentChildren as any[]).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {presentLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : (presentChildren as any[]).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No children currently checked in
              </div>
            ) : (
              <div className="space-y-4">
                {(presentChildren as any[]).map((attendance: any) => (
                  <div key={attendance.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {attendance.checkInPhotoUrl ? (
                          <img src={attendance.checkInPhotoUrl} alt="Check-in" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-primary font-bold text-lg">
                            {attendance.child.firstName[0]}{attendance.child.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {attendance.child.firstName} {attendance.child.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Room: {attendance.child.room}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Checked in at {new Date(attendance.checkInTime).toLocaleTimeString()}
                          </span>
                          {attendance.moodRating && (
                            <div className="flex items-center gap-1">
                              {getMoodIcon(attendance.moodRating)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => openCheckOutModal(attendance)}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Check Out
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Check-Out Modal */}
      <Dialog open={checkOutModalOpen} onOpenChange={setCheckOutModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Check Out: {selectedAttendance?.child.firstName} {selectedAttendance?.child.lastName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="checkOutBy">Checked Out By</Label>
              <Input
                id="checkOutBy"
                value={checkOutForm.checkOutBy}
                onChange={(e) => setCheckOutForm({...checkOutForm, checkOutBy: e.target.value})}
                placeholder="Parent/Guardian name"
              />
            </div>

            {/* Photo Capture for Check-Out */}
            <div>
              <Label>Check-Out Photo</Label>
              {!capturedPhoto && !cameraActive && (
                <Button variant="outline" onClick={startCamera} className="w-full mt-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              )}
              
              {cameraActive && (
                <div className="mt-2 space-y-2">
                  <video ref={videoRef} autoPlay className="w-full rounded-lg" />
                  <div className="flex gap-2">
                    <Button onClick={capturePhoto}>Capture</Button>
                    <Button variant="outline" onClick={() => {
                      setCameraActive(false);
                      const stream = videoRef.current?.srcObject as MediaStream;
                      stream?.getTracks().forEach(track => track.stop());
                    }}>Cancel</Button>
                  </div>
                </div>
              )}

              {capturedPhoto && (
                <div className="mt-2 space-y-2">
                  <img src={capturedPhoto} alt="Check-out photo" className="w-full rounded-lg max-h-48 object-cover" />
                  <Button variant="outline" onClick={retakePhoto} size="sm">
                    Retake Photo
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Daily Summary Notes</Label>
              <Textarea
                id="notes"
                value={checkOutForm.notes}
                onChange={(e) => setCheckOutForm({...checkOutForm, notes: e.target.value})}
                placeholder="How was the child's day? Any activities, meals, naps, or behavior notes..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleCheckOut}
                disabled={!checkOutForm.checkOutBy || checkOutMutation.isPending}
                className="flex-1"
              >
                {checkOutMutation.isPending ? "Checking Out..." : "Check Out"}
              </Button>
              <Button variant="outline" onClick={() => setCheckOutModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}