import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handles POST requests to send an email via Resend.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Response} - The response object with status and message.
 */
export async function POST(request) {
  try {
    // Get all users email
    await connectMongo();
    const users = await User.find({});
    console.log("users", users);

    const emailPromises = users.map((user) => {
      return resend.emails.send({
        from: "21habits <onboarding@21habits.co>",
        to: user.email,
        subject: "21habits Reminder",
        html: `

        `,
      });
    });

    await Promise.all(emailPromises);
    return Response.json({
      success: true,
      message: `Emails sent to ${users.length} users`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
