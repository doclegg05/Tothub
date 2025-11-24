import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { UserMenu } from "@/components/user-menu";
import { NotificationsPanel } from "@/components/notifications-panel";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: unreadAlerts = [] } = useQuery({
    queryKey: ["/api/alerts/unread"],
  });

  const alerts = Array.isArray(unreadAlerts) ? unreadAlerts : [];

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
          <NotificationsPanel />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
