import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageWrapper } from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CreditCard, Calendar as CalendarIcon, MessageSquare, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function ParentSelfService() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [absenceReason, setAbsenceReason] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
      toast({
        title: 'Documents uploaded',
        description: `${files.length} document(s) uploaded successfully`,
      });
    }
  };

  const handleAbsenceRequest = () => {
    if (!selectedDate) {
      toast({
        title: 'Error',
        description: 'Please select a date for the absence',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Absence requested',
      description: `Absence request for ${format(selectedDate, 'MMMM d, yyyy')} has been submitted`,
    });
    setSelectedDate(undefined);
    setAbsenceReason('');
  };

  const handlePaymentSetup = () => {
    toast({
      title: 'Redirecting to payment portal',
      description: 'You will be redirected to our secure payment portal',
    });
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Parent Self-Service Portal</h1>
      </div>

      <Tabs defaultValue="enrollment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Online Enrollment</CardTitle>
              <CardDescription>Complete your child's enrollment online</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="child-name">Child's Full Name</Label>
                  <Input id="child-name" placeholder="Enter child's name" />
                </div>
                <div>
                  <Label htmlFor="birth-date">Date of Birth</Label>
                  <Input id="birth-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="parent-name">Parent/Guardian Name</Label>
                  <Input id="parent-name" placeholder="Enter your name" />
                </div>
                <div>
                  <Label htmlFor="parent-email">Email Address</Label>
                  <Input id="parent-email" type="email" placeholder="parent@example.com" />
                </div>
                <div>
                  <Label htmlFor="parent-phone">Phone Number</Label>
                  <Input id="parent-phone" type="tel" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <Label htmlFor="emergency-contact">Emergency Contact</Label>
                  <Input id="emergency-contact" placeholder="Name and phone" />
                </div>
              </div>
              <div>
                <Label htmlFor="medical-info">Medical Information</Label>
                <Textarea 
                  id="medical-info" 
                  placeholder="Allergies, medications, special needs..."
                  rows={4}
                />
              </div>
              <Button className="w-full">Submit Enrollment Application</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Upload required documents for enrollment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2">Drag and drop files here, or click to browse</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline" 
                  className="cursor-pointer"
                >
                  Select Files
                </Button>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Uploaded Documents:</h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium">Immunization Records</p>
                    <p className="text-xs text-gray-500">Required for enrollment</p>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium">Birth Certificate</p>
                    <p className="text-xs text-gray-500">Proof of age required</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Manage your payment methods and view history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">$1,200.00</p>
                    <p className="text-sm text-gray-500">Due by March 1, 2025</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AutoPay Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>Enabled</span>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Next payment: Feb 1</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Payment Methods</h3>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-500">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </Card>
                <Button onClick={handlePaymentSetup} className="w-full">
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>Request absences and view attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Select Date for Absence</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="absence-reason">Reason for Absence</Label>
                    <Select value={absenceReason} onValueChange={setAbsenceReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sick">Illness</SelectItem>
                        <SelectItem value="vacation">Family Vacation</SelectItem>
                        <SelectItem value="appointment">Medical Appointment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="absence-notes">Additional Notes</Label>
                    <Textarea 
                      id="absence-notes"
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleAbsenceRequest}
                    className="w-full"
                    disabled={!selectedDate || !absenceReason}
                  >
                    Submit Absence Request
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recent Attendance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Monday, Jan 27</span>
                    <span className="text-green-600">Present (7:45 AM - 5:30 PM)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Friday, Jan 24</span>
                    <span className="text-red-600">Absent - Sick</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Communication</CardTitle>
              <CardDescription>Send messages directly to your child's teacher</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message-recipient">Send To</Label>
                  <Select defaultValue="teacher">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Ms. Johnson (Lead Teacher)</SelectItem>
                      <SelectItem value="assistant">Mr. Smith (Assistant)</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message-content">Message</Label>
                  <Textarea 
                    id="message-content"
                    placeholder="Type your message here..."
                    rows={5}
                  />
                </div>

                <Button className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recent Messages</h3>
                <div className="space-y-3">
                  <Card className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Ms. Johnson</span>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-sm">Emma had a great day! She enjoyed art class and made a beautiful painting.</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">You</span>
                      <span className="text-sm text-gray-500">Yesterday</span>
                    </div>
                    <p className="text-sm">Thank you for the update! Please remind Emma to bring her library book tomorrow.</p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}