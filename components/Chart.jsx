"use client";

import React, { useEffect, useState } from "react";

function HabitChart({ habits, currentDay }) {
  const totalDays = 21;
  const [days, setDays] = useState(
    Array.from({ length: totalDays }, () => null)
  );

  useEffect(() => {
    const fetchCompletedDays = async () => {
      try {
        const response = await fetch("/api/user/getDays");
        if (!response.ok) {
          throw new Error("Failed to fetch completed days");
        }
        const data = await response.json();
        const completedDays = data.completedDays || [];

        // Mark the completed days as "complete"
        const updatedDays = Array.from({ length: totalDays }, (_, index) =>
          completedDays.includes(index + 1) ? "complete" : "missed"
        );
        setDays(updatedDays);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCompletedDays();
  }, []);

  useEffect(() => {
    if (habits.length === 0) {
      // Reset the chart if no habits
      setDays(Array.from({ length: totalDays }, () => null));
    } else {
      const allCompleted = habits.every((habit) => habit.isComplete);
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[currentDay - 1] = allCompleted ? "complete" : "missed";

        // If all habits for the day are completed, push the day to the database
        if (allCompleted) {
          updateChart(currentDay);
        }

        return updatedDays;
      });
    }
  }, [habits, currentDay]);

  const updateChart = async (day) => {
    try {
      const response = await fetch("/api/user/updateChart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day }),
      });

      if (!response.ok) {
        throw new Error("Failed to update chart");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const completedPercentage = (
    (days.filter((status) => status === "complete").length / totalDays) *
    100
  ).toFixed(2);

  return (
    <div className="w-full flex flex-col items-center p-8 bg-gray-900">
      <p className="text-gray-300 mb-8">{completedPercentage}% completed</p>
      <div className="grid grid-cols-7 gap-6">
        {days.map((status, index) => (
          <div
            key={index}
            className={`w-16 h-16 flex items-center justify-center rounded-md text-white font-bold ${
              status === "complete"
                ? "bg-green-500"
                : status === "missed"
                ? "bg-gray-500"
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
