"use client";

import { useState, useEffect } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonGradient from "@/components/ButtonGradient";
import { toast } from "react-hot-toast";
import Habits from "@/components/Habits";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [habitInputs, setHabitInputs] = useState([
    { title: "", duration: "", count: "", penalty: "" },
  ]);

  const [habits, setHabits] = useState([]);
  const [toggleOption, setToggleOption] = useState("count");

  const { data: session } = useSession();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/user/getHabits");
      const data = await response.json();
      setHabits(data.habits);
    } catch (error) {
      toast.error("Failed to fetch habits");
    }
  };

  const deleteHabit = async (habitId) => {
    if (!habitId) return;

    if (habits.length === 1) {
      await fetch("/api/user/resetProgress", {
        method: "POST",
        body: JSON.stringify({ userId: session.user.id }),
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const response = await fetch("/api/user/deleteHabit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to delete habit");

      await fetchHabits();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newHabitInputs = [...habitInputs];
    newHabitInputs[index][field] = value;
    setHabitInputs(newHabitInputs);
  };

  const addMoreHabitFields = () => {
    if (habitInputs.length < 5) {
      setHabitInputs([...habitInputs, { title: "", duration: "", count: "" }]);
    } else {
      toast.error("You can only add a maximum of 5 habit fields.");
    }
  };

  const addHabits = async () => {
    const validInputs = habitInputs.filter((input) =>
      toggleOption === "count" ? input.count : input.duration
    );
    if (validInputs.length === 0) {
      toast.error("Please fill out all fields for each habit.");
      return;
    }

    try {
      for (const input of validInputs) {
        const response = await fetch("/api/user/addHabit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            habitTitle: input.title,
            habitDuration: toggleOption === "duration" ? input.duration : 0,
            habitCount: toggleOption === "count" ? input.count : 0,
            penalty: input.penalty,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to add habit");

        setHabits((prevHabits) => [
          ...prevHabits,
          {
            title: input.title,
            duration: input.duration,
            count: input.count,
          },
        ]);
      }

      toast.success("Habits added successfully!");
      setShowPopup(false);
      setHabitInputs([{ title: "", duration: "", count: "", penalty: "" }]);
      fetchHabits();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleChange = () => {
    setToggleOption(toggleOption === "count" ? "duration" : "count");
    setHabitInputs(
      habitInputs.map((input) => ({ ...input, duration: "", count: "" }))
    );
  };

  return (
    <main className="min-h-screen pb-24 w-full bg-base-100 text-base-content">
      <section className="space-y-8">
        {/* Header Section */}
        <div className="w-full flex flex-row justify-between items-center space-x-4 p-8">
          <div className="flex-1">
            <ButtonAccount />
          </div>

          <div className="flex-1 flex flex-row gap-5 justify-end">
            <ButtonGradient
              title="Add Habits"
              onClick={() => setShowPopup(true)}
            />
          </div>
        </div>

        {/* Habits Section */}
        <Habits
          habits={habits}
          deleteHabit={deleteHabit}
          onHabitsChange={fetchHabits}
        />

        {/* Add Habit Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-base-100 p-6 rounded-md shadow-lg w-96 transform scale-105 transition-all duration-300">
              <h2 className="text-xl font-bold mb-4">Add New Habits</h2>

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
                  />

                  {toggleOption === "count" ? (
                    <input
                      type="text"
                      placeholder="Count"
                      value={input.count}
                      onChange={(e) =>
                        handleInputChange(index, "count", e.target.value)
                      }
                      className="input input-bordered input-info w-full max-w-xs mb-2"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Duration (mins)"
                      value={input.duration}
                      onChange={(e) =>
                        handleInputChange(index, "duration", e.target.value)
                      }
                      className="input input-bordered input-info w-full max-w-xs mb-2"
                    />
                  )}

                  <div className="flex items-center justify-around w-full ">
                    <span className="mr-2 text-gray-200">Count</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        onChange={handleToggleChange}
                      />
                      <div className="w-10 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                      <div
                        className={`dot absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${
                          toggleOption === "count"
                            ? "translate-x-0"
                            : "translate-x-4"
                        }`}
                      ></div>
                    </label>
                    <span className="ml-2 text-gray-200">Duration</span>
                  </div>
                </div>
              ))}

              <div className="flex justify-between mt-4 items-center">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-md"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-md"
                  onClick={addMoreHabitFields}
                >
                  Add More
                </button>

                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  onClick={addHabits}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
