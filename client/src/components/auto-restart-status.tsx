import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AutoRestartStatus {
  enabled: boolean;
  memoryUsage: string;
  threshold: string;
  lastRestart: string;
  canRestartNow: boolean;
  nextCheckIn: string;
}

export function AutoRestartStatus() {
  const [status, setStatus] = useState<AutoRestartStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/auto-restart/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch auto-restart status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleAutoRestart = async () => {
    if (!status) return;
    
    try {
      const response = await apiRequest("POST", "/api/auto-restart/config", { enabled: !status.enabled });
      
      if (response.ok) {
        toast({
          title: status.enabled ? "Auto-restart disabled" : "Auto-restart enabled",
          description: status.enabled 
            ? "System will no longer restart automatically" 
            : "System will restart automatically when memory usage exceeds threshold",
        });
        fetchStatus();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update auto-restart settings",
        variant: "destructive",
      });
    }
  };

  const triggerManualRestart = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to restart the server? This will briefly interrupt service."
    );
    
    if (!confirmed) return;
    
    try {
      const response = await apiRequest("POST", "/api/auto-restart/trigger", {});
      
      if (response.ok) {
        toast({
          title: "Restart triggered",
          description: "Server will restart in 5 seconds...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger restart",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Auto-Restart System</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  const memoryPercentage = parseFloat(status.memoryUsage);
  const thresholdPercentage = parseFloat(status.threshold);
  const isHighMemory = memoryPercentage > thresholdPercentage;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Auto-Restart System
        </CardTitle>
        <CardDescription>
          Automatically restarts the server when memory usage exceeds the threshold
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-restart-toggle" className="flex items-center gap-2">
            <span>Auto-restart enabled</span>
            {status.enabled ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
          </Label>
          <Switch
            id="auto-restart-toggle"
            checked={status.enabled}
            onCheckedChange={toggleAutoRestart}
          />
        </div>

        {/* Memory Status */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Memory Usage</span>
            <span className={isHighMemory ? "text-red-600 font-semibold" : ""}>
              {status.memoryUsage}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                isHighMemory ? "bg-red-600" : "bg-green-600"
              }`}
              style={{ width: `${Math.min(memoryPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Threshold: {status.threshold}
          </p>
        </div>

        {/* Status Information */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Restart</span>
            <span>{status.lastRestart === "Never" ? "Never" : new Date(status.lastRestart).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Next Check</span>
            <span>{status.nextCheckIn}</span>
          </div>
        </div>

        {/* High Memory Alert */}
        {isHighMemory && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              Memory usage is above threshold. {status.enabled ? "Restart will occur soon." : "Consider restarting manually."}
            </span>
          </div>
        )}

        {/* Manual Restart Button */}
        <Button
          onClick={triggerManualRestart}
          variant="outline"
          className="w-full"
          disabled={!status.canRestartNow}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Restart Now
        </Button>
        
        {!status.canRestartNow && (
          <p className="text-xs text-center text-muted-foreground">
            Restart is on cooldown. Please wait before restarting again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}