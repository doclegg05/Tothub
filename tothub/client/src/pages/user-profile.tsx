import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Globe, Bell } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { InsertUser } from "@shared/types";

interface UserProfile extends InsertUser {
  childrenIds?: string[];
  phoneNumber?: string;
  username?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  jobTitle?: string;
  department?: string;
}

export default function UserProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/profile");
      return response.json();
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      apiRequest("PATCH", "/api/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <p>Profile not found.</p>
      </div>
    );
  }

  const getInitials = () => {
    return `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateProfile.mutate({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      bio: formData.get("bio") as string,
      preferredLanguage: formData.get("preferredLanguage") as string,
      jobTitle: formData.get("jobTitle") as string || undefined,
      department: formData.get("department") as string || undefined,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profilePictureUrl || undefined} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-muted-foreground">@{profile.username}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{profile.role}</Badge>
                  {profile.isActive && <Badge variant="default">Active</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={profile.firstName}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={profile.lastName}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={profile.email || ""}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        defaultValue={profile.phoneNumber || ""}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <div className="space-y-2">
                      <Input
                        name="street"
                        placeholder="Street"
                        defaultValue={profile.street || ""}
                        disabled={!isEditing}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          name="city"
                          placeholder="City"
                          defaultValue={profile.city || ""}
                          disabled={!isEditing}
                        />
                        <Input
                          name="state"
                          placeholder="State"
                          defaultValue={profile.state || ""}
                          disabled={!isEditing}
                        />
                        <Input
                          name="zipCode"
                          placeholder="ZIP"
                          defaultValue={profile.zipCode || ""}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      defaultValue={profile.bio || ""}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Your work-related details and qualifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(profile.role === 'director' || profile.role === 'teacher' || profile.role === 'staff') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="jobTitle"
                            name="jobTitle"
                            defaultValue={profile.jobTitle || ""}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          name="department"
                          defaultValue={profile.department || ""}
                          disabled={!isEditing}
                        />
                      </div>

                      {profile.employeeId && (
                        <div className="space-y-2">
                          <Label>Employee ID</Label>
                          <p className="text-sm text-muted-foreground">{profile.employeeId}</p>
                        </div>
                      )}

                      {profile.hireDate && (
                        <div className="space-y-2">
                          <Label>Hire Date</Label>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">
                              {new Date(profile.hireDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {profile.role === 'parent' && (
                    <div className="space-y-2">
                      <Label>Associated Children</Label>
                      {profile.childrenIds && profile.childrenIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.childrenIds?.map((childId: string) => (
                            <Badge key={childId} variant="secondary">
                              Child ID: {childId}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No children associated</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Manage your language and notification settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredLanguage">Preferred Language</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Select name="preferredLanguage" defaultValue={profile.preferredLanguage || "en"} disabled={!isEditing}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Preferences</Label>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Coming soon: Customize how you receive notifications
                      </p>
                    </div>
                  </div>

                  {profile.lastLoginAt && (
                    <div className="space-y-2">
                      <Label>Last Login</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile.lastLoginAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {isEditing && (
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </Tabs>
      </div>
    </div>
  );
}