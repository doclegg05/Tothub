import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calculator, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface PayPeriod {
  id: string;
  startDate?: string;
  endDate?: string;
  payDate?: string;
  status: string;
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
}

export function QuickBooksExport() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch pay periods
  const { data: payPeriods = [] } = useQuery<PayPeriod[]>({
    queryKey: ["/api/payroll/pay-periods"],
  });

  // Fetch GL summary for selected period
  const { data: glSummary } = useQuery({
    queryKey: ["/api/payroll/export/gl-summary", selectedPeriod],
    enabled: !!selectedPeriod,
  });

  const handleExport = async () => {
    if (!selectedPeriod) {
      toast({
        title: "Select Pay Period",
        description: "Please select a pay period to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const url = `/api/payroll/export/quickbooks/${selectedPeriod}?format=${exportFormat}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `payroll-${selectedPeriod}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Export Successful",
        description: `QuickBooks ${exportFormat.toUpperCase()} file downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export payroll data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleTaxReportExport = async () => {
    try {
      const currentDate = new Date();
      const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      const year = currentDate.getFullYear();

      const response = await fetch(`/api/payroll/export/tax-reports?quarter=${quarter}&year=${year}`);
      const taxData = await response.json();

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(taxData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tax-reports-Q${quarter}-${year}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Tax Report Generated",
        description: `Q${quarter} ${year} tax reports downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Tax Report Failed",
        description: "Failed to generate tax reports. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedPeriodData = payPeriods.find(p => p.id === selectedPeriod);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          <CardTitle>QuickBooks Export</CardTitle>
        </div>
        <CardDescription>
          Export payroll data to QuickBooks and generate financial reports
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pay Period Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Pay Period</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a pay period to export" />
            </SelectTrigger>
            <SelectContent>
              {payPeriods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {period.startDate ? new Date(period.startDate).toLocaleDateString() : 'N/A'} - {' '}
                      {period.endDate ? new Date(period.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <Badge variant={period.status === 'closed' ? 'default' : 'secondary'}>
                      {period.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV (Recommended)
                </div>
              </SelectItem>
              <SelectItem value="iif">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  IIF (QuickBooks Desktop)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pay Period Summary */}
        {selectedPeriodData && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-700">Pay Period Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Gross Pay</span>
                <p className="font-medium">${(selectedPeriodData.totalGrossPay / 100).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Taxes</span>
                <p className="font-medium">${(selectedPeriodData.totalTaxes / 100).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Net Pay</span>
                <p className="font-medium">${(selectedPeriodData.totalNetPay / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* General Ledger Summary */}
        {glSummary && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-700">General Ledger Impact</h4>
            <div className="space-y-1 text-sm">
              {glSummary.breakdown?.map((entry: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{entry.account}</span>
                  <span className="font-medium">
                    {entry.debit > 0 ? `+$${entry.debit.toFixed(2)}` : `-$${entry.credit.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleExport}
            disabled={!selectedPeriod || isExporting}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : `Export to QuickBooks (${exportFormat.toUpperCase()})`}
          </Button>

          <Button
            onClick={handleTaxReportExport}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Tax Reports (941/State)
          </Button>
        </div>

        {/* Format Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>CSV Format:</strong> Compatible with QuickBooks Online and most accounting software</p>
          <p><strong>IIF Format:</strong> Direct import for QuickBooks Desktop versions</p>
          <p><strong>Tax Reports:</strong> Quarterly 941 and state withholding summaries</p>
        </div>
      </CardContent>
    </Card>
  );
}