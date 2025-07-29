import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";
import { 
  Home,
  UserCheck,
  MessageSquare,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  TrendingUp,
  Shield,
  DollarSign,
  Calendar,
  CheckCircle,
  Activity,
  Mail
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Check-In/Out", href: "/checkin", icon: UserCheck },
  { name: "Daily Reports", href: "/daily-reports", icon: Mail },
  { name: "Children", href: "/children", icon: Users },
  { name: "Staff", href: "/staff", icon: GraduationCap },
  { name: "Staff Scheduling", href: "/staff-scheduling", icon: Calendar },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Compliance", href: "/compliance", icon: CheckCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Advanced features (available but not in main nav)
const advancedNavigation = [
  { name: "Parent Communication", href: "/parent-communication", icon: MessageSquare },
  { name: "Payroll", href: "/payroll", icon: DollarSign },
  { name: "Scheduling", href: "/scheduling", icon: Calendar },
  { name: "Physical Security", href: "/security", icon: Shield },
  { name: "Performance Test", href: "/performance-test", icon: TrendingUp },
  { name: "Sessions", href: "/sessions", icon: Activity },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src="/tothub-logo-new.png" 
            alt="TotHub Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-800">TotHub</h1>
            <p className="text-sm text-gray-600">Daycare Management</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 flex-1">
        <div className="px-4 space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Core Features
            </h3>
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
          
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
              Advanced (Optional)
            </h3>
            {advancedNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg transition-colors text-sm",
                    isActive
                      ? "text-gray-700 bg-blue-50 border-r-4 border-primary"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-600"
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className={cn("font-medium", isActive && "font-semibold")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      

    </div>
  );
}
