import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function RewardPanel({ stats }) {
  const [remaining, setRemaining] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  // Sync with server state on mount and periodically (less frequently)
  const syncWithServer = async () => {
    try {
      const res = await axios.get(`${API}/rewards/time`);
      const seconds = res.data.remainingSeconds || 0;
      if (seconds > 0) {
        setRemaining(seconds);
        setActive(true);
      } else {
        setActive(false);
        setRemaining(0);
      }
    } catch (err) {
      console.error('Error syncing reward:', err);
    }
  };

  useEffect(() => {
    if (stats) {
      syncWithServer();
    }
    // Sync with server every 15 seconds as a fallback
    const syncInterval = setInterval(syncWithServer, 15000);
    return () => clearInterval(syncInterval);
  }, [!!stats]);

  // Smooth local countdown
  useEffect(() => {
    if (active && remaining > 0) {
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setActive(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [active, remaining > 0]);

  const startReward = async (minutes) => {
    try {
      // Immediate UI transition
      setRemaining(minutes * 60);
      setActive(true);
      
      await axios.post(`${API}/rewards/start`, { minutes });
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (err) {
      setActive(false);
      setRemaining(0);
      alert(err.response?.data?.message || 'Failed to start reward');
    }
  };

  const cancelReward = async () => {
    try {
      setActive(false);
      setRemaining(0);
      await axios.post(`${API}/rewards/cancel`);
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (err) {
      console.error('Error cancelling reward:', err);
    }
  };

  const tasksPending = stats ? stats.incompleteTasks : 1;
  const totalTasks = stats ? (stats.totalTasks || 0) : 0;
  const isRewardReady = totalTasks > 0 && tasksPending === 0 && !active && remaining <= 0;

  if (active || remaining > 0) {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return (
      <div className="reward-card active">
        <h3>🎉 Break Time Active!</h3>
        <p>Enjoy your distraction-free browsing.</p>
        <div className="timer">
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
        <button onClick={cancelReward} className="cancel-btn">
          Stop Reward early
        </button>
      </div>
    );
  }

  return (
    <div className={`reward-card ${isRewardReady ? 'ready' : ''}`}>
      <h3>{isRewardReady ? '✨ Reward Unlocked!' : 'Unlock Reward'}</h3>
      <p style={{ minHeight: '3em' }}>
        {isRewardReady
          ? 'Legendary focus! Select your break duration to begin.'
          : totalTasks === 0 
            ? 'Add some tasks to start earning break time!'
            : 'Complete every task to unblock your favorite sites.'}
      </p>
      <div className="reward-buttons">
        <button 
          onClick={() => startReward(15)} 
          disabled={!isRewardReady}
          className={isRewardReady ? 'btn-pulse' : ''}
        >
          15 min
        </button>
        <button 
          onClick={() => startReward(30)} 
          disabled={!isRewardReady}
          className={isRewardReady ? 'btn-pulse' : ''}
        >
          30 min
        </button>
        <button 
          onClick={() => startReward(60)} 
          disabled={!isRewardReady}
          className={isRewardReady ? 'btn-pulse' : ''}
        >
          60 min
        </button>
      </div>
      {!isRewardReady && (
        totalTasks === 0 ? (
          <div className="reward-hint">📝 No tasks in your list yet</div>
        ) : tasksPending > 0 ? (
          <div className="reward-hint">🔒 Finish {tasksPending} more tasks to unlock</div>
        ) : null
      )}
    </div>
  );
}

export default RewardPanel;


