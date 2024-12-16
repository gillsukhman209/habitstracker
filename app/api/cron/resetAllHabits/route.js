import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(request) {
  console.log("Resetting all habits api");
  try {
    // Connect to MongoDB
    await connectMongo();

    // Fetch all users
    const users = await User.find({});
    console.log("users", users.length);
    // Loop through each user and reset their habits
    for (const user of users) {
      if (user.habits) {
        const firstHabitDate = user.habits[0].dateAdded.getDate();

        const today = parseInt(new Date().getDate()) + 6;

        const currentDay = today - firstHabitDate;

        // Check if user has compelted all the habits for today if so then add currentDay to winning streak

        if (user.habits.every((habit) => habit.isComplete)) {
          user.completedDays.push(currentDay);
        } else {
          // Charge user
          console.log("charging user in resetAllHabits for day", currentDay);
          const response = await fetch(
            "http://localhost:3000/api/user/chargeUser",
            {
              method: "POST",
              body: JSON.stringify({
                day: currentDay,
                userId: user._id,
              }),
            }
          );
        }
      }

      user.habits.forEach((habit) => {
        habit.isComplete = false;
      });

      // Save the updated user document
      await user.save();
    }

    // Send a response back
    return new Response(
      JSON.stringify({
        success: true,
        message: `Habits reset for ${users.length} users`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error resetting habits:", error);

    // Handle errors
    return new Response(JSON.stringify({ error: "Failed to reset habits" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
