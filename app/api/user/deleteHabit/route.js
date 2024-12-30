import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function DELETE(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const { habitId } = body;

    if (!habitId) {
      return NextResponse.json(
        { error: "Habit ID is required" },
        { status: 400 }
      );
    }

    // Find the user by their ID
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove the habit with the specified ID
    const updatedHabits = user.habits.filter(
      (habit) => habit._id.toString() !== habitId
    );

    if (updatedHabits.length === user.habits.length) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    user.habits = updatedHabits;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete habit due to server error" },
      { status: 500 }
    );
  }
}
