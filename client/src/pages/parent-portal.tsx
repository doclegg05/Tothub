import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Camera,
  FileText,
  Users,
  Activity,
  Bell,
  CalendarDays,
  Home
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface ChildAttendance {
  id: string;
  childId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  mood?: string;
  notes?: string;
  child: {
    firstName: string;
    lastName: string;
    room: string;
  };
}

export default function ParentPortal() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch parent's children
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["/api/parent/children"],
    enabled: !!user?.childrenIds,
  });

  // Fetch today's attendance for parent's children
  const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/parent/attendance/today"],
    enabled: !!user?.childrenIds,
  });

  // Fetch recent messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/parent/messages"],
    enabled: !!user,
  });

  // Fetch recent media
  const { data: mediaShares = [], isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/parent/media"],
    enabled: !!user,
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMoodEmoji = (mood?: string) => {
    const moods: { [key: string]: string } = {
      happy: "😊",
      neutral: "😐",
      sad: "😢",
      tired: "😴",
    };
    return moods[mood || ""] || "😊";
  };

  const getAttendanceStatus = (child: any) => {
    const todayAttendance = attendance.find((a: ChildAttendance) => a.childId === child.id);
    if (!todayAttendance) return { status: "Not checked in", color: "secondary" };
    if (todayAttendance.checkOut) return { status: "Checked out", color: "default" };
    return { status: "Present", color: "success" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-600 mt-1">View your children's daily activities and communicate with teachers</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Home className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Calendar className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="communication">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="media">
              <Camera className="w-4 h-4 mr-2" />
              Photos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Children Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {childrenLoading ? (
                <p>Loading children...</p>
              ) : children.length === 0 ? (
                <p>No children found</p>
              ) : (
                children.map((child: any) => {
                  const status = getAttendanceStatus(child);
                  const todayAttendance = attendance.find((a: ChildAttendance) => a.childId === child.id);
                  
                  return (
                    <Card key={child.id}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {child.firstName} {child.lastName}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{child.room}</p>
                          </div>
                          <Badge variant={status.color as any}>
                            {status.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {todayAttendance && (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Check-in:</span>
                              <span className="font-medium">
                                {formatTime(todayAttendance.checkIn)}
                              </span>
                            </div>
                            {todayAttendance.checkOut && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">Check-out:</span>
                                <span className="font-medium">
                                  {formatTime(todayAttendance.checkOut)}
                                </span>
                              </div>
                            )}
                            {todayAttendance.mood && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">Mood:</span>
                                <span className="text-xl">
                                  {getMoodEmoji(todayAttendance.mood)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.slice(0, 3).map((message: any) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium">{message.subject}</p>
                        <p className="text-sm text-gray-500">{message.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {mediaShares.slice(0, 3).map((media: any) => (
                    <div key={media.id} className="flex items-start space-x-3">
                      <Camera className="w-5 h-5 text-green-500 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium">New photo shared</p>
                        <p className="text-sm text-gray-500">{media.caption}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(media.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendance.map((record: ChildAttendance) => (
                    <div key={record.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {record.child.firstName} {record.child.lastName}
                        </h4>
                        <Badge variant="outline">
                          {new Date(record.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Check-in: </span>
                          <span className="font-medium">
                            {formatTime(record.checkIn)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Check-out: </span>
                          <span className="font-medium">
                            {record.checkOut ? formatTime(record.checkOut) : "Still present"}
                          </span>
                        </div>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          Note: {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages from Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messagesLoading ? (
                    <p>Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-gray-500">No messages yet</p>
                  ) : (
                    messages.map((message: any) => (
                      <div key={message.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{message.subject}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {message.content}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>From: {message.senderName}</span>
                              <span>{new Date(message.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          {message.priority === "urgent" && (
                            <Badge variant="destructive" className="ml-2">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Photos & Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaLoading ? (
                    <p>Loading media...</p>
                  ) : mediaShares.length === 0 ? (
                    <p className="text-gray-500 col-span-full">No photos or videos shared yet</p>
                  ) : (
                    mediaShares.map((media: any) => (
                      <div key={media.id} className="space-y-2">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-sm">{media.caption}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(media.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}