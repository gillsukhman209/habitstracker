import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import configFile from "@/config";
import User from "@/models/User";
import { findCheckoutSession } from "@/libs/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe webhook handler
export async function POST(req) {
  await connectMongo();

  let event;

  try {
    // Get raw body as text
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(
      JSON.stringify({ error: "Webhook verification failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = event.data;
  const eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        console.log("checkout session was completed");

        const session = await findCheckoutSession(data.object.id);
        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = data.object.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) break;

        const customer = await stripe.customers.retrieve(customerId);

        let user;

        // Identify or create the user
        if (userId) {
          user = await User.findById(userId);
        } else if (customer.email) {
          user = await User.findOne({ email: customer.email });

          if (!user) {
            user = await User.create({
              email: customer.email,
              name: customer.name,
            });
          }
        } else {
          throw new Error("No user found");
        }

        // Grant user access
        user.priceId = priceId;
        user.customerId = customerId;
        user.hasAccess = true;

        // Save payment method
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent
        );
        user.paymentMethodId = paymentIntent.payment_method;

        await user.save();
        console.log("User access granted and saved");
        break;
      }

      // Add additional Stripe events as needed here

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Stripe webhook error: ${error.message}`);
    return new NextResponse(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
