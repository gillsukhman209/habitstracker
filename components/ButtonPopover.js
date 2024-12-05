"use client";

import { Popover, Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const ButtonPopover = ({ deleteHabit }) => {
  const [habits, setHabits] = useState([]);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/user/getHabits");
      const data = await response.json();
      setHabits(data.habits);
    } catch (error) {
      toast.error("Failed to fetch habits");
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteHabit(habitId); // Wait for the habit to be deleted
      await fetchHabits(); // Refresh habits after successful deletion
      toast.success("Habit deleted successfully");
    } catch (error) {
      toast.error("Failed to delete habit");
    }
  };

  return (
    <Popover className="relative z-10 w-full">
      {({ open }) => (
        <>
          <Popover.Button
            onClick={() => fetchHabits()}
            className="btn flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2"
          >
            Your Habits
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-5 h-5 duration-200 ${
                open ? "transform rotate-180" : ""
              }`}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </Popover.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="absolute left-0 z-10 mt-3 transform w-full max-w-sm">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative grid gap-4 bg-white p-4">
                  {habits.map((habit) => (
                    <div
                      key={habit._id}
                      className="text-sm flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-lg duration-200"
                    >
                      <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-lg bg-orange-500/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 stroke-orange-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                          />
                        </svg>
                      </span>
                      <div className="flex-grow">
                        <p className="font-bold">{habit.title}</p>
                        <p className="text-gray-500">
                          {habit.duration} minutes
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteHabit(habit._id)}
                        className="ml-auto p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.293 6.293a1 1 0 011.414 0L12 10.586l4.293-4.293a1 1 0 011.414 1.414L13.414 12l4.293 4.293a1 1 0 01-1.414 1.414L12 13.414l-4.293 4.293a1 1 0 01-1.414-1.414L10.586 12 6.293 7.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {habits.length === 0 && (
                    <p className="text-gray-500 text-center">
                      No habits found.
                    </p>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default ButtonPopover;
