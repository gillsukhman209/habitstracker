"use client";

import { useState, useEffect } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonGradient from "@/components/ButtonGradient";
import Chart from "@/components/Chart";
import { toast } from "react-hot-toast";
import ButtonPopover from "@/components/ButtonPopover";
import Habits from "@/components/Habits";

export default function Dashboard() {
  const [showPopup, setShowPopup] = useState(false); // State for showing/hiding the popup
  const [habitTitle, setHabitTitle] = useState(""); // State for habit title
  const [rawDuration, setRawDuration] = useState(""); // Raw duration input
  const [habitDuration, setHabitDuration] = useState(""); // State for habit duration in minutes
  const [habits, setHabits] = useState([]); // State for habits

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    console.log("fetching habits");
    try {
      const response = await fetch("/api/user/getHabits");
      const data = await response.json();
      setHabits(data.habits);
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

  const addHabit = async () => {
    if (!habitTitle || !habitDuration) {
      toast.error("Please enter both habit title and duration.");
      return;
    }

    try {
      const response = await fetch("/api/user/addHabit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habitTitle: habitTitle,
          habitDuration: habitDuration,
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
      await fetchHabits();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <main className="min-h-screen p-8 pb-24 w-full">
        <section className="space-y-8">
          <div className="w-full  flex flex-row justify-between items-center space-x-4">
            <div className="flex-1">
              <ButtonAccount />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Habit Tracker
              </h1>
            </div>
            <div className="flex-1 flex flex-row gap-5 justify-end">
              <ButtonGradient
                title="Add Habit"
                onClick={() => setShowPopup(true)}
              />
              <ButtonPopover
                habits={habits}
                deleteHabit={deleteHabit}
                fetchHabits={fetchHabits}
              />
            </div>
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
          <Habits habits={habits} />

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
                  placeholder="Duration (e.g., 45 minutes)"
                  value={habitDuration}
                  onChange={(e) => {
                    const re = /^[0-9\b]+$/;
                    if (e.target.value === "" || re.test(e.target.value)) {
                      setHabitDuration(e.target.value);
                    }
                  }}
                  className="input input-bordered input-info w-full max-w-xs"
                />
                <div className="text-gray-500 text-sm mt-2 ml-2">
                  {habitDuration || 0} minutes
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
