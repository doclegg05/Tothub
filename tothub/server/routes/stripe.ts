import { Router } from "express";
import Stripe from "stripe";
import { authMiddleware } from "../middleware/auth";
import { db } from "../db";
import { children, billing } from "@shared/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

const router = Router();

// Create a payment intent for one-time payments
router.post("/create-payment-intent", authMiddleware, async (req, res) => {
  try {
    const { childId, amount, description } = req.body;

    if (!childId || !amount) {
      return res.status(400).json({ message: "Child ID and amount are required" });
    }

    // Get child information
    const [child] = await db
      .select()
      .from(children)
      .where(eq(children.id, childId));

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Create or retrieve Stripe customer
    let customerId = child.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: child.parentEmail || undefined,
        name: child.parentName,
        phone: child.parentPhone || undefined,
        metadata: {
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
        },
      });
      
      // Update child record with Stripe customer ID
      await db
        .update(children)
        .set({ stripeCustomerId: customer.id })
        .where(eq(children.id, childId));
      
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      customer: customerId,
      description: description || `Payment for ${child.firstName} ${child.lastName}`,
      metadata: {
        childId: child.id,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Error creating payment intent: " + error.message });
  }
});

// Create or retrieve a subscription for recurring payments
router.post("/get-or-create-subscription", authMiddleware, async (req, res) => {
  try {
    const { childId, priceId } = req.body;

    if (!childId) {
      return res.status(400).json({ message: "Child ID is required" });
    }

    // Get child information
    const [child] = await db
      .select()
      .from(children)
      .where(eq(children.id, childId));

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Check if subscription already exists
    if (child.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(child.stripeSubscriptionId);
        
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          // Retrieve the latest invoice's payment intent
          const latestInvoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
            expand: ['latest_invoice.payment_intent'],
          });

          if (latestInvoice && (latestInvoice as any).payment_intent) {
            const paymentIntent = (latestInvoice as any).payment_intent;
            const clientSecret = typeof paymentIntent === 'string' 
              ? null // If it's just an ID, we can't get the client secret
              : (paymentIntent as Stripe.PaymentIntent)?.client_secret;
            
            return res.json({
              subscriptionId: subscription.id,
              clientSecret: clientSecret,
              status: subscription.status,
            });
          }
        }
      } catch (error) {
        console.log("Existing subscription not found or inactive, creating new one");
      }
    }

    // Create or retrieve Stripe customer
    let customerId = child.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: child.parentEmail || undefined,
        name: child.parentName,
        phone: child.parentPhone || undefined,
        metadata: {
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
        },
      });
      
      // Update child record with Stripe customer ID
      await db
        .update(children)
        .set({ stripeCustomerId: customer.id })
        .where(eq(children.id, childId));
      
      customerId = customer.id;
    }

    // Use the tuition rate from the child record if no priceId provided
    const subscriptionPriceId = priceId || process.env.STRIPE_TUITION_PRICE_ID;
    
    if (!subscriptionPriceId) {
      // If no price ID is available, create a one-time payment instead
      const amount = child.tuitionRate || 50000; // Default to $500 if no rate set
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        customer: customerId,
        description: `Monthly tuition for ${child.firstName} ${child.lastName}`,
        metadata: {
          childId: child.id,
          type: 'tuition',
        },
      });
      
      return res.json({
        clientSecret: paymentIntent.client_secret,
        isOneTime: true,
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: subscriptionPriceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        childId: child.id,
      },
    });

    // Update child record with subscription info
    await db
      .update(children)
      .set({ 
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      })
      .where(eq(children.id, childId));

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = (latestInvoice as any).payment_intent;
    const clientSecret = typeof paymentIntent === 'string' 
      ? null // If it's just an ID, we can't get the client secret
      : (paymentIntent as Stripe.PaymentIntent)?.client_secret;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return res.status(400).json({ error: { message: error.message } });
  }
});

// Cancel a subscription
router.post("/cancel-subscription", authMiddleware, async (req, res) => {
  try {
    const { childId } = req.body;

    if (!childId) {
      return res.status(400).json({ message: "Child ID is required" });
    }

    // Get child information
    const [child] = await db
      .select()
      .from(children)
      .where(eq(children.id, childId));

    if (!child || !child.stripeSubscriptionId) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    // Cancel the subscription
    const subscription = await stripe.subscriptions.cancel(child.stripeSubscriptionId);

    // Update child record
    await db
      .update(children)
      .set({ 
        subscriptionStatus: 'cancelled',
      })
      .where(eq(children.id, childId));

    res.json({ 
      message: "Subscription cancelled successfully",
      status: subscription.status 
    });
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ message: "Error cancelling subscription: " + error.message });
  }
});

// Get payment history
router.get("/payment-history/:childId", authMiddleware, async (req, res) => {
  try {
    const { childId } = req.params;

    // Get child information
    const [child] = await db
      .select()
      .from(children)
      .where(eq(children.id, childId));

    if (!child || !child.stripeCustomerId) {
      return res.json({ payments: [] });
    }

    // Get payment history from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      customer: child.stripeCustomerId,
      limit: 20,
    });

    const payments = paymentIntents.data.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100, // Convert from cents
      status: pi.status,
      description: pi.description,
      created: new Date(pi.created * 1000),
    }));

    res.json({ payments });
  } catch (error: any) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ message: "Error fetching payment history: " + error.message });
  }
});

// Webhook endpoint for Stripe events
router.post("/webhook", async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.log("Warning: No webhook secret configured, skipping signature verification");
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
      
      // Update billing record if needed
      if (paymentIntent.metadata.childId) {
        // You can update billing records here
      }
      break;

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription ${subscription.id} was ${event.type}`);
      
      // Update child record with new subscription status
      if (subscription.metadata.childId) {
        await db
          .update(children)
          .set({ 
            subscriptionStatus: subscription.status,
          })
          .where(eq(children.id, subscription.metadata.childId));
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export { router as stripeRouter };