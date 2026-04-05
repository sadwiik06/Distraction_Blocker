import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function Stats({ stats }) {
  const [access, setAccess] = useState({ canAccess: false, remainingTasks: 0 });

  const fetchAccess = async () => {
    try {
      const res = await axios.get(`${API}/blocker/can-access`);
      setAccess(res.data);
    } catch (err) {
      console.error('Error fetching access status:', err);
    }
  };

  useEffect(() => {
    fetchAccess();
    const interval = setInterval(fetchAccess, 5000);
    window.addEventListener('taskUpdated', fetchAccess);
    return () => {
      clearInterval(interval);
      window.removeEventListener('taskUpdated', fetchAccess);
    };
  }, []);

  if (!stats) {
    return <div className="stats-card">Loading stats...</div>;
  }

  return (
    <div className="stats-card">
      <div className="streak">
        <span className="streak-icon">🔥</span>
        <div>
          <div className="streak-value">{stats.streak || 0} days</div>
          <div className="streak-label">Current Streak</div>
        </div>
        <div className="best-streak">
          Best: {stats.bestStreak || 0} days
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-value">{stats.totalTasksCompleted || 0}</div>
          <div className="stat-label">Tasks Done</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats.incompleteTasks || 0}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>
      <div className={`access-status ${access.canAccess ? 'unlocked' : 'locked'}`}>
        {access.canAccess
          ? '🔓 UNLOCKED - You can browse freely'
          : access.remainingTasks === 0 
            ? '🔒 READY - Start reward to unblock'
            : `🔒 LOCKED - Complete ${access.remainingTasks} tasks first`}
      </div>
    </div>
  );
}

export default Stats;