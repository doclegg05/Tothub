import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, User, Mail, Shield, Calendar, Edit2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    // For now, just show a success message
    // In a real app, this would update the user profile via API
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{user.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{user.email || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center text-muted-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    Role
                  </Label>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Member Since
                  </Label>
                  <p className="font-medium">{format(new Date(), 'MMMM yyyy')}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Details about your account and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Username</Label>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="font-medium font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Permissions</Label>
                  <div className="mt-2">
                    {user.role === 'director' && (
                      <div className="space-y-1 text-sm">
                        <p>• Full system access</p>
                        <p>• User management</p>
                        <p>• Settings configuration</p>
                        <p>• Report generation</p>
                      </div>
                    )}
                    {user.role === 'teacher' && (
                      <div className="space-y-1 text-sm">
                        <p>• Check-in/out children</p>
                        <p>• View assigned rooms</p>
                        <p>• Update attendance</p>
                      </div>
                    )}
                    {user.role === 'staff' && (
                      <div className="space-y-1 text-sm">
                        <p>• View schedules</p>
                        <p>• Basic check-in access</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}