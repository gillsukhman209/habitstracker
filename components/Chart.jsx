"use client";
import React, { useState, useEffect } from "react";

function HabitChart({ currentDay }) {
  const totalDays = 21; // Total number of days for the habit tracker
  const [days, setDays] = useState(
    Array.from({ length: totalDays }, () => null)
  ); // Initialize days

  // Check if all habits for the current day are completed
  const checkHabitsCompletion = async () => {
    try {
      const response = await fetch("/api/user/getHabits");
      if (!response.ok) throw new Error("Failed to fetch habits");

      const data = await response.json();
      const allCompleted = data.habits.every((habit) => habit.isComplete);

      setDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[currentDay - 1] = allCompleted ? "complete" : "missed";
        return updatedDays;
      });
    } catch (error) {
      console.error("Error checking habits completion:", error);
    }
  };

  useEffect(() => {
    checkHabitsCompletion(); // Check habits on component mount
  }, [currentDay]); // Recheck whenever the current day changes

  const completedPercentage = (
    (days.filter((status) => status === "complete").length / totalDays) *
    100
  ).toFixed(2);

  const daysLeft = totalDays - currentDay;

  return (
    <div className="w-full min-h-screen bg-gray-900 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Your Habit Tracker</h1>
      <p className="text-gray-300 mb-2">{daysLeft} days left</p>
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
