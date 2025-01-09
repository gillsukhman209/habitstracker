import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function GET() {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await User.findById(session.user.id);
  return new Response(JSON.stringify({ habits: user.habits || [] }), {
    status: 200,
  });
}
