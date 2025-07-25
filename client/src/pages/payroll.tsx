import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, Users, FileText, Download, Plus, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QuickBooksExport } from "@/components/quickbooks-export";

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  hourlyRate?: number;
  salaryAmount?: number;
  payType: string;
  employeeNumber?: string;
}

interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: string;
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
}

interface TimesheetEntry {
  id: string;
  staffId: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  date: string;
  isApproved: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
}

function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

export default function PayrollPage() {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch payroll dashboard data
  const { data: dashboard } = useQuery({
    queryKey: ["/api/payroll/dashboard"],
  });

  // Fetch staff for payroll
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/payroll/staff"],
  });

  // Fetch pay periods
  const { data: payPeriods = [] } = useQuery({
    queryKey: ["/api/payroll/pay-periods"],
  });

  // Fetch timesheets for selected staff
  const { data: timesheets = [] } = useQuery({
    queryKey: ["/api/payroll/timesheet", selectedStaff],
    enabled: !!selectedStaff,
  });

  // Create pay period mutation
  const createPayPeriod = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/payroll/pay-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create pay period");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/pay-periods"] });
      toast({ title: "Pay period created successfully" });
    },
  });

  // Process payroll mutation
  const processPayroll = useMutation({
    mutationFn: async (payPeriodId: string) => {
      const response = await fetch(`/api/payroll/pay-periods/${payPeriodId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processedBy: "admin" }),
      });
      if (!response.ok) throw new Error("Failed to process payroll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/pay-periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/dashboard"] });
      toast({ title: "Payroll processed successfully" });
    },
  });

  // Update staff payroll info mutation
  const updateStaffPayroll = useMutation({
    mutationFn: async ({ staffId, data }: { staffId: string; data: any }) => {
      const response = await fetch(`/api/payroll/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update staff payroll info");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/staff"] });
      toast({ title: "Staff payroll information updated" });
    },
  });

  const handleCreatePayPeriod = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const payDate = new Date(endDate);
    payDate.setDate(payDate.getDate() + 7);

    createPayPeriod.mutate({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      payDate: payDate.toISOString(),
    });
  };

  const handleDownloadPayStub = async (payStubId: string, staffName: string) => {
    try {
      const response = await fetch(`/api/payroll/pay-stubs/${payStubId}/pdf`);
      if (!response.ok) throw new Error("Failed to download pay stub");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paystub-${staffName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({ title: "Failed to download pay stub", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee timesheets, wages, and pay stubs</p>
        </div>
        <Button onClick={handleCreatePayPeriod} disabled={createPayPeriod.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Create Pay Period
        </Button>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Gross Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboard.ytdTotals.grossPay)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Taxes</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboard.ytdTotals.taxes)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Timesheets</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.pendingTimesheets}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll">Payroll Processing</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="staff">Staff Pay Info</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Pay Periods</CardTitle>
              <CardDescription>Manage and process payroll for different pay periods</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payPeriods.map((period: PayPeriod) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{new Date(period.payDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={period.status === 'open' ? 'default' : 'secondary'}>
                          {period.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(period.totalGrossPay)}</TableCell>
                      <TableCell>{formatCurrency(period.totalNetPay)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {period.status === 'open' && (
                            <Button
                              size="sm"
                              onClick={() => processPayroll.mutate(period.id)}
                              disabled={processPayroll.isPending}
                            >
                              Process
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/api/payroll/pay-periods/${period.id}/summary-report`} target="_blank">
                              <Download className="h-4 w-4 mr-1" />
                              Report
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle>Employee Timesheets</CardTitle>
              <CardDescription>Review and approve employee time entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="staff-select">Select Employee</Label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((employee: Staff) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedStaff && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Regular Hours</TableHead>
                      <TableHead>Overtime Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timesheets.map((timesheet: TimesheetEntry) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>{new Date(timesheet.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(timesheet.clockInTime).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          {timesheet.clockOutTime 
                            ? new Date(timesheet.clockOutTime).toLocaleTimeString()
                            : 'Not clocked out'
                          }
                        </TableCell>
                        <TableCell>{formatHours(timesheet.regularHours)}</TableCell>
                        <TableCell>{formatHours(timesheet.overtimeHours)}</TableCell>
                        <TableCell>
                          <Badge variant={timesheet.isApproved ? 'default' : 'secondary'}>
                            {timesheet.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Payroll Information</CardTitle>
              <CardDescription>Manage employee pay rates and tax information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Pay Type</TableHead>
                    <TableHead>Rate/Salary</TableHead>
                    <TableHead>Employee #</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((employee: Staff) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.payType}</Badge>
                      </TableCell>
                      <TableCell>
                        {employee.payType === 'hourly' 
                          ? employee.hourlyRate ? formatCurrency(employee.hourlyRate) + '/hr' : 'Not set'
                          : employee.salaryAmount ? formatCurrency(employee.salaryAmount) + '/year' : 'Not set'
                        }
                      </TableCell>
                      <TableCell>{employee.employeeNumber || 'Not assigned'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
              <CardDescription>Generate and download payroll reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Pay Period Summary
                    </CardTitle>
                    <CardDescription>
                      Generate summary reports for completed pay periods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="period-select">Select Pay Period</Label>
                      <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a pay period" />
                        </SelectTrigger>
                        <SelectContent>
                          {payPeriods.filter((p: PayPeriod) => p.status !== 'open').map((period: PayPeriod) => (
                            <SelectItem key={period.id} value={period.id}>
                              {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        className="w-full mt-2" 
                        disabled={!selectedPayPeriod}
                        asChild
                      >
                        <a 
                          href={selectedPayPeriod ? `/api/payroll/pay-periods/${selectedPayPeriod}/summary-report` : '#'}
                          target="_blank"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Tax Reports
                    </CardTitle>
                    <CardDescription>
                      Generate quarterly tax reports for filing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="quarter-select">Select Quarter</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quarter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="q1-2025">Q1 2025</SelectItem>
                          <SelectItem value="q2-2025">Q2 2025</SelectItem>
                          <SelectItem value="q3-2025">Q3 2025</SelectItem>
                          <SelectItem value="q4-2025">Q4 2025</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full mt-2" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* QuickBooks Export */}
            <div>
              <QuickBooksExport />
            </div>
            
            {/* Additional Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Reports
                </CardTitle>
                <CardDescription>
                  Generate additional payroll and compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Employee Summary Report
                </Button>
                <Button variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Time & Attendance Report
                </Button>
                <Button variant="outline" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Tax Liability Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}