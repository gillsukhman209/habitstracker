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
    <div className="w-full flex flex-col items-center p-6 bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-white">Your Habit Tracker</h1>

      <p className="text-gray-300 mb-6">{completedPercentage}% completed</p>
      <div className="grid grid-cols-7 gap-4">
        {days.map((status, index) => (
          <div
            key={index}
            className={`w-12 h-12 flex items-center justify-center rounded-md text-white font-bold ${
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
