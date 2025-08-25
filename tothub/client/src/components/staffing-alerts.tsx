import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Users, Plus, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface Schedule {
  staffId: string;
  isPresent: boolean;
}

interface Ratio {
  room: string;
  isCompliant: boolean;
  currentRatio: number;
  requiredRatio: number;
}

export function StaffingAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  
  const { data: ratios = [], isLoading } = useQuery<Ratio[]>({
    queryKey: ["/api/ratios"],
  });

  // Fetch all staff members
  const { data: staffResponse } = useQuery({
    queryKey: ["staff", 1],
    queryFn: async () => {
      const res = await fetch(`/api/staff?page=1&limit=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
  });

  // Fetch today's schedules to see who's already assigned
  const { data: todaysSchedules = [] } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules/today"],
  });

  const staff = staffResponse?.data || [];
  
  // Get available staff (not currently scheduled for today)
  const scheduledStaffIds = new Set(todaysSchedules.map((s: any) => s.staffId));
  const availableStaff = staff.filter((s: any) => !scheduledStaffIds.has(s.id) && s.isActive);

  // Get staff currently scheduled but not present
  const scheduledButNotPresent = todaysSchedules.filter((s: any) => !s.isPresent);

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("GET", "/api/ratios"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      toast({
        title: "Status Updated",
        description: "Staffing ratios have been refreshed.",
      });
    },
  });

  const requestStaffMutation = useMutation({
    mutationFn: (room: string) => 
      apiRequest("POST", "/api/alerts", {
        type: "RATIO_VIOLATION",
        message: `Additional staff needed in ${room} to meet required ratios`,
        severity: "HIGH",
        metadata: { room }
      }),
    onSuccess: (_, room) => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread"] });
      toast({
        title: "Staff Request Sent",
        description: `Alert sent for additional staff in ${room}`,
      });
    },
    onError: () => {
      toast({
        title: "Request Failed",
        description: "Could not send staff request. Please try again.",
        variant: "destructive"
      });
    },
  });

  const assignStaffMutation = useMutation({
    mutationFn: async (data: { staffId: string; room: string; date: string }) => {
      const now = new Date();
      const scheduleDate = new Date(data.date);
      
      // Set start time to current time or next hour if it's already past 8 AM
      let scheduledStart: Date;
      if (now.getHours() >= 8) {
        // If it's past 8 AM, start at the next hour
        scheduledStart = new Date(now);
        scheduledStart.setMinutes(0, 0, 0); // Start at the top of the next hour
        scheduledStart.setHours(scheduledStart.getHours() + 1);
      } else {
        // If it's before 8 AM, start at 8 AM
        scheduledStart = new Date(scheduleDate);
        scheduledStart.setHours(8, 0, 0, 0);
      }
      
      // Set end time to 5 PM or 8 hours from start time
      const scheduledEnd = new Date(scheduledStart);
      scheduledEnd.setHours(scheduledEnd.getHours() + 8); // 8-hour shift

      const payload = {
        staffId: data.staffId,
        room: data.room,
        date: scheduleDate.toISOString(),
        scheduledStart: scheduledStart.toISOString(),
        scheduledEnd: scheduledEnd.toISOString(),
        scheduleType: 'emergency',
        notes: 'Emergency assignment due to ratio violation'
      };

      console.log('Sending schedule payload:', payload);
      return apiRequest("POST", "/api/schedules", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      setAssignmentModalOpen(false);
      setSelectedStaff("");
      toast({
        title: "Staff Assigned",
        description: "Staff member has been assigned to the room.",
      });
    },
    onError: (error: any) => {
      console.error('Assignment error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Could not assign staff member. Please try again.";
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    },
  });

  const markPresentMutation = useMutation({
    mutationFn: (scheduleId: string) => apiRequest("POST", `/api/schedules/${scheduleId}/mark-present`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Staff Marked Present",
        description: "Staff member has been marked as present.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark staff as present.",
        variant: "destructive"
      });
    },
  });

  const handleAssignStaff = () => {
    if (!selectedStaff || !selectedRoom) {
      toast({
        title: "Selection Required",
        description: "Please select both a staff member and room.",
        variant: "destructive"
      });
      return;
    }

    // Validate that we're not assigning for a past date
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = new Date().toISOString().split('T')[0];
    
    if (selectedDate < today) {
      toast({
        title: "Invalid Date",
        description: "Cannot assign staff for a date in the past.",
        variant: "destructive"
      });
      return;
    }

    assignStaffMutation.mutate({
      staffId: selectedStaff,
      room: selectedRoom,
      date: selectedDate
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staffing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staffing Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ratios.map((ratio: any) => (
            <div
              key={ratio.room}
              className={`p-4 border rounded-lg ${
                ratio.isCompliant
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${
                  ratio.isCompliant ? "text-green-800" : "text-red-800"
                }`}>
                  {ratio.room}
                </h4>
                <Badge
                  variant={ratio.isCompliant ? "default" : "destructive"}
                  className={ratio.isCompliant ? "bg-green-600" : ""}
                >
                  {ratio.isCompliant ? "Compliant" : "Alert"}
                </Badge>
              </div>
              <p className={`text-sm ${
                ratio.isCompliant ? "text-green-700" : "text-red-700"
              }`}>
                {ratio.children} children, {ratio.staff} teacher{ratio.staff !== 1 ? 's' : ''}
              </p>
              <p className={`text-xs ${
                ratio.isCompliant ? "text-green-600" : "text-red-600"
              }`}>
                Current: {ratio.ratio} (Required: {ratio.requiredRatio})
              </p>
              
              {/* Show scheduled but not present staff for this room */}
              {!ratio.isCompliant && (
                <div className="mt-3 space-y-2">
                  {/* Staff scheduled but not present */}
                  {scheduledButNotPresent
                    .filter((s: any) => s.room === ratio.room)
                    .map((schedule: any) => (
                      <div key={schedule.id} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-yellow-600" />
                          <span className="text-yellow-800">
                            {schedule.staff?.firstName} {schedule.staff?.lastName} - Scheduled but not present
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-6"
                          onClick={() => markPresentMutation.mutate(schedule.id)}
                          disabled={markPresentMutation.isPending}
                        >
                          {markPresentMutation.isPending ? "Marking..." : "Mark Present"}
                        </Button>
                      </div>
                    ))}
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => requestStaffMutation.mutate(ratio.room)}
                      disabled={requestStaffMutation.isPending}
                    >
                      {requestStaffMutation.isPending ? "Sending..." : "Request Additional Staff"}
                    </Button>
                    
                    {availableStaff.length > 0 && (
                      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs"
                            onClick={() => setSelectedRoom(ratio.room)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Assign Available Staff
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Assign Staff to {ratio.room}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="staff-select">Select Staff Member</Label>
                              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a staff member" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableStaff.map((member: any) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.firstName} {member.lastName} - {member.position}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <p><strong>Available Staff:</strong> {availableStaff.length}</p>
                              <p><strong>Required:</strong> {ratio.requiredStaff - ratio.staff} more</p>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setAssignmentModalOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAssignStaff}
                                disabled={!selectedStaff || assignStaffMutation.isPending}
                              >
                                {assignStaffMutation.isPending ? "Assigning..." : "Assign Staff"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  {availableStaff.length === 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      <Users className="w-3 h-3 inline mr-1" />
                      No available staff to assign
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? "Refreshing..." : "Refresh Status"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
