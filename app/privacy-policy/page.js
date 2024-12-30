import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
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
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Effective Date: December 12, 2024

Welcome to 21 Habits! Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information.

1. Information We Collect

Personal Data: Name, email address, and payment information.
Non-Personal Data: Web cookies for enhancing website functionality.
2. Purpose of Data Collection
We use your data solely for order processing and to improve your experience with 21 Habits.

3. Data Sharing
We do not share your data with any third parties.

4. Children's Privacy
We do not knowingly collect data from children under the age of 13.

5. Updates to the Privacy Policy
We may update this policy from time to time. Users will be notified of changes via email.

6. Contact Us
If you have any questions about this Privacy Policy, please contact us at gillsukhman209@gmail.com.

Thank you for using 21 Habits!`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
