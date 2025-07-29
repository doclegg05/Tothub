import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Heart, GraduationCap, Activity, Loader2, Send } from "lucide-react";

interface TeacherNotesProps {
  childId: string;
  childName: string;
  date?: Date;
}

interface TeacherNote {
  id: string;
  note: string;
  category?: string;
  createdAt: string;
  staffName?: string;
}

export function TeacherNotesPanel({ childId, childName, date = new Date() }: TeacherNotesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<string>('general');
  
  const dateStr = date.toISOString().split('T')[0];
  
  // Fetch existing notes for today
  const { data: existingNotes = [], isLoading } = useQuery<TeacherNote[]>({
    queryKey: ['/api/teacher-notes', childId, dateStr],
    queryFn: () => apiRequest(`/api/teacher-notes/${childId}/${dateStr}`, 'GET'),
    enabled: !!childId
  });
  
  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (data: { childId: string; note: string; category: string }) => 
      apiRequest('/api/teacher-notes', 'POST', data),
    onSuccess: () => {
      toast({ 
        title: 'Note added successfully',
        description: `Your note for ${childName} has been saved.`
      });
      setNote('');
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ['/api/teacher-notes', childId, dateStr] });
    },
    onError: () => {
      toast({ 
        title: 'Error adding note',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = () => {
    if (!note.trim()) return;
    
    addNoteMutation.mutate({
      childId,
      note: note.trim(),
      category
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'behavior':
        return <Heart className="w-4 h-4" />;
      case 'learning':
        return <GraduationCap className="w-4 h-4" />;
      case 'health':
        return <Activity className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'behavior':
        return 'text-pink-600 bg-pink-50';
      case 'learning':
        return 'text-blue-600 bg-blue-50';
      case 'health':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Daily Notes for {childName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new note form */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="note">Add a note about {childName}'s day</Label>
            <Textarea 
              id="note"
              placeholder="Share something special about their day..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    General
                  </div>
                </SelectItem>
                <SelectItem value="behavior">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Behavior
                  </div>
                </SelectItem>
                <SelectItem value="learning">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Learning
                  </div>
                </SelectItem>
                <SelectItem value="health">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Health
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSubmit}
              disabled={!note.trim() || addNoteMutation.isPending}
              className="flex-1"
            >
              {addNoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Add Note
            </Button>
          </div>
        </div>

        {/* Existing notes */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : existingNotes.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Today's Notes</h4>
            {existingNotes.map((note) => (
              <div 
                key={note.id} 
                className={`p-3 rounded-lg border ${getCategoryColor(note.category || 'general')}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {getCategoryIcon(note.category || 'general')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {note.staffName && ` • ${note.staffName}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              No notes added for today yet. Add a note to share with parents in the daily report.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}