import React, { useState } from "react";

const NewTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("low");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dueDateParam = newTaskDueDate === "" ? "" : `dueDate=${newTaskDueDate}`;

    try {
      const response = await fetch(`http://localhost:9090/api/todos/${newTaskName}/${newTaskPriority}?${dueDateParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setNewTaskName("");
        setNewTaskDueDate("");
        setNewTaskPriority("low");
        onTaskAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error adding new task:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task Name"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Due Date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit">Add Task</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;