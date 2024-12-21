"use server";

import connectMongo from "@/libs/mongoose";

import DashBoardClient from "./dashboardClient";

export default async function Dashboard() {
  await connectMongo();

  return (
    <>
      <main className="min-h-screen p-8 pb-24 w-full bg-red">
        <DashBoardClient />
      </main>
    </>
  );
}
