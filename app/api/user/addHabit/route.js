import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { habitTitle, habitDuration, habitCount } = body; // Include penaltyAmount
    if (!habitTitle) {
      return NextResponse.json(
        { error: "Habit name is required" },
        { status: 400 }
      );
    }
    if (!habitDuration && !habitCount) {
      return NextResponse.json(
        { error: "Either habit duration or habit count is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session?.user?.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.habits = user.habits || [];
    user.habits.push({
      title: habitTitle,
      duration: habitDuration,
      count: habitCount,
      createdAt: new Date(),
    });

    await user.save();

    return NextResponse.json({ success: true, habit: habitTitle });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add habit server error" },
      { status: 500 }
    );
  }
}
