const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:String,
    completed : {type : Boolean, default : false},
    completedAt : {type: Date},
    date : {type:Date, default:Date.now}
});

module.exports = mongoose.model("Task",taskSchema);