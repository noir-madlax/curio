import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('获取任务失败:', error);
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await axios.post('/api/tasks', { title: newTask });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (error) {
      console.error('添加任务失败:', error);
    }
  };

  return (
    <div className="container home-page">
      <h2>任务列表</h2>
      
      <form className="task-form" onSubmit={addTask}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="添加新任务..."
          className="task-input"
        />
        <button type="submit">添加</button>
      </form>

      {loading ? (
        <p>加载中...</p>
      ) : (
        <ul className="task-list">
          {tasks.length === 0 ? (
            <li className="no-tasks">暂无任务</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="task-item">
                {task.title}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default Home; 