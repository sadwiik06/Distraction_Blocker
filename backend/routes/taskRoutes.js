const router = require("express").Router();
const task = require("../models/Task");

router.post("/",async(req,res)=>{
    const task = await Task.create({title: req.body.title});
    res.json(task);
});

router.get("/", async(req,res)=>{
    const tasks = await Task.find();
    res.json(tasks);
});
// to update the completeed task
router.put(":/id",async(req,res)=>{
    const task = await Task.findByIdAndUpdate(
        req.params.id,
        {completed:true},
        {new : true}
    );
    res.json(task);

});

module.exports = router;