import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home,
  UserCheck,
  Camera,
  MessageSquare,
  Users,
  GraduationCap,
  BarChart3,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Basic Check-In/Out", href: "/check-in-out", icon: UserCheck },
  { name: "Enhanced Check-In", href: "/enhanced-checkin", icon: Camera },
  { name: "Parent Communication", href: "/parent-communication", icon: MessageSquare },
  { name: "Children", href: "/children", icon: Users },
  { name: "Staff Management", href: "/staff", icon: GraduationCap },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">KidSign Pro</h1>
        <p className="text-sm text-gray-600">Enhanced Daycare Management</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "text-gray-700 bg-blue-50 border-r-4 border-primary"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className={cn("font-medium", isActive && "font-semibold")}>
                    {item.name}
                  </span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
