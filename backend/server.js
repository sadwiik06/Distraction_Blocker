const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const HostsService = require('./services/hostsService');
const BlockedSite = require('./models/BlockedSite');
const Task = require('./models/Task');
const User = require('./models/User');

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
  .then(() => {
    console.log('MongoDB Connected successfully');
    // Start the periodic sync worker after DB is connected
    setupSyncWorker();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Periodic Sync Worker
async function setupSyncWorker() {
  const sync = async () => {
    try {
      const users = await User.find({});
      const allBlockedDOMAINS = new Set();
      const unblockedDOMAINS = new Set();

      for (const user of users) {
        const hasReward = user.rewardActive && user.rewardEndTime > new Date();
        const userSites = await BlockedSite.find({ userId: user._id });
        
        userSites.forEach(site => {
          const domain = HostsService.extractDomain(site.url);
          if (domain) {
            if (hasReward) {
              unblockedDOMAINS.add(domain);
            } else {
              allBlockedDOMAINS.add(domain);
            }
          }
        });
      }
      
      const finalSitesToBlock = [];
      for (const domain of allBlockedDOMAINS) {
        // If the domain is unblocked by ANY user's active reward, do not block it
        if (!unblockedDOMAINS.has(domain)) {
          finalSitesToBlock.push({ url: domain });
        }
      }
      
      // Sync all accumulated blocked sites once
      await HostsService.syncHosts(finalSitesToBlock, false);
    } catch (err) {
      console.error('[SyncWorker] Error:', err.message);
    }
  };

  // Run every 10 seconds
  setInterval(sync, 10000);
  // Initial run
  sync();
}

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

// Cleanup on shutdown
const cleanup = async () => {
  console.log('Cleaning up hosts file...');
  await HostsService.clear();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

