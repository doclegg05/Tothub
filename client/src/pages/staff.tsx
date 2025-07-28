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
import { Search, Plus, GraduationCap, Mail, Phone, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { StaffTimeClock } from "@/components/staff-timeclock";

export default function Staff() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
  });
  const [scheduleData, setScheduleData] = useState({
    staffId: "",
    room: "",
    scheduledStart: "",
    scheduledEnd: "",
    date: new Date().toISOString().split('T')[0],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: staffResponse, isLoading } = useQuery({
    queryKey: ["/api/staff", currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/staff?page=${currentPage}&limit=${pageSize}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
  });

  const staff = staffResponse?.data || [];
  const totalPages = staffResponse?.totalPages || 1;

  const { data: todaysSchedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ["/api/staff-schedules/today"],
  });

  const createStaffMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Staff member added successfully.",
      });
      setModalOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/staff-schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-schedules/today"] });
      toast({
        title: "Success",
        description: "Schedule created successfully.",
      });
      setScheduleModalOpen(false);
      setScheduleData({
        staffId: "",
        room: "",
        scheduledStart: "",
        scheduledEnd: "",
        date: new Date().toISOString().split('T')[0],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create schedule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markPresentMutation = useMutation({
    mutationFn: (scheduleId: string) => apiRequest("POST", `/api/staff-schedules/${scheduleId}/mark-present`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-schedules/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      toast({
        title: "Success",
        description: "Staff member marked as present.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark staff as present.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffMutation.mutate(formData);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleDate = new Date(scheduleData.date);
    const startTime = scheduleData.scheduledStart.split(':');
    const endTime = scheduledData.scheduledEnd.split(':');
    
    const scheduledStart = new Date(scheduleDate);
    scheduledStart.setHours(parseInt(startTime[0]), parseInt(startTime[1]));
    
    const scheduledEnd = new Date(scheduleDate);
    scheduledEnd.setHours(parseInt(endTime[0]), parseInt(endTime[1]));

    createScheduleMutation.mutate({
      ...scheduleData,
      date: scheduleDate,
      scheduledStart,
      scheduledEnd,
    });
  };

  const filteredStaff = staff.filter((member: any) =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (schedule: any) => {
    if (schedule.isPresent) {
      return <Badge className="bg-green-600">Present</Badge>;
    } else if (new Date() > new Date(schedule.scheduledStart)) {
      return <Badge variant="destructive">Late</Badge>;
    } else {
      return <Badge variant="secondary">Scheduled</Badge>;
    }
  };

  return (
    <>
      <Header title="Staff Management" subtitle="Manage staff and schedules" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Search and Actions */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <div className="flex space-x-3">
            <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Staff Schedule</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="staffMember">Staff Member</Label>
                    <Select 
                      value={scheduleData.staffId}
                      onValueChange={(value) => setScheduleData(prev => ({ ...prev, staffId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member: any) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} - {member.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="room">Room</Label>
                    <Select 
                      value={scheduleData.room}
                      onValueChange={(value) => setScheduleData(prev => ({ ...prev, room: value }))}
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

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start">Start Time</Label>
                      <Input
                        id="start"
                        type="time"
                        value={scheduleData.scheduledStart}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledStart: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end">End Time</Label>
                      <Input
                        id="end"
                        type="time"
                        value={scheduleData.scheduledEnd}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledEnd: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createScheduleMutation.isPending}>
                      {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select 
                      value={formData.position}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lead Teacher">Lead Teacher</SelectItem>
                        <SelectItem value="Assistant Teacher">Assistant Teacher</SelectItem>
                        <SelectItem value="Substitute Teacher">Substitute Teacher</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Assistant Director">Assistant Director</SelectItem>
                        <SelectItem value="Support Staff">Support Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createStaffMutation.isPending}>
                      {createStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Today's Schedule ({todaysSchedules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : todaysSchedules.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {todaysSchedules.map((schedule: any) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">
                            {schedule.staff.firstName[0]}{schedule.staff.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {schedule.staff.firstName} {schedule.staff.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{schedule.room}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(schedule.scheduledStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(schedule.scheduledEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(schedule)}
                          {!schedule.isPresent && new Date() >= new Date(schedule.scheduledStart) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markPresentMutation.mutate(schedule.id)}
                              disabled={markPresentMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Mark Present
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No schedules for today</p>
                  <p className="text-sm">Create a schedule to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Directory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Staff Directory ({filteredStaff.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredStaff.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {filteredStaff.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">
                            {member.firstName[0]}{member.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {member.position}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {member.email && (
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {member.email}
                              </span>
                            )}
                            {member.phone && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {member.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No staff members found</p>
                  {searchTerm ? (
                    <p className="text-sm">Try adjusting your search</p>
                  ) : (
                    <p className="text-sm">Add your first staff member to get started</p>
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
        </div>
      </main>
    </>
  );
}
