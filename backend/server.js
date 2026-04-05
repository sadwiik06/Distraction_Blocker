const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import routes
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const blockerRoutes = require('./routes/blockedRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blocker', blockerRoutes);
app.use('/api/rewards', rewardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Error handler (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
