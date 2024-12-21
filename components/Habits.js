import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import Chart from "./Chart";

import { useSession } from "next-auth/react";
function Habits({ habits, deleteHabit, onHabitsChange }) {
  const [today] = useState(parseInt(new Date().getDate()));
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    habit: null,
  });

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/getHabits");
      if (!response.ok) throw new Error("Failed to fetch habits");

      const data = await response.json();

      onHabitsChange && onHabitsChange();

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

      // toast.success("Habit updated successfully!");
      await fetchHabits();
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

  const updateCompletedDays = async (day) => {
    try {
      const response = await fetch("/api/user/updateCompletedDays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day }),
      });

      if (!response.ok) {
        throw new Error("Failed to update completed days");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const confirmHabitCompletion = async () => {
    const { habit } = confirmModal;
    await updateHabit(habit._id, true);

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

  const handleSendEmail = async () => {
    // api call to send email
    await fetch("/api/cron/runCron", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleResetHabits = async () => {
    try {
      const response = await fetch("/api/cron/resetAllHabits", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reset habits");
      toast.success("Habits reset successfully!");
      await fetchHabits();
    } catch (error) {
      toast.error("Failed to reset habits");
      console.error("Error resetting habits:", error);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 bg-gray-800 p-4 rounded-lg">
      {loading ? (
        <div className="text-center text-white">
          <h2 className="text-xl">Loading...</h2>
        </div>
      ) : (
        <>
          <div className="text-center text-white mb-4">
            <h2 className="text-xl font-bold">Day {currentDay} / 21</h2>
          </div>
          <button
            onClick={handleSendEmail}
            className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Send Email
          </button>
          <button
            onClick={handleResetHabits}
            className="mb-4 px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Reset All Habits
          </button>
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
