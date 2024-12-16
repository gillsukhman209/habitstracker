import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    await connectMongo();
    const users = await User.find({});

    const BATCH_SIZE = 10;
    const totalUsers = users.length;

    for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const emailPromises = batch.map((user) =>
        resend.emails.send({
          from: "21habits <onboarding@21habits.co>",
          to: user.email,
          subject: "21habits Reminder",
          html: `<p>Hey ${user.email},<br>This is your daily habit reminder. Stay consistent!</p>`,
        })
      );
      await Promise.all(emailPromises);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails sent to ${totalUsers} users in batches.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
