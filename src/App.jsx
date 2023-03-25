import React, { Component } from 'react';
import NewTaskModal from './NewTaskModal';
import UpdateTaskModal from './UpdateTaskModal';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    // Initialize the component's state with an array of tasks, search and filter criteria, pagination information, and a boolean flag indicating whether the modal for creating a new task is open.
    this.state = {
      tasks: [],
      name: '',
      priority: 'all',
      state: 'all',
      currentPage: 1,
      totalPages: 1,
      isModalOpen: false,
      taskToUpdate: null,
      sortBy: 'DUE_DATE',
      ascending: true,
      averageCompletionTimes: [],
    };

    // Bind the "this" keyword to several event handler methods that will be used later in the code.
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleUpdateTask = this.handleUpdateTask.bind(this);
    this.handleSortByDueDateClick = this.handleSortByDueDateClick.bind(this);
    this.handleSortByPriorityClick = this.handleSortByPriorityClick.bind(this);
    this.fetchAverageCompletionTime = this.fetchAverageCompletionTime.bind(this);
  }

  // Call the "fetchTasks" method after the component is mounted to fetch the initial list of tasks from the backend API.
  componentDidMount() {
    this.fetchTasks();
    this.fetchAverageCompletionTime();
  }

  // Define a method that fetches a list of tasks from the backend API based on the current search and filter criteria and pagination information.
  fetchTasks() {
    const { name, priority, state, currentPage, sortBy, ascending } = this.state;
    const url = `http://localhost:9090/api/todos?searchText=${encodeURIComponent(name)}&priority=${priority}&state=${state}&pageNumber=${currentPage - 1}&pageSize=10&sortBy=${sortBy}&ascending=${ascending}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("Response data lol:", data);
        this.setState({ tasks: data, totalPages: data.totalPages }, () => {
        this.fetchAverageCompletionTime(); 
      });
      console.log(this.state.tasks);
    })
    .catch((error) => {
      console.error('Error fetching tasks:', error);
    });
}

  //Defines a method to calculate the average completion time of the tasks
  fetchAverageCompletionTime() {
    fetch('http://localhost:9090/api/todos/time')
      .then((response) => response.json())
      .then((data) => {
        console.log("Average completion times:", data);
        const categories = ['All', 'High', 'Medium', 'Low'];
        const formattedData = data.map((avgTime, index) => ({
          category: categories[index],
          time: avgTime,
        }));
        this.setState({ averageCompletionTimes: formattedData });
      })
      .catch((error) => {
        console.error('Error fetching average completion times:', error);
      });
}

  // Define a method that updates the component's state with the new search or filter criteria when the user enters text into an input field.
  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  // Define a method that fetches a new list of tasks from the backend API when the user clicks the "Search" button.
  handleSearchClick() {
    this.fetchTasks();
  }

  // Define a method that updates the component's state with the new current page number when the user clicks the "Previous" or "Next" button.
  handlePageChange(newPage) {
    this.setState({ currentPage: newPage }, () => {
      this.fetchTasks();
    });
  }

  // Define a method that sends a PUT request to the backend API to update an existing task.
  handleUpdateTaskClick(task) {
    this.setState({ taskToUpdate: task });
  }
  handleUpdateTask = (updatedTask) => {
    fetch('http://localhost:9090/api/todos/update/' + updatedTask.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Task not found');
        }
        return response.json();
      })
      .then((data) => {
      this.setState({
        tasks: this.state.tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      ),
    taskToUpdate: null, // This will close the update modal
    }, () => {
      this.fetchAverageCompletionTime(); 
    });
  })
      .catch((error) => {
        console.error('Error updating task:', error);
      });
  };

  // Define a method that sends a DELETE request to the backend API to delete an existing task.
  handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:9090/api/todos/${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        this.fetchTasks();
        this.fetchAverageCompletionTime(); 
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  //Opens and closes modal
  openModal() {
    this.setState({ isModalOpen: true });
  }
  closeModal() {
    this.setState({ isModalOpen: false });
  }

  handleToggleDone(task) {
  const updatedTask = {
    ...task,
    done: !task.done,
    doneDate: !task.done ? new Date().toISOString() : null,
  };
  const apiEndpoint = updatedTask.done ? 'done' : 'undone';

  fetch(`http://localhost:9090/api/todos/${task.id}/${apiEndpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Task not found');
      }
    })
    .then((data) => {
      this.setState({
        tasks: this.state.tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        ),
      });
      this.fetchAverageCompletionTime();
    })
    .catch((error) => {
      console.error('Error updating task:', error);
    });
}
  // Define a method that updates the component's state with the new sort by due date criteria when the user clicks the "Due Date" button.
  handleSortByDueDateClick() {
    const { sortBy, ascending } = this.state;
    if (sortBy !== 'DUE_DATE' || ascending) {
      this.setState({ sortBy: 'DUE_DATE', ascending: false }, () => {
        this.fetchTasks();
      });
    } else {
        this.setState({ ascending: true }, () => {
        this.fetchTasks();
      });
    }
  }
  // Define a method that updates the component's state with the new sort by priority criteria when the user clicks the "Priority" button.
  handleSortByPriorityClick() {
    const { sortBy, ascending } = this.state;
    if (sortBy !== 'PRIORITY' || !ascending) {
      this.setState({ sortBy: 'PRIORITY', ascending: true }, () => {
        this.fetchTasks();
      });
    } else {
      this.setState({ ascending: false }, () => {
        this.fetchTasks();
      });
    }
  }

  static parseISO8601Duration (isoDuration) {
    // Return "No Data/Tasks" as is
    if (isoDuration === "No Data/Tasks") {
     return isoDuration;
    }
    const regex = /P(?:([0-9]+)Y)?(?:([0-9]+)M)?(?:([0-9]+)D)?(?:T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+(?:\.[0-9]+)?)S)?)?/;
    const match = regex.exec(isoDuration);
    if (!match) {
      return 'Invalid duration';
    }

    const [_, years, months, days, hours, minutes, seconds] = match;

    const parts = [
      { value: years, unit: 'y' },
      { value: months, unit: 'mth' },
      { value: days, unit: 'd' },
      { value: hours, unit: 'h' },
      { value: minutes, unit: 'm' },
      { value: Math.round(parseFloat(seconds)), unit: 's' },
    ];

    return parts
      .filter((part) => part.value)
      .map((part) => `${part.value}${part.unit}`)
      .join(' ');
  }
  //Renders everything on the page
  render() {
    console.log("Tasks in state:", this.state.tasks);
  const { tasks, currentPage, totalPages, taskToUpdate, ascending, sortBy } = this.state;

  return (
    <div className="App">
      {/* Search section */}
      <div id="search-section">
        <label htmlFor="name-input">Name:</label>
        <input
          type="text"
          id="name-input"
          name="name"
          value={this.state.name}
          onChange={this.handleInputChange}
        />
        <label htmlFor="priority-dropdown">Priority:</label>
        <select
          id="priority-dropdown"
          name="priority"
          value={this.state.priority}
          onChange={this.handleInputChange}
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label htmlFor="state-dropdown">State:</label>
        <select
          id="state-dropdown"
          name="state"
          value={this.state.state}
          onChange={this.handleInputChange}
        >
          <option value="all">All</option>
          <option value="done">Done</option>
          <option value="undone">Undone</option>
        </select>
        <button id="search-button" onClick={this.handleSearchClick}>
          Search
        </button>
      </div>

      {/* New task section */}
      <button id="new-todo-button" onClick={this.openModal}>
          +New to do
        </button>
      <NewTaskModal
  isOpen={this.state.isModalOpen}
  onClose={() => this.setState({ isModalOpen: false })}
  onTaskAdded={() => {
            this.fetchTasks();
            this.fetchAverageCompletionTime(); // 
          }}

/>

      {/* Tasks table */}
      <table id="tasks-table">
        {/* ...table headers */}
        <thead>
          <tr>
            <th>Done?</th>
            <th>Name</th>
            <th>
              Priority{' '}
              <button onClick={() => this.handleSortByPriorityClick()}>
                {sortBy === 'PRIORITY' && (
                  <span>{ascending ? '▲' : '▼'}</span>
                )}
              </button>
            </th>
            <th>
              Due Date{' '}
              <button onClick={() => this.handleSortByDueDateClick()}>
                {sortBy === 'DUE_DATE' && (
                  <span>{ascending ? '▲' : '▼'}</span>
                )}
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {this.state.tasks && this.state.tasks.map((task) => (
            <tr key={task.id}>
              <td>
               <input
                type="checkbox"
                checked={task.done}
                 onChange={() => this.handleToggleDone(task)}
                 />
             </td>
              <td>{task.text}</td>
              <td>{task.priority}</td>
              <td>{task.dueDate}</td>
              <td>
                <button onClick={() => this.handleUpdateTaskClick(task)}>
                  Update
                </button>
                <button onClick={() => this.handleDeleteTask(task.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination section */}
      <div id="pagination-section">
        <span>
          Page {currentPage}
        </span>
        <button
          id="prev-page-button"
          onClick={() => this.handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          id="next-page-button"
          onClick={() => this.handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Metrics */}
      <div id="metrics-section">
          <h2>Average completion times:</h2>
          <ul>
            {this.state.averageCompletionTimes.map((item, index) => (
              <li key={index}>
                {item.category}: {this.constructor.parseISO8601Duration(item.time)}
              </li>
            ))}
          </ul>
      </div>
      {/* UpdateTaskModal */}
        {taskToUpdate && (
          <UpdateTaskModal
            task={taskToUpdate}
            onClose={() => this.setState({ taskToUpdate: null })}
            onUpdate={this.handleUpdateTask}
          />
        )}
    </div>
  );
}
}

export default App;
