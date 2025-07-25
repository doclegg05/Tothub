import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Monitor, 
  Smartphone, 
  Clock, 
  Activity, 
  MapPin, 
  UserX,
  RefreshCw,
  User
} from 'lucide-react';

export default function Sessions() {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Fetch active sessions
  const { data: activeSessions = [], isLoading } = useQuery({
    queryKey: ['/api/sessions/active'],
    refetchInterval: 10000, // Refresh every 10 seconds
  }) as { data: any[]; isLoading: boolean };

  // Fetch current session
  const { data: currentSession } = useQuery({
    queryKey: ['/api/sessions/current'],
  }) as { data: any | undefined };

  // Fetch session activity for selected session
  const { data: sessionActivity = [] } = useQuery({
    queryKey: selectedSession ? [`/api/sessions/activity`] : [],
    enabled: !!selectedSession,
  }) as { data: any[] };

  // Force logout mutation
  const forceLogoutMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/sessions/force-logout/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to force logout');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Session ended', description: 'User has been logged out' });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
    },
  });

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="w-4 h-4" />;
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    return isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'director': return 'bg-blue-600';
      case 'teacher': return 'bg-green-600';
      case 'staff': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login': return 'text-green-600';
      case 'logout': return 'text-red-600';
      case 'post': return 'text-blue-600';
      case 'get': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  const formatDuration = (loginTime: string) => {
    const duration = Date.now() - new Date(loginTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <>
      <Header 
        title="Session Management" 
        subtitle="Monitor active user sessions and activity"
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Current Session Info */}
        {currentSession && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Your Current Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Logged in as <span className="font-medium">{currentSession.username}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Since {format(new Date(currentSession.loginTime), 'h:mm a')}
                  </p>
                </div>
                <Badge className={getRoleBadgeColor(currentSession.role)}>
                  {currentSession.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Sessions ({activeSessions.length})
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-gray-500 text-center py-8">Loading sessions...</p>
              ) : activeSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active sessions</p>
              ) : (
                activeSessions.map((session: any) => (
                  <div 
                    key={session.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.userAgent)}
                            <span className="font-medium">{session.username}</span>
                          </div>
                          <Badge className={getRoleBadgeColor(session.role)}>
                            {session.role}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(session.loginTime)}
                          </div>
                          {session.ipAddress && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.ipAddress}
                            </div>
                          )}
                          <div className="text-xs">
                            Last active: {format(new Date(session.lastActivity), 'h:mm:ss a')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedSession(session.id)}
                        >
                          View Activity
                        </Button>
                        {session.id !== currentSession?.sessionId && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => forceLogoutMutation.mutate(session.id)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session Activity Modal */}
        {selectedSession && sessionActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessionActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                    <Activity className={`w-4 h-4 ${getActivityIcon(activity.action)}`} />
                    <div className="flex-1">
                      <span className="font-medium">{activity.action.toUpperCase()}</span>
                      <span className="text-gray-600 ml-2">{activity.path}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(activity.timestamp), 'h:mm:ss a')}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => setSelectedSession(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}