const router = require("express").Router();
const Task = require("../models/Task");
const User = require("../models/User");
const { protect } = require('../middleware/auth');

router.post("/", protect, async (req, res) => {
    try {
        const task = await Task.create({
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
            userId: req.user._id
        });

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.get("/", protect, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        res.json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// to update the completed task
router.put("/:id", protect, async (req, res) => {
    try {
        let task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        if (req.body.completed === true && !task.completed) {
            req.body.completedAt = new Date();
            req.user.totalTasksCompleted += 1;
            await req.user.updateStreak();
            await req.user.save();
        }
        task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// delete
router.delete("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        res.json({ success: true, message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

//for incompleted tasks
router.get('/stats/incomplete', protect, async (req, res) => {
    try {
        const count = await Task.countDocuments({
            userId: req.user._id,
            completed: false,
        });
        res.json({
            success: true,
            incompletedTasks: count,
            allCompleted: count === 0
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;