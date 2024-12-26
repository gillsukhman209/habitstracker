"use client";

import React, { useEffect, useState, useRef } from "react";

function HabitChart({ currentDay, penaltyAmount }) {
  const [completedDays, setCompletedDays] = useState([]);
  const [visibleDays, setVisibleDays] = useState(10); // State to manage visible days
  const chartRef = useRef(null);

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
            w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-110 cursor-pointer
            ${
              isCompleted
                ? "bg-gradient-to-r from-green-800 to-green-400"
                : isMissed
                ? "bg-gradient-to-r from-red-800 to-red-400"
                : "bg-gray-700"
            }
            ${
              isCurrent
                ? "ring-4 ring-blue-400 ring-offset-2 ring-offset-gray-900"
                : ""
            }
            ${i > currentDay ? "opacity-50" : ""}
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
    return days.slice(0, visibleDays); // Show only the visible days
  };

  const handleScroll = () => {
    if (chartRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chartRef.current;
      if (scrollTop + clientHeight >= scrollHeight) {
        setVisibleDays((prev) => Math.min(prev + 10, 21)); // Load more days, up to 21
      }
    }
  };

  return (
    <div
      ref={chartRef}
      onScroll={handleScroll}
      className="w-full lg:h-[600px] h-[500px] mt-10 rounded-xl p-10 shadow-xl text-white border border-white/10 overflow-auto"
    >
      <div className="mb-8 flex items-center justify-between">
        <span className="text-4xl font-bold text-white">
          {calculateProgress()}%
        </span>

        <div className={`text-xl font-bold text-white`}>
          Penalty: ${penaltyAmount}
        </div>
      </div>
      <div className="grid xs:grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-x-3 gap-y-4 place-items-center">
        {renderDays()}
      </div>
      <div className="absolute bottom-0 left-0 right-0 mt-6 flex justify-center gap-6 text-lg text-white ">
        <div className="flex items-center gap-2 xs:bg-green-400  sm:bg-red-400 md:bg-blue-400 lg:bg-green-400 xl:bg-yellow-400">
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-red-500"></div>
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}

export default HabitChart;
