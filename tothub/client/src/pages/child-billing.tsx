import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, Calendar } from "lucide-react";
import { PaymentButton } from "@/components/payment-button";
import { Badge } from "@/components/ui/badge";

export default function ChildBilling() {
  const { id } = useParams();
  
  // Fetch child information
  const { data: child } = useQuery({
    queryKey: ["/api/children", id],
    queryFn: async () => {
      const response = await fetch(`/api/children/${id}`);
      if (!response.ok) throw new Error("Failed to fetch child");
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch payment history
  const { data: paymentHistory } = useQuery({
    queryKey: ["/api/stripe/payment-history", id],
    queryFn: async () => {
      const response = await fetch(`/api/stripe/payment-history/${id}`);
      if (!response.ok) throw new Error("Failed to fetch payment history");
      return response.json();
    },
    enabled: !!id,
  });

  if (!child) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Billing for {child.firstName} {child.lastName}</h1>
        <p className="text-muted-foreground">Manage payments and subscription</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Monthly tuition subscription</CardDescription>
          </CardHeader>
          <CardContent>
            {child.stripeSubscriptionId ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={child.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                    {child.subscriptionStatus || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Rate:</span>
                  <span className="font-semibold">
                    ${child.tuitionRate ? (child.tuitionRate / 100).toFixed(2) : '0.00'}
                  </span>
                </div>
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No active subscription. Set up automatic monthly payments.
                </p>
                <PaymentButton childId={id!} type="subscription" className="w-full">
                  Set Up Monthly Payments
                </PaymentButton>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>One-time payments and fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PaymentButton childId={id!} amount={50} variant="outline" className="w-full">
              <DollarSign className="mr-2 h-4 w-4" />
              Pay Registration Fee ($50)
            </PaymentButton>
            <PaymentButton childId={id!} variant="outline" className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Make Custom Payment
            </PaymentButton>
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              View Payment Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Transaction history for {child.firstName}</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory?.payments?.length > 0 ? (
            <div className="space-y-2">
              {paymentHistory.payments.slice(0, 5).map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{payment.description || 'Payment'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.created).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                    <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No payment history available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}