import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function PATCH(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { habitId, isComplete, duration, count, progress } = body;

    if (!habitId || typeof isComplete !== "boolean") {
      return NextResponse.json(
        { error: "Habit ID and isComplete status are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const habit = user.habits.find((habit) => habit._id.toString() === habitId);

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Update habit fields
    habit.isComplete = isComplete;
    if (duration !== undefined) habit.duration = duration;
    if (count !== undefined) habit.count = count;
    if (progress !== undefined) habit.progress = progress;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Habit updated successfully",
      habit,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update habit due to server error" },
      { status: 500 }
    );
  }
}
