const router = require("express").Router();
const BlockedSite = require("../models/BlockedSite");
const Task = require("../models/Task");
const { protect } = require('../middleware/auth');

router.get("/sites", protect, async(req,res)=>{
    try {
        const sites = await BlockedSite.find({ userId: req.user._id });
        res.json(sites);
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/sites", protect, async(req,res)=>{
    try {
        const site = await BlockedSite.create({ url: req.body.url, userId: req.user._id });
        res.json(site);
    } catch(err) {
        res.status(400).json({ success: false, message: err.message });
    }
})

router.delete("/sites/:id", protect, async (req,res)=>{
    try {
        await BlockedSite.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({success:true});
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/can-access', protect, async(req,res)=>{
    try{
        const incompletedTasks = await Task.countDocuments({
            userId: req.user._id,
            completed: false,
        });
        const hasReward = req.user.rewardActive && req.user.rewardEndTime > new Date();
        const canAccess = hasReward;
        res.json({
            success: true,
            canAccess,
            remainingTasks : incompletedTasks,
            rewardActive: hasReward
        });
    }catch(err){
        res.status(500).json({success:false, message:err.message});
    }
})

module.exports = router;
