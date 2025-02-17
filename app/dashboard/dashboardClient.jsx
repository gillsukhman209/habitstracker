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
    {
      title: "",
      duration: "",
      count: "",
      penalty: "",
      toggleOption: "duration",
      getCharged: true, // Set getCharged to true by default
    },
  ]);

  const [habits, setHabits] = useState([]);
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

    try {
      const response = await fetch("/api/user/deleteHabit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete habit");

      // Optimistically update habits state
      setHabits((prevHabits) =>
        prevHabits.filter((habit) => habit._id !== habitId)
      );

      // If no habits are left, explicitly clear the habits state
      if (habits.length === 1) {
        setHabits([]);
        await fetch("/api/user/resetProgress", {
          method: "POST",
          body: JSON.stringify({ userId: session.user.id }),
          headers: { "Content-Type": "application/json" },
        });
      }

      toast.success("Habit deleted successfully!");
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to delete habit");
    }
  };

  const handleInputChange = (index, field, value) => {
    const newHabitInputs = [...habitInputs];
    newHabitInputs[index][field] = value;
    setHabitInputs(newHabitInputs);
  };

  const addMoreHabitFields = () => {
    if (habitInputs.length < 5) {
      setHabitInputs([
        ...habitInputs,
        {
          title: "",
          duration: "",
          count: "",
          toggleOption: "count",
          getCharged: true,
        },
      ]);
    } else {
      toast.error("You can only add a maximum of 5 habit fields.");
    }
  };

  const addHabits = async () => {
    try {
      // Loop through each habit input
      for (const input of habitInputs) {
        // === CHANGED: Optimistically insert the new habit at the top ===
        // We'll give a temporary ID like "temp-<timestamp>"
        setHabits((prevHabits) => [
          {
            _id: "temp-" + Date.now(),
            title: input.title,
            duration: input.toggleOption === "duration" ? input.duration : "0",
            count: input.toggleOption === "count" ? input.count : "0",
            getCharged: input.getCharged,
            isComplete: false,
            isImportant: false,
            progress: 0,
            createdAt: new Date(),
          },
          ...prevHabits,
        ]);
        // ===============================================================

        // Make the API call to actually add the habit to the server
        const response = await fetch("/api/user/addHabit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            habitTitle: input.title,
            habitDuration:
              input.toggleOption === "duration" ? input.duration : "0",
            habitCount: input.toggleOption === "count" ? input.count : "0",
            getCharged: input.getCharged,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to add habit");
      }

      // We added everything successfully, so let's re-fetch once to ensure data is correct
      await fetchHabits();

      // Reset inputs
      setHabitInputs([
        {
          title: "",
          duration: "",
          count: "",
          penalty: "",
          toggleOption: "count",
          getCharged: true,
        },
      ]);

      // Close the popup
      setShowPopup(false);

      toast.success("Habits added successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleChange = (index) => {
    const newHabitInputs = [...habitInputs];
    newHabitInputs[index].toggleOption =
      newHabitInputs[index].toggleOption === "count" ? "duration" : "count";
    newHabitInputs[index].duration = "";
    newHabitInputs[index].count = "";
    setHabitInputs(newHabitInputs);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default form submission
      addHabits(); // Call addHabits function
    }
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

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ">
            <div className="bg-base-100 p-8 rounded-xl shadow-xl w-96 transform scale-100 transition-all duration-300">
              <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                Add New Habit
              </h2>

              {habitInputs.map((input, index) => (
                <div key={index} className="mb-6">
                  <input
                    type="text"
                    placeholder="Habit Title"
                    value={input.title}
                    onChange={(e) =>
                      handleInputChange(index, "title", e.target.value)
                    }
                    className="input input-bordered input-primary w-full mb-4 text-sm"
                    onKeyDown={handleKeyDown}
                  />

                  {input.toggleOption === "count" ? (
                    <input
                      type="text"
                      placeholder="Count (optional)"
                      value={input.count}
                      onChange={(e) =>
                        handleInputChange(index, "count", e.target.value)
                      }
                      className="input input-bordered input-primary w-full mb-4 text-sm"
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Duration (mins, optional)"
                      value={input.duration}
                      onChange={(e) =>
                        handleInputChange(index, "duration", e.target.value)
                      }
                      className="input input-bordered input-primary w-full mb-4 text-sm"
                      onKeyDown={handleKeyDown}
                    />
                  )}

                  <div className="flex items-center justify-between w-full text-sm">
                    <span className="text-base-content">Count</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        onChange={() => handleToggleChange(index)}
                      />
                      <div className="w-12 h-6 bg-gray-300 rounded-full shadow-inner transition-colors">
                        <div
                          className={`dot absolute w-6 h-6 bg-primary rounded-full shadow transition-transform duration-200 ease-in-out ${
                            input.toggleOption === "count"
                              ? "translate-x-0"
                              : "translate-x-6"
                          }`}
                        ></div>
                      </div>
                    </label>
                    <span className="text-base-content">Duration</span>
                  </div>

                  <div className="flex items-center mt-4 text-sm">
                    <input
                      type="checkbox"
                      checked={input.getCharged}
                      onChange={(e) =>
                        handleInputChange(index, "getCharged", e.target.checked)
                      }
                      className="checkbox checkbox-primary mr-2"
                    />
                    <label className="text-base-content">Get Charged</label>
                  </div>
                </div>
              ))}

              <div className="flex justify-between mt-6">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all"
                  onClick={addMoreHabitFields}
                >
                  Add More
                </button>

                <button
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-all"
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
