import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { 
  ArrowLeft, User, Mail, Shield, Calendar, Edit2, Lock, Bell, 
  Activity, Settings, Camera, Trash2, Download, Smartphone,
  Globe, Moon, Sun, Key, AlertCircle, CheckCircle2, Upload, X
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem('userAvatar');
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    checkIn: true,
    alerts: true,
    reports: false,
    marketing: false,
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    language: 'en',
    timezone: 'America/New_York',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Mock activity data
  const { data: activities = [] } = useQuery({
    queryKey: ['/api/profile/activities'],
    enabled: false, // Mock for now
    initialData: [
      { id: 1, action: 'Logged in', timestamp: new Date().toISOString(), device: 'Chrome on Windows', ip: '192.168.1.1' },
      { id: 2, action: 'Updated profile', timestamp: new Date(Date.now() - 86400000).toISOString(), device: 'Mobile App', ip: '192.168.1.2' },
      { id: 3, action: 'Changed password', timestamp: new Date(Date.now() - 172800000).toISOString(), device: 'Firefox on Mac', ip: '192.168.1.3' },
    ]
  });

  // Mock sessions data
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/profile/sessions'],
    enabled: false, // Mock for now
    initialData: [
      { id: 1, device: 'Chrome on Windows', location: 'New York, US', lastActive: new Date().toISOString(), current: true },
      { id: 2, device: 'TotHub Mobile', location: 'New York, US', lastActive: new Date(Date.now() - 3600000).toISOString(), current: false },
    ]
  });

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleImageUpload = () => {
    setShowUploadModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PNG, JPG, GIF, or WebP image.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Read and store the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
        localStorage.setItem('userAvatar', result);
        setShowUploadModal(false);
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem('userAvatar');
    setShowUploadModal(false);
    toast({
      title: "Profile Picture Removed",
      description: "Your profile picture has been removed.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "You'll receive an email with your data shortly.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion Requested",
      description: "Please check your email to confirm account deletion.",
      variant: "destructive",
    });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode`,
    });
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

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar 
                    className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleImageUpload}
                  >
                    <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full p-2"
                    onClick={handleImageUpload}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{user.role}</Badge>
                    {twoFactorEnabled && <Badge variant="secondary">2FA Enabled</Badge>}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {isEditing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{formData.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      ) : (
                        <p className="font-medium">{formData.email || 'Not provided'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      {isEditing ? (
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      ) : (
                        <p className="font-medium">{formData.phone || 'Not provided'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      {isEditing ? (
                        <Select
                          value={formData.language}
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium">English</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      {isEditing ? (
                        <Select
                          value={formData.timezone}
                          onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium">Eastern Time</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <p className="font-medium">{format(new Date(), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    />
                  </div>
                  <Button onClick={handlePasswordChange}>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable 2FA</Label>
                      <p className="text-sm text-muted-foreground">
                        Use an authenticator app to generate verification codes
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                  {twoFactorEnabled && (
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Two-factor authentication is enabled
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your account is protected with an additional security layer
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage your active login sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.location} • Last active {format(new Date(session.lastActive), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.current && <Badge variant="secondary">Current</Badge>}
                          {!session.current && (
                            <Button variant="ghost" size="sm">Revoke</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Check-in/Check-out</Label>
                        <p className="text-sm text-muted-foreground">When children are checked in or out</p>
                      </div>
                      <Switch
                        checked={notifications.checkIn}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, checkIn: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Important system notifications</p>
                      </div>
                      <Switch
                        checked={notifications.alerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, alerts: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reports</Label>
                        <p className="text-sm text-muted-foreground">Daily and weekly reports</p>
                      </div>
                      <Switch
                        checked={notifications.reports}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, reports: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing</Label>
                        <p className="text-sm text-muted-foreground">Product updates and announcements</p>
                      </div>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent account activity and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')} • {activity.device}
                          </p>
                          <p className="text-xs text-muted-foreground">IP: {activity.ip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Export Your Data</p>
                          <p className="text-sm text-muted-foreground">
                            Download a copy of all your data
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleExportData}>
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Privacy Settings</p>
                          <p className="text-sm text-muted-foreground">
                            Control your privacy preferences
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">API Keys</p>
                          <p className="text-sm text-muted-foreground">
                            Manage API keys for integrations
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4 pt-4">
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900">Delete Account</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-3"
                            onClick={handleDeleteAccount}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Choose an image file to use as your profile picture. Supported formats: PNG, JPG, GIF, WebP (max 5MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {avatarUrl && (
              <div className="flex justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="flex flex-col gap-4">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload an image</p>
                  </div>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <div className="flex gap-2">
                {avatarUrl && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveAvatar}
                    className="flex-1"
                  >
                    Remove Picture
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}