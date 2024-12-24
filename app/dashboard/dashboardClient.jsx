"use client";

import { useState, useEffect } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonGradient from "@/components/ButtonGradient";
import { toast } from "react-hot-toast";
import Habits from "@/components/Habits";

export default function Dashboard() {
  const [showPopup, setShowPopup] = useState(false); // State for showing/hiding the popup
  const [habitInputs, setHabitInputs] = useState([{ title: "", duration: "" }]); // State for habit inputs
  const [penaltyAmount, setPenaltyAmount] = useState(""); // State for penalty amount
  const [habits, setHabits] = useState([]); // State for habits
  const [canAddHabits, setCanAddHabits] = useState(true); // State to control adding habits

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/user/getHabits");
      const data = await response.json();
      setHabits(data.habits);

      setCanAddHabits(data.habits.length === 0); // Unlock adding habits if none exist, lock if any exist
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
            penaltyAmount: parseFloat(penaltyAmount), // Include penalty amount
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add habit");
        } else {
          console.log("Added habitsssss in dash client.jsx");
          // Immediately update the habits state with the new habit
          setHabits((prevHabits) => [
            ...prevHabits,
            { title: input.title, duration: input.duration, isComplete: false },
          ]);
        }
      }

      toast.success("Habits added successfully!");
      setShowPopup(false); // Close the popup
      setHabitInputs([{ title: "", duration: "" }]); // Reset the habit inputs
      setPenaltyAmount(""); // Reset penalty amount
      await fetchHabits(); // Fetch updated habits
      setCanAddHabits(false); // Disable adding more habits
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
      <main className="min-h-screen p-8 pb-24 w-full ">
        <section className="space-y-8">
          <div className="w-full flex flex-row justify-between items-center space-x-4">
            <div className="flex-1">
              <ButtonAccount />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                21 Habits
              </h1>
            </div>
            <div className="flex-1 flex flex-row gap-5 justify-end">
              <ButtonGradient
                title="Add Habits"
                onClick={() => setShowPopup(true)}
                disabled={!canAddHabits}
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
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 text-black">
              <div className="bg-white p-6 rounded-md shadow-lg w-96">
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
                      className="input input-bordered input-info w-full max-w-xs mb-2"
                      onKeyPress={handleKeyPress}
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g., 45 minutes)"
                      value={input.duration}
                      onChange={(e) =>
                        handleInputChange(index, "duration", e.target.value)
                      }
                      className="input input-bordered input-info w-full max-w-xs"
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                ))}
                <div className="mb-4">
                  <input
                    type="number"
                    placeholder="Penalty Amount ($)"
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
                    disabled={!canAddHabits} // Disable button if habits exist
                  >
                    Add More Habits
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={addHabits}
                    disabled={!canAddHabits} // Disable button if habits exist
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
