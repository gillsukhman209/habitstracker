import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    // Parse the request body
    const body = await req.json(); // Explicitly parse JSON body
    const { habitTitle, habitDuration } = body;

    console.log(habitTitle, habitDuration);

    if (!habitTitle) {
      console.log("habit name required");
      return NextResponse.json(
        { error: "Habit name is required" },
        { status: 400 }
      );
    }

    // Replace this with actual user ID fetching
    const user = await User.findById(session?.user?.id);
    console.log("found user", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add habit to user's habits array
    user.habits = user.habits || [];
    user.habits.push({
      title: habitTitle,
      duration: habitDuration,
      createdAt: new Date(),
    });
    await user.save();

    return NextResponse.json({ success: true, habit: habitTitle });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add habit server error" },
      { status: 500 }
    );
  }
}
