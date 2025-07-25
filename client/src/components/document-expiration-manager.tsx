import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Shield, 
  Users, 
  Building,
  RefreshCw,
  Eye,
  XCircle,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Document {
  id: string;
  title: string;
  description?: string;
  issueDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'suspended';
  documentNumber?: string;
  issuingAuthority?: string;
  contactInfo?: string;
  filePath?: string;
  lastReminderSent?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  documentType: {
    id: string;
    name: string;
    category: string;
    isRequired: boolean;
    alertDaysBefore: number;
  };
}

interface DocumentTemplate {
  name: string;
  category: string;
  description: string;
  isRequired: boolean;
  renewalFrequency: string;
  alertDaysBefore: number;
  regulatoryBody: string;
  complianceNotes: string;
}

export function DocumentExpirationManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: 'insurance',
    documentNumber: '',
    issuingAuthority: '',
    contactInfo: '',
    issueDate: '',
    expirationDate: '',
    alertDaysBefore: '30',
  });
  const [renewalData, setRenewalData] = useState({
    newExpirationDate: '',
    cost: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents/documents'],
  }) as { data: Document[]; isLoading: boolean };

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/documents/templates'],
  }) as { data: DocumentTemplate[] };

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/documents/statistics'],
  });

  // Fetch pending reminders
  const { data: pendingReminders = [] } = useQuery({
    queryKey: ['/api/documents/reminders/pending'],
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/documents/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: 'admin', // This would come from auth context
          documentTypeId: 'custom', // This would be selected or created
        }),
      });
      if (!response.ok) throw new Error('Failed to create document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents/statistics'] });
      setIsDialogOpen(false);
      resetNewDocument();
      toast({ title: 'Document added successfully!' });
    },
  });

  // Renew document mutation
  const renewDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/documents/documents/${id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          processedBy: 'admin', // This would come from auth context
        }),
      });
      if (!response.ok) throw new Error('Failed to renew document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents/statistics'] });
      setIsRenewalDialogOpen(false);
      setSelectedDocument(null);
      setRenewalData({ newExpirationDate: '', cost: '', notes: '' });
      toast({ title: 'Document renewed successfully!' });
    },
  });

  // Acknowledge reminder mutation
  const acknowledgeReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await fetch(`/api/documents/reminders/${reminderId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: 'admin' }),
      });
      if (!response.ok) throw new Error('Failed to acknowledge reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/reminders/pending'] });
      toast({ title: 'Reminder acknowledged!' });
    },
  });

  const resetNewDocument = () => {
    setNewDocument({
      title: '',
      description: '',
      category: 'insurance',
      documentNumber: '',
      issuingAuthority: '',
      contactInfo: '',
      issueDate: '',
      expirationDate: '',
      alertDaysBefore: '30',
    });
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(d => d.documentType?.category === selectedCategory);

  const expired = documents.filter(d => 
    d.isActive && new Date(d.expirationDate) < new Date()
  );

  const expiringSoon = documents.filter(d => 
    d.isActive && 
    new Date(d.expirationDate) > new Date() &&
    new Date(d.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const getPriorityColor = (expirationDate: string, status: string) => {
    if (status === 'expired') return 'bg-red-500';
    
    const daysUntilExpiration = Math.ceil(
      (new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiration < 0) return 'bg-red-500';
    if (daysUntilExpiration <= 7) return 'bg-orange-500';
    if (daysUntilExpiration <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'insurance': return <Shield className="h-4 w-4" />;
      case 'license': return <FileText className="h-4 w-4" />;
      case 'certification': return <CheckCircle className="h-4 w-4" />;
      case 'legal': return <Building className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string, expirationDate: string) => {
    const daysUntilExpiration = Math.ceil(
      (new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiration <= 7) {
      return <Badge variant="destructive">Expires Soon</Badge>;
    } else if (daysUntilExpiration <= 30) {
      return <Badge variant="secondary">Expires This Month</Badge>;
    } else {
      return <Badge variant="outline">Active</Badge>;
    }
  };

  const useTemplate = (template: DocumentTemplate) => {
    setNewDocument({
      title: template.name,
      description: template.description,
      category: template.category,
      documentNumber: '',
      issuingAuthority: template.regulatoryBody,
      contactInfo: '',
      issueDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      alertDaysBefore: template.alertDaysBefore.toString(),
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-red-600">{expired.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{expiringSoon.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Alerts</p>
                <p className="text-2xl font-bold">{pendingReminders.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reminders Alert */}
      {pendingReminders.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{pendingReminders.length} pending reminder{pendingReminders.length > 1 ? 's' : ''}</strong> require attention:
            <ul className="mt-2 list-disc pl-5">
              {pendingReminders.slice(0, 3).map((reminder: any) => (
                <li key={reminder.id} className="flex items-center justify-between">
                  <span>{reminder.message}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeReminderMutation.mutate(reminder.id)}
                    disabled={acknowledgeReminderMutation.isPending}
                  >
                    Acknowledge
                  </Button>
                </li>
              ))}
              {pendingReminders.length > 3 && <li>...and {pendingReminders.length - 3} more</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="license">Licenses</SelectItem>
              <SelectItem value="certification">Certifications</SelectItem>
              <SelectItem value="legal">Legal Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Document or Insurance Policy</DialogTitle>
              <DialogDescription>
                Track expiration dates and receive automated renewal reminders
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="custom" className="w-full">
              <TabsList>
                <TabsTrigger value="custom">Custom Document</TabsTrigger>
                <TabsTrigger value="templates">Use Template</TabsTrigger>
              </TabsList>
              <TabsContent value="custom" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                      placeholder="e.g., General Liability Insurance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newDocument.category} onValueChange={(value) => setNewDocument({...newDocument, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="license">License</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="legal">Legal Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="documentNumber">Policy/License Number</Label>
                    <Input
                      id="documentNumber"
                      value={newDocument.documentNumber}
                      onChange={(e) => setNewDocument({...newDocument, documentNumber: e.target.value})}
                      placeholder="e.g., POL-2024-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                    <Input
                      id="issuingAuthority"
                      value={newDocument.issuingAuthority}
                      onChange={(e) => setNewDocument({...newDocument, issuingAuthority: e.target.value})}
                      placeholder="e.g., ABC Insurance Company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={newDocument.issueDate}
                      onChange={(e) => setNewDocument({...newDocument, issueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={newDocument.expirationDate}
                      onChange={(e) => setNewDocument({...newDocument, expirationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="alertDays">Alert Days Before</Label>
                    <Input
                      id="alertDays"
                      type="number"
                      value={newDocument.alertDaysBefore}
                      onChange={(e) => setNewDocument({...newDocument, alertDaysBefore: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Input
                      id="contactInfo"
                      value={newDocument.contactInfo}
                      onChange={(e) => setNewDocument({...newDocument, contactInfo: e.target.value})}
                      placeholder="Phone or email for renewals"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                    placeholder="Additional details about this document..."
                  />
                </div>
              </TabsContent>
              <TabsContent value="templates" className="space-y-4">
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {templates.map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => useTemplate(template)}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{template.category}</Badge>
                              <Badge variant="outline">{template.renewalFrequency}</Badge>
                              <Badge variant="outline">{template.alertDaysBefore} days alert</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{template.complianceNotes}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => createDocumentMutation.mutate(newDocument)} disabled={createDocumentMutation.isPending}>
                Add Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No documents found. Add your first document to get started with expiration tracking.
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(document.documentType?.category || 'legal')}
                      <h3 className="font-semibold">{document.title}</h3>
                      {getStatusBadge(document.status, document.expirationDate)}
                      <Badge variant="outline">{document.documentType?.category || 'Other'}</Badge>
                    </div>
                    {document.description && (
                      <p className="text-sm text-muted-foreground mb-3">{document.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <span>Issue Date: {new Date(document.issueDate).toLocaleDateString()}</span>
                      <span>Expires: {new Date(document.expirationDate).toLocaleDateString()}</span>
                      {document.documentNumber && <span>Number: {document.documentNumber}</span>}
                      {document.issuingAuthority && <span>Issuer: {document.issuingAuthority}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDocument(document);
                        setRenewalData({
                          newExpirationDate: '',
                          cost: '',
                          notes: '',
                        });
                        setIsRenewalDialogOpen(true);
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Renew
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Renewal Dialog */}
      <Dialog open={isRenewalDialogOpen} onOpenChange={setIsRenewalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Document</DialogTitle>
            <DialogDescription>
              Update the expiration date for {selectedDocument?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newExpirationDate">New Expiration Date</Label>
              <Input
                id="newExpirationDate"
                type="date"
                value={renewalData.newExpirationDate}
                onChange={(e) => setRenewalData({...renewalData, newExpirationDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="cost">Renewal Cost (optional)</Label>
              <Input
                id="cost"
                value={renewalData.cost}
                onChange={(e) => setRenewalData({...renewalData, cost: e.target.value})}
                placeholder="e.g., $1,200"
              />
            </div>
            <div>
              <Label htmlFor="renewalNotes">Notes</Label>
              <Textarea
                id="renewalNotes"
                value={renewalData.notes}
                onChange={(e) => setRenewalData({...renewalData, notes: e.target.value})}
                placeholder="Additional notes about the renewal..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewalDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedDocument && renewDocumentMutation.mutate({ 
                id: selectedDocument.id, 
                data: renewalData 
              })}
              disabled={renewDocumentMutation.isPending}
            >
              Renew Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}