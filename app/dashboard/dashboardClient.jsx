"use client";

import { useState } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonGradient from "@/components/ButtonGradient";
import Chart from "@/components/Chart";
import { toast } from "react-hot-toast";

export default function Dashboard() {
  const [showPopup, setShowPopup] = useState(false); // State for showing/hiding the popup
  const [habitTitle, setHabitTitle] = useState(""); // State for habit title
  const [rawDuration, setRawDuration] = useState(""); // Raw duration input
  const [habitDuration, setHabitDuration] = useState(""); // State for habit duration in minutes

  const addHabit = async () => {
    if (!habitTitle || !habitDuration) {
      toast.error("Please enter both habit title and duration.");
      return;
    }

    try {
      console.log("sending", habitTitle, habitDuration);
      const response = await fetch("/api/user/addHabit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habitTitle: habitTitle,
          habitDuration: habitDuration, // Assuming the API expects duration in minutes
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add habit");
      }

      toast.success("Habit added successfully!");
      setShowPopup(false); // Close the popup
      setHabitTitle(""); // Reset the habit title
      setRawDuration(""); // Reset the raw duration
      setHabitDuration(""); // Reset the habit duration
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDurationChange = (e) => {
    const input = e.target.value;
    setRawDuration(input); // Update the raw input value

    // Convert duration to minutes
    const duration = input.toLowerCase();
    let totalMinutes = 0;

    // Regex to match time values
    const timeUnits = duration.match(/\d+\s*(days?|hours?|minutes?)/g);

    if (timeUnits) {
      timeUnits.forEach((unit) => {
        const value = parseInt(unit.match(/\d+/)[0]);
        if (unit.includes("day")) {
          totalMinutes += value * 24 * 60; // Convert days to minutes
        } else if (unit.includes("hour")) {
          totalMinutes += value * 60; // Convert hours to minutes
        } else if (unit.includes("minute")) {
          totalMinutes += value; // Add minutes
        }
      });
    }

    setHabitDuration(totalMinutes.toString()); // Save total duration in minutes
  };

  return (
    <>
      <main className="min-h-screen p-8 pb-24 w-full">
        <section className="space-y-8">
          <div className="flex flex-row justify-between items-center">
            <ButtonAccount />
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Habit Tracker
            </h1>
            <ButtonGradient
              title="Add Habit"
              onClick={() => setShowPopup(true)}
            />
          </div>

          <div className="w-full flex items-center justify-center">
            <div
              className="radial-progress"
              style={{
                "--value": "35",
                "--size": "12rem",
                "--thickness": "8px",
              }}
              role="progressbar"
            >
              35%
            </div>
          </div>

          {/* Chart */}
          <Chart />

          {/* Popup */}
          {showPopup && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Add a New Habit</h2>
                <input
                  type="text"
                  placeholder="Habit Title"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="input input-bordered input-info w-full max-w-xs mb-4"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 2 hours, 45 minutes)"
                  value={rawDuration}
                  onChange={handleDurationChange}
                  className="input input-bordered input-info w-full max-w-xs"
                />
                <div className="text-gray-500 text-sm mt-2">
                  Duration in minutes: {habitDuration || 0}
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-black rounded-md"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={addHabit}
                  >
                    Save
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
