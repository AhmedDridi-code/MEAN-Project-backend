const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    try{
        console.log("verifying");
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
        const decodedToken=jwt.verify(token,process.env.JWT_KEY);
        console.log("verified")
        req.dataAuth={email:decodedToken.email,userId:decodedToken.userId};
        next();
    }catch(err){
        console.log("not verified")
        res.status(401).json({message:"Auth failed!"})
    }

}