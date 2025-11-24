import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Users, Camera, Image, Video, Star, AlertCircle, Clock } from "lucide-react";

interface MessageData {
  recipientType: "parent" | "staff" | "broadcast";
  recipientId?: string;
  subject: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
}

interface MediaShareData {
  childId: string;
  mediaType: "photo" | "video";
  caption: string;
}

export default function ParentCommunication() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("messages");

  const [messageForm, setMessageForm] = useState<MessageData>({
    recipientType: "parent",
    recipientId: "",
    subject: "",
    content: "",
    priority: "normal",
  });

  const [mediaForm, setMediaForm] = useState<MediaShareData>({
    childId: "",
    mediaType: "photo",
    caption: "",
  });

  // Fetch data
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["/api/children"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: mediaShares = [], isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/media-shares"],
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: (data: MessageData) => apiRequest("POST", "/api/messages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      resetMessageForm();
      setMessageModalOpen(false);
    },
  });

  const shareMediaMutation = useMutation({
    mutationFn: (data: MediaShareData) => apiRequest("POST", "/api/media-shares", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-shares"] });
      toast({
        title: "Success",
        description: "Media shared successfully!",
      });
      resetMediaForm();
      setMediaModalOpen(false);
    },
  });

  const resetMessageForm = () => {
    setMessageForm({
      recipientType: "parent",
      recipientId: "",
      subject: "",
      content: "",
      priority: "normal",
    });
  };

  const resetMediaForm = () => {
    setMediaForm({
      childId: "",
      mediaType: "photo",
      caption: "",
    });
  };

  const handleSendMessage = () => {
    sendMessageMutation.mutate(messageForm);
  };

  const handleShareMedia = () => {
    shareMediaMutation.mutate(mediaForm);
  };

  const getPriorityBadge = (priority: string) => {
    const variants: { [key: string]: any } = {
      low: "secondary",
      normal: "outline",
      high: "default",
      urgent: "destructive",
    };
    return (
      <Badge variant={variants[priority]}>
        {priority === "urgent" && <AlertCircle className="w-3 h-3 mr-1" />}
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return messageDate.toLocaleDateString();
  };

  return (
    <>
      <Header 
        title="Parent Communication" 
        subtitle="Secure messaging and photo sharing with families"
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetMessageForm}>
                <MessageSquare className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Message Type</Label>
                    <Select 
                      value={messageForm.recipientType} 
                      onValueChange={(value: "parent" | "staff" | "broadcast") => 
                        setMessageForm({...messageForm, recipientType: value, recipientId: ""})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent Message</SelectItem>
                        <SelectItem value="staff">Staff Message</SelectItem>
                        <SelectItem value="broadcast">Broadcast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select 
                      value={messageForm.priority} 
                      onValueChange={(value: "low" | "normal" | "high" | "urgent") => 
                        setMessageForm({...messageForm, priority: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {messageForm.recipientType === "parent" && (
                  <div>
                    <Label>Select Child's Family</Label>
                    <Select 
                      value={messageForm.recipientId || ""} 
                      onValueChange={(value) => setMessageForm({...messageForm, recipientId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a child's family" />
                      </SelectTrigger>
                      <SelectContent>
                        {(children as any[]).map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.firstName} {child.lastName} - {child.parentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Subject</Label>
                  <Input
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                    placeholder="Type your message here..."
                    rows={5}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageForm.content || sendMessageMutation.isPending}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                  <Button variant="outline" onClick={() => setMessageModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={mediaModalOpen} onOpenChange={setMediaModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetMediaForm}>
                <Camera className="w-4 h-4 mr-2" />
                Share Photo/Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Media with Parents</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Select Child</Label>
                  <Select 
                    value={mediaForm.childId} 
                    onValueChange={(value) => setMediaForm({...mediaForm, childId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {(children as any[]).map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.firstName} {child.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Media Type</Label>
                  <Select 
                    value={mediaForm.mediaType} 
                    onValueChange={(value: "photo" | "video") => setMediaForm({...mediaForm, mediaType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Caption</Label>
                  <Textarea
                    value={mediaForm.caption}
                    onChange={(e) => setMediaForm({...mediaForm, caption: e.target.value})}
                    placeholder="Add a caption for parents..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleShareMedia}
                    disabled={!mediaForm.childId || shareMediaMutation.isPending}
                    className="flex-1"
                  >
                    {shareMediaMutation.isPending ? "Sharing..." : "Share Media"}
                  </Button>
                  <Button variant="outline" onClick={() => setMediaModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Communication Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="media">Media Shares</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="flex items-start justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (messages as any[]).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages sent yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(messages as any[]).slice().reverse().map((message: any) => (
                      <div key={message.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-800">{message.subject}</h4>
                            <p className="text-sm text-gray-600">
                              To: {message.recipientType === "broadcast" ? "All Parents" : "Individual Family"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(message.priority)}
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(message.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {message.content}
                        </p>
                        {message.isRead && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">Read</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Shared Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mediaLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4 animate-pulse">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (mediaShares as any[]).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No media shared yet
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(mediaShares as any[]).slice().reverse().map((media: any) => (
                      <div key={media.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          {media.mediaType === "photo" ? (
                            <Image className="w-8 h-8 text-gray-400" />
                          ) : (
                            <Video className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {media.child?.firstName} {media.child?.lastName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {media.mediaType}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{media.caption}</p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(media.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}