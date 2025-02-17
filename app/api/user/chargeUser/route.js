import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with your secret key

export async function POST(req) {
  try {
    console.log("charging user in chargeUser");
    await connectMongo();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User not found in chargeUser.js" },
        { status: 404 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found in database" },
        { status: 404 }
      );
    }

    const customerId = user.customerId; // Get the customer's ID from the user object
    const priceId = user.priceId;
    const paymentMethodId = user.paymentMethodId;
    const penaltyAmount = user.penaltyAmount;
    const amount = penaltyAmount * 100;

    // Check for missing data
    if (!priceId) {
      return NextResponse.json(
        { message: "Price ID is missing from user data" },
        { status: 400 }
      );
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { message: "Payment method ID is missing for the user" },
        { status: 400 }
      );
    }

    // Retrieve the price details using the priceId
    const price = await stripe.prices.retrieve(priceId);

    if (!price?.unit_amount) {
      return NextResponse.json(
        { message: "Invalid price details or amount is missing" },
        { status: 400 }
      );
    }

    const today = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    // Generate an idempotency key based on user ID and current date
    const idempotencyKey = `${user.id}-${today}`;

    // Charge the user
    try {
      await stripe.paymentIntents.create(
        {
          amount, // Amount in cents
          currency: price.currency, // Use the currency from the price object
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
        },
        {
          idempotencyKey, // Prevent duplicate charges
        }
      );

      // Update the user record with charge details
      await user.save();
      console.log("successfully charged user");

      return NextResponse.json({
        success: true,
        message: "Charged",
      });
    } catch (error) {
      if (error.type === "StripeCardError") {
        return NextResponse.json(
          { message: "Payment failed: Card was declined" },
          { status: 402 }
        );
      } else {
        return NextResponse.json(
          { message: "Payment failed due to an error" },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.log("error in chargeUser", error);
    return NextResponse.json(
      { message: "Failed to charge user due to server error" },
      { status: 500 }
    );
  }
}
