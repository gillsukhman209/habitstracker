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

    const { day } = body;

    if (!day) {
      return NextResponse.json({ error: "Day is required" }, { status: 400 });
    }

    const user = await User.findById(session?.user?.id).exec();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the completedDays array
    if (!user.completedDays.includes(day)) {
      console.log(
        "user.completed days",
        user.completedDays,
        "doens't include day",
        day
      );
      await User.updateOne(
        { _id: session.user.id },
        { $addToSet: { completedDays: day } }
      );
    }

    await user.save();

    return NextResponse.json({ success: true, day });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update chart due to server error" },
      { status: 500 }
    );
  }
}
