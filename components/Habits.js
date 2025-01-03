import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt, FaPlay, FaPause } from "react-icons/fa";
import Chart from "./Chart";

function Habits({ habits: parentHabits, deleteHabit, onHabitsChange }) {
  const [today] = useState(parseInt(new Date().getDate() + 0));
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [quote, setQuote] = useState("");
  const [habits, setHabits] = useState(parentHabits);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    if (parentHabits.length === 0) {
      setHabits([]);
    } else {
      setHabits(parentHabits);
    }
  }, [parentHabits]);

  const updateHabit = async (
    habitId,
    isComplete,
    duration,
    count,
    progress,
    timer
  ) => {
    try {
      const response = await fetch("/api/user/updateHabit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habitId,
          isComplete,
          duration,
          count,
          progress,
          timer,
        }),
      });

      const updatedHabit = await response.json();

      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h._id === habitId
            ? {
                ...h,
                isComplete: updatedHabit.habit.isComplete,
                duration: updatedHabit.habit.duration,
                count: updatedHabit.habit.count,
                progress: updatedHabit.habit.progress,
                timer: updatedHabit.habit.timer,
              }
            : h
        )
      );

      onHabitsChange && onHabitsChange(habits);
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  const calculateProgress = (habit) => {
    if (habit.duration > 0) {
      const totalDuration = habit.duration * 60;
      const elapsed = totalDuration - (habit.timer || totalDuration);
      const progress = ((elapsed / totalDuration) * 100).toFixed(2);
      return Math.min(progress, 100);
    }
    return habit.progress || 0;
  };

  const handleStartTimer = (habit) => {
    if (timers[habit._id]?.interval) {
      return;
    }

    const startTime = Date.now();
    const savedRemaining = habit.timer || habit.duration * 60;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(savedRemaining - elapsed, 0);

      const progress = Math.min(
        ((habit.duration * 60 - remaining) / (habit.duration * 60)) * 100,
        100
      );

      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h._id === habit._id ? { ...h, timer: remaining, progress } : h
        )
      );

      if (elapsed % 10 === 0 || remaining === 0) {
        updateHabit(
          habit._id,
          false,
          Math.ceil(remaining / 60),
          habit.count,
          progress,
          remaining
        );
      }

      if (remaining === 0) {
        clearInterval(interval);

        updateHabit(habit._id, true, 0, habit.count, 100, 0);

        setHabits((prevHabits) =>
          prevHabits.map((h) =>
            h._id === habit._id
              ? { ...h, isComplete: true, timer: 0, progress: 100 }
              : h
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
      [habit._id]: { interval, remaining: savedRemaining },
    }));
  };

  const handlePauseTimer = (habit) => {
    if (timers[habit._id]?.interval) {
      clearInterval(timers[habit._id].interval);

      const remainingTime =
        habit.timer || timers[habit._id]?.remaining || habit.duration * 60;
      const progress = Math.min(
        ((habit.duration * 60 - remainingTime) / (habit.duration * 60)) * 100,
        100
      );

      updateHabit(
        habit._id,
        false,
        Math.ceil(remainingTime / 60),
        habit.count,
        progress,
        remainingTime
      );

      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h._id === habit._id
            ? {
                ...h,
                timer: remainingTime,
                progress,
              }
            : h
        )
      );

      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        updatedTimers[habit._id] = { remaining: remainingTime };
        delete updatedTimers[habit._id].interval;
        return updatedTimers;
      });
    }
  };

  const handleDecrementCount = (habit, decrementValue) => {
    const newCount = Math.max(habit.count - decrementValue, 0);
    const isComplete = newCount === 0;

    setHabits((prevHabits) =>
      prevHabits.map((h) =>
        h._id === habit._id ? { ...h, count: newCount, isComplete } : h
      )
    );

    updateHabit(
      habit._id,
      isComplete,
      habit.duration,
      newCount,
      habit.progress
    );

    if (isComplete) {
      toast.success(`${habit.title} has been marked as completed!`);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    const updatedHabits = habits.filter((h) => h._id !== habitId);
    setHabits(updatedHabits);
    onHabitsChange && onHabitsChange(updatedHabits);

    setLoading(true);
    try {
      await deleteHabit(habitId);
    } catch (error) {
      toast.error("Failed to delete habit");
      setHabits(habits);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteHabit = (habit) => {
    updateHabit(habit._id, true, habit.duration, habit.count, 100, 0);
    toast.success(`${habit.title} has been marked as completed!`);
  };

  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user/getHabits");
        if (!response.ok) throw new Error("Failed to fetch habits");

        const data = await response.json();
        setHabits(
          data.habits.map((habit) => ({
            ...habit,
            progress: calculateProgress(habit),
          }))
        );
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

  // Drag and drop functionality
  const handleDragStart = (e, habit) => {
    e.dataTransfer.setData("text/plain", habit._id);
  };

  const handleDrop = (e) => {
    const habitId = e.dataTransfer.getData("text/plain");
    const targetHabitId = e.target.closest(".habit-item").dataset.id;

    if (habitId && targetHabitId && habitId !== targetHabitId) {
      const updatedHabits = [...habits];
      const draggedHabitIndex = updatedHabits.findIndex(
        (h) => h._id === habitId
      );
      const targetHabitIndex = updatedHabits.findIndex(
        (h) => h._id === targetHabitId
      );

      // Move the dragged habit to the new position
      const [movedHabit] = updatedHabits.splice(draggedHabitIndex, 1);
      updatedHabits.splice(targetHabitIndex, 0, movedHabit);

      setHabits(updatedHabits);
      onHabitsChange && onHabitsChange(updatedHabits);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Categorizing habits
  const categorizedHabits = [
    ...habits.filter((h) => !h.isComplete && (h.count || h.penalty)),
    ...habits.filter((h) => !h.isComplete && !h.count && !h.penalty),
    ...habits.filter((h) => h.isComplete),
  ];

  const isAnyTimerRunning = Object.values(timers).some(
    (timer) => timer.interval
  );

  return (
    <div className="w-full flex flex-col gap-8 p-8 rounded-lg shadow-xl text-base-content">
      {loading ? (
        <div className="text-center text-base-content">
          <h2 className="text-xl">Loading...</h2>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="text-center text-base-content mb-6 w-full">
            <h2 className="text-2xl font-semibold">
              Day {currentDay} / 21 latest update
            </h2>
          </div>

          {quote ? (
            <div className="text-center text-base-content mb-4">
              <p className="text-lg italic">&quot;{quote}&quot;</p>
            </div>
          ) : (
            <div className="text-center text-base-content mb-4">
              <p className="text-lg italic">
                &quot;Stay positive and keep pushing forward!&quot;
              </p>
            </div>
          )}
          {categorizedHabits.map((habit) => (
            <div
              key={habit._id}
              className={`habit-item relative flex items-center justify-between p-6 rounded-lg shadow-2xl transition-all transform border-[0.1px] border-base-content ${
                habit.isComplete ? " opacity-50 text-base-content" : ""
              }`}
              data-id={habit._id}
              draggable
              onDragStart={(e) => handleDragStart(e, habit)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div
                className={`absolute top-0 left-0 h-full ${
                  habit.isComplete ? "" : "bg-base-content"
                } opacity-25 rounded-lg transition-all`}
                style={{ width: `${habit.progress}%` }}
              ></div>
              <div className="relative flex flex-col items-start z-10">
                <span
                  className={`ml-4 text-lg font-medium transition-all duration-300 ${
                    habit.isComplete ? "line-through " : "text-base-content"
                  }`}
                >
                  {habit.title}
                </span>
                {habit.isComplete && <span className="ml-4 ">Completed</span>}
                {habit.count > 0 && (
                  <span className="ml-4 text-base-content">
                    Count: {habit.count}
                  </span>
                )}
                {habit.duration !== "0" && (
                  <span className="ml-4 text-base-content">
                    Duration:{" "}
                    {habit.timer
                      ? `${Math.floor(habit.timer / 60)}:${habit.timer % 60}`
                      : `${habit.duration}:00`}
                  </span>
                )}
              </div>

              <div className="relative flex space-x-2 z-10">
                {!habit.isComplete && habit.count > 0 && (
                  <>
                    <button
                      className="px-2 py-1 border border-white rounded-md shadow-xl bg-transparent text-base-content"
                      onClick={() => handleDecrementCount(habit, 10)}
                      disabled={isAnyTimerRunning}
                    >
                      -10
                    </button>
                    <button
                      className="px-2 py-1 border border-white rounded-md shadow-xl bg-transparent text-base-content"
                      onClick={() => handleDecrementCount(habit, 1)}
                      disabled={isAnyTimerRunning}
                    >
                      -1
                    </button>
                  </>
                )}
                {!habit.isComplete && habit.duration !== "0" && (
                  <>
                    {timers[habit._id]?.interval === undefined && (
                      <button
                        className="px-2 py-1 border border-base-content rounded-md shadow-xl bg-transparent text-base-content"
                        onClick={() => handleStartTimer(habit)}
                        disabled={isAnyTimerRunning}
                      >
                        <FaPlay />
                      </button>
                    )}
                    {timers[habit._id]?.interval !== undefined && (
                      <button
                        className="px-2 py-1 border border-base-content rounded-md shadow-xl bg-transparent text-base-content"
                        onClick={() => handlePauseTimer(habit)}
                      >
                        <FaPause />
                      </button>
                    )}
                  </>
                )}
                {/* Checkbox for habits with no duration or count */}
                {!habit.isComplete &&
                  habit.duration === "0" &&
                  habit.count < 1 && (
                    <div className="flex items-center ">
                      <input
                        type="checkbox"
                        className="w-6 h-6" // Increased size of the checkbox
                        onChange={() => handleCompleteHabit(habit)}
                      />
                    </div>
                  )}
                <button
                  onClick={() => handleDeleteHabit(habit._id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <FaRegTrashAlt className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))}
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
