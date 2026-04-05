const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema  = new mongoose.Schema({
    username:{type:String, required:[true, 'Username required'], unique: true, trim:true,minlength:[2,'Username too short'], maxlength:[30,'Username too long']},
    email:{type :String, required: [true, 'Email required'], unique:true, lowercase:true, match: [/^\S+@\S+\.\S+$/,'Invalid email format']},
    password:{ type:String, required : [true,'Password required'], minlength:[6,'Password too short'], select:false},

    streak:{type: Number, default : 0},
    bestStreak:{type:Number, default :0},
    lastActiveDate : {type: Date},
    totalTasksCompleted : {type: Number, default :0},
    totalFocusTime:{type:Number, default : 0},

    rewardTimeRemaining : {type : Number, default : 0},
    
    rewardActive : {type : Boolean, default : false},
    createdAt:{type: Date, default:Date.now}
});

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password,12);
});

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateStreak = async function(){
    const today = new Date().toDateString();
    const lastDate = this.lastActiveDate?.toDateString();
    if(lastDate !== today){
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        if(lastDate === yesterday.toDateString()){
            this.streak +=1;
            if(this.streak > this.bestStreak){
                this.bestStreak = this.streak;
            }

        }else if(lastDate !== today){
            this.streak=1;
        }
        this.lastActiveDate = new Date();
        await this.save();

    }
    return this.streak;
}

module.exports = mongoose.model("User",userSchema);