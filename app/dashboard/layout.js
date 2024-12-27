import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export default async function LayoutPrivate({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log("no session redirecting to login");
    redirect(config.auth.loginUrl);
  }

  // Check if the user has access
  await connectMongo();
  const user = await User.findById(session.user.id);

  if (!user || !user.hasAccess) {
    console.log("user does not have access redirecting to home");
    redirect("http://21habits.co/");
  }

  return <>{children}</>;
}
