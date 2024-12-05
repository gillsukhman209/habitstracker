"use client";
import React, { useState } from "react";

function HabitChart() {
  const totalDays = 21; // Total number of days for the habit tracker
  const [days, setDays] = useState(
    Array.from({ length: totalDays }, () => null)
  ); // Initialize days
  const [daysLeft, setDaysLeft] = useState(totalDays); // Initialize days left

  // Function to toggle completion status
  const toggleDayStatus = (index) => {
    setDays((prevDays) => {
      const newDays = [...prevDays];
      const currentStatus = newDays[index];

      // Update the status of the selected day
      if (currentStatus === null) {
        newDays[index] = "complete";
        setDaysLeft((prev) => Math.max(prev - 1, 0)); // Decrease days left only once
      } else if (currentStatus === "complete") {
        newDays[index] = "missed";
        // Do not increase daysLeft when marking "missed"
      } else if (currentStatus === "missed") {
        newDays[index] = null;
        // Do not change daysLeft when reverting "missed"
      }

      return newDays;
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Your Habit Tracker</h1>
      <p className="text-gray-700 mb-2">{daysLeft} days left</p>
      <p className="text-gray-700 mb-6">
        {(
          (days.filter((status) => status === "complete").length / totalDays) *
          100
        ).toFixed(2)}
        % completed
      </p>

      <div className="grid grid-cols-7 gap-4">
        {days.map((status, index) => (
          <button
            key={index}
            onClick={() => toggleDayStatus(index)}
            className={`w-12 h-12 flex items-center justify-center rounded-md text-white font-bold ${
              status === "complete"
                ? "bg-green-500"
                : status === "missed"
                ? "bg-red-500"
                : "bg-gray-300"
            }`}
          >
            {status === "complete" && "✓"}
            {status === "missed" && "X"}
            {status === null && index + 1}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-between w-full max-w-md">
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded-md"
          disabled
        >
          Previous
        </button>
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded-md"
          disabled
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default HabitChart;
