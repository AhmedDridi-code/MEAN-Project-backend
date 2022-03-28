const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const checkAuth = require('../middlewares/check-auth');

const mimeTypes ={
    "image/png":"png",
    "image/jpeg":"jpeg",
    "image/jpg":"jpg"
}
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        const isValid = mimeTypes[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid){
            error=null;
        }        
        cb(error,"images");
    },
    filename:(req,file,cb)=>{
        const name = file.originalname.toLocaleLowerCase().split(' ').join("-");
        const ext = mimeTypes[file.mimetype];
        cb(null,name+"-"+Date.now()+"."+ext);
    }
})

router.get("/", async (req, res) => {
    const pageSize = Number(req.query.limit);
    const currentPage = Number(req.query.page);
    const postQuery = Post.find();
    let posts;
    try{
      const postCount=await Post.find({}).count();  
    if(pageSize && currentPage){
        posts= await postQuery
        .skip(pageSize*(currentPage-1))
        .limit(pageSize);
    }else{
        posts= await postQuery;
    }
        res.status(200).json({message:"post fetched successfully",posts:posts,postCount:postCount});
    }catch(e){
        console.log("error in post ",e);
        res.status(500).json({message:e.message})
    }
})
router.post("/",checkAuth,multer({storage:storage}).single("image"), async (req, res) => {
    const url = req.protocol+"://"+req.get("host");
    const post = new Post({
        title:req.body.title,
        description:req.body.description,
        imagePath:url+"/images/"+req.file.filename,
        creator:req.dataAuth.userId,
    });
    try{
        const addedPost = await post.save();     
        res.status(200).json({message:"post added successfully",post:addedPost});
    }catch(e){
        console.log("error in post ",e);
        res.status(500).json({message:e.message})
    }
    });

router.delete("/:id",checkAuth, async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id);
        Post.deleteOne({_id:req.params.id, creator:req.dataAuth.userId}).then(()=>{

            console.log(post);
            const imageUrl =post.imagePath.split("/");
            const imageFile = imageUrl[imageUrl.length-1];
            fs.unlinkSync("images/"+imageFile);
            res.status(200).json({message:"post deleted successfully"});
        }).catch(e=>{
            res.status(500).json({message:e});
        })

    }catch(e){
        console.log("error in post ",e);
        res.status(500).json({message:e.message})
    }
})
router.put("/:id",checkAuth, multer({storage:storage}).single("image"), async (req, res)=>{
    try{
        let imagePath="";
        const url = req.protocol+"://"+req.get("host");
        if(req.file){
            let oldPost = await Post.findById(req.params.id);
            console.log(oldPost);
            const imageUrl =oldPost.imagePath.split("/");
            const imageFile = imageUrl[imageUrl.length-1];
            fs.unlinkSync("images/"+imageFile);
            imagePath=url+"/images/"+req.file.filename;
            console.log("deleted");
        }else{
            imagePath=req.body.imagePath;
            console.log("not deleted");
        }
        console.log(imagePath);
        const post ={
            _id:req.params.id,
            title:req.body.title,
            description:req.body.description,
            imagePath:imagePath,
            creator:req.userData.userId,
        }
        Post.updateOne({_id:req.params.id,creator:req.dataAuth.userId},post).then((response) => {
            if(response.nModified>0){
                res.status(200).json({message:"post edited successfully",post:post});
            }else{
                res.status(401).json({message:"Unauthorized"})
            }
        });
        
    }catch(e){
        console.log("error in post ",e);
        res.status(500).json({message:e.message})
    }
})
module.exports=router;