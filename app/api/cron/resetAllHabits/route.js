// Reset everyone's habits and update their completed days
import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectMongo();
    const users = await User.find({});
  } catch (error) {
    console.error("Error resetting habits:", error);
    return new Response(JSON.stringify({ error: "Failed to reset habits" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
