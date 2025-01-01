import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import Chart from "./Chart";

function Habits({ habits, deleteHabit, onHabitsChange }) {
  const [today] = useState(parseInt(new Date().getDate() + 0));
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [quote, setQuote] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    habit: null,
  });

  const [gitNumber, setGitNumber] = useState(0);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/getHabits");
      if (!response.ok) throw new Error("Failed to fetch habits");

      const data = await response.json();

      onHabitsChange && onHabitsChange();
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

  useEffect(() => {
    fetchHabits();
  }, []);
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
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={habit.isComplete}
                    onChange={() => handleCheckboxClick(habit)}
                    className="form-checkbox h-6 w-6 text-indigo-500 transition-all duration-300"
                    disabled={habit.isComplete}
                  />
                  <span
                    className={`ml-4 text-lg font-medium transition-all duration-300 ${
                      habit.isComplete
                        ? "line-through text-gray-500"
                        : "text-base-content"
                    }`}
                  >
                    {habit.title} - {habit.duration} minutes
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteHabit(habit._id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <FaRegTrashAlt className="h-6 w-6" />
                </button>
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
          {confirmModal.open && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 text-black">
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
                    className="px-4 py-2 bg-indigo-500 text-base-content rounded-md"
                    onClick={confirmHabitCompletion}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Habits;
