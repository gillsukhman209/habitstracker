import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with your secret key

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found in chargeUser.js" },
        { status: 404 }
      );
    }

    const customerId = user.customerId; // Get the customer's ID from the user object
    const priceId = user.priceId;
    const paymentMethodId = user.paymentMethodId;

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

    const amount = 140000;

    // Get the day object from the request
    const { day } = await req.json();

    // Check if the day is in the user's completed days
    if (user.completedDays.includes(day)) {
      return NextResponse.json(
        { message: "User has already completed this day" },
        { status: 400 }
      );
    }

    console.log("charging user");

    const today = "12/15/2024";

    // Generate an idempotency key based on user ID and current date
    const idempotencyKey = `${user.id}-${today}`;

    // Charge the user
    try {
      const paymentIntent = await stripe.paymentIntents.create(
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

      user.totalCharges = (user.totalCharges || 0) + amount / 100; // Convert to dollars

      await user.save();

      return NextResponse.json({
        success: true,
        message: "Charged",
        lastChargeDate: user.lastChargeDate,
        totalCharges: user.totalCharges,
      });
    } catch (error) {
      if (error.type === "StripeCardError") {
        console.error("Card declined:", error.message);
        return NextResponse.json(
          { message: "Payment failed: Card was declined" },
          { status: 402 }
        );
      } else {
        console.log("error", error);
      }
    }
  } catch (error) {
    console.error("Error charging user:", error);
    return NextResponse.json(
      { message: "Failed to charge user due to server error" },
      { status: 500 }
    );
  }
}
