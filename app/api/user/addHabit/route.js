import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function POST(req) {
  console.log("add habit route");
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { habitTitle, habitDuration, habitCount } = body;
    console.log(
      "habitTitle",
      habitTitle,
      "habitDuration",
      habitDuration,
      "habitCount",
      habitCount
    );
    if (!habitTitle) {
      return NextResponse.json(
        { error: "Habit name is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session?.user?.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.habits = user.habits || [];

    const newHabit = {
      title: habitTitle,
      count: habitCount,
      originalCount: habitCount,
      duration: habitDuration,
      originalDuration: habitDuration,
      progress: 0,
      createdAt: new Date(),
    };

    user.habits.push(newHabit);

    await user.save();

    return NextResponse.json({ success: true, habit: habitTitle });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { error: "Failed to add habit server error" },
      { status: 500 }
    );
  }
}
