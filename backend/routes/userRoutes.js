const router = require("express").Router();
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const Task = require("../models/Task");
const { protect } = require('../middleware/auth');

//register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({
            username,
            email,
            password
        });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                streak: user.streak
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email
        }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                streak: user.streak,
                bestStreak: user.bestStreak,
                totalTasksCompleted: user.totalTasksCompleted
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// stats of the user
router.get("/stats", protect, async (req, res) => {
    try {
        const incompleteTask = await Task.countDocuments({
            userId: req.user._id,
            completed: false
        });
        
        res.json({
            streak: req.user.streak,
            bestStreak: req.user.bestStreak,
            totalTasksCompleted: req.user.totalTasksCompleted,
            totalFocusTime: req.user.totalFocusTime,
            rewardActive: req.user.rewardActive,
            rewardTimeRemaining: req.user.rewardTimeRemaining,
            incompleteTasks: incompleteTask
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/profile', protect, async (req, res) => {
    try {
        const allowedUpdates = ['username'];
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

//starting reqrd timer
router.post("/start-reward", protect, async (req, res) => {
    try {
        const { minutes } = req.body;
        let user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.rewardActive = true;
        user.rewardTimeRemaining = minutes * 60;
        await user.save();

        setTimeout(async () => {
            let updatedUser = await User.findById(req.user._id);
            if(updatedUser) {
                updatedUser.rewardActive = false;
                updatedUser.rewardTimeRemaining = 0;
                await updatedUser.save();
            }
        }, minutes * 60 * 1000);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// can access themed things to do
router.get("/can-access", protect, async (req, res) => {
    try {
        const incompleteTasks = await Task.countDocuments({ userId: req.user._id, completed: false });
        const user = await User.findById(req.user._id);
        const canAccess = incompleteTasks === 0 || (user && user.rewardActive);

        res.json({
            canAccess,
            remainingTasks: incompleteTasks,
            rewardActive: user?.rewardActive || false
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;