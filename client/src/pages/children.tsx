import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Users, Calendar, Mail, Phone, Heart, Shield, FileText, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getAgeGroupFromBirthDate, calculateAge } from "@/lib/ratioCalculations";

export default function Children() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    room: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    // Enhanced fields from competitor research
    allergies: [] as string[],
    medicalNotes: "",
    immunizations: [] as string[],
    tuitionRate: "",
    // Comprehensive Health Information
    medicalConditions: [] as string[],
    currentMedications: "",
    dietaryRestrictions: [] as string[],
    foodAllergies: [] as string[],
    specialCareInstructions: "",
    physicalLimitations: "",
    bloodType: "",
    // Healthcare Provider Information
    primaryPhysician: "",
    physicianPhone: "",
    pediatricianName: "",
    pediatricianPhone: "",
    preferredHospital: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceGroupNumber: "",
    // Emergency Medical Information
    emergencyMedicalAuthorization: false,
    medicalActionPlan: "",
    epiPenRequired: false,
    inhalerRequired: false,
    // Immunization Details
    immunizationRecords: "",
    immunizationExemptions: [] as string[],
    nextImmunizationDue: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: childrenResponse, isLoading, refetch } = useQuery({
    queryKey: ["/api/children", currentPage],
  });

  const children = childrenResponse?.data || [];
  const totalPages = childrenResponse?.totalPages || 1;

  const createChildMutation = useMutation({
    mutationFn: (data: any) => {
      console.log("Sending child data:", data);
      return apiRequest("POST", "/api/children", data);
    },
    onSuccess: async () => {
      // Close modal immediately
      setModalOpen(false);
      
      // Show success message
      toast({
        title: "Success",
        description: "Child enrolled successfully!",
      });
      
      // Force reload to ensure fresh data
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        room: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        allergies: [],
        medicalNotes: "",
        immunizations: [],
        tuitionRate: "",
        // Reset comprehensive health fields
        medicalConditions: [],
        currentMedications: "",
        dietaryRestrictions: [],
        foodAllergies: [],
        specialCareInstructions: "",
        physicalLimitations: "",
        bloodType: "",
        primaryPhysician: "",
        physicianPhone: "",
        pediatricianName: "",
        pediatricianPhone: "",
        preferredHospital: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",
        insuranceGroupNumber: "",
        emergencyMedicalAuthorization: false,
        medicalActionPlan: "",
        epiPenRequired: false,
        inhalerRequired: false,
        immunizationRecords: "",
        immunizationExemptions: [],
        nextImmunizationDue: "",
      });
    },
    onError: (error: any) => {
      console.error("Error creating child:", error);
      const message = error?.response?.data?.message || error?.message || "Failed to add child. Please try again.";
      const errors = error?.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        const errorMessages = errors.map((e: any) => `${e.path?.join('.')}: ${e.message}`).join('\n');
        toast({
          title: "Validation Error",
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const birthDate = new Date(formData.dateOfBirth);
    const ageGroup = getAgeGroupFromBirthDate(birthDate);
    
    // Build submission data with only required fields
    const submissionData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: birthDate,
      ageGroup,
      room: formData.room,
      parentName: formData.parentName,
    };
    
    // Add optional fields if they have values
    if (formData.parentEmail) submissionData.parentEmail = formData.parentEmail;
    if (formData.parentPhone) submissionData.parentPhone = formData.parentPhone;
    if (formData.emergencyContactName) submissionData.emergencyContactName = formData.emergencyContactName;
    if (formData.emergencyContactPhone) submissionData.emergencyContactPhone = formData.emergencyContactPhone;
    if (formData.tuitionRate) submissionData.tuitionRate = parseInt(formData.tuitionRate) * 100;
    if (formData.allergies && formData.allergies.length > 0) submissionData.allergies = formData.allergies;
    if (formData.medicalNotes) submissionData.medicalNotes = formData.medicalNotes;
    if (formData.immunizations && formData.immunizations.length > 0) submissionData.immunizations = formData.immunizations;
    
    // JSON fields
    if (formData.currentMedications) submissionData.currentMedications = JSON.stringify(formData.currentMedications);
    if (formData.immunizationRecords) submissionData.immunizationRecords = JSON.stringify(formData.immunizationRecords);
    
    // Other optional fields
    if (formData.nextImmunizationDue) submissionData.nextImmunizationDue = new Date(formData.nextImmunizationDue);
    
    createChildMutation.mutate(submissionData);
  };

  const filteredChildren = (children as any[]).filter((child: any) =>
    `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAgeGroupBadge = (ageGroup: string) => {
    const colors = {
      infant: "bg-pink-100 text-pink-800",
      young_toddler: "bg-purple-100 text-purple-800",
      toddler: "bg-blue-100 text-blue-800",
      preschool: "bg-green-100 text-green-800",
      school_age: "bg-yellow-100 text-yellow-800",
      older_school_age: "bg-orange-100 text-orange-800",
    };
    
    const labels = {
      infant: "Infant",
      young_toddler: "Young Toddler",
      toddler: "Toddler",
      preschool: "Preschool",
      school_age: "School Age",
      older_school_age: "Older School Age",
    };
    
    return (
      <Badge className={colors[ageGroup as keyof typeof colors] || colors.preschool}>
        {labels[ageGroup as keyof typeof labels] || "Unknown"}
      </Badge>
    );
  };

  return (
    <>
      <Header title="Children" subtitle="Manage enrolled children" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Search and Actions */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search children..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger>
                    <TabsTrigger value="health" className="text-xs">
                      <Heart className="w-3 h-3 mr-1" />Health
                    </TabsTrigger>
                    <TabsTrigger value="emergency" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />Emergency
                    </TabsTrigger>
                    <TabsTrigger value="insurance" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />Healthcare
                    </TabsTrigger>
                  </TabsList>
                <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="room">Room</Label>
                    <Select 
                      value={formData.room}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Infant Room">Infant Room</SelectItem>
                        <SelectItem value="Toddler A">Toddler A</SelectItem>
                        <SelectItem value="Toddler B">Toddler B</SelectItem>
                        <SelectItem value="Preschool A">Preschool A</SelectItem>
                        <SelectItem value="Preschool B">Preschool B</SelectItem>
                        <SelectItem value="School Age">School Age</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Parent Information</h3>
                  <div>
                    <Label htmlFor="parentName">Parent/Guardian Name</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentEmail">Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentPhone">Phone</Label>
                      <Input
                        id="parentPhone"
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Heart className="w-5 h-5 mr-2" />
                      Health Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select 
                          value={formData.bloodType}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}
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
                              id="epiPen"
                              checked={formData.epiPenRequired}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, epiPenRequired: !!checked }))}
                            />
                            <Label htmlFor="epiPen" className="text-sm">EpiPen Required</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="inhaler"
                              checked={formData.inhalerRequired}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inhalerRequired: !!checked }))}
                            />
                            <Label htmlFor="inhaler" className="text-sm">Inhaler Required</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Input
                        id="medicalConditions"
                        placeholder="Enter conditions separated by commas (e.g., Asthma, Diabetes)"
                        value={formData.medicalConditions.join(', ')}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          medicalConditions: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                        }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="foodAllergies">Food Allergies</Label>
                      <Input
                        id="foodAllergies"
                        placeholder="Enter allergies separated by commas (e.g., Peanuts, Dairy, Eggs)"
                        value={formData.foodAllergies.join(', ')}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          foodAllergies: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                        }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                      <Input
                        id="dietaryRestrictions"
                        placeholder="Enter restrictions separated by commas (e.g., Vegetarian, Gluten-free)"
                        value={formData.dietaryRestrictions.join(', ')}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          dietaryRestrictions: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                        }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialCareInstructions">Special Care Instructions</Label>
                      <Textarea
                        id="specialCareInstructions"
                        placeholder="Enter any special care instructions or medical notes..."
                        value={formData.specialCareInstructions}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialCareInstructions: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="emergency" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Emergency Medical Information
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="emergencyAuth"
                        checked={formData.emergencyMedicalAuthorization}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emergencyMedicalAuthorization: !!checked }))}
                      />
                      <Label htmlFor="emergencyAuth">I authorize emergency medical treatment</Label>
                    </div>

                    <div>
                      <Label htmlFor="medicalActionPlan">Medical Action Plan</Label>
                      <Textarea
                        id="medicalActionPlan"
                        placeholder="Enter detailed action plan for medical conditions (e.g., steps for asthma attack, allergy reaction procedures)..."
                        value={formData.medicalActionPlan}
                        onChange={(e) => setFormData(prev => ({ ...prev, medicalActionPlan: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="physicalLimitations">Physical Limitations</Label>
                      <Textarea
                        id="physicalLimitations"
                        placeholder="Enter any physical limitations or accommodations needed..."
                        value={formData.physicalLimitations}
                        onChange={(e) => setFormData(prev => ({ ...prev, physicalLimitations: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Healthcare Provider Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryPhysician">Primary Physician</Label>
                        <Input
                          id="primaryPhysician"
                          value={formData.primaryPhysician}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryPhysician: e.target.value }))}
                          placeholder="Dr. Smith"
                        />
                      </div>
                      <div>
                        <Label htmlFor="physicianPhone">Physician Phone</Label>
                        <Input
                          id="physicianPhone"
                          type="tel"
                          value={formData.physicianPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, physicianPhone: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pediatricianName">Pediatrician</Label>
                        <Input
                          id="pediatricianName"
                          value={formData.pediatricianName}
                          onChange={(e) => setFormData(prev => ({ ...prev, pediatricianName: e.target.value }))}
                          placeholder="Dr. Johnson"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pediatricianPhone">Pediatrician Phone</Label>
                        <Input
                          id="pediatricianPhone"
                          type="tel"
                          value={formData.pediatricianPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, pediatricianPhone: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preferredHospital">Preferred Hospital</Label>
                      <Input
                        id="preferredHospital"
                        value={formData.preferredHospital}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferredHospital: e.target.value }))}
                        placeholder="Children's Hospital"
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Insurance Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                          <Input
                            id="insuranceProvider"
                            value={formData.insuranceProvider}
                            onChange={(e) => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                            placeholder="Blue Cross Blue Shield"
                          />
                        </div>
                        <div>
                          <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                          <Input
                            id="insurancePolicyNumber"
                            value={formData.insurancePolicyNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
                            placeholder="ABC123456789"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="insuranceGroupNumber">Group Number</Label>
                        <Input
                          id="insuranceGroupNumber"
                          value={formData.insuranceGroupNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, insuranceGroupNumber: e.target.value }))}
                          placeholder="GRP12345"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                </Tabs>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createChildMutation.isPending}>
                    {createChildMutation.isPending ? "Adding..." : "Add Child"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Children List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Enrolled Children ({filteredChildren.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChildren.length > 0 ? (
              <div className="space-y-4">
                {filteredChildren.map((child: any) => (
                  <div key={child.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {child.firstName[0]}{child.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {child.firstName} {child.lastName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Age: {calculateAge(new Date(child.dateOfBirth))} years • Room: {child.room}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {child.parentName}
                          </span>
                          {child.parentEmail && (
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {child.parentEmail}
                            </span>
                          )}
                          {child.parentPhone && (
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {child.parentPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getAgeGroupBadge(child.ageGroup)}
                      <p className="text-xs text-gray-500 mt-1">
                        Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No children found</p>
                {searchTerm ? (
                  <p className="text-sm">Try adjusting your search</p>
                ) : (
                  <p className="text-sm">Add your first child to get started</p>
                )}
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
