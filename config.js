import themes from "daisyui/src/theming/themes";
import Stripe from "stripe";

const config = {
  // REQUIRED
  appName: "💪🏻 21 Habits",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription: "Challenge yourself to be consistent for the next 21 days",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "21habits.co",

  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId: "price_1QbrdPIy56rK71xGl8w9qCnP",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "21 Habits",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Challenge yourself to be consistent for the next 21 days",
        // The price you want to display, the one user will be charged on Stripe.
        price: 19.99,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 59.99,
        features: [
          {
            name: "Challenge yourself to be consistent for the next 21 days",
          },
          { name: "Get charged if you don't complete your habits" },
          { name: "Visualize your progress and build momentum" },
          { name: "Make habit-building fun and rewarding" },
        ],
      },
    ],
  },

  mailgun: {
    // subdomain to use when sending emails, if you don't have a subdomain, just remove it. Highly recommended to have one (i.e. mg.yourdomain.com or mail.yourdomain.com)
    subdomain: "mg.21habits.co",
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `21 Habits <noreply@mg.21habits.co>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: "21 Habits Reminder <mailgun@mg.21habits.co>",
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "singh@mg.21habits.co",
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: "gillsukhman209@gmail.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
};

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Function to charge user for missed days

export default config;
