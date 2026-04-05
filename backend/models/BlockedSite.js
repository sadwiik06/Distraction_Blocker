const mongoose  = require("mongoose");

const blockedsiteSchema = new mongoose.Schema({
    url: { type : String , required : [true, 'URL is required'], unique : true, trim : true, lowercase:true},
    userId: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required : true},

    createdAt: {type : Date, default: Date.now}
});
blockedsiteSchema.index({userId:1, url : 1}, {unique: true});


module.exports = mongoose.model("BlockedSites", blockedsiteSchema);