import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function PATCH(req) {
  try {
    await connectMongo();
<<<<<<< HEAD
    const { currentDay } = await req.json();
=======
    console.log("resetting request received");
>>>>>>> ed14104 (new method added)

    const users = await User.updateMany(
      {},
      { $set: { "habits.$[].isComplete": false, lastResetDay: currentDay } }
    );

<<<<<<< HEAD
    return new Response(JSON.stringify({ success: true }), { status: 200 });
=======
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    user.habits.forEach((habit) => {
      habit.isComplete = false;
    });

    user.lastResetDate = parseInt(new Date().getDate() + 4);

    await user.save();

    return NextResponse.json({ success: true }, { status: 200 });
>>>>>>> ed14104 (new method added)
  } catch (error) {
    console.error("Error resetting habits:", error);
    return new Response(JSON.stringify({ error: "Failed to reset habits" }), {
      status: 500,
    });
  }
}
