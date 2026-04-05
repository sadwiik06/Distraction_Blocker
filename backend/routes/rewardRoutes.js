const router = require('express').Router();
const Task = require('../models/Task');
const {protect} =  require('../middleware/auth');

router.post('/start', protect, async(req,res)=>{
    try{
        const {minutes} = req.body;
        const rewardMinutes  =Math.min(Math.abs(minutes || 30),60);
        const incompleteTasks = await Task.countDocuments({
            userId: req.user._id,
            completed: false
        });
        if(incompleteTasks > 0){
            return res.status(403).json({
                success:false,
                message: `Complete ${incompleteTasks} remaining tasks first`
            });

        }
        req.user.rewardActive = true;
        req.user.rewardEndTime = new Date(Date.now()+rewardMinutes * 60000);
        await req.user.save();
        setTimeout(async ()=>{
            req.user.rewardActive = false;
            req.user.rewardEndTime = null;
            await req.user.save();
        },rewardMinutes * 60000);
        res.json({
            success:true,
            message: `rEWARD UNLOCKED FOR ${rewardMinutes} minutes`,
            data:{
                minutes: rewardMinutes,
                endTime: req.user.rewardEndTime
            }
        });
    }catch(err){
        res.status(500).json({success:false,message:err.message});
    }
});

router.get('/time',protect, async(req,res)=>{
    try{
        let remaining =0;
        if(req.user.rewardEndTime && req.user.rewardActive){
            remaining = Math.max(0,Math.floor(
                (req.user.rewardEndTime - new Date())/1000
            ));
            if(remaining === 0){
                req.user.rewardActive = false;
                req.user.rewardEndTime = null;
                await req.user.save();
            }
        }
        res.json({
            success:true,
            remainingSeconds: remaining
        });
    }catch(err){
        res.status(500).json({success:false,message:err.message});
    }
});
router.post('/cancel', protect, async(req,res)=>{
    try{
        req.user.rewardActive = false;
        req.user.rewardEndTime = null;
        await req.user.save();
        res.json({
            success: true, 
            message: 'Reward cancelled'
        });


    } catch(err){
        res.status(500).json({success:false, message: err.message});
    }
});
module.exports = router;
