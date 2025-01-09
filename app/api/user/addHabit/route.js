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

  const { habitTitle, habitDuration, habitCount } = await req.json();
  const user = await User.findById(session.user.id);

  const newHabit = {
    title: habitTitle,
    duration: habitDuration,
    count: habitCount,
    order: user.habits.length,
  };

  user.habits.push(newHabit);
  await user.save();

  return new Response(JSON.stringify({ message: "Habit added" }), {
    status: 201,
  });
}
