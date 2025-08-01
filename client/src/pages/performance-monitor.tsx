import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Database, HardDrive, Cpu, Clock, AlertTriangle } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface MemoryStatus {
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;
  arrayBuffers: string;
  systemTotal: string;
  percentUsed: string;
}

interface PerformanceMetrics {
  memory: MemoryStatus;
  apiMetrics: {
    totalRequests: number;
    averageResponseTime: number;
    slowRequests: number;
    errorRate: number;
    endpointMetrics: Array<{
      endpoint: string;
      count: number;
      avgResponseTime: number;
    }>;
  };
  cacheMetrics: {
    children: { hits: number; misses: number; size: number; max: number };
    staff: { hits: number; misses: number; size: number; max: number };
    attendance: { hits: number; misses: number; size: number; max: number };
    stateRatios: { hits: number; misses: number; size: number; max: number };
  };
  databaseMetrics: {
    activeConnections: number;
    queryCount: number;
    slowQueries: number;
  };
}

export default function PerformanceMonitor() {
  const [memoryHistory, setMemoryHistory] = useState<Array<{ time: string; usage: number }>>([]);
  const [apiHistory, setApiHistory] = useState<Array<{ time: string; responseTime: number; requests: number }>>([]);

  // Fetch performance metrics
  const { data: metrics, isLoading } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/performance/metrics'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Fetch memory status
  const { data: memoryStatus } = useQuery<MemoryStatus>({
    queryKey: ['/api/memory-status'],
    refetchInterval: 5000,
  });

  // Update history charts
  useEffect(() => {
    if (memoryStatus) {
      const now = new Date().toLocaleTimeString();
      setMemoryHistory(prev => {
        const updated = [...prev, { time: now, usage: parseFloat(memoryStatus.percentUsed) }];
        return updated.slice(-20); // Keep last 20 data points
      });
    }
  }, [memoryStatus]);

  useEffect(() => {
    if (metrics?.apiMetrics) {
      const now = new Date().toLocaleTimeString();
      setApiHistory(prev => {
        const updated = [...prev, { 
          time: now, 
          responseTime: metrics.apiMetrics.averageResponseTime,
          requests: metrics.apiMetrics.totalRequests 
        }];
        return updated.slice(-20);
      });
    }
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const memoryUsage = memoryStatus ? parseFloat(memoryStatus.percentUsed) : 0;
  const isHighMemory = memoryUsage > 70;
  const isCriticalMemory = memoryUsage > 85;

  // Calculate cache hit rates
  const calculateHitRate = (cache: { hits: number; misses: number }) => {
    const total = cache.hits + cache.misses;
    return total > 0 ? ((cache.hits / total) * 100).toFixed(1) : '0';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Monitor</h1>
        <p className="text-muted-foreground">Real-time system performance and health metrics</p>
      </div>

      {/* Memory Alert */}
      {isCriticalMemory && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Critical memory usage detected ({memoryUsage.toFixed(1)}%). System may restart soon.
          </AlertDescription>
        </Alert>
      )}

      {/* Memory Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className={`h-4 w-4 ${isCriticalMemory ? 'text-red-500' : isHighMemory ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryStatus?.percentUsed || '0%'}</div>
            <Progress value={memoryUsage} className={`mt-2 ${isCriticalMemory ? 'bg-red-200' : isHighMemory ? 'bg-yellow-200' : ''}`} />
            <p className="text-xs text-muted-foreground mt-2">
              {memoryStatus?.heapUsed} / {memoryStatus?.systemTotal}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.apiMetrics.averageResponseTime.toFixed(0) || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Avg response time
            </p>
            <p className="text-xs mt-1">
              {metrics?.apiMetrics.totalRequests || 0} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.databaseMetrics.activeConnections || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active connections
            </p>
            <p className="text-xs mt-1">
              {metrics?.databaseMetrics.queryCount || 0} queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.apiMetrics.errorRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              API error rate
            </p>
            <p className="text-xs mt-1">
              {metrics?.apiMetrics.slowRequests || 0} slow requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Memory Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage Over Time</CardTitle>
          <CardDescription>System memory utilization percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={memoryHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Performance</CardTitle>
          <CardDescription>Hit rates and utilization for each cache</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.cacheMetrics && Object.entries(metrics.cacheMetrics).map(([name, cache]) => (
              <div key={name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{name}</span>
                  <span className="text-sm text-muted-foreground">
                    {calculateHitRate(cache)}% hit rate
                  </span>
                </div>
                <Progress value={(cache.size / cache.max) * 100} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{cache.hits} hits / {cache.misses} misses</span>
                  <span>{cache.size} / {cache.max} items</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoint Performance */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Performance</CardTitle>
          <CardDescription>Response times by endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.apiMetrics.endpointMetrics.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgResponseTime" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Heap Total:</span>
              <span className="ml-2 font-medium">{memoryStatus?.heapTotal}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Heap Used:</span>
              <span className="ml-2 font-medium">{memoryStatus?.heapUsed}</span>
            </div>
            <div>
              <span className="text-muted-foreground">RSS:</span>
              <span className="ml-2 font-medium">{memoryStatus?.rss}</span>
            </div>
            <div>
              <span className="text-muted-foreground">External:</span>
              <span className="ml-2 font-medium">{memoryStatus?.external}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}