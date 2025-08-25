import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TeacherNotesPanel } from "@/components/teacher-notes";
import { Mail, MessageSquare, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  child: {
    id: string;
    firstName: string;
    lastName: string;
    room: string;
  };
  checkInTime: string;
}

export default function DailyReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  // Fetch present children
  const { data: presentChildren = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/present"],
  });

  // Send individual report
  const sendReportMutation = useMutation({
    mutationFn: async (childId: string) => 
      apiRequest('/api/daily-reports/send', 'POST', { childId, date: today }),
    onSuccess: () => {
      toast({ 
        title: 'Report sent successfully',
        description: 'The daily report has been sent to the parent.'
      });
      queryClient.invalidateQueries({ queryKey: [`/api/daily-reports`] });
    },
    onError: () => {
      toast({ 
        title: 'Failed to send report',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  // Send all reports
  const sendAllReportsMutation = useMutation({
    mutationFn: async () => 
      apiRequest('/api/daily-reports/send-all', 'POST', { date: today }),
    onSuccess: () => {
      toast({ 
        title: 'All reports started',
        description: 'Daily reports are being sent to all parents.'
      });
    },
    onError: () => {
      toast({ 
        title: 'Failed to start reports',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  const handleAddNotes = (child: any) => {
    setSelectedChild(child);
    setNotesModalOpen(true);
  };

  const handleSendReport = (childId: string) => {
    sendReportMutation.mutate(childId);
  };

  return (
    <>
      <Header 
        title="Daily Reports" 
        subtitle="Manage and send daily activity reports to parents" 
      />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily Report Management</CardTitle>
            <Button 
              onClick={() => sendAllReportsMutation.mutate()}
              disabled={sendAllReportsMutation.isPending}
            >
              <Mail className="w-4 h-4 mr-2" />
              {sendAllReportsMutation.isPending ? "Sending..." : "Send All Reports"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {format(today, 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center">
                <Badge variant="outline">
                  {presentChildren.length} children present
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children List */}
        <Card>
          <CardHeader>
            <CardTitle>Present Children</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : presentChildren.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No children are currently present
              </div>
            ) : (
              <div className="space-y-3">
                {presentChildren.map((attendance: AttendanceRecord) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-purple-700">
                          {attendance.child.firstName[0]}{attendance.child.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {attendance.child.firstName} {attendance.child.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {attendance.child.room} • Checked in at{" "}
                          {new Date(attendance.checkInTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNotes(attendance.child)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Add Notes
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendReport(attendance.child.id)}
                        disabled={sendReportMutation.isPending}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Modal */}
        <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Daily Notes for {selectedChild?.firstName} {selectedChild?.lastName}
              </DialogTitle>
            </DialogHeader>
            {selectedChild && (
              <TeacherNotesPanel
                childId={selectedChild.id}
                childName={`${selectedChild.firstName} ${selectedChild.lastName}`}
                date={today}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}