import { NextResponse } from "next/server";

let shuffledQuotes = [];
export const GET = async () => {
  if (shuffledQuotes.length === 0) {
    try {
      const response = await fetch(
        `https://zenquotes.io/api/quotes?timestamp=${Date.now()}`
      );
      const data = await response.json();
      shuffledQuotes = data.sort(() => Math.random() - 0.5); // Shuffle quotes
    } catch (error) {
      console.error("Error fetching quotes:", error);
      return NextResponse.json("Stay positive and keep pushing forward!");
    }
  }
  // Pop a quote from the shuffled array
  const quote = shuffledQuotes.pop();
  return NextResponse.json(quote.q);
};
