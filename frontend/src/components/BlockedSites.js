import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function BlockedSites() {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState('');

  const fetchSites = async () => {
    try {
      const res = await axios.get(`${API}/blocker/sites`);
      // The backend returns the array directly for /sites
      setSites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const addSite = async (e) => {
    e.preventDefault();
    if (!newSite.trim()) return;
    try {
      await axios.post(`${API}/blocker/sites`, { url: newSite });
      setNewSite('');
      fetchSites();
    } catch (err) {
      console.error('Error adding site:', err);
    }
  };

  const deleteSite = async (id) => {
    try {
      await axios.delete(`${API}/blocker/sites/${id}`);
      fetchSites();
    } catch (err) {
      console.error('Error deleting site:', err);
    }
  };

  return (
    <div className="card">
      <h2>Blocked Sites</h2>
      <form onSubmit={addSite} className="block-form">
        <input
          type="text"
          placeholder="e.g., youtube.com"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
        />
        <button type="submit">Block</button>
      </form>
      <ul className="site-list">
        {sites.map((site) => (
          <li key={site._id}>
            {site.url}
            <button onClick={() => deleteSite(site._id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BlockedSites;