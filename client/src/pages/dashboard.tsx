import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";
import { StaffingAlerts } from "@/components/staffing-alerts";
import { CheckInModal } from "@/components/check-in-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LogIn, LogOut, UserPlus, Clock, AlertTriangle, CheckCircle, MapPin } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [, setLocation] = useLocation();

  const { data: presentChildren = [], isLoading: presentLoading } = useQuery({
    queryKey: ["/api/attendance/present"],
    enabled: !!localStorage.getItem('authToken'),
  });

  const { data: todaysSchedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ["/api/schedules/today"],
    enabled: !!localStorage.getItem('authToken'),
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/alerts/unread"],
    enabled: !!localStorage.getItem('authToken'),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
    enabled: !!localStorage.getItem('authToken'),
  });

  const getSetting = (key: string, defaultValue: string = "") => {
    const setting = (settings as any[]).find((s: any) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const handleCheckOut = (child: any) => {
    setSelectedChild(child);
    setCheckOutModalOpen(true);
  };

  const getStatusBadge = (schedule: any) => {
    if (schedule.isPresent) {
      return <Badge className="bg-green-600">Present</Badge>;
    } else if (new Date() > new Date(schedule.scheduledStart)) {
      return <Badge variant="destructive">Late</Badge>;
    } else {
      return <Badge variant="secondary">Scheduled</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check_in':
        return <LogIn className="text-green-600" />;
      case 'check_out':
        return <LogOut className="text-red-600" />;
      case 'staffing_alert':
        return <AlertTriangle className="text-yellow-600" />;
      case 'staff_arrival':
        return <UserPlus className="text-blue-600" />;
      default:
        return <CheckCircle className="text-green-600" />;
    }
  };

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle={`Using ${getSetting("selected_state", "West Virginia")} compliance ratios`}
      />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Check-In/Out */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quick Check-In/Out</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/checkin')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {presentLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(presentChildren as any[]).slice(0, 3).map((attendance: any) => (
                      <div key={attendance.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold">
                              {attendance.child.firstName[0]}{attendance.child.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {attendance.child.firstName} {attendance.child.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Room: {attendance.child.room}
                            </p>
                            <p className="text-xs text-green-600">
                              Checked in at {new Date(attendance.checkInTime).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCheckOut(attendance)}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Check Out
                        </Button>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-200">
                      <Button 
                        className="w-full" 
                        onClick={() => setCheckInModalOpen(true)}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Add New Check-In
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <StaffingAlerts />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Staff Schedule</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/staff')}
              >
                Manage Schedule
              </Button>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
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
              ) : (
                <div className="space-y-3">
                  {(todaysSchedules as any[]).map((schedule: any) => (
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
                        {getStatusBadge(schedule)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/reports')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(presentChildren as any[]).slice(0, 2).map((attendance: any) => (
                    <div key={`activity-${attendance.id}`} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <LogIn className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{attendance.child.firstName} {attendance.child.lastName}</span> checked in to {attendance.child.room}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(attendance.checkInTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(alerts as any[]).slice(0, 3).map((alert: any) => (
                    <div key={`alert-${alert.id}`} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{alert.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">Daily attendance report generated</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <CheckInModal 
        open={checkInModalOpen}
        onOpenChange={setCheckInModalOpen}
        mode="check-in"
      />
      
      <CheckInModal 
        open={checkOutModalOpen}
        onOpenChange={setCheckOutModalOpen}
        mode="check-out"
        selectedChild={selectedChild}
      />
    </>
  );
}
