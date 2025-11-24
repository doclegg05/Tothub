import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/page-wrapper';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, DollarSign, MessageSquare, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Analytics() {
  const { data: attendanceTrends } = useQuery({
    queryKey: ['analytics', 'attendance-trends'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/attendance-trends');
      if (!res.ok) throw new Error('Failed to fetch attendance trends');
      return res.json();
    },
  });

  const { data: staffStats } = useQuery({
    queryKey: ['analytics', 'staff-utilization'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/staff-utilization');
      if (!res.ok) throw new Error('Failed to fetch staff stats');
      return res.json();
    },
  });

  const { data: revenueStats } = useQuery({
    queryKey: ['analytics', 'revenue-forecast'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/revenue-forecast');
      if (!res.ok) throw new Error('Failed to fetch revenue stats');
      return res.json();
    },
  });

  const { data: parentEngagement } = useQuery({
    queryKey: ['analytics', 'parent-engagement'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/parent-engagement');
      if (!res.ok) throw new Error('Failed to fetch parent engagement');
      return res.json();
    },
  });

  const { data: ageDistribution } = useQuery({
    queryKey: ['analytics', 'age-distribution'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/age-distribution');
      if (!res.ok) throw new Error('Failed to fetch age distribution');
      return res.json();
    },
  });

  const { data: roomUtilization } = useQuery({
    queryKey: ['analytics', 'room-utilization'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/room-utilization');
      if (!res.ok) throw new Error('Failed to fetch room utilization');
      return res.json();
    },
  });

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Attendance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceTrends?.length ? 
                Math.round(attendanceTrends.reduce((acc: number, day: any) => acc + day.totalCheckIns, 0) / attendanceTrends.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffStats?.averageUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Scheduled vs actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueStats?.length ? revenueStats[revenueStats.length - 1].collectionRate.toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parent Engagement</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parentEngagement?.portalUsageRate}%
            </div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalCheckIns" 
                    stroke="#3B82F6" 
                    name="Check-ins"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="utilizationRate" 
                    stroke="#10B981" 
                    name="Utilization %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Average Hours per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={attendanceTrends?.slice(-7) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'EEE')}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageHours" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Morning Drop-off (7-9 AM)</span>
                    <span className="font-bold">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Afternoon Pickup (3-5 PM)</span>
                    <span className="font-bold">70%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Late Pickup (5-6 PM)</span>
                    <span className="font-bold">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
                  <Bar dataKey="projected" fill="#E5E7EB" name="Projected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collection Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="collectionRate" 
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{staffStats?.totalStaff || 0}</div>
                <p className="text-sm text-muted-foreground">Active employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overtime Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{staffStats?.overtimeHours.toFixed(1) || 0}</div>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule Adherence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {((staffStats?.scheduledVsActual || 1) * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">Actual vs scheduled</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Age Group Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ageDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ageGroup, count }) => `${ageGroup}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(ageDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Room Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roomUtilization || []} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="room" type="category" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}