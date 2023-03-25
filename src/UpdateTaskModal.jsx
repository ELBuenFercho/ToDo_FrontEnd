import React from 'react';
import './app.css';

function UpdateTaskModal({ task, onClose, onUpdate }) {
  const [updatedTask, setUpdatedTask] = React.useState(task);

  function handleChange(event) {
    setUpdatedTask({ ...updatedTask, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault(); // Prevents default form submission
    onUpdate(updatedTask);
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Update Task</h2>
        <form className="modal-form" onSubmit={handleSubmit}> {/* Add onSubmit handler here */}
          <label htmlFor="task-name">Name:</label>
          <input
            type="text"
            id="task-name"
            name="text"
            value={updatedTask.text}
            onChange={handleChange}
          />
          <label htmlFor="task-priority">Priority:</label>
          <select
            id="task-priority"
            name="priority"
            value={updatedTask.priority}
            onChange={handleChange}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <label htmlFor="task-dueDate">Due Date:</label>
          <input
            type="date"
            id="task-dueDate"
            name="dueDate"
            value={updatedTask.dueDate || ""}
            onChange={handleChange}
          />
          <button type="submit" style={{ display: 'none' }}></button> {/* Add a hidden submit button */}
        </form>
        <div className="modal-buttons">
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="save" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateTaskModal;
