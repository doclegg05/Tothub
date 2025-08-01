import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";
import { useState } from "react";
import { 
  Home,
  UserCheck,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Shield,
  Zap,
  ClipboardList,
  Activity,
  Briefcase,
  Bell
} from "lucide-react";

interface NavSection {
  title: string;
  items: { name: string; href: string; icon: any }[];
  defaultOpen?: boolean;
}

const navigationSections: NavSection[] = [
  {
    title: "Daily Operations",
    defaultOpen: true,
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "Check-In/Out", href: "/checkin", icon: UserCheck },
      { name: "Children", href: "/children", icon: Users },
      { name: "Staff", href: "/staff", icon: GraduationCap },
    ]
  },
  {
    title: "Management",
    defaultOpen: true,
    items: [
      { name: "Scheduling", href: "/staff-scheduling", icon: Calendar },
      { name: "Daily Reports", href: "/daily-reports", icon: FileText },
      { name: "Billing", href: "/billing", icon: DollarSign },
    ]
  },
  {
    title: "Insights & Compliance",
    defaultOpen: false,
    items: [
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Compliance", href: "/compliance", icon: ClipboardList },
    ]
  },
  {
    title: "Advanced Tools",
    defaultOpen: false,
    items: [
      { name: "Zapier Automation", href: "/zapier", icon: Zap },
      { name: "Security", href: "/security", icon: Shield },
      { name: "Performance Monitor", href: "/performance-monitor", icon: Activity },
      { name: "Background Jobs", href: "/background-jobs", icon: Briefcase },
      { name: "Alert Rules", href: "/alert-rules", icon: Bell },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationSections.forEach(section => {
      initial[section.title] = section.defaultOpen ?? false;
    });
    return initial;
  });

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

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
      
      <nav className="mt-4 flex-1 overflow-y-auto">
        <div className="px-3 space-y-1">
          {navigationSections.map((section) => (
            <div key={section.title} className="mb-2">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span>{section.title}</span>
                {openSections[section.title] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {openSections[section.title] && (
                <div className="mt-1 space-y-1 ml-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        )}
                      >
                        <Icon className={cn(
                          "mr-3 transition-colors",
                          isActive ? "w-5 h-5 text-blue-600" : "w-4 h-4"
                        )} />
                        <span className="text-sm">
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <UserMenu />
      </div>
    </div>
  );
}
