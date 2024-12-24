"use client";

import React, { useEffect, useState } from "react";

function HabitChart({ currentDay }) {
  const [completedDays, setCompletedDays] = useState([]);

  const fetchCompletedDays = async () => {
    const response = await fetch("/api/user/getDays");
    if (!response.ok) {
      throw new Error("Failed to fetch completed days");
    }
    const data = await response.json();
    setCompletedDays(data.completedDays || []);
  };

  useEffect(() => {
    fetchCompletedDays();
  }, []);

  const calculateProgress = () => {
    return Math.round((completedDays.length / 21) * 100);
  };

  const renderDays = () => {
    const days = [];
    for (let i = 1; i <= 21; i++) {
      const isCompleted = completedDays.includes(i);
      const isCurrent = i === currentDay;
      const isPast = i < currentDay;

      days.push(
        <div
          key={i}
          className={`
            w-10 h-10 rounded-full transition-all duration-500 transform hover:scale-110
            ${isCompleted ? "bg-emerald-500" : "bg-gray-700"}
            ${
              isCurrent
                ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900"
                : ""
            }
            ${!isCompleted && isPast ? "bg-red-500/50" : ""}
            ${i > currentDay ? "opacity-40" : ""}
          `}
        >
          <span className="sr-only">Days {i}</span>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full h-[500px] rounded-xl  p-10 shadow-lg text-white ">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">21 Days Progress</h3>
        <span className="text-3xl font-bold text-white">
          {calculateProgress()}%
        </span>
      </div>
      <div className="grid grid-cols-7 gap-4 place-items-center">
        {renderDays()}
      </div>
      <div className="mt-6 flex justify-center gap-6 text-sm text-white">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-red-500/50"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-gray-700"></div>
          <span>Upcoming</span>
        </div>
      </div>
    </div>
  );
}

export default HabitChart;
