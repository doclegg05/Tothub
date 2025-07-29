import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function StaffingAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: ratios = [], isLoading } = useQuery({
    queryKey: ["/api/ratios"],
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("GET", "/api/ratios"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      toast({
        title: "Status Updated",
        description: "Staffing ratios have been refreshed.",
      });
    },
  });

  const requestStaffMutation = useMutation({
    mutationFn: (room: string) => 
      apiRequest("POST", "/api/alerts", {
        type: "RATIO_VIOLATION",
        message: `Additional staff needed in ${room} to meet required ratios`,
        severity: "HIGH",
        metadata: { room }
      }),
    onSuccess: (_, room) => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread"] });
      toast({
        title: "Staff Request Sent",
        description: `Alert sent for additional staff in ${room}`,
      });
    },
    onError: () => {
      toast({
        title: "Request Failed",
        description: "Could not send staff request. Please try again.",
        variant: "destructive"
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staffing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staffing Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ratios.map((ratio: any) => (
            <div
              key={ratio.room}
              className={`p-4 border rounded-lg ${
                ratio.isCompliant
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${
                  ratio.isCompliant ? "text-green-800" : "text-red-800"
                }`}>
                  {ratio.room}
                </h4>
                <Badge
                  variant={ratio.isCompliant ? "default" : "destructive"}
                  className={ratio.isCompliant ? "bg-green-600" : ""}
                >
                  {ratio.isCompliant ? "Compliant" : "Alert"}
                </Badge>
              </div>
              <p className={`text-sm ${
                ratio.isCompliant ? "text-green-700" : "text-red-700"
              }`}>
                {ratio.children} children, {ratio.staff} teacher{ratio.staff !== 1 ? 's' : ''}
              </p>
              <p className={`text-xs ${
                ratio.isCompliant ? "text-green-600" : "text-red-600"
              }`}>
                Current: {ratio.ratio} (Required: {ratio.requiredRatio})
              </p>
              {!ratio.isCompliant && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs"
                  onClick={() => requestStaffMutation.mutate(ratio.room)}
                  disabled={requestStaffMutation.isPending}
                >
                  {requestStaffMutation.isPending ? "Sending..." : "Request Additional Staff"}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? "Refreshing..." : "Refresh Status"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
