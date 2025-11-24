import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  Users, 
  Eye,
  FileText,
  Clock,
  Building,
  Scale,
  MapPin,
  Info
} from 'lucide-react';
import { US_STATES_LIST, STATE_COMPLIANCE_RATIOS } from '@shared/stateComplianceData';
import { SafetyReminderManager } from '@/components/safety-reminder-manager';
import { DocumentExpirationManager } from '@/components/document-expiration-manager';

export default function CompliancePage() {
  const [selectedState, setSelectedState] = useState('California');
  const [ageGroup, setAgeGroup] = useState('infant');
  const [childCount, setChildCount] = useState('4');
  const [staffCount, setStaffCount] = useState('1');

  const queryClient = useQueryClient();

  // Check ratio compliance
  const { data: ratioCompliance, isLoading: ratioLoading } = useQuery({
    queryKey: ['/api/compliance/ratios/check', selectedState, ageGroup, childCount, staffCount],
    enabled: !!selectedState && !!ageGroup && !!childCount && !!staffCount,
  }) as { data: any; isLoading: boolean };

  // Get qualification requirements
  const { data: qualifications } = useQuery({
    queryKey: ['/api/compliance/qualifications', selectedState, ageGroup],
    enabled: !!selectedState && !!ageGroup,
  }) as { data: any };

  // Get accessibility recommendations
  const { data: accessibilityRecs } = useQuery({
    queryKey: ['/api/compliance/accessibility/recommendations'],
  }) as { data: any };

  // Get testing checklist
  const { data: testingChecklist } = useQuery({
    queryKey: ['/api/compliance/accessibility/testing-checklist'],
  }) as { data: any };

  // FLSA validation mutation
  const flsaValidation = useMutation({
    mutationFn: async (data: { hoursWorked: number; hourlyRate: number; state: string }) => {
      const response = await fetch('/api/compliance/flsa/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('FLSA validation failed');
      return response.json();
    },
  });

  // Color contrast check mutation
  const colorContrastCheck = useMutation({
    mutationFn: async (data: { foreground: string; background: string; fontSize: number; isBold: boolean }) => {
      const response = await fetch('/api/compliance/accessibility/color-contrast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Color contrast check failed');
      return response.json();
    },
  });

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getComplianceBadge = (compliant: boolean, level?: string) => {
    if (compliant) {
      return <Badge variant="default" className="bg-green-500">{level || 'Compliant'}</Badge>;
    }
    return <Badge variant="destructive">Non-Compliant</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Regulatory Compliance Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor compliance with state regulations, labor laws, and accessibility standards
        </p>
      </div>

      <Tabs defaultValue="ratios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ratios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ratios
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Labor Laws
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Accessibility
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        {/* Teacher-Student Ratios */}
        <TabsContent value="ratios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teacher-Student Ratio Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {US_STATES_LIST.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infant">Infant (0-16 months)</SelectItem>
                      <SelectItem value="toddler">Toddler (16 months - 2 years)</SelectItem>
                      <SelectItem value="preschool">Preschool (3-5 years)</SelectItem>
                      <SelectItem value="school_age">School Age (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="childCount">Children</Label>
                  <Input
                    type="number"
                    value={childCount}
                    onChange={(e) => setChildCount(e.target.value)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="staffCount">Staff</Label>
                  <Input
                    type="number"
                    value={staffCount}
                    onChange={(e) => setStaffCount(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              {ratioCompliance && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-2">
                    {getComplianceIcon(ratioCompliance.compliant)}
                    <span className="font-semibold">
                      {ratioCompliance.compliant ? 'Compliant' : 'Non-Compliant'}
                    </span>
                    {getComplianceBadge(ratioCompliance.compliant, ratioCompliance.standard)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{ratioCompliance.requiredStaff}</div>
                        <div className="text-sm text-muted-foreground">Required Staff</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{ratioCompliance.maxChildren}</div>
                        <div className="text-sm text-muted-foreground">Max Children</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{ratioCompliance.standard}</div>
                        <div className="text-sm text-muted-foreground">Standard</div>
                      </CardContent>
                    </Card>
                  </div>

                  {ratioCompliance.violations && ratioCompliance.violations.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc pl-4">
                          {ratioCompliance.violations.map((violation: string, index: number) => (
                            <li key={index}>{violation}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Comprehensive State Requirements */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {selectedState} State Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Full Ratio Table */}
                    <div>
                      <h4 className="font-semibold mb-3">Complete Ratio Requirements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {STATE_COMPLIANCE_RATIOS[selectedState] && Object.entries(STATE_COMPLIANCE_RATIOS[selectedState]).map(([ageGroup, ratio]) => {
                          if (ageGroup === 'maxGroupSize' || ageGroup === 'notes') return null;
                          return (
                            <Card key={ageGroup} className="border-l-4 border-l-blue-500">
                              <CardContent className="pt-4">
                                <div className="text-sm font-medium text-muted-foreground">{ageGroup}</div>
                                <div className="text-2xl font-bold">{ratio}</div>
                                <div className="text-xs text-muted-foreground">Children per Teacher</div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    {/* Maximum Group Sizes */}
                    {STATE_COMPLIANCE_RATIOS[selectedState]?.maxGroupSize && (
                      <div>
                        <h4 className="font-semibold mb-3">Maximum Group Sizes</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(STATE_COMPLIANCE_RATIOS[selectedState].maxGroupSize!).map(([ageGroup, maxSize]) => (
                            <div key={ageGroup} className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-muted-foreground">{ageGroup}</div>
                              <div className="font-bold">{maxSize} children max</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special Notes */}
                    {STATE_COMPLIANCE_RATIOS[selectedState]?.notes && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>State-Specific Notes:</strong> {STATE_COMPLIANCE_RATIOS[selectedState].notes}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Staff Qualifications */}
                    {qualifications && (
                      <div>
                        <h4 className="font-semibold mb-3">Staff Qualification Requirements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">Required Qualifications</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {qualifications.required.map((req: string, index: number) => (
                                <li key={index} className="text-sm">{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-700 mb-2">Preferred Qualifications</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {qualifications.preferred.map((pref: string, index: number) => (
                                <li key={index} className="text-sm">{pref}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-800">Continuing Education</h5>
                          <p className="text-sm text-blue-700 mt-1">{qualifications.continuing_education}</p>
                        </div>
                      </div>
                    )}

                    {/* Compliance Comparison */}
                    <div>
                      <h4 className="font-semibold mb-3">How {selectedState} Compares</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-green-200 bg-green-50">
                          <CardContent className="pt-4">
                            <div className="text-green-800 font-semibold">Strictest States</div>
                            <div className="text-sm text-green-600 mt-1">
                              Maryland (3:1), Massachusetts (3:1), DC (3:1)
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-yellow-200 bg-yellow-50">
                          <CardContent className="pt-4">
                            <div className="text-yellow-800 font-semibold">Moderate States</div>
                            <div className="text-sm text-yellow-600 mt-1">
                              California (4:1), New York (4:1), Texas (4:1)
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-orange-200 bg-orange-50">
                          <CardContent className="pt-4">
                            <div className="text-orange-800 font-semibold">Lenient States</div>
                            <div className="text-sm text-orange-600 mt-1">
                              Alabama (5:1), Arkansas (6:1), Louisiana (6:1)
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Labor Law Compliance */}
        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FLSA Compliance Checker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hoursWorked">Hours Worked</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="40.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="15.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payrollState">State</Label>
                    <Select defaultValue="California">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {US_STATES_LIST.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={() => flsaValidation.mutate({ hoursWorked: 40, hourlyRate: 15, state: 'California' })}
                  disabled={flsaValidation.isPending}
                >
                  Check FLSA Compliance
                </Button>

                {flsaValidation.data && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      {getComplianceIcon(flsaValidation.data.compliant)}
                      <span className="font-semibold">
                        {flsaValidation.data.compliant ? 'FLSA Compliant' : 'FLSA Violations Found'}
                      </span>
                    </div>

                    {flsaValidation.data.violations.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <ul className="list-disc pl-4">
                            {flsaValidation.data.violations.map((violation: string, index: number) => (
                              <li key={index}>{violation}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {flsaValidation.data.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold">Recommendations</h4>
                        <ul className="list-disc pl-5 mt-2">
                          {flsaValidation.data.recommendations.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Physical Security Compliance */}
        <TabsContent value="security" className="space-y-6">
          {/* Safety Reminders System */}
          <Card>
            <CardHeader>
              <CardTitle>Safety Reminder System</CardTitle>
              <CardDescription>
                Manage safety equipment checks, emergency drills, and compliance tasks with automated alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SafetyReminderManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UL 294 Physical Security Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Physical security devices must meet UL 294 standards for access control systems used in childcare facilities.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Security Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          AES-256 encryption minimum
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Multi-factor authentication
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Comprehensive audit logging
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Fail-safe/fail-secure modes
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Tamper detection
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Emergency Procedures</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li>• Emergency unlock procedures</li>
                        <li>• Fire safety integration</li>
                        <li>• Lockdown capabilities</li>
                        <li>• Power failure protocols</li>
                        <li>• Manual override options</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Compliance */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>WCAG 2.1 Accessibility Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Color Contrast Checker</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="foreground">Foreground Color</Label>
                      <Input type="color" defaultValue="#000000" />
                    </div>
                    <div>
                      <Label htmlFor="background">Background Color</Label>
                      <Input type="color" defaultValue="#ffffff" />
                    </div>
                    <div>
                      <Label htmlFor="fontSize">Font Size (px)</Label>
                      <Input type="number" defaultValue="16" />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => colorContrastCheck.mutate({ 
                          foreground: '#000000', 
                          background: '#ffffff', 
                          fontSize: 16, 
                          isBold: false 
                        })}
                        disabled={colorContrastCheck.isPending}
                      >
                        Check Contrast
                      </Button>
                    </div>
                  </div>

                  {colorContrastCheck.data && (
                    <div className="mt-4 p-4 border rounded">
                      <div className="flex items-center gap-2 mb-2">
                        {getComplianceIcon(colorContrastCheck.data.compliant)}
                        <span className="font-semibold">
                          Contrast Ratio: {colorContrastCheck.data.ratio}:1
                        </span>
                        {getComplianceBadge(colorContrastCheck.data.compliant, colorContrastCheck.data.level)}
                      </div>
                    </div>
                  )}
                </div>

                {accessibilityRecs && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Accessibility Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {accessibilityRecs.slice(0, 6).map((rec: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{rec.category}</h4>
                              <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.suggestion}</p>
                            <p className="text-xs">{rec.implementation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {testingChecklist && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Testing Checklist</h3>
                    <Tabs defaultValue="keyboard">
                      <TabsList>
                        <TabsTrigger value="keyboard">Keyboard</TabsTrigger>
                        <TabsTrigger value="screenReader">Screen Reader</TabsTrigger>
                        <TabsTrigger value="colorBlind">Color Blind</TabsTrigger>
                        <TabsTrigger value="motor">Motor</TabsTrigger>
                      </TabsList>
                      {Object.entries(testingChecklist).map(([key, tests]: [string, any]) => (
                        <TabsContent key={key} value={key.replace('Testing', '')}>
                          <ul className="space-y-2">
                            {tests.map((test: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <input type="checkbox" className="mt-1" />
                                <span className="text-sm">{test}</span>
                              </li>
                            ))}
                          </ul>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Documentation */}
        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Expiration Management</CardTitle>
              <CardDescription>
                Track required documents, insurance policies, and certifications with automated expiration alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentExpirationManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}