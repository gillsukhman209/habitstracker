"use client";

import React, { useEffect, useState } from "react";

function HabitChart({ habits, currentDay }) {
  const totalDays = 21;
  const [days, setDays] = useState(
    Array.from({ length: totalDays }, () => null)
  );

  useEffect(() => {
    const fetchCompletedDays = async () => {
      console.log("fetching completed days");
      try {
        const response = await fetch("/api/user/getDays");
        if (!response.ok) {
          throw new Error("Failed to fetch completed days");
        }
        const data = await response.json();
        const completedDays = data.completedDays || [];
        console.log("completedDays", completedDays);

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
    console.log("running chart with day ", currentDay);
    if (habits.length === 0) {
      // Reset the chart if no habits
      setDays(Array.from({ length: totalDays }, () => null));
    } else {
      const allCompleted = habits.every((habit) => habit.isComplete);
      console.log("Habits completed yes or no", allCompleted);
      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[currentDay - 1] = allCompleted ? "complete" : "missed";

        // If all habits for the day are completed, push the day to the database
        if (allCompleted) {
          console.log("habits completed for day", currentDay);
          updateChart(currentDay);
        }

        return updatedDays;
      });
    }
  }, []);

  const updateChart = async (day) => {
    console.log("updating chart for day", day);
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
                : index + 1 === currentDay
                ? "bg-blue-500 opacity-50"
                : status === "missed"
                ? "bg-gray-500"
                : "bg-gray-500"
            }`}
          >
            {status === "complete" && "✓"}

            {status === null && index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HabitChart;
