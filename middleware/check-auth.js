const jwt = require('jsonwebtoken');

module.exports = (req,res,next) =>{
    try{
        const token= req.headers.authorization.split(" ")[1];
        jwt.verify(token, "this is my final project");
        next();
    }
    catch(e){
        res.status(400).json({messge: "Verification auth failed"})
    }
}