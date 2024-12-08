import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function GET() {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

<<<<<<< HEAD
    // Check if the habits need to be reset
    if (user.lastResetDay !== today) {
      // Reset habits
      user.habits.forEach((habit) => {
        habit.isComplete = false; // Reset each habit
      });
      user.lastResetDay = today; // Update last reset day
      await user.save(); // Save changes
    }

    return NextResponse.json({ habits: user.habits });
=======
    return NextResponse.json({
      habits: habits,
      lastResetDate: user.lastResetDate,
    });
>>>>>>> ed14104 (new method added)
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch habits due to server error" },
      { status: 500 }
    );
  }
}
