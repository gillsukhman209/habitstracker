"use client";

import React, { useEffect, useState } from "react";

function HabitChart({ habits, currentDay }) {
  const totalDays = 21;
  const [days, setDays] = useState(
    Array.from({ length: totalDays }, () => null)
  );

  useEffect(() => {
    if (habits.length === 0) {
      // Reset the chart if no habits
      setDays(Array.from({ length: totalDays }, () => null));
    } else {
      const allCompleted = habits.every((habit) => habit.isComplete);
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[currentDay - 1] = allCompleted ? "complete" : "missed";
        return updatedDays;
      });
    }
  }, [habits, currentDay]);

  const completedPercentage = (
    (days.filter((status) => status === "complete").length / totalDays) *
    100
  ).toFixed(2);

  return (
    <div className="w-full flex flex-col items-center p-8 bg-gray-900">
      {" "}
      {/* Increased padding for a bigger chart */}
      <p className="text-gray-300 mb-8">
        {completedPercentage}% completed
      </p>{" "}
      {/* Increased margin for better spacing */}
      <div className="grid grid-cols-7 gap-6">
        {" "}
        {/* Increased gap for larger boxes */}
        {days.map((status, index) => (
          <div
            key={index}
            className={`w-16 h-16 flex items-center justify-center rounded-md text-white font-bold ${
              // Increased width and height for larger boxes
              status === "complete"
                ? "bg-green-500"
                : status === "missed"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          >
            {status === "complete" && "✓"}
            {status === "missed" && "X"}
            {status === null && index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HabitChart;
