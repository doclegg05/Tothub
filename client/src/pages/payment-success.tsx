import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function PaymentSuccess() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your payment has been processed successfully. Thank you for your payment.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button>Return to Dashboard</Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline">View Payment History</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}