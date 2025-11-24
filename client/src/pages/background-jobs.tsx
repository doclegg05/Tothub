import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  FileText,
  Mail,
  DollarSign,
  BarChart3,
  Trash2
} from "lucide-react";

export default function BackgroundJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', selectedStatus],
    queryFn: async () => {
      const url = selectedStatus === 'all' 
        ? '/api/jobs' 
        : `/api/jobs?status=${selectedStatus}`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch job progress
  const { data: progress } = useQuery({
    queryKey: ['jobs-progress'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/jobs-progress');
      return response.json();
    },
    refetchInterval: 5000,
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/jobs', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Job Created",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-progress'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job",
        variant: "destructive",
      });
    },
  });

  const getJobIcon = (type: string) => {
    switch (type) {
      case 'generate-daily-report':
        return <FileText className="w-4 h-4" />;
      case 'send-bulk-email':
        return <Mail className="w-4 h-4" />;
      case 'process-payroll':
        return <DollarSign className="w-4 h-4" />;
      case 'generate-analytics':
        return <BarChart3 className="w-4 h-4" />;
      case 'cleanup-old-data':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'In progress...';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  // Quick job actions
  const quickJobs = [
    {
      title: "Generate Daily Report",
      description: "Create today's attendance and activity report",
      type: "generate-daily-report",
      data: { date: new Date().toISOString().split('T')[0], sendEmail: false },
    },
    {
      title: "Process Payroll",
      description: "Calculate payroll for the current period",
      type: "process-payroll",
      data: {
        payPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payPeriodEnd: new Date().toISOString().split('T')[0],
      },
    },
    {
      title: "Send Bulk Email",
      description: "Send newsletter to all parents",
      type: "send-bulk-email",
      data: {
        recipients: [],
        subject: "Weekly Newsletter",
        content: "Newsletter content here...",
      },
    },
    {
      title: "Generate Analytics",
      description: "Create monthly analytics report",
      type: "generate-analytics",
      data: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        metrics: ['attendance', 'revenue', 'staffing'],
      },
    },
    {
      title: "Cleanup Old Data",
      description: "Remove data older than 1 year",
      type: "cleanup-old-data",
      data: { daysToKeep: 365 },
    },
  ];

  return (
    <>
      <Header title="Background Jobs" subtitle="Manage and monitor background tasks" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Progress Overview */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{progress?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{progress?.processing || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{progress?.completed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{progress?.failed || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start common background jobs with one click</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {quickJobs.map((job) => (
                <Button
                  key={job.type}
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => createJobMutation.mutate({ type: job.type, data: job.data })}
                  disabled={createJobMutation.isPending}
                >
                  <div className="flex items-center w-full mb-2">
                    {getJobIcon(job.type)}
                    <span className="ml-2 font-medium">{job.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">{job.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job List */}
        <Card>
          <CardHeader>
            <CardTitle>Job Queue</CardTitle>
            <CardDescription>View and monitor all background jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>
              <TabsContent value={selectedStatus} className="mt-4">
                {jobsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
                ) : jobs?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No jobs found</div>
                ) : (
                  <div className="space-y-2">
                    {jobs?.map((job: any) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getJobIcon(job.type)}
                          <div>
                            <div className="font-medium">{job.type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                            <div className="text-sm text-muted-foreground">
                              Created: {new Date(job.createdAt).toLocaleString()}
                            </div>
                            {job.startedAt && (
                              <div className="text-sm text-muted-foreground">
                                Duration: {formatDuration(job.startedAt, job.completedAt)}
                              </div>
                            )}
                            {job.error && (
                              <div className="text-sm text-red-600 mt-1">
                                Error: {job.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-muted-foreground">
                            Retry {job.retries}/{job.maxRetries}
                          </div>
                          {getStatusBadge(job.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
}