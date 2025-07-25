import { useState } from "react";
import { Header } from "@/components/header";
import { CheckInModal } from "@/components/check-in-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { LogIn, LogOut, Search, Clock } from "lucide-react";

export default function CheckInOut() {
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: presentChildren = [], isLoading: presentLoading } = useQuery({
    queryKey: ["/api/attendance/present"],
  });

  const { data: allChildren = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["/api/children"],
  });

  const handleCheckOut = (child: any) => {
    setSelectedChild(child);
    setCheckOutModalOpen(true);
  };

  const filteredPresentChildren = presentChildren.filter((attendance: any) =>
    `${attendance.child.firstName} ${attendance.child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.child.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const absentChildren = allChildren.filter((child: any) =>
    !presentChildren.some((attendance: any) => attendance.child.id === child.id) &&
    `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header title="Check-In/Out" subtitle="Manage daily attendance" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search children..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <div className="text-sm text-gray-600">
              <Clock className="inline w-4 h-4 mr-1" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          <Button onClick={() => setCheckInModalOpen(true)}>
            <LogIn className="w-4 h-4 mr-2" />
            New Check-In
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Currently Present */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Currently Present ({filteredPresentChildren.length})</span>
                <Badge variant="secondary">{filteredPresentChildren.length} children</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {presentLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : filteredPresentChildren.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredPresentChildren.map((attendance: any) => (
                    <div key={attendance.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">
                            {attendance.child.firstName[0]}{attendance.child.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {attendance.child.firstName} {attendance.child.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Room: {attendance.child.room}
                          </p>
                          <p className="text-xs text-green-600">
                            Checked in: {new Date(attendance.checkInTime).toLocaleTimeString()} by {attendance.checkInBy}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCheckOut(attendance)}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Check Out
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <LogIn className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No children currently present</p>
                  {searchTerm && <p className="text-sm">Try adjusting your search</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available for Check-In */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available for Check-In</span>
                <Badge variant="outline">{absentChildren.length} children</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {childrenLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : absentChildren.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {absentChildren.map((child: any) => (
                    <div key={child.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">
                            {child.firstName[0]}{child.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {child.firstName} {child.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Room: {child.room}
                          </p>
                          <p className="text-xs text-gray-500">
                            Parent: {child.parentName}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setCheckInModalOpen(true)}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Check In
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <LogOut className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>All children are checked in</p>
                  {searchTerm && <p className="text-sm">Try adjusting your search</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <CheckInModal 
        open={checkInModalOpen}
        onOpenChange={setCheckInModalOpen}
        mode="check-in"
      />
      
      <CheckInModal 
        open={checkOutModalOpen}
        onOpenChange={setCheckOutModalOpen}
        mode="check-out"
        selectedChild={selectedChild}
      />
    </>
  );
}
