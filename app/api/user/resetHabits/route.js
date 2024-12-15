import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";
export async function PATCH(req) {
  console.log("Resetting habits api");
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reset } = await req.json();

    const user = await User.findById(session.user.id);

    // if (reset) {
    //   user.completedDays = [];

    //   await user.save();
    // }

    user.habits.forEach((habit) => {
      habit.isComplete = false;
    });

    user.lastResetDate = parseInt(new Date().getDate() + 0);

    await user.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error resetting habits:", error);
    return new Response(JSON.stringify({ error: "Failed to reset habits" }), {
      status: 500,
    });
  }
}
