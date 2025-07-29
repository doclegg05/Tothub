import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  AlertCircle, 
  MessageSquare, 
  Calendar, 
  UserCheck, 
  DollarSign,
  Shield,
  CheckCircle,
  Info,
  X
} from "lucide-react";

interface Notification {
  id: string;
  type: 'alert' | 'message' | 'system' | 'attendance' | 'billing' | 'compliance';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export function NotificationsPanel() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Fetch alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts/unread"],
  });

  // State for managing read status - persist in localStorage
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('notificationReadStatus');
    return saved ? JSON.parse(saved) : {};
  });

  // Combine alerts with other notification sources
  const alertNotifications: Notification[] = (alerts as any[]).map(alert => ({
    id: alert.id,
    type: 'alert' as const,
    title: alert.title,
    description: alert.message,
    timestamp: alert.createdAt,
    read: false,
    priority: (alert.severity === 'critical' ? 'high' : alert.severity === 'warning' ? 'medium' : 'low') as 'high' | 'medium' | 'low'
  }));

  // Static sample notifications - these would come from real APIs in production
  const sampleNotifications: Notification[] = [
    {
      id: 'msg-1',
      type: 'message',
      title: 'New message from Sarah\'s parent',
      description: 'Question about tomorrow\'s field trip permission slip',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      priority: 'medium'
    },
    {
      id: 'attend-1',
      type: 'attendance',
      title: 'Late arrival',
      description: 'Emma Thompson checked in 45 minutes late',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
      priority: 'low'
    },
    {
      id: 'billing-1',
      type: 'billing',
      title: 'Payment received',
      description: 'Monthly tuition payment from Johnson family',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
      priority: 'low'
    },
    {
      id: 'system-1',
      type: 'system',
      title: 'Daily reports scheduled',
      description: 'Daily activity reports will be sent at 5:00 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      read: true,
      priority: 'low'
    }
  ];

  // Merge and sort all notifications
  const allNotifications = [...alertNotifications, ...sampleNotifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply read status from local state
  const notifications = allNotifications.map(n => ({
    ...n,
    read: readStatus[n.id] ?? n.read
  }));

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch(type) {
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'attendance': return <UserCheck className="w-4 h-4" />;
      case 'billing': return <DollarSign className="w-4 h-4" />;
      case 'compliance': return <Shield className="w-4 h-4" />;
      case 'system': return <Info className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch(type) {
      case 'alert': return 'text-red-600 bg-red-50';
      case 'message': return 'text-blue-600 bg-blue-50';
      case 'attendance': return 'text-green-600 bg-green-50';
      case 'billing': return 'text-purple-600 bg-purple-50';
      case 'compliance': return 'text-orange-600 bg-orange-50';
      case 'system': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const markAsRead = (id: string) => {
    setReadStatus(prev => {
      const newStatus = {
        ...prev,
        [id]: true
      };
      localStorage.setItem('notificationReadStatus', JSON.stringify(newStatus));
      return newStatus;
    });
  };

  const markAllAsRead = () => {
    const newReadStatus: Record<string, boolean> = {};
    notifications.forEach(n => {
      newReadStatus[n.id] = true;
    });
    setReadStatus(newReadStatus);
    localStorage.setItem('notificationReadStatus', JSON.stringify(newReadStatus));
  };

  const [hiddenNotifications, setHiddenNotifications] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('hiddenNotifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const clearNotification = (id: string) => {
    setHiddenNotifications(prev => {
      const newHidden = new Set(prev).add(id);
      localStorage.setItem('hiddenNotifications', JSON.stringify(Array.from(newHidden)));
      return newHidden;
    });
  };

  // Filter out hidden notifications
  const visibleNotifications = notifications.filter(n => !hiddenNotifications.has(n.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {visibleNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {visibleNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {notification.priority === 'high' && (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {visibleNotifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                // Show all notifications including hidden ones
                setHiddenNotifications(new Set());
                setReadStatus({});
                localStorage.removeItem('hiddenNotifications');
                localStorage.removeItem('notificationReadStatus');
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}