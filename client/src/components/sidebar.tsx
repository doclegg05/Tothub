import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home,
  UserCheck,
  MessageSquare,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  TrendingUp,
  Shield
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Check-In/Out", href: "/checkin", icon: UserCheck },
  { name: "Parent Communication", href: "/parent-communication", icon: MessageSquare },
  { name: "Children", href: "/children", icon: Users },
  { name: "Staff Management", href: "/staff", icon: GraduationCap },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Physical Security", href: "/security", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Performance Test", href: "/performance-test", icon: TrendingUp },
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
              <Link 
                key={item.name} 
                href={item.href}
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
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
