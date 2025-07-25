import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: unreadAlerts = [] } = useQuery({
    queryKey: ["/api/alerts/unread"],
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600">
            {subtitle || `Welcome back! Today is ${currentDate}`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </Button>
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">Sarah Johnson</span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
