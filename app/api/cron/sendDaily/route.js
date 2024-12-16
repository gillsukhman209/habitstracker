import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Utility function to chunk an array into smaller arrays of a specified size
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export async function GET() {
  try {
    // Establish or reuse existing MongoDB connection
    await connectMongo();

    // Fetch only the 'email' field from all users to reduce data transfer
    const users = await User.find({}, "email").lean();

    if (users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users to send emails to.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Define the concurrency limit based on Resend API rate limits
    const CONCURRENT_LIMIT = 50; // Adjust this value as needed

    // Chunk the users array to control the number of concurrent email sends
    const userChunks = chunkArray(users, CONCURRENT_LIMIT);

    // Iterate over each chunk and send emails concurrently within the limit
    for (const chunk of userChunks) {
      const emailPromises = chunk.map((user) =>
        resend.emails.send({
          from: "21habits <onboarding@21habits.co>",
          to: user.email,
          subject: "21habits Reminder",
          html: `
            <p>Don't forget to complete your daily habits!</p>
          `,
        })
      );

      // Await all email sends in the current chunk before proceeding
      await Promise.all(emailPromises);
    }

    // Return a success response after all emails have been sent
    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails sent to ${users.length} users`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);

    // Return an error response in case of failure
    return new Response(
      JSON.stringify({
        error: "Failed to send email",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
