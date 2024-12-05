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

    // Find the user by their ID
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user's habits
    const habits = user.habits || [];

    return NextResponse.json({ habits });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch habits due to server error" },
      { status: 500 }
    );
  }
}