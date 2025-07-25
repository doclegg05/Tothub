import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "check-in" | "check-out";
  selectedChild?: any;
}

export function CheckInModal({ open, onOpenChange, mode, selectedChild }: CheckInModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    childId: selectedChild?.childId || "",
    checkInBy: "",
    checkOutBy: "",
    room: selectedChild?.child?.room || "",
  });

  const { data: children = [] } = useQuery({
    queryKey: ["/api/children"],
    enabled: mode === "check-in",
  });

  const { data: presentChildren = [] } = useQuery({
    queryKey: ["/api/attendance/present"],
    enabled: mode === "check-out",
  });

  const checkInMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/attendance/check-in", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/present"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      toast({
        title: "Success",
        description: "Child checked in successfully.",
      });
      onOpenChange(false);
      setFormData({ childId: "", checkInBy: "", checkOutBy: "", room: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check in child. Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: ({ attendanceId, checkOutBy }: { attendanceId: string; checkOutBy: string }) =>
      apiRequest("POST", `/api/attendance/check-out/${attendanceId}`, { checkOutBy }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/present"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratios"] });
      toast({
        title: "Success",
        description: "Child checked out successfully.",
      });
      onOpenChange(false);
      setFormData({ childId: "", checkInBy: "", checkOutBy: "", room: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check out child. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "check-in") {
      const selectedChildData = children.find((c: any) => c.id === formData.childId);
      if (!selectedChildData || !formData.checkInBy) {
        toast({
          title: "Error",
          description: "Please select a child and enter parent/guardian name.",
          variant: "destructive",
        });
        return;
      }
      
      checkInMutation.mutate({
        childId: formData.childId,
        checkInBy: formData.checkInBy,
        room: selectedChildData.room,
      });
    } else {
      if (!selectedChild || !formData.checkOutBy) {
        toast({
          title: "Error",
          description: "Please enter parent/guardian name.",
          variant: "destructive",
        });
        return;
      }
      
      checkOutMutation.mutate({
        attendanceId: selectedChild.id,
        checkOutBy: formData.checkOutBy,
      });
    }
  };

  const selectedChildData = mode === "check-in" 
    ? children.find((c: any) => c.id === formData.childId)
    : selectedChild?.child;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "check-in" ? "Check In Child" : "Check Out Child"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "check-in" ? (
            <div>
              <Label htmlFor="child">Select Child</Label>
              <Select 
                value={formData.childId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, childId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child: any) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.firstName} {child.lastName} - {child.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label>Child</Label>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="font-medium">
                  {selectedChildData?.firstName} {selectedChildData?.lastName}
                </p>
                <p className="text-sm text-gray-600">Room: {selectedChildData?.room}</p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="parent">Parent/Guardian Name</Label>
            <Input
              id="parent"
              value={mode === "check-in" ? formData.checkInBy : formData.checkOutBy}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                [mode === "check-in" ? "checkInBy" : "checkOutBy"]: e.target.value 
              }))}
              placeholder="Enter parent or guardian name"
              required
            />
          </div>

          <div>
            <Label>Time</Label>
            <Input
              type="time"
              value={new Date().toTimeString().slice(0, 5)}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={checkInMutation.isPending || checkOutMutation.isPending}
            >
              {checkInMutation.isPending || checkOutMutation.isPending 
                ? "Processing..." 
                : mode === "check-in" 
                  ? "Check In" 
                  : "Check Out"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
