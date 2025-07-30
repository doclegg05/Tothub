import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { formatDistance } from "date-fns";

export default function Billing() {
  const [selectedChildId, setSelectedChildId] = useState<string>("all");

  // Fetch children list for the dropdown
  const { data: childrenData } = useQuery({
    queryKey: ["children", 1],
    queryFn: async () => {
      const response = await fetch("/api/children?page=1&limit=100", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch children");
      return response.json();
    },
  });

  // Fetch billing records
  const { data: billingRecords } = useQuery({
    queryKey: ["/api/billing", selectedChildId],
    queryFn: async () => {
      const endpoint = selectedChildId === "all" || !selectedChildId
        ? "/api/billing"
        : `/api/billing?childId=${selectedChildId}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch billing records");
      return response.json();
    },
    enabled: true,
  });

  // Fetch payment history from Stripe
  const { data: paymentHistory } = useQuery({
    queryKey: ["/api/stripe/payment-history", selectedChildId],
    queryFn: async () => {
      if (!selectedChildId || selectedChildId === "all") return { payments: [] };
      const response = await fetch(`/api/stripe/payment-history/${selectedChildId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch payment history");
      return response.json();
    },
    enabled: !!selectedChildId && selectedChildId !== "all",
  });

  const children = childrenData?.data || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <div className="flex gap-4">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              {children.map((child: any) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${billingRecords?.outstanding || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all active enrollments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${billingRecords?.thisMonth || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Due by month end
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected YTD</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${billingRecords?.yearToDate || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Since January 1st
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="setup">Payment Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                View and manage billing invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Child</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingRecords?.invoices?.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        #{invoice.id.slice(-6)}
                      </TableCell>
                      <TableCell>
                        {invoice.childName}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.periodStart).toLocaleDateString()} - 
                        {new Date(invoice.periodEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${(invoice.totalAmount / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' :
                          invoice.status === 'overdue' ? 'destructive' :
                          'secondary'
                        }>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'pending' && selectedChildId && (
                          <Link href={`/payment?childId=${selectedChildId}&amount=${invoice.totalAmount / 100}&invoiceId=${invoice.id}`}>
                            <Button size="sm">Pay Now</Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View past payments and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory?.payments?.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        {formatDistance(new Date(payment.created), new Date(), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {payment.description || 'Daycare payment'}
                      </TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {selectedChildId && selectedChildId !== "all" ? 'No payment history found' : 'Select a child to view payment history'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Payment Setup</CardTitle>
              <CardDescription>
                Manage payment methods and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedChildId && selectedChildId !== "all" ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">One-Time Payment</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Make a one-time payment for fees, supplies, or other charges.
                      </p>
                      <Link href={`/payment?childId=${selectedChildId}&type=payment`}>
                        <Button>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Make Payment
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-2">Monthly Tuition Subscription</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Set up automatic monthly tuition payments to never miss a payment.
                      </p>
                      <Link href={`/payment?childId=${selectedChildId}&type=subscription`}>
                        <Button variant="outline">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Set Up Subscription
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Please select a child to manage payment methods
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}