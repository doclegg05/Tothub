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
import { Search, Plus, Users, Calendar, Mail, Phone } from "lucide-react";
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
  });

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["/api/children"],
  });

  const createChildMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/children", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Success",
        description: "Child added successfully.",
      });
      setModalOpen(false);
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
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add child. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const birthDate = new Date(formData.dateOfBirth);
    const ageGroup = getAgeGroupFromBirthDate(birthDate);
    
    createChildMutation.mutate({
      ...formData,
      dateOfBirth: birthDate,
      ageGroup,
    });
  };

  const filteredChildren = children.filter((child: any) =>
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

                <div className="flex justify-end space-x-3">
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
          </CardContent>
        </Card>
      </main>
    </>
  );
}
