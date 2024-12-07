// components/Habits.js
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import Chart from "./Chart";

function Habits({ deleteHabit }) {
  const [habits, setHabits] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [daysLeft, setDaysLeft] = useState(0);
  const [resetTriggered, setResetTriggered] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    habit: null,
  });
  const [loading, setLoading] = useState(true); // New loading state
  const [lastResetDay, setLastResetDay] = useState(0); // New state for last reset day

  const fetchHabits = async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const response = await fetch("/api/user/getHabits");
      if (!response.ok) throw new Error("Failed to fetch habits");

      const data = await response.json();
      setHabits(data.habits);
      return data.habits;
    } catch (error) {
      if (!resetTriggered) {
        toast.error("Failed to fetch habits");
        console.error("Error fetching habits:", error);
      }
    } finally {
      setLoading(false); // Set loading to false when fetching is done
    }
  };

  const calculateDays = (startDate) => {
    console.log("Calculating days...");
    // const now = new Date();
    const now = new Date(
      "Sat Dec 21 2024 01:22:43 GMT-0800 (Pacific Standard Time)"
    );
    console.log("Now:", now);
    const daysElapsed =
      Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const cappedDay = Math.min(daysElapsed, 21);
    setCurrentDay(cappedDay);
    setDaysLeft(21 - cappedDay);

    // Only reset if cappedDay has changed and reset hasn't been triggered
    if (cappedDay > lastResetDay && !resetTriggered) {
      setResetTriggered(true);
      resetDailyHabits(cappedDay);

      setLastResetDay(cappedDay);
    }
  };

  const resetDailyHabits = async (day) => {
    console.log("Resetting habits for day:", day);
    try {
      const response = await fetch("/api/user/resetHabits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentDay: day }),
      });

      if (!response.ok) {
        toast.error("Failed to reset daily habits");
        throw new Error("Failed to reset daily habits");
      }

      await fetchHabits();
    } catch (error) {
      console.error("Error resetting habits:", error);
      if (!resetTriggered) {
        toast.error("Failed to reset daily habits");
      }
    }
  };

  const updateHabit = async (habitId, isComplete) => {
    try {
      const response = await fetch("/api/user/updateHabit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ habitId, isComplete }),
      });

      if (!response.ok) throw new Error("Failed to update habit");

      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit._id === habitId ? { ...habit, isComplete } : habit
        )
      );

      toast.success("Habit updated successfully!");
    } catch (error) {
      toast.error("Failed to update habit");
      console.error("Error updating habit:", error);
    }
  };

  const handleCheckboxClick = (habit) => {
    if (!habit.isComplete) {
      setConfirmModal({ open: true, habit });
    }
  };

  const confirmHabitCompletion = () => {
    const { habit } = confirmModal;
    updateHabit(habit._id, true);
    setConfirmModal({ open: false, habit: null });
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteHabit(habitId);
      await fetchHabits();
      toast.success("Habit deleted successfully");
    } catch (error) {
      toast.error("Failed to delete habit");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("Running fetchData...");
      await fetchHabits().then((habits) => {
        console.log("Habits fetched", habits);
        if (habits.length > 0) {
          const firstHabitDate = new Date(habits[0].dateAdded);
          console.log("First habit date:", firstHabitDate);
          calculateDays(firstHabitDate);
        }
      });
    };
    fetchData();
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 bg-gray-800 p-4 rounded-lg">
      {loading ? ( // Show loading message if loading is true
        <div className="text-center text-white">
          <h2 className="text-xl">Loading...</h2>
        </div>
      ) : (
        <>
          <div className="text-center text-white mb-4">
            <h2 className="text-xl font-bold">
              Day {currentDay} / 21 - {daysLeft} days left
            </h2>
            {currentDay === 21 && (
              <p>Congratulations! You have completed 21 days.</p>
            )}
          </div>

          {habits.length > 0 ? (
            habits.map((habit) => (
              <div
                key={habit._id}
                className="flex items-center justify-between bg-gray-700 text-white p-2 rounded-lg"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={habit.isComplete}
                    onChange={() => handleCheckboxClick(habit)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                    disabled={habit.isComplete}
                  />
                  <span
                    className={`ml-3 text-sm ${
                      habit.isComplete ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {habit.title} - {habit.duration} minutes
                  </span>
                </div>
                <button onClick={() => handleDeleteHabit(habit._id)}>
                  <FaRegTrashAlt className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No habits found</p>
          )}

          <Chart habits={habits} currentDay={currentDay} />
          {resetTriggered.toString()}

          {confirmModal.open && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Confirm Completion</h2>
                <p>Are you sure you want to mark this habit as complete?</p>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-black rounded-md"
                    onClick={() =>
                      setConfirmModal({ open: false, habit: null })
                    }
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={confirmHabitCompletion}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Habits;
