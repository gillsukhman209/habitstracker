import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { cors } from "@/libs/cors";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = cors(async (req) => {
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

    await connectMongo();

    const users = await User.find({}, "email");

    if (users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users to send emails to.",
        }),
        { status: 200 }
      );
    }

    const emailPromises = users.map((user) =>
      resend.emails.send({
        from: "21 Habits <onboarding@21habits.co>",
        to: user.email,
        subject: "Daily Reminder from 21 Habits",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 16px;">Hi there,</h1>
            <p style="font-size: 16px; margin-bottom: 16px;">
              This is your friendly reminder to complete your daily habits for today! 
            </p>
            <p style="font-size: 16px; margin-bottom: 16px;">
              Remember: Consistency is the key to building lasting habits.
            </p>
            <a href="https://21habits.co/dashboard" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 4px; font-size: 16px;">Go to Dashboard</a>
           
          </div>
        `,
      })
    );

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails sent to ${users.length} users.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to send emails." }), {
      status: 500,
    });
  }
});
