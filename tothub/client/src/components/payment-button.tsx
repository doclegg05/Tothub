import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { Link } from "wouter";

interface PaymentButtonProps {
  childId: string;
  amount?: number;
  type?: 'payment' | 'subscription';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({ 
  childId, 
  amount, 
  type = 'payment',
  variant = 'default',
  size = 'default',
  className,
  children
}: PaymentButtonProps) {
  const href = `/payment?childId=${childId}&type=${type}${amount ? `&amount=${amount}` : ''}`;
  
  return (
    <Link href={href}>
      <Button variant={variant} size={size} className={className}>
        <CreditCard className="mr-2 h-4 w-4" />
        {children || (type === 'subscription' ? 'Set Up Subscription' : 'Make Payment')}
      </Button>
    </Link>
  );
}