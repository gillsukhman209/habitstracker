import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt, FaPlay, FaPause, FaGripVertical } from "react-icons/fa";
import Chart from "./Chart";
import { useTheme } from "next-themes";
import { MdRemoveCircle } from "react-icons/md";

// --- Drag & Drop imports ---
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  HABIT: "HABIT",
};

/**
 * Subcomponent for a single habit row
 * so Hooks can be called at the top level.
 */
function HabitItem({
  habit,
  index,
  theme,
  timers,
  isAnyTimerRunning,
  decrementAnimation,
  decrementVisible,
  moveHabit,
  handleDrop,
  handleDecrementCount,
  handleStartTimer,
  handlePauseTimer,
  handleCompleteHabit,
  confirmDeleteHabit,
  setDecrementAnimation,
  setDecrementVisible,
}) {
  // Set up drag & drop
  const ref = useRef(null);

  const [, drag] = useDrag({
    type: ItemTypes.HABIT,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.HABIT,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveHabit(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    drop: () => {
      handleDrop();
    },
  });

  drag(drop(ref));

  // Render the habit row
  return (
    <div
      ref={ref}
      style={{ cursor: "move" }}
      className={`habit-item relative flex items-center justify-between p-6 rounded-lg shadow-2xl transition-all transform border-[0.1px] border-base-content ${
        habit.isComplete ? "opacity-50 text-base-content" : ""
      }`}
    >
      {/* Progress background bar */}
      <div
        className={`absolute top-0 left-0 h-full ${
          habit.isComplete
            ? "hidden"
            : theme === "dark"
            ? "bg-green-600 "
            : "bg-green-400"
        } rounded-lg transition-all`}
        style={{ width: `${habit.progress}%` }}
      ></div>

      {/* Left side: Drag handle + title, count, duration */}
      <div className="relative flex flex-col items-start z-10">
        <div className="flex items-center mb-1">
          <FaGripVertical className="text-gray-500 mr-2" />
          <span
            className={`text-lg font-medium transition-all duration-300 ${
              habit.isComplete ? "line-through " : "text-base-content"
            }`}
          >
            {habit.title}
          </span>
        </div>
        {habit.isComplete && <span className="ml-1">Completed</span>}
        {habit.count > 0 && (
          <span className="ml-1 text-base-content">Count: {habit.count}</span>
        )}
        {habit.duration !== "0" && (
          <span className="ml-1 text-base-content">
            Duration:{" "}
            {habit.timer
              ? `${Math.floor(habit.timer / 60)}:${
                  habit.timer % 60 < 10
                    ? "0" + (habit.timer % 60)
                    : habit.timer % 60
                }`
              : `${habit.duration}:00`}
          </span>
        )}
      </div>

      {/* Right side: Buttons (decrement, play/pause, checkbox, delete) */}
      <div className="relative flex space-x-2 z-10">
        {habit.count > 0 && (
          <>
            <button
              onClick={() => {
                setDecrementAnimation((prev) => ({
                  ...prev,
                  [habit._id]: !prev[habit._id],
                }));
                setDecrementVisible((prev) => ({
                  ...prev,
                  [habit._id]: !prev[habit._id],
                }));
              }}
              className="px-4 py-2 rounded-xl justify-center text-3xl bg-transparent text-base-content flex items-center"
            >
              <MdRemoveCircle />
            </button>
            {decrementVisible[habit._id] && (
              <div
                className={`flex space-x-3 transition-transform duration-300 transform ${
                  decrementAnimation[habit._id] ? "scale-100" : "scale-0"
                }`}
              >
                {habit.count >= 1000 && (
                  <button
                    className="px-2 py-1 border border-base-content rounded-md shadow-xl text-base-content flex items-center justify-center mt-2 h-8 w-14 "
                    onClick={() => handleDecrementCount(habit, 1000)}
                    disabled={isAnyTimerRunning}
                  >
                    -1000
                  </button>
                )}
                {habit.count >= 500 && (
                  <button
                    className="px-2 py-1 border border-base-content rounded-md shadow-xl text-base-content flex items-center justify-center mt-2 h-8 w-14 "
                    onClick={() => handleDecrementCount(habit, 500)}
                    disabled={isAnyTimerRunning}
                  >
                    -500
                  </button>
                )}
                {habit.count >= 100 && (
                  <button
                    className="px-2 py-1 border border-base-content rounded-md shadow-xl text-base-content flex items-center justify-center mt-2 h-8 w-12 "
                    onClick={() => handleDecrementCount(habit, 100)}
                    disabled={isAnyTimerRunning}
                  >
                    -100
                  </button>
                )}
                {habit.count >= 50 && (
                  <button
                    className="px-2 py-1 border border-base-content rounded-md shadow-xl text-base-content flex items-center justify-center mt-2 h-8 w-10 "
                    onClick={() => handleDecrementCount(habit, 50)}
                    disabled={isAnyTimerRunning}
                  >
                    -50
                  </button>
                )}
                {habit.count >= 10 && (
                  <button
                    className="px-2 py-1 border border-base-content rounded-md shadow-xl text-base-content flex items-center justify-center mt-2 h-8 w-10 "
                    onClick={() => handleDecrementCount(habit, 10)}
                    disabled={isAnyTimerRunning}
                  >
                    -10
                  </button>
                )}
                {habit.count >= 1 && (
                  <button
                    className="px-2 py-1 border border-base-content rounded-md shadow-xl text-base-content flex items-center justify-center mt-2 h-8 w-10 "
                    onClick={() => handleDecrementCount(habit, 1)}
                    disabled={isAnyTimerRunning}
                  >
                    -1
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {!habit.isComplete && habit.duration !== "0" && (
          <>
            {timers[habit._id]?.interval === undefined && (
              <button
                className="px-4 py-2 rounded-xl justify-center text-2xl bg-transparent text-base-content flex items-center"
                onClick={() => handleStartTimer(habit)}
                disabled={isAnyTimerRunning}
              >
                <FaPlay />
              </button>
            )}
            {timers[habit._id]?.interval !== undefined && (
              <button
                className="px-4 py-2 rounded-xl justify-center text-3xl bg-transparent text-base-content flex items-center"
                onClick={() => handlePauseTimer(habit)}
              >
                <FaPause />
              </button>
            )}
          </>
        )}
        {!habit.isComplete && habit.duration === "0" && habit.count < 1 && (
          <div className="px-4 py-2 rounded-xl justify-center text-3xl bg-transparent text-base-content flex items-center">
            <input
              type="checkbox"
              className="w-6 h-6"
              onChange={() => handleCompleteHabit(habit)}
            />
          </div>
        )}
        <button
          onClick={() => confirmDeleteHabit(habit._id)}
          className="text-red-500 hover:text-red-700 transition-colors duration-200"
        >
          <FaRegTrashAlt className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

/**
 * Main Habits Component
 */
function Habits({ habits: parentHabits, deleteHabit, onHabitsChange }) {
  const [today] = useState(parseInt(new Date().getDate() + 0));
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [quote, setQuote] = useState("");
  const [habits, setHabits] = useState(parentHabits);
  const [timers, setTimers] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [decrementVisible, setDecrementVisible] = useState({});
  const [decrementAnimation, setDecrementAnimation] = useState({});
  const { theme } = useTheme();

  // Keep local habits in sync
  useEffect(() => {
    if (parentHabits.length === 0) {
      setHabits([]);
    } else {
      setHabits(parentHabits);
    }
  }, [parentHabits]);

  // ----------- Drag & Drop Logic -----------
  // Reorder the local array
  const moveHabit = (fromIndex, toIndex) => {
    const updatedHabits = [...habits];
    const [movedHabit] = updatedHabits.splice(fromIndex, 1);
    updatedHabits.splice(toIndex, 0, movedHabit);
    setHabits(updatedHabits);
  };

  // Persist changes to the backend
  const handleDrop = async () => {
    try {
      await fetch("/api/user/updateHabitOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits }),
      });
      if (onHabitsChange) {
        onHabitsChange(habits);
      }
    } catch (error) {
      console.error("Failed to update habit order:", error);
    }
  };

  // ---------- Habit Update Logic -----------
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

  // Timer Start
  const handleStartTimer = (habit) => {
    if (timers[habit._id]?.interval) return;

    const startTime = Date.now();
    const savedRemaining = habit.timer || habit.duration * 60;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(savedRemaining - elapsed, 0);

      const progress = Math.min(
        ((habit.duration * 60 - remaining) / (habit.duration * 60)) * 100,
        100
      );

      setHabits((prev) =>
        prev.map((h) =>
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

        setHabits((prev) =>
          prev.map((h) =>
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

    setTimers((prev) => ({
      ...prev,
      [habit._id]: { interval, remaining: savedRemaining },
    }));
  };

  // Timer Pause
  const handlePauseTimer = (habit) => {
    if (timers[habit._id]?.interval) {
      clearInterval(timers[habit._id].interval);

      const remainingTime =
        habit.timer || timers[habit._id].remaining || habit.duration * 60;
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

      setHabits((prev) =>
        prev.map((h) =>
          h._id === habit._id ? { ...h, timer: remainingTime, progress } : h
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

  // Decrement Count
  const handleDecrementCount = (habit, decrementValue) => {
    const newCount = Math.max(habit.count - decrementValue, 0);
    const isComplete = newCount === 0;

    setHabits((prev) =>
      prev.map((h) =>
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

  // Delete Habit Confirmation
  const confirmDeleteHabit = (habitId) => {
    setConfirmDeleteId(habitId);
  };

  const handleDeleteHabit = async () => {
    if (!confirmDeleteId) return;
    const updatedHabits = habits.filter((h) => h._id !== confirmDeleteId);
    setHabits(updatedHabits);
    onHabitsChange && onHabitsChange(updatedHabits);

    setLoading(true);
    try {
      await deleteHabit(confirmDeleteId);
    } catch (error) {
      toast.error("Failed to delete habit");
      setHabits(habits);
    } finally {
      setLoading(false);
    }
    setConfirmDeleteId(null);
  };

  // Mark Habit as Complete (checkbox)
  const handleCompleteHabit = (habit) => {
    updateHabit(habit._id, true, habit.duration, habit.count, 100, 0);
    toast.success(`${habit.title} has been marked as completed!`);
  };

  // Initial fetch of habits
  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user/getHabits");
        if (!response.ok) throw new Error("Failed to fetch habits");

        const data = await response.json();
        setHabits(
          data.habits.map((h) => ({
            ...h,
            progress: calculateProgress(h),
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
      // Clear all timers
      Object.values(timers).forEach((timer) => clearInterval(timer.interval));
    };
  }, [today]);

  // Check if any timer is running
  const isAnyTimerRunning = Object.values(timers).some(
    (timer) => timer.interval
  );

  // Instead of regrouping them (which overrides manual reorder),
  // let’s just display them as-is so drag & drop order is visible.
  const displayedHabits = showMore ? habits : habits.slice(0, 5);

  return (
    <DndProvider backend={HTML5Backend}>
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

            {/* Render each habit with the subcomponent */}
            {displayedHabits.map((habit, index) => (
              <HabitItem
                key={habit._id}
                habit={habit}
                index={index}
                theme={theme}
                timers={timers}
                isAnyTimerRunning={isAnyTimerRunning}
                decrementAnimation={decrementAnimation}
                decrementVisible={decrementVisible}
                moveHabit={moveHabit}
                handleDrop={handleDrop}
                handleDecrementCount={handleDecrementCount}
                handleStartTimer={handleStartTimer}
                handlePauseTimer={handlePauseTimer}
                handleCompleteHabit={handleCompleteHabit}
                confirmDeleteHabit={confirmDeleteHabit}
                setDecrementAnimation={setDecrementAnimation}
                setDecrementVisible={setDecrementVisible}
              />
            ))}

            {/* Show More / Show Less */}
            {habits.length > 5 && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="mt-4 w-full sm:w-auto mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                {showMore ? "Show Less" : "Show More"}
              </button>
            )}

            {/* Chart */}
            <Chart
              habits={habits}
              currentDay={currentDay}
              penaltyAmount={penaltyAmount}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg">
              <h3 className="text-lg">
                Are you sure you want to delete this habit?
              </h3>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteHabit}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default Habits;
