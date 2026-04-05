const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:{ type:String,required : [true, "Task title is required"], trim: true, maxlength : [200, 'Task cannot exceed 200 chars'] },
    description:{type:String, maxlength: [500,'Descritpion too long']},

    completed : {type : Boolean, default : false},
    dueDate:{type : Date},
    completedAt : {type: Date},
    createdAt : {type:Date, default:Date.now},
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }
});
taskSchema.index({userId:1,completed : 1, createdAt : -1});

module.exports = mongoose.model("Task",taskSchema);