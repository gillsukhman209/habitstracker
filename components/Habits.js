import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

function Habits({ habits }) {
  const [localHabits, setLocalHabits] = useState(habits);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/user/getHabits");
      const data = await response.json();
      setLocalHabits(data.habits);
    } catch (error) {
      toast.error("Failed to fetch habits");
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [localHabits]);

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
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-gray-800 p-4 rounded-lg">
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
                  habit.isComplete ? "line-through" : ""
                }`}
              >
                {habit.title}
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
