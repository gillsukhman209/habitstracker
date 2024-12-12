import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// This is a server-side component to ensure the user is logged in and has access.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  // Check if the user has access
  await connectMongo();
  const user = await User.findById(session.user.id);
  if (!user || !user.hasAccess) {
    redirect("https://www.21habits.co");
  }

  return <>{children}</>;
}
