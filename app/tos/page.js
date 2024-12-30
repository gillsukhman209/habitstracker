import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: December 28, 2024

Welcome to 21 Habits!

These Terms of Service ("Terms") govern your use of the 21 Habits website at https://21habits.co ("Website") and the services provided by 21 Habits. By using our Website and services, you agree to these Terms.

1. Description of 21 Habits

21 Habits is a platform designed to help users build habits over a 21-day period by tracking progress, setting penalties for missed habits, and providing motivational content.

2. Ownership and Usage Rights

All rights to the Website and services are owned by 21 Habits. Users may access and use the services for personal habit-building purposes only. Commercial use or resale of the services is prohibited.

3. User Data and Privacy

We collect and store user data, including:
- Name
- Email
- Payment information (e.g., penalty processing via Stripe)

For more information, please see our Privacy Policy at https://21habits.co/privacy-policy.

4. Non-Personal Data Collection

We use cookies to enhance your experience and gather analytical data. For more information, refer to our Cookie Policy.

5. Penalty System

By using 21 Habits, you agree to set a penalty amount for missed habits. Penalty charges will be processed automatically via Stripe. Refunds for penalties are not available.

6. Refund Policy

If you believe a penalty charge was made in error, contact us within 7 days at support@21habits.co.

7. Governing Law

These Terms are governed by the laws of the United States, under California jurisdiction.

8. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any changes via email or a prominent notice on our Website.

For any questions or concerns regarding these Terms of Service, please contact us at support@21habits.co.

Thank you for using 21 Habits!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
