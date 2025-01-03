import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with your secret key

export async function POST(req) {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongo();
    console.log("Connected to MongoDB.");

    const { userId } = await req.json();
    console.log("Received userId:", userId);

    if (!userId) {
      console.log("User ID not found.");
      return NextResponse.json(
        { message: "User not found in chargeUser.js" },
        { status: 404 }
      );
    }

    const user = await User.findById(userId);
    console.log("Fetched user:", user);

    const customerId = user.customerId; // Get the customer's ID from the user object
    const priceId = user.priceId;
    const paymentMethodId = user.paymentMethodId;
    const penaltyAmount = user.penaltyAmount;
    const amount = penaltyAmount * 100;

    console.log("Customer ID:", customerId);
    console.log("Price ID:", priceId);
    console.log("Payment Method ID:", paymentMethodId);
    console.log("Penalty Amount:", penaltyAmount);
    console.log("Amount to charge:", amount);

    // Check for missing data
    if (!priceId) {
      console.log("Price ID is missing from user data.");
      return NextResponse.json(
        { message: "Price ID is missing from user data" },
        { status: 400 }
      );
    }

    if (!paymentMethodId) {
      console.log("Payment method ID is missing for the user.");
      return NextResponse.json(
        { message: "Payment method ID is missing for the user" },
        { status: 400 }
      );
    }

    // Retrieve the price details using the priceId
    const price = await stripe.prices.retrieve(priceId);
    console.log("Retrieved price details:", price);

    if (!price?.unit_amount) {
      console.log("Invalid price details or amount is missing.");
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
    console.log("Today's date:", today);

    // Generate an idempotency key based on user ID and current date
    const idempotencyKey = `${user.id}-${today}`;
    console.log("Idempotency Key:", idempotencyKey);

    // Charge the user
    try {
      console.log("Charging user...");
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

      console.log("User charged successfully.");

      // Update the user record with charge details
      await user.save();
      console.log("User record updated.");

      return NextResponse.json({
        success: true,
        message: "Charged",
        lastChargeDate: user.lastChargeDate,
        totalCharges: user.totalCharges,
      });
    } catch (error) {
      console.error("Error charging user:", error);
      if (error.type === "StripeCardError") {
        return NextResponse.json(
          { message: "Payment failed: Card was declined" },
          { status: 402 }
        );
      }
    }
  } catch (error) {
    console.error("Failed to charge user due to server error:", error);
    return NextResponse.json(
      { message: "Failed to charge user due to server error" },
      { status: 500 }
    );
  }
}
