import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
export async function POST(req) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { habits } = await req.json();
  console.log("Received habits order update:", habits);

  const user = await User.findById(session.user.id);
  user.habits = habits.map((habit, index) => ({
    ...habit,
    order: index,
  }));

  await user.save();

  return new Response(JSON.stringify({ message: "Order updated" }), {
    status: 200,
  });
}
