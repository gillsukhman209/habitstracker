"use server";

import connectMongo from "@/libs/mongoose";

import DashBoardClient from "./dashboardClient";

export default async function Dashboard() {
  await connectMongo();

  return (
    <>
      <main className="bg-gray-900 min-h-screen  w-full  ">
        <DashBoardClient />
      </main>
    </>
  );
}
