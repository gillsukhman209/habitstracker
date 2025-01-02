import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    const { penaltyAmount } = await req.json(); // Get the penalty amount from the request body

    console.log("penalty amount received in route.js", penaltyAmount);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id; // Use the user ID from the session
    const user = await User.findById(userId);
    console.log("user found in route.js", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.penaltyAmount = penaltyAmount; // Update the user's penalty amount
    await user.save();

    return NextResponse.json(
      { message: "Penalty updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while updating penalty" },
      { status: 500 }
    );
  }
}
