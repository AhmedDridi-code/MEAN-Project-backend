const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user')

router.post("/signup",(req,res)=>{
    bcrypt.hash(req.body.password,10)
.then(hash=>{
        const user = new User({
            email : req.body.email,
            password : hash
        })
        user.save().then(result=>{
            res.status(200).json({message:"User created",result: result})
        }).catch(err=>{
            res.status(500).json({error:err});
        })
    })
    .catch(err=>{
        console.error(err);
    })
})

router.post("/login",(req,res)=>{
    let fetchedUSer;
    User.findOne({email:req.body.email}).then(user=>{
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        fetchedUSer=user;
        return bcrypt.compare(req.body.password,user.password)
    })
    .then(result=>{
        if(!result){
            return res.status(401).json({message:"problem in bycript"})
        }
        const token = jwt.sign({email:fetchedUSer.email,userId:fetchedUSer._id}, "secret_this_should_be_longer",{expiresIn:"5h"})
        res.status(200).json({token:token});
    })
    .catch(err=>{
        console.log(err);
        return res.status(401).json({message:"problem in bycript"})
    })
})


module.exports =router;