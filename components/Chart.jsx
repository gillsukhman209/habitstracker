"use client";

import React, { useEffect, useState } from "react";

function HabitChart({ currentDay, missedDays }) {
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
            w-8 h-8 rounded-full transition-all duration-300
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
          <span className="sr-only">Day {i}</span>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="w-full rounded-xl bg-gray-900 p-8 shadow-lg">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-200">21 Days Progress</h3>
        <span className="text-2xl font-bold text-emerald-500">
          {calculateProgress()}%
        </span>
      </div>
      <div className="grid grid-cols-7 gap-4 place-items-center">
        {renderDays()}
      </div>
      <div className="mt-6 flex justify-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-700"></div>
          <span>Upcoming</span>
        </div>
      </div>
      {/* Show all completed days
      <div className="mt-6 flex flex-col gap-2">
        Completed Days:
        {completedDays.map((day) => (
          <div key={day} className="text-gray-400">
            Day {day}
          </div>
        ))}
      </div> */}
      {/* Missed Days */}
      {/* <div className="mt-6 flex flex-col gap-2">Missed Days: {missedDays}</div> */}
    </div>
  );
}

export default HabitChart;
