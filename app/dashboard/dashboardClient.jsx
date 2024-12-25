"use client";

import { useState, useEffect } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonGradient from "@/components/ButtonGradient";
import { toast } from "react-hot-toast";
import Habits from "@/components/Habits";

export default function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [habitInputs, setHabitInputs] = useState([{ title: "", duration: "" }]);
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [habits, setHabits] = useState([]);
  const [canAddHabits, setCanAddHabits] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/user/getHabits");
      const data = await response.json();
      setHabits(data.habits);

      setCanAddHabits(data.habits.length === 0);
    } catch (error) {
      toast.error("Failed to fetch habits");
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      const response = await fetch("/api/user/deleteHabit", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ habitId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete habit");
      }
      await fetchHabits();
    } catch (error) {
      console.error(error.message);
    }
  };

  const addHabits = async () => {
    const validInputs = habitInputs.filter(
      (input) => input.title && input.duration
    );
    if (validInputs.length === 0) {
      toast.error("Please enter habit titles and durations.");
      return;
    }

    if (parseFloat(penaltyAmount) < 5) {
      toast.error("Penalty amount must be at least $5.");
      return;
    }

    try {
      for (const input of validInputs) {
        const response = await fetch("/api/user/addHabit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            habitTitle: input.title,
            habitDuration: input.duration,
            penaltyAmount: parseFloat(penaltyAmount),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add habit");
        }

        setHabits((prevHabits) => [
          ...prevHabits,
          { title: input.title, duration: input.duration, isComplete: false },
        ]);
      }

      toast.success("Habits added successfully!");
      setShowPopup(false);
      setHabitInputs([{ title: "", duration: "" }]);
      setPenaltyAmount("");
      await fetchHabits();
      setCanAddHabits(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addHabits();
    }
  };

  const handleInputChange = (index, field, value) => {
    const newHabitInputs = [...habitInputs];
    newHabitInputs[index][field] = value;
    setHabitInputs(newHabitInputs);
  };

  const addMoreHabitFields = () => {
    setHabitInputs([...habitInputs, { title: "", duration: "" }]);
  };

  return (
    <>
      <main className="min-h-screen pb-24 w-full">
        <section className="space-y-8">
          <div className="w-full flex flex-row justify-between items-center space-x-4 p-8">
            <div className="flex-1">
              <ButtonAccount />
            </div>

            <div className="flex-1 flex flex-row gap-5 justify-end">
              <ButtonGradient
                title="Add Habits"
                onClick={() => setShowPopup(true)}
                disabled={!canAddHabits}
                className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gradient-to-l"
              />
            </div>
          </div>

          <Habits
            habits={habits}
            deleteHabit={deleteHabit}
            onHabitsChange={fetchHabits}
          />

          {/* Popup */}
          {showPopup && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 text-white">
              <div className="bg-white p-6 rounded-md shadow-lg w-96 transform scale-105 transition-all duration-300">
                <h2 className="text-xl font-bold mb-4 text-black">
                  Add New Habits
                </h2>
                {habitInputs.map((input, index) => (
                  <div key={index} className="mb-4">
                    <input
                      type="text"
                      placeholder="Habit Title"
                      value={input.title}
                      onChange={(e) =>
                        handleInputChange(index, "title", e.target.value)
                      }
                      className="input input-bordered input-info w-full max-w-xs mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={handleKeyPress}
                    />
                    <input
                      type="text"
                      placeholder="Duration in minutes"
                      value={input.duration}
                      onChange={(e) =>
                        handleInputChange(index, "duration", e.target.value)
                      }
                      className="input input-bordered input-info w-full max-w-xs mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                ))}
                <div className="mb-4">
                  <input
                    type="number"
                    placeholder="Penalty Amount Minimum $5"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(e.target.value)}
                    className="input input-bordered input-info w-full max-w-xs"
                    min="5"
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                    onClick={addMoreHabitFields}
                    disabled={!canAddHabits}
                  >
                    Add More Habits
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={addHabits}
                    disabled={!canAddHabits}
                  >
                    Save
                  </button>
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
