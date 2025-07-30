import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useSearchParams } from "@/hooks/search-params";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment!",
      });
      // Redirect to dashboard after successful payment
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  );
};

export default function Payment() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const type = searchParams.get('type') || 'payment';
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!childId) {
      toast({
        title: "Error",
        description: "No child selected for payment",
        variant: "destructive",
      });
      return;
    }

    // Create PaymentIntent or Subscription based on type
    const endpoint = type === 'subscription' ? '/api/stripe/get-or-create-subscription' : '/api/stripe/create-payment-intent';
    const payload = type === 'subscription' 
      ? { childId }
      : { childId, amount: amount ? parseFloat(amount) : 100, description: "Daycare payment" };

    apiRequest("POST", endpoint, payload)
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error(data.message || "Failed to create payment");
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize payment",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [childId, type, amount, toast]);

  if (!childId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No child selected for payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-destructive">Failed to initialize payment. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'subscription' ? 'Set Up Monthly Tuition' : 'Make a Payment'}
          </CardTitle>
          <CardDescription>
            {type === 'subscription' 
              ? 'Enter your payment details to set up automatic monthly tuition payments.'
              : `Complete your payment${amount ? ` of $${amount}` : ''}.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}