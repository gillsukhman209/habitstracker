import React, { useState, useEffect, useRef } from "react";
import { FaRegTrashAlt, FaGripVertical } from "react-icons/fa";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  HABIT: "HABIT",
};

function Habits({ habits: parentHabits, onHabitsChange }) {
  const [habits, setHabits] = useState([...parentHabits]);

  useEffect(() => {
    setHabits([...parentHabits]);
  }, [parentHabits]);

  const moveHabit = (fromIndex, toIndex) => {
    const updatedHabits = [...habits];
    const [movedHabit] = updatedHabits.splice(fromIndex, 1); // Remove the dragged habit
    updatedHabits.splice(toIndex, 0, movedHabit); // Insert it at the new position
    setHabits(updatedHabits);
  };

  const handleDrop = async () => {
    try {
      await fetch("/api/user/updateHabitOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits }),
      });
      if (onHabitsChange) {
        onHabitsChange(); // Fetch updated habits from the backend
      }
    } catch (error) {
      console.error("Failed to update habit order:", error);
    }
  };

  const HabitItem = ({ habit, index }) => {
    const ref = useRef(null);

    const [, drag] = useDrag({
      type: ItemTypes.HABIT,
      item: { index },
    });

    const [, drop] = useDrop({
      accept: ItemTypes.HABIT,
      hover: (draggedItem) => {
        if (draggedItem.index !== index) {
          moveHabit(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
      drop: () => {
        handleDrop(); // Update backend on drop
      },
    });

    drag(drop(ref));

    return (
      <div
        ref={ref}
        className="habit-item flex items-center justify-between p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
        style={{ cursor: "move" }}
      >
        <div className="flex items-center">
          <FaGripVertical className="text-gray-500 mr-4" />
          <p className="text-lg">{habit.title}</p>
        </div>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => alert(`Deleting habit: ${habit.title}`)}
        >
          <FaRegTrashAlt />
        </button>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Drag & Drop Habits</h1>
        <div className="space-y-2">
          {habits.map((habit, index) => (
            <HabitItem key={habit._id} habit={habit} index={index} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

export default Habits;
