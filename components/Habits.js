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
  const [timers, setTimers] = useState({}); // Track timers

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

      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h._id === habitId ? { ...h, isComplete, duration, count } : h
        )
      );
      onHabitsChange && onHabitsChange(habits);
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
        h._id === habit._id ? { ...h, count: newCount, isComplete } : h
      )
    );

    // Send API request to update the habit
    updateHabit(habit._id, isComplete, habit.duration, newCount);

    if (isComplete) {
      toast.success(`${habit.title} has been marked as completed!`);
    }
  };

  const handlePauseTimer = (habit) => {
    if (timers[habit._id]?.interval) {
      clearInterval(timers[habit._id].interval);

      const remainingTime = habit.timer || timers[habit._id]?.remaining;

      // Update the backend with the remaining duration in minutes
      updateHabit(habit._id, false, Math.ceil(remainingTime / 60), habit.count);

      // Update the local state with the new remaining time
      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h._id === habit._id
            ? {
                ...h,
                timer: remainingTime,
                duration: Math.ceil(remainingTime / 60),
              }
            : h
        )
      );

      // Clean up the interval
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        updatedTimers[habit._id] = { remaining: remainingTime };
        delete updatedTimers[habit._id].interval;
        return updatedTimers;
      });

      toast.success(`${habit.title} paused successfully.`);
    }
  };

  const handleStartTimer = (habit) => {
    if (timers[habit._id]?.interval) {
      clearInterval(timers[habit._id].interval);
    }

    const startTime = Date.now();
    const duration = habit.timer || habit.duration * 60;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000) * 30;
      const remaining = Math.max(duration - elapsed, 0);

      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h._id === habit._id ? { ...h, timer: remaining } : h
        )
      );

      if (remaining === 0) {
        clearInterval(interval);

        updateHabit(habit._id, true, 0, habit.count);

        setHabits((prevHabits) =>
          prevHabits.map((h) =>
            h._id === habit._id ? { ...h, isComplete: true, timer: 0 } : h
          )
        );

        setTimers((prevTimers) => {
          const updatedTimers = { ...prevTimers };
          delete updatedTimers[habit._id];
          return updatedTimers;
        });

        toast.success(`${habit.title} has been marked as completed!`);
      }
    }, 1000);

    setTimers((prevTimers) => ({
      ...prevTimers,
      [habit._id]: { interval, remaining: duration },
    }));
  };

  const handleDeleteHabit = async (habitId) => {
    const updatedHabits = habits.filter((h) => h._id !== habitId);
    setHabits(updatedHabits);
    onHabitsChange && onHabitsChange(updatedHabits);

    setLoading(true);
    try {
      await deleteHabit(habitId);
      toast.success("Habit deleted successfully");
    } catch (error) {
      toast.error("Failed to delete habit");
      setHabits(habits);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    fetchHabits();

    return () => {
      Object.values(timers).forEach((timer) => clearInterval(timer.interval));
    };
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
                  {!habit.isComplete && habit.duration !== "0" && (
                    <span className="ml-4 text-base-content">
                      Timer:{" "}
                      {habit.timer
                        ? `${Math.floor(habit.timer / 60)}:${habit.timer % 60}`
                        : `${habit.duration}:00`}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!habit.isComplete && habit.count > 0 && (
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
                  )}
                  {!habit.isComplete && habit.duration !== "0" && (
                    <>
                      <button
                        className={`px-2 py-1 rounded-md ${
                          timers[habit._id]?.interval !== undefined
                            ? "bg-gray-300 text-gray-500"
                            : "bg-green-500 text-white"
                        }`}
                        onClick={() => handleStartTimer(habit)}
                        disabled={timers[habit._id]?.interval !== undefined}
                      >
                        Start
                      </button>
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded-md"
                        onClick={() => handlePauseTimer(habit)}
                      >
                        Pause
                      </button>
                    </>
                  )}
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
