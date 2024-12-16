import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handles POST requests to send an email via Resend.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Response} - The response object with status and message.
 */
export async function POST(request) {
  try {
    const { to } = await request.json();

    // Validate required fields
    if (!to) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send the email using Resend
    const email = await resend.emails.send({
      from: "21habits <onboarding@21habits.co>",
      to,
      subject: "21habits Reminder",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
              }
              .header {
                background: #4CAF50;
                color: white;
                padding: 10px 20px;
                text-align: center;
              }
              .content {
                padding: 20px;
              }
              .footer {
                text-align: center;
                padding: 10px 20px;
                font-size: 12px;
                color: #777;
              }
              a {
                color: #4CAF50;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to 21 Habits!</h1>
              </div>
              <div class="content">
                <p>Congrats on sending your <strong>first email</strong>!</p>
                <p>We're excited to have you on board. Start tracking your habits today and challenge yourself to stay consistent!</p>
                <p>For more information, visit our <a href="https://21habits.co">website</a>.</p>
              </div>
              <div class="footer">
                <p>&copy; 2023 21 Habits. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return new Response(
      JSON.stringify({ message: "Email sent successfully", email }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
