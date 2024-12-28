import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req) {
  console.log("resetAllHabits route called");
  try {
    const { API_SECRET_TOKEN } = process.env;
    const authHeader = req.headers.get("Authorization");

    if (!API_SECRET_TOKEN) {
      return new Response(JSON.stringify({ error: "No API_SECRET_TOKEN" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (authHeader !== `Bearer ${API_SECRET_TOKEN}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Connect to MongoDB
    await connectMongo();

    // Fetch all users
    const users = await User.find({});

    // Loop through each user and reset their habits
    for (const user of users) {
      if (user.habits.length > 0) {
        console.log("user.habits.length", user.habits.length);
        const quoteResponse = await fetch(
          "https://www.21habits.co/api/user/fetchQuote"
        );
        const quoteData = await quoteResponse.json();
        console.log("quoteData", quoteData);

        // get user and set quote to quoteData

        user.quote = quoteData;
        await user.save();
        console.log("afer saving users quote");

        const firstHabitDate = user.habits[0].dateAdded.getDate();

        const today = parseInt(new Date().getDate() + 0);

        const currentDay = today - firstHabitDate;

        // Check if user has completed all the habits for today if so then add currentDay to winning streak
        if (user.habits.every((habit) => habit.isComplete)) {
          user.completedDays.push(currentDay + 1);
          console.log("User has completed all habits for today");
          await user.save();
        } else {
          console.log(
            "User has not completed all habits for today, charging user"
          );
          // // Charge user
          // await fetch("http://localhost:3000/api/user/chargeUser", {
          //   method: "POST",
          //   body: JSON.stringify({
          //     day: currentDay,
          //     userId: user._id,
          //     penaltyAmount: user.penaltyAmount,
          //   }),
          // });
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
