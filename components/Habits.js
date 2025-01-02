import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import Chart from "./Chart";

function Habits({ habits: parentHabits, deleteHabit, onHabitsChange }) {
  const [today] = useState(parseInt(new Date().getDate() + 0));
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [quote, setQuote] = useState("");
  const [habits, setHabits] = useState(parentHabits); // Local state

  useEffect(() => {
    setHabits(parentHabits); // Sync with parent state
  }, [parentHabits]);

  const updateHabit = async (habitId, isComplete, duration, count) => {
    try {
      const response = await fetch("/api/user/updateHabit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ habitId, isComplete, duration, count }),
      });

      if (!response.ok) throw new Error("Failed to update habit");

      // Update local state immediately after successful backend update
      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h._id === habitId ? { ...h, isComplete, duration, count } : h
        )
      );
      onHabitsChange && onHabitsChange(habits); // Update parent state
    } catch (error) {
      toast.error("Failed to update habit");
      console.error("Error updating habit:", error);
    }
  };

  const handleDecrementCount = (habit, decrementValue) => {
    const newCount = Math.max(habit.count - decrementValue, 0);
    const isComplete = newCount === 0;

    // Optimistic UI update
    setHabits((prevHabits) =>
      prevHabits.map((h) =>
        h._id === habit._id ? { ...habit, count: newCount, isComplete } : h
      )
    ); // Update local state

    // Send API request to update the habit
    updateHabit(habit._id, isComplete, habit.duration, newCount);
  };

  const handleDeleteHabit = async (habitId) => {
    // Optimistically update UI
    const updatedHabits = habits.filter((h) => h._id !== habitId);
    setHabits(updatedHabits);
    onHabitsChange && onHabitsChange(updatedHabits);

    // Show loading state while deleting
    setLoading(true);
    try {
      await deleteHabit(habitId);
      toast.success("Habit deleted successfully");
      await fetchHabits();
    } catch (error) {
      toast.error("Failed to delete habit");
      // Revert the optimistic update if deletion fails
      setHabits(habits);
    } finally {
      setLoading(false);
    }
  };
  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/getHabits");
      if (!response.ok) throw new Error("Failed to fetch habits");

      const data = await response.json();
      setHabits(data.habits);
      setPenaltyAmount(data.penaltyAmount);
      setQuote(data.quote);

      if (data.habits[0]?.dateAdded) {
        const firstHabitDate = new Date(data.habits[0]?.dateAdded).getDate();
        setCurrentDay(today - firstHabitDate + 1);
      } else {
        setCurrentDay(1);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHabits();
  }, [today]);

  return (
    <div className="w-full flex flex-col gap-8 p-8 rounded-lg shadow-xl text-base-content">
      {loading ? (
        <div className="text-center text-base-content">
          <h2 className="text-xl">Loading...</h2>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="text-center text-base-content mb-6 w-full">
            <h2 className="text-2xl font-semibold">Day {currentDay} / 21</h2>
          </div>

          {quote && (
            <div className="text-center text-base-content mb-4">
              <p className="text-lg italic">&quot;{quote}&quot;</p>
            </div>
          )}
          {habits.length > 0 ? (
            habits.map((habit) => (
              <div
                key={habit._id}
                className="flex items-center justify-between p-6 rounded-lg shadow-2xl transition-all transform border-[0.1px] border-base-content"
              >
                <div className="flex flex-col items-start">
                  <span
                    className={`ml-4 text-lg font-medium transition-all duration-300 ${
                      habit.isComplete ? "line-through " : "text-base-content"
                    }`}
                  >
                    {habit.title}
                  </span>
                  {habit.isComplete && <span className="ml-4 ">Completed</span>}
                  {!habit.isComplete && habit.count > 0 && (
                    <span className="ml-4 text-base-content">
                      Count: {habit.count}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!habit.isComplete ? (
                    <>
                      <button
                        className="px-2 py-1 bg-gray-300 text-gray-900 rounded-md"
                        onClick={() => handleDecrementCount(habit, 1)}
                      >
                        -1
                      </button>
                      <button
                        className="px-2 py-1 bg-gray-300 text-gray-900 rounded-md"
                        onClick={() => handleDecrementCount(habit, 5)}
                      >
                        -5
                      </button>
                      <button
                        className="px-2 py-1 bg-gray-300 text-gray-900 rounded-md"
                        onClick={() => handleDecrementCount(habit, 10)}
                      >
                        -10
                      </button>
                    </>
                  ) : null}

                  <button
                    onClick={() => handleDeleteHabit(habit._id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <FaRegTrashAlt className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">
              Add habits to get started
            </p>
          )}
          <Chart
            habits={habits}
            currentDay={currentDay}
            penaltyAmount={penaltyAmount}
          />
        </div>
      )}
    </div>
  );
}

export default Habits;
