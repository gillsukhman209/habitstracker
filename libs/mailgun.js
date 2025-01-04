import { Resend } from "resend";

export const sendEmail = async ({ to }) => {
  const resend = new Resend("re_gfhxaFEr_PG6yUsxb1Ewp17NcNQZLMFd8");

  try {
    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // Must be a verified email address in Resend
      to: "sukhmansingh1603@gmail.com", // Recipient email address
      subject: "Hello World",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    });

    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
