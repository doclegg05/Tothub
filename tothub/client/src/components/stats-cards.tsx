import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, CheckCircle, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  childrenPresent?: number;
  staffOnDuty?: number;
  complianceStatus?: string;
  revenue?: number;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Children Present</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.childrenPresent || 0}</p>
              <p className="text-xs text-gray-500 mt-1">enrolled today</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-2xl text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Staff On Duty</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.staffOnDuty || 0}</p>
              <p className="text-xs text-green-600 mt-1">Active staff</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="text-2xl text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Compliance Status</p>
              <p className={`text-lg font-bold ${stats?.complianceStatus === 'Compliant' ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.complianceStatus || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500 mt-1">All ratios checked</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className={`text-2xl ${stats?.complianceStatus === 'Compliant' ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Revenue Today</p>
              <p className="text-3xl font-bold text-gray-800">${stats?.revenue || 0}</p>
              <p className="text-xs text-gray-500 mt-1">daily total</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-2xl text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
