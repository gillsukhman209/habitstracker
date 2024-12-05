"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import DashBoardClient from "./dashboardClient";

export default async function Dashboard() {
  await connectMongo();
  const session = await getServerSession(authOptions);
  const user = await User.findById(session.user.id);
  const userProgress = "35";

  return (
    <>
      <main className="min-h-screen p-8 pb-24 w-full">
        <DashBoardClient />
      </main>
    </>
  );
}
