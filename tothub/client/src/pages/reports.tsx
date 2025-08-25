import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, Calendar, Users, Clock, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportType, setReportType] = useState("attendance");

interface AttendanceRecord {
  id: string;
  checkOutTime?: string;
}

interface Schedule {
  id: string;
  isPresent: boolean;
  scheduledStart: string;
}

interface Ratio {
  id: string;
  isCompliant: boolean;
}

interface DashboardStats {
  revenue?: number;
}

  const { data: todaysAttendance = [], isLoading: attendanceLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/today"],
    queryFn: async () => {
      const response = await fetch("/api/attendance/today");
      return response.json();
    },
  });

  const { data: presentChildren = [], isLoading: presentLoading } = useQuery<any[]>({
    queryKey: ["/api/attendance/present"],
    queryFn: async () => {
      const response = await fetch("/api/attendance/present");
      return response.json();
    },
  });

  const { data: todaysSchedules = [], isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules/today"],
    queryFn: async () => {
      const response = await fetch("/api/schedules/today");
      return response.json();
    },
  });

  const { data: ratios = [], isLoading: ratiosLoading } = useQuery<Ratio[]>({
    queryKey: ["/api/ratios"],
    queryFn: async () => {
      const response = await fetch("/api/ratios");
      return response.json();
    },
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      return response.json();
    },
  });

  const generateReport = () => {
    // This would generate and download the selected report
    console.log(`Generating ${reportType} report for ${dateRange.startDate} to ${dateRange.endDate}`);
  };

  const getComplianceStats = () => {
    const compliantRooms = ratios.filter((ratio: any) => ratio.isCompliant).length;
    const totalRooms = ratios.length;
    const compliancePercentage = totalRooms > 0 ? Math.round((compliantRooms / totalRooms) * 100) : 100;
    
    return {
      compliantRooms,
      totalRooms,
      compliancePercentage
    };
  };

  const getAttendanceStats = () => {
    const totalCheckIns = todaysAttendance.length;
    const currentlyPresent = presentChildren.length;
    const checkOutsCompleted = todaysAttendance.filter((a: any) => a.checkOutTime).length;
    
    return {
      totalCheckIns,
      currentlyPresent,
      checkOutsCompleted,
      averageStayTime: "6.5 hours" // This would be calculated from actual data
    };
  };

  const getStaffingStats = () => {
    const scheduledStaff = todaysSchedules.length;
    const presentStaff = todaysSchedules.filter((s: any) => s.isPresent).length;
    const lateStaff = todaysSchedules.filter((s: any) => 
      !s.isPresent && new Date() > new Date(s.scheduledStart)
    ).length;
    
    return {
      scheduledStaff,
      presentStaff,
      lateStaff,
      attendanceRate: scheduledStaff > 0 ? Math.round((presentStaff / scheduledStaff) * 100) : 0
    };
  };

  const complianceStats = getComplianceStats();
  const attendanceStats = getAttendanceStats();
  const staffingStats = getStaffingStats();

  return (
    <>
      <Header title="Reports" subtitle="Analytics and compliance reporting" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Generate Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Daily Attendance</SelectItem>
                    <SelectItem value="staffing">Staffing Report</SelectItem>
                    <SelectItem value="compliance">Compliance Report</SelectItem>
                    <SelectItem value="summary">Weekly Summary</SelectItem>
                    <SelectItem value="billing">Billing Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              
              <Button onClick={generateReport} className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Today's Attendance</p>
                  <p className="text-3xl font-bold text-gray-800">{attendanceStats.currentlyPresent}</p>
                  <p className="text-xs text-gray-500 mt-1">{attendanceStats.totalCheckIns} total check-ins</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-2xl text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Staff Attendance</p>
                  <p className="text-3xl font-bold text-gray-800">{staffingStats.attendanceRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">{staffingStats.presentStaff}/{staffingStats.scheduledStaff} present</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-2xl text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Compliance Rate</p>
                  <p className="text-3xl font-bold text-gray-800">{complianceStats.compliancePercentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">{complianceStats.compliantRooms}/{complianceStats.totalRooms} rooms compliant</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className={`text-2xl ${complianceStats.compliancePercentage === 100 ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Revenue Today</p>
                  <p className="text-3xl font-bold text-gray-800">${stats?.revenue || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Daily total</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-2xl text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Today's Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="font-medium text-blue-800">Total Check-ins</span>
                    <Badge className="bg-blue-600">{attendanceStats.totalCheckIns}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-medium text-green-800">Currently Present</span>
                    <Badge className="bg-green-600">{attendanceStats.currentlyPresent}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="font-medium text-gray-800">Completed Check-outs</span>
                    <Badge variant="secondary">{attendanceStats.checkOutsCompleted}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="font-medium text-purple-800">Average Stay Time</span>
                    <Badge className="bg-purple-600">{attendanceStats.averageStayTime}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Compliance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ratiosLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {ratios.map((ratio: any) => (
                    <div
                      key={ratio.room}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        ratio.isCompliant
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div>
                        <span className={`font-medium ${
                          ratio.isCompliant ? "text-green-800" : "text-red-800"
                        }`}>
                          {ratio.room}
                        </span>
                        <p className={`text-xs ${
                          ratio.isCompliant ? "text-green-600" : "text-red-600"
                        }`}>
                          Current: {ratio.ratio} (Required: {ratio.requiredRatio})
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={ratio.isCompliant ? "default" : "destructive"}
                          className={ratio.isCompliant ? "bg-green-600" : ""}
                        >
                          {ratio.isCompliant ? "Compliant" : "Alert"}
                        </Badge>
                        {!ratio.isCompliant && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Staff Performance Today
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
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Staff Member</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Room</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Scheduled Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysSchedules.map((schedule: any) => (
                      <tr key={schedule.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {schedule.staff.firstName[0]}{schedule.staff.lastName[0]}
                              </span>
                            </div>
                            <span className="font-medium">
                              {schedule.staff.firstName} {schedule.staff.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{schedule.room}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {format(new Date(schedule.scheduledStart), 'h:mm a')} - {format(new Date(schedule.scheduledEnd), 'h:mm a')}
                        </td>
                        <td className="py-3 px-4">
                          {schedule.isPresent ? (
                            <Badge className="bg-green-600">Present</Badge>
                          ) : new Date() > new Date(schedule.scheduledStart) ? (
                            <Badge variant="destructive">Late</Badge>
                          ) : (
                            <Badge variant="secondary">Scheduled</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {schedule.isPresent ? (
                            <span className="text-green-600 text-sm">On Time</span>
                          ) : new Date() > new Date(schedule.scheduledStart) ? (
                            <span className="text-red-600 text-sm">
                              {Math.round((new Date().getTime() - new Date(schedule.scheduledStart).getTime()) / (1000 * 60))} min late
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
