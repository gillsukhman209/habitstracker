import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import { NextResponse } from "next/server";

export async function GET(req) {
  console.log("inside the user route.js");
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log("no session");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectMongo();
  const user = await User.findById(session.user.id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ hasAccess: user.hasAccess });
}
