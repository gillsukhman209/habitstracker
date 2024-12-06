import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

function Habits({ habits = [] }) {
  const [localHabits, setLocalHabits] = useState(habits);
  const [currentDay, setCurrentDay] = useState(1);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/user/getHabits");
      if (!response.ok) {
        throw new Error("Failed to fetch habits");
      }
      const data = await response.json();
      setLocalHabits(data.habits);

      if (data.habits.length > 0) {
        // const firstHabitDate = new Date(data.habits[0].createdAt);
        const firstHabitDate = new Date();
        calculateCurrentDay(firstHabitDate);
      }
    } catch (error) {
      toast.error("Failed to fetch habits");
      console.error("Fetch habits error:", error);
    }
  };

  const calculateCurrentDay = (startDate) => {
    const now = new Date();
    const differenceInTime = now - startDate;
    const differenceInDays =
      Math.floor(differenceInTime / (1000 * 60 * 60 * 24)) + 1;
    setCurrentDay(Math.min(differenceInDays, 21)); // Cap the day at 21
  };

  // Fetch habits and calculate the current day on component mount
  useEffect(() => {
    fetchHabits();

    // Update the day at midnight
    const interval = setInterval(() => {
      if (localHabits.length > 0) {
        const firstHabitDate = new Date(localHabits[0].createdAt);

        calculateCurrentDay(firstHabitDate);
      }
    }, 1000 * 60 * 60 * 24); // Update every 24 hours

    return () => clearInterval(interval);
  }, []);

  const updateHabit = async (habitId, isComplete) => {
    try {
      const response = await fetch("/api/user/updateHabit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ habitId, isComplete }),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit");
      }

      const data = await response.json();
      console.log("Habit updated:", data);

      // Update the local habits state
      setLocalHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit._id === habitId ? { ...habit, isComplete } : habit
        )
      );
      toast.success("Habit updated successfully!");
    } catch (error) {
      toast.error("Failed to update habit");
      console.error("Update habit error:", error);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-gray-800 p-4 rounded-lg">
      {/* Display the current day */}
      <div className="text-center text-white mb-4">
        <h2 className="text-xl font-bold">Day {currentDay} / 21</h2>
        {currentDay === 21 && (
          <p>Congratulations! You have completed 21 days.</p>
        )}
      </div>
      {localHabits.length > 0 ? (
        localHabits.map((habit) => (
          <div
            key={habit._id}
            className="flex items-center justify-between bg-gray-700 text-white p-2 rounded-lg"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={habit.isComplete}
                onChange={(e) => updateHabit(habit._id, e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span
                className={`ml-3 text-sm ${
                  habit.isComplete ? "line-through text-gray-400" : ""
                }`}
              >
                {habit.title} - {habit.duration} minutes
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center">No habits found</p>
      )}
    </div>
  );
}

export default Habits;
