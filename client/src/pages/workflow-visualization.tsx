import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Users, Calendar, FileText, Mail, DollarSign, 
  Shield, Database, Zap, ArrowRight, Clock, CheckCircle,
  AlertCircle, XCircle, Loader2, Play, Pause, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Workflow node types
type WorkflowStatus = "active" | "processing" | "error" | "idle" | "completed";

interface WorkflowNode {
  id: string;
  label: string;
  type: string;
  status: WorkflowStatus;
  description: string;
  icon: React.ComponentType<any>;
  stats?: {
    processed?: number;
    pending?: number;
    failed?: number;
  };
  connections: string[];
}

// Workflow data
const workflows: Record<string, WorkflowNode[]> = {
  attendance: [
    {
      id: "check-in",
      label: "Check-in Process",
      type: "input",
      status: "active",
      description: "Parents/staff check children in",
      icon: Users,
      stats: { processed: 45, pending: 3 },
      connections: ["attendance-record", "ratio-check"]
    },
    {
      id: "attendance-record",
      label: "Attendance Recording",
      type: "process",
      status: "active",
      description: "Store attendance data",
      icon: Database,
      connections: ["daily-reports", "billing"]
    },
    {
      id: "ratio-check",
      label: "Ratio Compliance",
      type: "validation",
      status: "active",
      description: "Check staff-child ratios",
      icon: Shield,
      connections: ["alerts"]
    },
    {
      id: "daily-reports",
      label: "Daily Reports",
      type: "output",
      status: "idle",
      description: "Generate activity reports",
      icon: FileText,
      connections: ["email-parents"]
    },
    {
      id: "email-parents",
      label: "Parent Communication",
      type: "output",
      status: "idle",
      description: "Send reports to parents",
      icon: Mail,
      connections: []
    },
    {
      id: "billing",
      label: "Billing Updates",
      type: "process",
      status: "processing",
      description: "Update billing records",
      icon: DollarSign,
      connections: []
    },
    {
      id: "alerts",
      label: "Alert System",
      type: "output",
      status: "idle",
      description: "Send compliance alerts",
      icon: AlertCircle,
      connections: []
    }
  ],
  staff: [
    {
      id: "time-clock",
      label: "Time Clock",
      type: "input",
      status: "active",
      description: "Staff clock in/out",
      icon: Clock,
      stats: { processed: 12, pending: 0 },
      connections: ["payroll-calc", "schedule-update"]
    },
    {
      id: "schedule-update",
      label: "Schedule Updates",
      type: "process",
      status: "active",
      description: "Update staff schedules",
      icon: Calendar,
      connections: ["ratio-calc"]
    },
    {
      id: "payroll-calc",
      label: "Payroll Calculation",
      type: "process",
      status: "idle",
      description: "Calculate wages and taxes",
      icon: DollarSign,
      connections: ["payroll-export"]
    },
    {
      id: "payroll-export",
      label: "QuickBooks Export",
      type: "output",
      status: "idle",
      description: "Export to accounting",
      icon: FileText,
      connections: []
    },
    {
      id: "ratio-calc",
      label: "Ratio Management",
      type: "validation",
      status: "active",
      description: "Ensure compliance",
      icon: Shield,
      connections: ["staff-alerts"]
    },
    {
      id: "staff-alerts",
      label: "Staffing Alerts",
      type: "output",
      status: "idle",
      description: "Notify of issues",
      icon: AlertCircle,
      connections: []
    }
  ],
  automation: [
    {
      id: "webhook-receive",
      label: "Webhook Receiver",
      type: "input",
      status: "active",
      description: "Receive Zapier webhooks",
      icon: Zap,
      stats: { processed: 156, failed: 2 },
      connections: ["process-automation"]
    },
    {
      id: "process-automation",
      label: "Automation Engine",
      type: "process",
      status: "active",
      description: "Process automation rules",
      icon: Activity,
      connections: ["trigger-actions", "log-events"]
    },
    {
      id: "trigger-actions",
      label: "Action Triggers",
      type: "output",
      status: "processing",
      description: "Execute automated actions",
      icon: Play,
      connections: []
    },
    {
      id: "log-events",
      label: "Event Logging",
      type: "process",
      status: "active",
      description: "Log automation events",
      icon: Database,
      connections: []
    }
  ]
};

