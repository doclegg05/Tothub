import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Save, UserX, Calendar, AlertTriangle, Heart, Shield, FileText, Clock } from "lucide-react";
import { format, differenceInYears } from "date-fns";

export default function ChildDetails() {
  const [, params] = useRoute("/children/:id");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [unenrollDialog, setUnenrollDialog] = useState(false);
  const [unenrollReason, setUnenrollReason] = useState("");
  
  const childId = params?.id;

  // Fetch child details
  const { data: child, isLoading, error } = useQuery({
    queryKey: ["child", childId],
    queryFn: async () => {
      const res = await fetch(`/api/children/${childId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
    enabled: isAuthenticated && !!childId,
  });

  // Fetch age-out setting
  const { data: ageOutSetting } = useQuery({
    queryKey: ["settings", "age_out_limit"],
    queryFn: async () => {
      const res = await fetch("/api/settings/age_out_limit", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) return { value: "14" }; // Default to 14
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const [formData, setFormData] = useState(child || {});

  useEffect(() => {
    if (child) {
      setFormData(child);
    }
  }, [child]);

  const updateChildMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/children/${childId}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Child profile updated successfully!",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["child", childId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update child profile",
        variant: "destructive",
      });
    },
  });

  const unenrollChildMutation = useMutation({
    mutationFn: (reason: string) => apiRequest("PUT", `/api/children/${childId}`, {
      enrollmentStatus: "unenrolled",
      unenrollmentDate: new Date(),
      unenrollmentReason: reason,
      isActive: false,
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Child has been unenrolled",
      });
      setUnenrollDialog(false);
      queryClient.invalidateQueries({ queryKey: ["child", childId] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unenroll child",
        variant: "destructive",
      });
    },
  });

  const markAsAgedOutMutation = useMutation({
    mutationFn: () => apiRequest("PUT", `/api/children/${childId}`, {
      enrollmentStatus: "aged_out",
      unenrollmentDate: new Date(),
      unenrollmentReason: "Aged out of program",
      isActive: false,
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Child has been marked as aged out",
      });
      queryClient.invalidateQueries({ queryKey: ["child", childId] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Failed to load child details</p>
      </div>
    );
  }

  const childAge = differenceInYears(new Date(), new Date(child.dateOfBirth));
  const ageOutLimit = parseInt(ageOutSetting?.value || "14");
  const isNearAgeOut = childAge >= ageOutLimit - 1;
  const hasAgedOut = childAge >= ageOutLimit;

  const handleSave = () => {
    updateChildMutation.mutate(formData);
  };

  const handleUnenroll = () => {
    if (!unenrollReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for unenrollment",
        variant: "destructive",
      });
      return;
    }
    unenrollChildMutation.mutate(unenrollReason);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/children")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Go back to children list"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-700 dark:text-gray-300"
            >
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </Button>
          <h1 className="text-3xl font-bold">
            {child.firstName} {child.lastName}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing && child.enrollmentStatus === "enrolled" && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status alerts */}
      {child.enrollmentStatus === "unenrolled" && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <UserX className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <p className="text-red-800 font-medium">Child Unenrolled</p>
              <p className="text-red-600 text-sm">
                Unenrolled on {format(new Date(child.unenrollmentDate), "MMM d, yyyy")}
                {child.unenrollmentReason && ` - ${child.unenrollmentReason}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {child.enrollmentStatus === "aged_out" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-yellow-800 font-medium">Aged Out</p>
              <p className="text-yellow-600 text-sm">
                This child has aged out of the program ({childAge} years old)
              </p>
            </div>
          </div>
        </div>
      )}

      {hasAgedOut && child.enrollmentStatus === "enrolled" && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <p className="text-orange-800 font-medium">Age Limit Exceeded</p>
                <p className="text-orange-600 text-sm">
                  This child is {childAge} years old and has exceeded the age limit of {ageOutLimit}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAsAgedOutMutation.mutate()}
            >
              Mark as Aged Out
            </Button>
          </div>
        </div>
      )}

      {isNearAgeOut && !hasAgedOut && child.enrollmentStatus === "enrolled" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              This child will age out soon (currently {childAge} years old, limit is {ageOutLimit})
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="health">Health & Medical</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={formData.firstName || ""}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "yyyy-MM-dd") : ""}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                />
                <p className="text-sm text-gray-500 mt-1">Age: {childAge} years</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age Group</Label>
                  <Select
                    value={formData.ageGroup}
                    onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infant">Infant (0-16 months)</SelectItem>
                      <SelectItem value="young_toddler">Young Toddler (16 months - 2 years)</SelectItem>
                      <SelectItem value="toddler">Toddler (2 years)</SelectItem>
                      <SelectItem value="preschool">Preschool (3-5 years)</SelectItem>
                      <SelectItem value="school_age">School Age (5-8 years)</SelectItem>
                      <SelectItem value="older_school_age">Older School Age (9-12 years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Room</Label>
                  <Input
                    value={formData.room || ""}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Parent/Guardian Information</h3>
                <div>
                  <Label>Parent Name</Label>
                  <Input
                    value={formData.parentName || ""}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Parent Email</Label>
                    <Input
                      type="email"
                      value={formData.parentEmail || ""}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Parent Phone</Label>
                    <Input
                      value={formData.parentPhone || ""}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health & Medical Information</CardTitle>
              <CardDescription>Medical conditions, allergies, and healthcare details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Allergies</Label>
                <Textarea
                  value={formData.allergies?.join(", ") || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    allergies: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                  })}
                  disabled={!isEditing}
                  placeholder="Enter allergies separated by commas"
                />
              </div>

              <div>
                <Label>Medical Conditions</Label>
                <Textarea
                  value={formData.medicalConditions?.join(", ") || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    medicalConditions: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                  })}
                  disabled={!isEditing}
                  placeholder="Enter medical conditions separated by commas"
                />
              </div>

              <div>
                <Label>Medical Notes</Label>
                <Textarea
                  value={formData.medicalNotes || ""}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Additional medical information"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Type</Label>
                  <Select
                    value={formData.bloodType || ""}
                    onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Emergency Requirements</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.epiPenRequired || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, epiPenRequired: !!checked })}
                        disabled={!isEditing}
                      />
                      <Label>EpiPen Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.inhalerRequired || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, inhalerRequired: !!checked })}
                        disabled={!isEditing}
                      />
                      <Label>Inhaler Required</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Information</CardTitle>
              <CardDescription>Emergency contacts and procedures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Emergency Contact Name</Label>
                  <Input
                    value={formData.emergencyContactName || ""}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Emergency Contact Phone</Label>
                  <Input
                    value={formData.emergencyContactPhone || ""}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label>Medical Action Plan</Label>
                <Textarea
                  value={formData.medicalActionPlan || ""}
                  onChange={(e) => setFormData({ ...formData, medicalActionPlan: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Detailed emergency procedures"
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.emergencyMedicalAuthorization || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, emergencyMedicalAuthorization: !!checked })}
                  disabled={!isEditing}
                />
                <Label>Emergency medical treatment authorized</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Information</CardTitle>
              <CardDescription>Enrollment status and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Enrollment Date</Label>
                  <Input
                    value={child.enrollmentDate ? format(new Date(child.enrollmentDate), "MMM d, yyyy") : ""}
                    disabled
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input
                    value={child.enrollmentStatus || "enrolled"}
                    disabled
                    className="capitalize"
                  />
                </div>
              </div>

              {child.unenrollmentDate && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Unenrollment Date</Label>
                    <Input
                      value={format(new Date(child.unenrollmentDate), "MMM d, yyyy")}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <Input
                      value={child.unenrollmentReason || ""}
                      disabled
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Monthly Tuition</Label>
                <Input
                  type="number"
                  value={formData.tuitionRate ? formData.tuitionRate / 100 : ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tuitionRate: Math.round(parseFloat(e.target.value) * 100) 
                  })}
                  disabled={!isEditing}
                  placeholder="0.00"
                />
              </div>

              {child.enrollmentStatus === "enrolled" && (
                <div className="pt-4 border-t">
                  <Dialog open={unenrollDialog} onOpenChange={setUnenrollDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <UserX className="h-4 w-4 mr-2" />
                        Unenroll Child
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Unenroll Child</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to unenroll {child.firstName} {child.lastName}? 
                          This action can be reversed by editing their enrollment status.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Reason for Unenrollment</Label>
                          <Textarea
                            value={unenrollReason}
                            onChange={(e) => setUnenrollReason(e.target.value)}
                            placeholder="Please provide a reason..."
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUnenrollDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleUnenroll}>
                          Confirm Unenrollment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}