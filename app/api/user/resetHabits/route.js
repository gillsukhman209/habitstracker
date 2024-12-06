import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function PATCH(req) {
  try {
    await connectMongo();
    const { currentDay } = await req.json();

    const users = await User.updateMany(
      {},
      { $set: { "habits.$[].isComplete": false, lastResetDay: currentDay } }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error resetting habits:", error);
    return new Response(JSON.stringify({ error: "Failed to reset habits" }), {
      status: 500,
    });
  }
}
