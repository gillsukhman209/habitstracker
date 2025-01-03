import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req) {
  try {
    // get the user id from the req and find user by that user id and set all the user properties to default

    await connectMongo();
    const { userId } = await req.json();
    const user = await User.findById(userId);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    user.habits = [];
    user.completedDays = [];
    user.lastResetDay = new Date().getDate(); // Set to current date (day of the month)
    user.penaltyAmount = 5;
    user.totalCharges = 0;
    await user.save();

    return new Response(
      JSON.stringify({ message: "Progress reset successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An error occurred while resetting progress" }),
      { status: 500 }
    );
  }
}
