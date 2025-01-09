import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt, FaPlay, FaPause, FaGripVertical } from "react-icons/fa";
import { MdRemoveCircle } from "react-icons/md";
import Chart from "./Chart";
import { useTheme } from "next-themes";

// Drag & Drop
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  HABIT: "HABIT",
};

/* 
  Helper to move completed habits to the bottom. 
  - First: gather all incomplete habits (isComplete === false).
  - Then: gather all complete habits (isComplete === true).
  - Combine them => incomplete... then complete...
  - Reassign .order from top to bottom in that new list.
*/
function reorderWithCompletedAtBottom(arr) {
  const incomplete = arr.filter((h) => !h.isComplete);
  const complete = arr.filter((h) => h.isComplete);
  const merged = [...incomplete, ...complete];
  merged.forEach((item, idx) => {
    item.order = idx;
  });
  return merged;
}

/**
 * Subcomponent for a single habit row
 */
function HabitItem({
  habit,
  index,
  moveHabit,
  handleDrop,
  timers,
  isAnyTimerRunning,
  decrementAnimation,
  decrementVisible,
  setDecrementAnimation,
  setDecrementVisible,
  handleDecrementCount,
  handleStartTimer,
  handlePauseTimer,
  handleCompleteHabit,
  confirmDeleteHabit,
  theme,
}) {
  const ref = useRef(null);

  // DRAG
  const [, drag] = useDrag({
    type: ItemTypes.HABIT,
    item: { index },
  });

  // DROP
  const [, drop] = useDrop({
    accept: ItemTypes.HABIT,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveHabit(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    drop: () => {
      // Once dropped, persist the new order
      handleDrop();
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`habit-item relative flex items-center justify-between p-6 rounded-lg shadow-2xl transition-all transform border border-base-content ${
        habit.isComplete ? "opacity-50" : ""
      }`}
      style={{ cursor: "move" }}
    >
      {/* Progress bar background */}
      <div
        className={`absolute top-0 left-0 h-full ${
          habit.isComplete
            ? "hidden"
            : theme === "dark"
            ? "bg-green-600"
            : "bg-green-400"
        } rounded-lg transition-all`}
        style={{ width: `${habit.progress}%` }}
      />

      {/* Left side: handle, name, count, duration */}
      <div className="relative flex flex-col items-start z-10">
        <div className="flex items-center mb-1">
          <FaGripVertical className="text-gray-500 mr-2" />
          <span
            className={`text-lg font-medium ${
              habit.isComplete ? "line-through" : ""
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

      {/* Right side: buttons */}
      <div className="relative flex space-x-2 z-10">
        {/* Decrement for count-based habits */}
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
              className="px-4 py-2 rounded-xl text-3xl bg-transparent"
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
                    onClick={() => handleDecrementCount(habit, 1000)}
                    disabled={isAnyTimerRunning}
                    className="px-2 py-1 border border-base-content rounded shadow text-base-content flex items-center justify-center mt-2 w-14"
                  >
                    -1000
                  </button>
                )}
                {habit.count >= 500 && (
                  <button
                    onClick={() => handleDecrementCount(habit, 500)}
                    disabled={isAnyTimerRunning}
                    className="px-2 py-1 border border-base-content rounded shadow text-base-content flex items-center justify-center mt-2 w-14"
                  >
                    -500
                  </button>
                )}
                {habit.count >= 100 && (
                  <button
                    onClick={() => handleDecrementCount(habit, 100)}
                    disabled={isAnyTimerRunning}
                    className="px-2 py-1 border border-base-content rounded shadow text-base-content flex items-center justify-center mt-2 w-12"
                  >
                    -100
                  </button>
                )}
                {habit.count >= 50 && (
                  <button
                    onClick={() => handleDecrementCount(habit, 50)}
                    disabled={isAnyTimerRunning}
                    className="px-2 py-1 border border-base-content rounded shadow text-base-content flex items-center justify-center mt-2 w-10"
                  >
                    -50
                  </button>
                )}
                {habit.count >= 10 && (
                  <button
                    onClick={() => handleDecrementCount(habit, 10)}
                    disabled={isAnyTimerRunning}
                    className="px-2 py-1 border border-base-content rounded shadow text-base-content flex items-center justify-center mt-2 w-10"
                  >
                    -10
                  </button>
                )}
                {habit.count >= 1 && (
                  <button
                    onClick={() => handleDecrementCount(habit, 1)}
                    disabled={isAnyTimerRunning}
                    className="px-2 py-1 border border-base-content rounded shadow text-base-content flex items-center justify-center mt-2 w-10"
                  >
                    -1
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Timer start/pause */}
        {!habit.isComplete && habit.duration !== "0" && (
          <>
            {timers[habit._id]?.interval === undefined && (
              <button
                className="px-4 py-2 rounded-xl text-2xl bg-transparent"
                onClick={() => handleStartTimer(habit)}
                disabled={isAnyTimerRunning}
              >
                <FaPlay />
              </button>
            )}
            {timers[habit._id]?.interval !== undefined && (
              <button
                className="px-4 py-2 rounded-xl text-3xl bg-transparent"
                onClick={() => handlePauseTimer(habit)}
              >
                <FaPause />
              </button>
            )}
          </>
        )}

        {/* If no count/duration => checkbox */}
        {!habit.isComplete && habit.duration === "0" && habit.count < 1 && (
          <div className="px-4 py-2 rounded-xl text-3xl bg-transparent flex items-center">
            <input
              type="checkbox"
              className="w-6 h-6"
              onChange={() => handleCompleteHabit(habit)}
            />
          </div>
        )}

        {/* Delete button */}
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
export default function Habits({
  habits: parentHabits,
  deleteHabit,
  onHabitsChange,
}) {
  const [today] = useState(() => new Date().getDate());
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [quote, setQuote] = useState("");
  const [habits, setHabits] = useState(parentHabits || []);
  const [timers, setTimers] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [decrementVisible, setDecrementVisible] = useState({});
  const [decrementAnimation, setDecrementAnimation] = useState({});
  const { theme } = useTheme();

  // Keep local habits in sync
  useEffect(() => {
    if (!parentHabits?.length) {
      setHabits([]);
    } else {
      setHabits(parentHabits);
    }
  }, [parentHabits]);

  /**
   * moveHabit: reorders items in a single list (no grouping).
   */
  function moveHabit(fromIndex, toIndex) {
    const updated = [...habits];
    const [removed] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, removed);

    // Reassign .order for the new order
    updated.forEach((h, i) => {
      h.order = i;
    });

    setHabits(updated);
  }

  /**
   * handleDrop: after dropping, persist order to backend
   */
  async function handleDrop() {
    try {
      // If any have changed completeness, reorder them so completes are at bottom
      const finalArr = reorderWithCompletedAtBottom([...habits]);

      setHabits(finalArr); // Ensure local state is correct
      await fetch("/api/user/updateHabitOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: finalArr }),
      });
      if (onHabitsChange) {
        onHabitsChange(finalArr);
      }
    } catch (error) {
      console.error("Failed to update habit order:", error);
    }
  }

  /**
   * updateHabit
   * If a habit becomes complete => reorder with completed at bottom
   */
  async function updateHabit(
    habitId,
    isComplete,
    duration,
    count,
    progress,
    timer
  ) {
    try {
      const response = await fetch("/api/user/updateHabit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

      setHabits((prev) => {
        // Merge updated fields
        const merged = prev.map((h) =>
          h._id === habitId
            ? {
                ...h,
                isComplete: updatedHabit.habit.isComplete,
                duration: updatedHabit.habit.duration,
                count: updatedHabit.habit.count,
                progress: updatedHabit.habit.progress,
                timer: updatedHabit.habit.timer,
                order: updatedHabit.habit.order ?? h.order,
              }
            : h
        );

        // If the habit is now complete, reorder so completed are at bottom
        return reorderWithCompletedAtBottom(merged);
      });
    } catch (error) {
      toast.error("Failed to update habit");
    }
  }

  // Timer utility
  function calculateProgress(habit) {
    if (habit.duration > 0) {
      const totalDuration = habit.duration * 60;
      const elapsed = totalDuration - (habit.timer || totalDuration);
      const progress = ((elapsed / totalDuration) * 100).toFixed(2);
      return Math.min(progress, 100);
    }
    return habit.progress || 0;
  }

  function handleStartTimer(habit) {
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
  }

  function handlePauseTimer(habit) {
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
  }

  function handleDecrementCount(habit, decrementValue) {
    const newCount = Math.max(habit.count - decrementValue, 0);
    const isComplete = newCount === 0;

    setHabits((prev) => {
      const merged = prev.map((h) =>
        h._id === habit._id
          ? {
              ...h,
              count: newCount,
              isComplete,
            }
          : h
      );
      return reorderWithCompletedAtBottom(merged);
    });

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
  }

  function handleCompleteHabit(habit) {
    // Mark as complete, reorder at bottom
    updateHabit(habit._id, true, habit.duration, habit.count, 100, 0);
    toast.success(`${habit.title} has been marked as completed!`);
  }

  function confirmDeleteHabit(habitId) {
    setConfirmDeleteId(habitId);
  }

  async function handleDeleteHabit() {
    if (!confirmDeleteId) return;
    const updated = habits.filter((h) => h._id !== confirmDeleteId);
    setHabits(updated);
    try {
      await deleteHabit(confirmDeleteId);
    } catch (error) {
      toast.error("Failed to delete habit");
      setHabits(habits); // revert
    }
    setConfirmDeleteId(null);
  }

  // On mount, fetch from server
  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user/getHabits");
        if (!response.ok) throw new Error("Failed to fetch habits");
        const data = await response.json();
        const finalData = data.habits.map((h) => ({
          ...h,
          progress: calculateProgress(h),
        }));
        // automatically reorder completes at bottom
        const finalArr = reorderWithCompletedAtBottom(finalData);
        setHabits(finalArr);

        setPenaltyAmount(data.penaltyAmount);
        setQuote(data.quote);

        if (data.habits[0]?.dateAdded) {
          const firstHabitDate = new Date(data.habits[0].dateAdded).getDate();
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
      // Clear all timers on unmount
      Object.values(timers).forEach((timer) => clearInterval(timer.interval));
    };
  }, [today]);

  const isAnyTimerRunning = Object.values(timers).some((t) => t.interval);

  // Sort by .order for display
  const sortedHabits = [...habits].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  // Show 5 or all
  const displayedHabits = showMore ? sortedHabits : sortedHabits.slice(0, 5);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full flex flex-col gap-8 p-8 rounded-lg shadow-xl text-base-content">
        {loading ? (
          <div className="text-center">
            <h2 className="text-xl">Loading...</h2>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="text-center mb-6 w-full">
              <h2 className="text-2xl font-semibold">
                Day {currentDay} / 21 main branch
              </h2>
            </div>

            {quote ? (
              <div className="text-center mb-4">
                <p className="text-lg italic">&quot;{quote}&quot;</p>
              </div>
            ) : (
              <div className="text-center mb-4">
                <p className="text-lg italic">
                  &quot;Stay positive and keep pushing forward!&quot;
                </p>
              </div>
            )}

            {/* Render each habit in sorted order */}
            {displayedHabits.map((habit, index) => (
              <HabitItem
                key={habit._id}
                habit={habit}
                index={index}
                moveHabit={moveHabit}
                handleDrop={handleDrop}
                timers={timers}
                isAnyTimerRunning={isAnyTimerRunning}
                decrementAnimation={decrementAnimation}
                decrementVisible={decrementVisible}
                setDecrementAnimation={setDecrementAnimation}
                setDecrementVisible={setDecrementVisible}
                handleDecrementCount={handleDecrementCount}
                handleStartTimer={handleStartTimer}
                handlePauseTimer={handlePauseTimer}
                handleCompleteHabit={handleCompleteHabit}
                confirmDeleteHabit={confirmDeleteHabit}
                theme={theme}
              />
            ))}

            {sortedHabits.length > 5 && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="mt-4 w-full sm:w-auto mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
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

        {/* Delete Confirmation */}
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
