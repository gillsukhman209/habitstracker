import { NextResponse } from "next/server";
export const GET = async () => {
  console.log("making request");
  try {
    const response = await fetch("https://zenquotes.io/api/quotes");

    const data = await response.json();

    // Select a random quote from the data array
    const randomIndex = Math.floor(Math.random() * data.length);

    const quote = data[randomIndex].q;
    console.log("returning quote", quote);

    return NextResponse.json(quote); // Return a random quote
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json("Stay positive and keep pushing forward!");
  }
};
