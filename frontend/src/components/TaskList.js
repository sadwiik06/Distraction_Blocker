import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/tasks`);
      setTasks(res.data.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await axios.post(`${API}/tasks`, { title, description });
      setTitle('');
      setDescription('');
      fetchTasks();
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const completeTask = async (id) => {
    try {
      await axios.put(`${API}/tasks/${id}`, { completed: true });
      fetchTasks();
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`);
      fetchTasks();
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const incompleteCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="card">
      <h2>Tasks ({incompleteCount} left)</h2>
      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="task-list">
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
          >
            <div className="task-info">
              <strong>{task.title}</strong>
              {task.description && <p>{task.description}</p>}
            </div>
            <div className="task-actions">
              {!task.completed && (
                <button onClick={() => completeTask(task._id)} className="complete-btn">
                  Done
                </button>
              )}
              <button onClick={() => deleteTask(task._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskList;