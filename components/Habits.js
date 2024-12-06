import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import Chart from "./Chart";
import Modal from "./Modal";

function Habits({ deleteHabit }) {
  const [habits, setHabits] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/user/getHabits");
      if (!response.ok) throw new Error("Failed to fetch habits");

      const data = await response.json();
      setHabits(data.habits);

      if (data.habits.length > 0) {
        const firstHabitDate = new Date(data.habits[0].createdAt);
        calculateCurrentDay(firstHabitDate);
      }
    } catch (error) {
      toast.error("Failed to fetch habits");
      console.error("Error fetching habits:", error);
    }
  };

  const calculateCurrentDay = (startDate) => {
    const now = new Date();
    const daysElapsed =
      Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
    setCurrentDay(Math.min(daysElapsed, 21));
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
      setSelectedHabit(habit);
      setIsModalOpen(true);
    } else {
      updateHabit(habit._id, !habit.isComplete);
    }
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
      <div className="text-center text-white mb-4">
        <h2 className="text-xl font-bold">Day {currentDay} / 21</h2>
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
                disabled={habit.isComplete}
                className="form-checkbox h-5 w-5 text-blue-600"
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
      <Chart currentDay={currentDay} />
      {isModalOpen && (
        <Modal isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <p>Are you sure you want to mark this habit as complete?</p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                updateHabit(selectedHabit._id, true);
                setIsModalOpen(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Confirm
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 ml-2 bg-gray-400 text-white rounded-md"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Habits;
