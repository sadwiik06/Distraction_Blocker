const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req,res,next)=>{
    let token;
    if(req.header('Authorization') && req.header('Authorization').startsWith('Bearer')){
        token = req.header('Authorization').split(' ')[1];
    }
    if(!token){
        return res.status(401).json({
            success : false,
            message: 'not authorized to access this route'
        });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();

    }
    catch(err){
        return res.status(401).json({
            success: false,
            message : 'Not authorized'
        });
    }
};
module.exports = {protect};