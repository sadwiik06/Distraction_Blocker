import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import BlockedSites from './components/BlockedSites';
import Stats from './components/Stats';
import RewardPanel from './components/RewardPanel';

import './App.css';

const API = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/users/stats`);
      // The backend returns the user stats object directly
      setUser(res.data);
    } catch (err) {
      console.error('Auth error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
      window.addEventListener('taskUpdated', fetchUser);
    } else {
      setLoading(false);
    }
    return () => window.removeEventListener('taskUpdated', fetchUser);
  }, [token]);


  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setShowLogin(true);
  };

  if (loading) return <div className="loader">Loading Discipline system...</div>;

  if (!token) {
    return (
      <div className="auth-container">
        {showLogin ? (
          <Login
            onLogin={(newToken) => {
              localStorage.setItem('token', newToken);
              setToken(newToken);
            }}
          />
        ) : (
          <Register
            onRegister={(newToken) => {
              localStorage.setItem('token', newToken);
              setToken(newToken);
            }}
          />
        )}
        <button onClick={() => setShowLogin(!showLogin)} className="switch-auth">
          {showLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Discipline Blocker</h1>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </header>
      <div className="main-content">
        <Stats stats={user} />
        <RewardPanel stats={user} />
        <TaskList />
        <BlockedSites />
      </div>
    </div>
  );
}

export default App;
