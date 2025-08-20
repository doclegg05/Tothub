import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Schedule {
  id: string;
  staffId: string;
  staffName: string;
  room: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
}

interface TimefoldResponse {
  status: string;
  totalScore: number;
  solvingTimeMs: number;
}

const ScheduleAdmin: React.FC = () => {
  const [weekStart, setWeekStart] = useState<string>('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timefoldResponse, setTimefoldResponse] = useState<TimefoldResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<{
    timefoldHealthy: boolean;
    solverStatus: string;
  } | null>(null);

  useEffect(() => {
    // Set default week start to current week
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    setWeekStart(monday.toISOString().split('T')[0]);
    
    // Check service status
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/schedule/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to check service status:', error);
    }
  };

  const generateSchedule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/schedule/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ weekStart })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data.schedules);
        setTimefoldResponse(data.data.timefoldResponse);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate schedule');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const acceptSchedule = async () => {
    try {
      const response = await fetch('/api/schedule/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ schedules, weekStart })
      });
      
      if (response.ok) {
        alert('Schedule accepted and saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept schedule');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to accept schedule');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Extract HH:MM
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedule Administration</h1>
        <div className="flex items-center space-x-2">
          {serviceStatus && (
            <Badge variant={serviceStatus.timefoldHealthy ? "default" : "destructive"}>
              {serviceStatus.timefoldHealthy ? "Timefold Online" : "Timefold Offline"}
            </Badge>
          )}
        </div>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Service Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Timefold Service</Label>
                <p className="text-sm text-gray-600">
                  {serviceStatus.timefoldHealthy ? "Healthy" : "Unavailable"}
                </p>
              </div>
              <div>
                <Label>Solver Status</Label>
                <p className="text-sm text-gray-600">{serviceStatus.solverStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weekStart">Week Start Date</Label>
              <Input
                id="weekStart"
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateSchedule} 
                disabled={loading || !weekStart}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Schedule'}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Results */}
      {timefoldResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {timefoldResponse.status}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {timefoldResponse.totalScore.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {timefoldResponse.solvingTimeMs}ms
                </div>
                <div className="text-sm text-gray-600">Solving Time</div>
              </div>
            </div>
            
            <Button onClick={acceptSchedule} className="w-full">
              Accept and Save Schedule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule List */}
      {schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(schedule.status)}
                    <div>
                      <div className="font-medium">{schedule.staffName}</div>
                      <div className="text-sm text-gray-600">{schedule.room}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(schedule.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(schedule.scheduledStart)} - {formatTime(schedule.scheduledEnd)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleAdmin;
