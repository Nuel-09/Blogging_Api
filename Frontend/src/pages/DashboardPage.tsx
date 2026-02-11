import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taskAPI, authAPI } from "../api";
import "../styles/Dashboard.css";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "completed" | "deleted";
  priority?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [user, setUser] = useState<any>(null);

  // Fetch user profile and tasks on load
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await authAPI.getProfile();
        setUser(profileRes.data.data);

        const tasksRes = await taskAPI.getTasks();
        setTasks(tasksRes.data.data);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, []);

  // Create new task
  const handleCreateTask = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await taskAPI.createTask(title, description, priority);
      setTasks([response.data.data, ...tasks]);
      setTitle("");
      setDescription("");
      setPriority("medium");
      alert("Task created!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await taskAPI.deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
      alert("Task deleted!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete task");
    }
  };

  // Update task status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";

    try {
      const response = await taskAPI.updateTask(id, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === id ? response.data.data : t)));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update task");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      // Dispatch auth change event so App.tsx updates
      window.dispatchEvent(new Event("auth-change"));
      alert("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Dispatch auth change event even on error
      window.dispatchEvent(new Event("auth-change"));
      alert("Logged out!");
      navigate("/login");
    }
  };

  // Filter tasks
  const filteredTasks =
    filter === "all"
      ? tasks.filter((t) => t.status !== "deleted")
      : tasks.filter((t) => t.status === filter);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Todo App</h1>
        <div className="dashboard-header-right">
          {user && <p>Welcome, {user.name}!</p>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {/* Create Task Form */}
        <div className="create-task-box">
          <h2>Create New Task</h2>
          <form onSubmit={handleCreateTask}>
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </button>
          </form>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({tasks.filter((t) => t.status !== "deleted").length})
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending ({tasks.filter((t) => t.status === "pending").length})
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed ({tasks.filter((t) => t.status === "completed").length})
          </button>
        </div>

        {/* Task List */}
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Create one above!</p>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className={`task-item ${task.status}`}>
                <div className="task-info">
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    onChange={() => handleToggleStatus(task._id, task.status)}
                  />
                  <div className="task-text">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                    <small>{task.priority} priority</small>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
