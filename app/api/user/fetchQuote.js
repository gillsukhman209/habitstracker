import { NextResponse } from "next/server";

export const fetchQuote = async () => {
  try {
    const response = await fetch("https://zenquotes.io/api/today");
    const data = await response.json();
    return NextResponse.json(data[0].q); // Assuming the quote is in the first element
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json("Stay positive and keep pushing forward!");
  }
};
