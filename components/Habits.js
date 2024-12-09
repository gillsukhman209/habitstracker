// components/Habits.js
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import Chart from "./Chart";

function Habits({ deleteHabit }) {
  const [habits, setHabits] = useState([]);
  const [lastResetDate, setLastResetDate] = useState(0);
  // const [today, setToday] = useState(parseInt(new Date().getDate()));
  const [today, setToday] = useState(11);

  const [currentDay, setCurrentDay] = useState(1);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    habit: null,
  });
  const [loading, setLoading] = useState(true); // New loading state
  const [lastResetDay, setLastResetDay] = useState(0); // New state for last reset day
  const [reset, setReset] = useState(false); // New state for reset

  const fetchHabits = async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const response = await fetch("/api/user/getHabits");
      if (!response.ok) throw new Error("Failed to fetch habits");

      const data = await response.json();
      setHabits(data.habits);

      setLastResetDate(data.lastResetDate);
      if (data.habits[0]?.dateAdded) {
        const firstHabitDate = new Date(data.habits[0]?.dateAdded).getDate();
        calculateDay(data.lastResetDate, parseInt(firstHabitDate));
      } else {
        calculateDay(data.lastResetDate, 1);
      }
    } finally {
      setLoading(false); // Set loading to false when fetching is done
    }
  };

  const calculateDay = async (resetDate, firstHabitDay) => {
    // Fetch completed days
    const response = await fetch("/api/user/getDays");
    if (!response.ok) throw new Error("Failed to fetch completed days");
    const data = await response.json();
    const completedDays = data.completedDays || [];

    if (today !== resetDate) {
      console.log("today !== resetDate", today, resetDate);
      const response = await fetch("/api/user/resetHabits", {
        method: "PATCH",
        body: JSON.stringify({ reset: false }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to reset habits in habits.js");
      setReset(true); // Set reset to true when resetHabits is called
      await fetchHabits();
    }

    if (firstHabitDay === 1) {
      setCurrentDay(1);
      return;
    }

    const currentDay = today - firstHabitDay + 1;
    setCurrentDay(currentDay);

    const missedDays = currentDay - 1 - completedDays.length;

    if (missedDays > 2) {
      console.log("missedDays > 2", missedDays);
      const resetResponse = await fetch("/api/user/resetHabits", {
        method: "PATCH",
        body: JSON.stringify({ reset: true }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setCurrentDay(1);
      setReset(true); // Set reset to true when resetHabits is called
      await fetchHabits();
      if (!resetResponse.ok) throw new Error("Failed to reset habits");
      return;
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
      await fetchHabits();
    } catch (error) {
      toast.error("Failed to update habit");
      console.error("Error updating habit:", error);
    }
  };

  const handleCheckboxClick = (habit) => {
    if (!habit.isComplete) {
      setConfirmModal({ open: true, habit });
      updateCompletedDays(currentDay);
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
    fetchHabits();
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
            <h2 className="text-xl font-bold">Day {currentDay} / 21</h2>
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
          <Chart habits={habits} currentDay={currentDay} reset={reset} />{" "}
          {/* Pass reset to Chart */}
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
