/**
 * State Compliance Wizard Component
 * Handles state selection with preview of ratio changes and compliance impact
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Info, MapPin, Users, Shield } from "lucide-react";
import { compareStateRequirements } from "@/lib/stateRatioCalculations";

interface StateComplianceWizardProps {
  onComplete?: (state: string) => void;
  currentState?: string;
}

interface StateData {
  name: string;
  hasData: boolean;
}

interface StateRatios {
  ratios: Record<string, string>;
  notes?: string;
}

export function StateComplianceWizard({ onComplete, currentState }: StateComplianceWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedState, setSelectedState] = useState(currentState || "");
  const [auditNote, setAuditNote] = useState("");
  const [showComparison, setShowComparison] = useState(false);

  const { data: availableStates = [], isLoading: statesLoading } = useQuery<StateData[]>({
    queryKey: ["/api/compliance/available-states"],
  });

  const { data: currentChildren = [] } = useQuery({
    queryKey: ["/api/children"],
  });

  const { data: selectedStateRatios } = useQuery<StateRatios>({
    queryKey: ["/api/compliance", selectedState, "ratios"],
    enabled: !!selectedState,
  });

  const updateStateMutation = useMutation({
    mutationFn: ({ state, auditNote }: { state: string; auditNote?: string }) =>
      apiRequest("POST", "/api/compliance/update-state", { state, auditNote }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/current-state"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "State Compliance Updated",
        description: `Successfully updated to ${selectedState}. All ratio calculations will now use ${selectedState} requirements.`,
      });
      onComplete?.(selectedState);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update state compliance.",
        variant: "destructive",
      });
    },
  });

  const handleStateSelection = (state: string) => {
    setSelectedState(state);
    if (currentState && currentState !== state) {
      setShowComparison(true);
    }
  };

  const handleSubmit = () => {
    if (!selectedState) {
      toast({
        title: "Selection Required",
        description: "Please select a state before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    updateStateMutation.mutate({
      state: selectedState,
      auditNote: auditNote || `State updated to ${selectedState} via compliance wizard`
    });
  };

  // Calculate impact if switching states
  const getStateChangeImpact = () => {
    if (!currentState || !selectedState || currentState === selectedState) {
      return null;
    }

    // Group children by age for comparison
    const childrenByAge = (currentChildren as any[]).reduce((acc, child) => {
      acc[child.ageGroup] = (acc[child.ageGroup] || 0) + 1;
      return acc;
    }, {});

    return compareStateRequirements(childrenByAge, currentState, selectedState);
  };

  const impact = getStateChangeImpact();

  return (
    <div className="space-y-6">
      {/* State Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Select Your State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stateSelect">Daycare Location</Label>
            <Select
              value={selectedState}
              onValueChange={handleStateSelection}
              disabled={statesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your state..." />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map((stateData: any) => (
                  <SelectItem 
                    key={stateData.name} 
                    value={stateData.name}
                    disabled={!stateData.hasData}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{stateData.name}</span>
                      {!stateData.hasData && (
                        <Badge variant="outline" className="ml-2 text-xs text-red-600">
                          No Data
                        </Badge>
                      )}
                      {stateData.name === currentState && (
                        <Badge variant="default" className="ml-2 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              This determines which state's daycare licensing requirements will be used for all compliance calculations.
            </p>
          </div>

          {selectedState && selectedStateRatios && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold mb-3 text-blue-900">
                {selectedState} Staff-to-Child Ratios
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {Object.entries(selectedStateRatios.ratios).map(([ageGroup, ratio]) => (
                  <div key={ageGroup} className="flex justify-between">
                    <span className="text-blue-700 font-medium">{ageGroup}:</span>
                    <span className="text-blue-900">{ratio as string}</span>
                  </div>
                ))}
              </div>
              {selectedStateRatios.notes && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <Info className="w-3 h-3 inline mr-1" />
                  {selectedStateRatios.notes}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Analysis */}
      {impact && showComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Staffing Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                {impact.becameStricter ? (
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                ) : impact.becameLenient ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <Info className="w-5 h-5 text-blue-500 mr-2" />
                )}
                <span className="text-sm font-medium">{impact.impactSummary}</span>
              </div>

              {impact.changes.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Ratio Changes:</h5>
                  <ul className="space-y-1">
                    {impact.changes.map((change, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 mr-2 flex-shrink-0" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Audit Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="auditNote">Change Reason (Optional)</Label>
            <Textarea
              id="auditNote"
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
              placeholder="e.g., Moved operations to new state, compliance audit requirement, etc."
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              This will be logged for compliance audit purposes. All state changes are automatically tracked.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedState(currentState || "");
            setShowComparison(false);
            setAuditNote("");
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedState || updateStateMutation.isPending}
        >
          {updateStateMutation.isPending ? "Updating..." : "Update State Compliance"}
        </Button>
      </div>

      {/* Federal Compliance Notice */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <Shield className="w-3 h-3 inline mr-1" />
          <strong>Note:</strong> Federal privacy regulations (COPPA, HIPAA, FERPA) are always enforced regardless of state selection. 
          State settings only affect staff-to-child ratios and related daycare licensing requirements.
        </p>
      </div>
    </div>
  );
}

export default StateComplianceWizard;