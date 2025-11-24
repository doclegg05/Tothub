import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Timer, User, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  employeeNumber?: string;
}

interface ClockStatus {
  isClockedIn: boolean;
  clockInTime?: string;
  hoursWorkedToday: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function StaffTimeClock() {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const queryClient = useQueryClient();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch staff list
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Fetch clock status for selected staff
  const { data: clockStatus } = useQuery({
    queryKey: ["/api/staff", selectedStaff, "clock-status"],
    enabled: !!selectedStaff,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Clock-in mutation
  const clockInMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await fetch(`/api/staff/${staffId}/clock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clockInTime: new Date().toISOString() }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to clock in");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff", selectedStaff, "clock-status"] });
      toast({ 
        title: "Clock In Successful", 
        description: `${data.message} at ${formatTime(new Date())}`,
      });
    },
    onError: (error) => {
      toast({ 
        title: "Clock In Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Clock-out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await fetch(`/api/staff/${staffId}/clock-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clockOutTime: new Date().toISOString() }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to clock out");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff", selectedStaff, "clock-status"] });
      toast({ 
        title: "Clock Out Successful", 
        description: `${data.message} at ${formatTime(new Date())}`,
      });
    },
    onError: (error) => {
      toast({ 
        title: "Clock Out Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const selectedStaffMember = staff.find((s: Staff) => s.id === selectedStaff);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <CardTitle>Staff Time Clock</CardTitle>
        </div>
        <CardDescription>
          Current Time: {formatTime(currentTime)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Staff Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Staff Member</label>
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a staff member" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((member: Staff) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {member.firstName} {member.lastName} ({member.employeeNumber || 'No ID'})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clock Status */}
        {selectedStaff && clockStatus && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {clockStatus.isClockedIn ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge variant="default" className="bg-green-600">
                        Clocked In
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <Badge variant="secondary">
                        Not Clocked In
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {clockStatus.isClockedIn && clockStatus.clockInTime && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Clocked in at</p>
                  <p className="text-sm font-medium">
                    {formatTime(new Date(clockStatus.clockInTime))}
                  </p>
                </div>
              )}
            </div>

            {/* Hours Worked Today */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Hours Today</span>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {formatHours(clockStatus.hoursWorkedToday)}
              </span>
            </div>

            {/* Clock Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => clockInMutation.mutate(selectedStaff)}
                disabled={
                  clockStatus.isClockedIn || 
                  clockInMutation.isPending || 
                  clockOutMutation.isPending
                }
                className="w-full"
                variant={clockStatus.isClockedIn ? "secondary" : "default"}
              >
                {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
              </Button>
              
              <Button
                onClick={() => clockOutMutation.mutate(selectedStaff)}
                disabled={
                  !clockStatus.isClockedIn || 
                  clockInMutation.isPending || 
                  clockOutMutation.isPending
                }
                className="w-full"
                variant={!clockStatus.isClockedIn ? "secondary" : "destructive"}
              >
                {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
              </Button>
            </div>
          </div>
        )}

        {/* Staff Info */}
        {selectedStaffMember && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Employee Information</p>
            <p className="text-sm text-gray-600">
              {selectedStaffMember.firstName} {selectedStaffMember.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {selectedStaffMember.position} • ID: {selectedStaffMember.employeeNumber || 'Not assigned'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}