// Status colors
const statusColors: Record<WorkflowStatus, string> = {
  active: "bg-green-500",
  processing: "bg-yellow-500",
  error: "bg-red-500",
  idle: "bg-gray-400",
  completed: "bg-blue-500"
};

const statusBadgeVariants: Record<WorkflowStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  processing: "secondary",
  error: "destructive",
  idle: "outline",
  completed: "default"
};

// Animated connection component
const AnimatedConnection = ({ from, to, delay = 0 }: { from: string; to: string; delay?: number }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="currentColor"
            className="text-gray-400"
          />
        </marker>
      </defs>
      <motion.path
        d={`M ${from} L ${to}`}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        className="text-gray-300"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: isAnimating ? 1 : 0,
          opacity: isAnimating ? 0.6 : 0.3
        }}
        transition={{ 
          duration: 2,
          delay: delay,
          ease: "easeInOut"
        }}
      />
      <motion.circle
        r="4"
        fill="currentColor"
        className="text-primary"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{
          duration: 2,
          delay: delay,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          offsetPath: `path('M ${from} L ${to}')`,
        }}
      />
    </svg>
  );
};

// Workflow node component
const WorkflowNodeComponent = ({ 
  node, 
  position,
  onClick 
}: { 
  node: WorkflowNode;
  position: { x: number; y: number };
  onClick: (node: WorkflowNode) => void;
}) => {
  const Icon = node.icon;
  const StatusIcon = {
    active: CheckCircle,
    processing: Loader2,
    error: XCircle,
    idle: Clock,
    completed: CheckCircle
  }[node.status];

  return (
    <motion.div
      className="absolute"
      style={{ left: position.x, top: position.y, zIndex: 1 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <Card 
        className={cn(
          "w-48 cursor-pointer transition-all hover:shadow-lg",
          "border-2",
          node.status === "active" && "border-green-500",
          node.status === "processing" && "border-yellow-500 animate-pulse",
          node.status === "error" && "border-red-500",
          node.status === "idle" && "border-gray-300",
          node.status === "completed" && "border-blue-500"
        )}
        onClick={() => onClick(node)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <Badge variant={statusBadgeVariants[node.status]} className="text-xs">
              {node.status}
            </Badge>
          </div>
          <h4 className="font-semibold text-sm mb-1">{node.label}</h4>
          <p className="text-xs text-muted-foreground mb-2">{node.description}</p>
          
          {node.stats && (
            <div className="flex items-center gap-2 text-xs">
              {node.stats.processed !== undefined && (
                <span className="text-green-600">✓ {node.stats.processed}</span>
              )}
              {node.stats.pending !== undefined && node.stats.pending > 0 && (
                <span className="text-yellow-600">⏳ {node.stats.pending}</span>
              )}
              {node.stats.failed !== undefined && node.stats.failed > 0 && (
                <span className="text-red-600">✗ {node.stats.failed}</span>
              )}
            </div>
          )}
          
          <motion.div 
            className={cn("absolute bottom-0 left-0 right-0 h-1", statusColors[node.status])}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: node.status === "processing" ? [0, 1, 0] : 1 }}
            transition={{ 
              duration: node.status === "processing" ? 2 : 0.5,
              repeat: node.status === "processing" ? Infinity : 0
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function WorkflowVisualization() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("attendance");
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Node positions for layout
  const nodePositions: Record<string, Record<string, { x: number; y: number }>> = {
    attendance: {
      "check-in": { x: 50, y: 150 },
      "attendance-record": { x: 300, y: 100 },
      "ratio-check": { x: 300, y: 200 },
      "daily-reports": { x: 550, y: 50 },
      "email-parents": { x: 800, y: 50 },
      "billing": { x: 550, y: 150 },
      "alerts": { x: 550, y: 250 }
    },
    staff: {
      "time-clock": { x: 50, y: 150 },
      "schedule-update": { x: 300, y: 100 },
      "payroll-calc": { x: 300, y: 200 },
      "payroll-export": { x: 550, y: 200 },
      "ratio-calc": { x: 550, y: 100 },
      "staff-alerts": { x: 800, y: 100 }
    },
    automation: {
      "webhook-receive": { x: 50, y: 150 },
      "process-automation": { x: 350, y: 150 },
      "trigger-actions": { x: 650, y: 100 },
      "log-events": { x: 650, y: 200 }
    }
  };

  // Get connections for rendering
  const getConnections = () => {
    const connections: { from: string; to: string; delay: number }[] = [];
    const nodes = workflows[selectedWorkflow];
    const positions = nodePositions[selectedWorkflow];

    nodes.forEach((node, index) => {
      node.connections.forEach((targetId, connIndex) => {
        const fromPos = positions[node.id];
        const toPos = positions[targetId];
        if (fromPos && toPos) {
          connections.push({
            from: `${fromPos.x + 96},${fromPos.y + 40}`,
            to: `${toPos.x},${toPos.y + 40}`,
            delay: index * 0.2 + connIndex * 0.1
          });
        }
      });
    });

    return connections;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Workflow Visualization</h1>
          <p className="text-muted-foreground mt-2">
            Interactive view of system processes and data flows
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedWorkflow} onValueChange={setSelectedWorkflow} className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Flow</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[600px] relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedWorkflow === "attendance" && "Child Attendance Workflow"}
                  {selectedWorkflow === "staff" && "Staff Management Workflow"}
                  {selectedWorkflow === "automation" && "Automation Workflow"}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative h-[500px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedWorkflow}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full"
                  >
                    {/* Render connections */}
                    {isPlaying && getConnections().map((conn, index) => (
                      <AnimatedConnection
                        key={`${conn.from}-${conn.to}`}
                        from={conn.from}
                        to={conn.to}
                        delay={conn.delay}
                      />
                    ))}

                    {/* Render nodes */}
                    {workflows[selectedWorkflow].map((node) => (
                      <WorkflowNodeComponent
                        key={node.id}
                        node={node}
                        position={nodePositions[selectedWorkflow][node.id]}
                        onClick={setSelectedNode}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm">Active - Running normally</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-sm">Processing - In progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-sm">Error - Needs attention</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                  <span className="text-sm">Idle - Waiting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="text-sm">Completed - Finished</span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Node Details */}
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <selectedNode.icon className="h-5 w-5" />
                      {selectedNode.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedNode.description}
                      </p>
                      <Badge variant={statusBadgeVariants[selectedNode.status]}>
                        {selectedNode.status}
                      </Badge>
                    </div>

                    {selectedNode.stats && (
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">Statistics</h4>
                        {selectedNode.stats.processed !== undefined && (
                          <p className="text-sm">
                            Processed: <span className="font-mono">{selectedNode.stats.processed}</span>
                          </p>
                        )}
                        {selectedNode.stats.pending !== undefined && (
                          <p className="text-sm">
                            Pending: <span className="font-mono">{selectedNode.stats.pending}</span>
                          </p>
                        )}
                        {selectedNode.stats.failed !== undefined && (
                          <p className="text-sm">
                            Failed: <span className="font-mono">{selectedNode.stats.failed}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {selectedNode.connections.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Connects To</h4>
                        <div className="space-y-1">
                          {selectedNode.connections.map(connId => {
                            const targetNode = workflows[selectedWorkflow].find(n => n.id === connId);
                            return targetNode ? (
                              <p key={connId} className="text-sm flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                {targetNode.label}
                              </p>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}