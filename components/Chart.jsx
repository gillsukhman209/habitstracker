"use client";

import React, { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

function HabitChart({ currentDay, penaltyAmount }) {
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
      const isMissed = !isCompleted && isPast;

      days.push(
        <div
          key={i}
          className={`
            w-16 h-16 rounded-full border-2 transition-all duration-300 transform hover:scale-110 cursor-pointer
            ${
              isCompleted
                ? "bg-green-500 text-white border-green-500"
                : isMissed
                ? "bg-red-500 text-white border-red-500"
                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            }
            ${
              isCurrent
                ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-base-100"
                : ""
            }
            relative flex justify-center items-center shadow-lg hover:shadow-xl
          `}
          title={
            isCompleted ? "Completed" : isMissed ? "Missed" : "Not Completed"
          }
        >
          {isCompleted && (
            <span className="text-white text-xl font-bold">✔</span>
          )}
          {isMissed && <span className="text-white text-xl font-bold">✘</span>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="w-full lg:h-[600px] md:h-[500px] xs:h-screen rounded-xl p-10 shadow-xl border border-gray-200 dark:border-gray-700 bg-base-100 text-base-content">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-4xl font-bold">{calculateProgress()}%</span>

        <div className="text-xl font-bold">Penalty: ${penaltyAmount}</div>
      </div>
      <div className="text-sm mb-4 text-center">Updates every day at 12 AM</div>
      <div className="mt-8 grid xs:grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-x-3 gap-y-4 place-items-center">
        {renderDays()}
      </div>
      <div className="flex justify-center gap-6 text-lg xs:order-1 lg:order-2">
        <div className="flex items-center gap-2 xs:mb-4 lg:mb-0">
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2 xs:mb-4 lg:mb-0">
          <div className="h-4 w-4 rounded-full bg-red-500"></div>
          <span>Missed</span>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}

export default HabitChart;
