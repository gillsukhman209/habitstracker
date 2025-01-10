import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

/**
 * Helper to reorder habits:
 * - Incomplete habits first
 * - Completed habits at the bottom
 * - Reassign .order for the entire list
 */
function reorderWithCompletedAtBottom(arr) {
  const incomplete = arr.filter((h) => !h.isComplete);
  const complete = arr.filter((h) => h.isComplete);

  // Optionally sort incomplete/complete by existing .order if you want
  // incomplete.sort((a, b) => a.order - b.order);
  // complete.sort((a, b) => a.order - b.order);

  const merged = [...incomplete, ...complete];
  merged.forEach((habit, idx) => {
    habit.order = idx;
  });
  return merged;
}

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

    // Reorder habits on the server so the client never sees them "jump"
    const sortedHabits = reorderWithCompletedAtBottom(user.habits || []);

    return NextResponse.json({
      habits: sortedHabits,
      customerId: user.customerId,
      completedDays: user.completedDays,
      penaltyAmount: user.penaltyAmount,
      quote: user.quote,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch habits due to server error" },
      { status: 500 }
    );
  }
}
