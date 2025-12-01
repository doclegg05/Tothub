import {
  Baby,
  Calendar,
  LayoutGrid,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import TotHubLogo from "../components/TotHubLogo";

// Reusable "Bouncy" Card Component
const WidgetCard = ({
  title,
  color = "border-nursery-sage",
  children,
  className,
}: any) => (
  <div
    className={`bg-white rounded-squircle border-4 ${color} p-6 shadow-paper hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}
  >
    <h3 className="font-heading text-xl font-bold text-nursery-dark mb-4">
      {title}
    </h3>
    <div className="font-body text-gray-600">{children}</div>
  </div>
);

export default function Dashboard() {
  const [location] = useLocation();

  const NavItem = ({ href, icon: Icon, label }: any) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <button
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-bold transition-all
            ${
              isActive
                ? "bg-white text-nursery-coral shadow-sm translate-x-2"
                : "text-nursery-dark hover:bg-white/50 hover:translate-x-1"
            }
          `}
        >
          <Icon size={24} strokeWidth={2.5} />
          {label}
        </button>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-nursery-bg">
      {/* THE SIDEBAR (The Cubby) */}
      <aside className="w-64 bg-nursery-wood/20 border-r-2 border-nursery-wood flex flex-col p-6 sticky top-0 h-screen">
        <div className="mb-8">
          <TotHubLogo size="small" />
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem href="/nursery" icon={LayoutGrid} label="My Room" />
          <NavItem href="/children" icon={Baby} label="Little Ones" />
          <NavItem href="/daily-reports" icon={Calendar} label="Attendance" />
          <NavItem href="/staff" icon={Users} label="Staff" />
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-nursery-dark/10">
          <NavItem href="/settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* MAIN CONTENT (The Play Mat) */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold text-nursery-dark">
              Good Morning, Teacher! ☀️
            </h1>
            <p className="text-gray-500 font-body">
              Here is what is happening in the Caterpillar Room today.
            </p>
          </div>
          <Link href="/children">
            <button className="bg-nursery-coral text-white px-6 py-3 rounded-squircle font-heading font-bold shadow-paper hover:shadow-paper-hover active:scale-95 transition-all">
              + Quick Action
            </button>
          </Link>
        </header>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Attendance Widget */}
          <WidgetCard title="Today's Attendance" color="border-nursery-sage">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <span className="block text-4xl font-heading font-bold text-nursery-dark">
                  24
                </span>
                <span className="text-sm">Present</span>
              </div>
              <div className="h-12 w-0.5 bg-gray-200"></div>
              <div className="text-center opacity-50">
                <span className="block text-4xl font-heading font-bold">3</span>
                <span className="text-sm">Absent</span>
              </div>
            </div>
            <div className="mt-4 bg-nursery-sage/20 rounded-full h-3 w-full overflow-hidden">
              <div className="bg-nursery-sage h-full w-[85%] rounded-full"></div>
            </div>
          </WidgetCard>

          {/* Staff Ratio Widget */}
          <WidgetCard title="Staff Ratio" color="border-nursery-sky">
            <div className="flex items-center gap-4">
              <div className="bg-nursery-sky/20 p-3 rounded-full">
                <Users className="text-nursery-dark" size={32} />
              </div>
              <div>
                <span className="block text-2xl font-heading font-bold text-nursery-dark">
                  1 : 4
                </span>
                <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-0.5 rounded-full">
                  Perfect!
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              You are within state limits for the Infant room.
            </p>
          </WidgetCard>

          {/* Check-In Button (Giant Action) */}
          <Link href="/checkin">
            <button className="w-full h-full bg-nursery-coral rounded-squircle border-4 border-nursery-dark p-6 shadow-paper hover:shadow-paper-hover hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all group text-left relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 group-hover:scale-110 transition-transform">
                <LogOut size={120} />
              </div>
              <h3 className="font-heading text-3xl font-bold text-white mb-2">
                Check-In Kiosk
              </h3>
              <p className="text-white/90 font-body">
                Launch the parent tablet mode.
              </p>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
