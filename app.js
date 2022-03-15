const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const postsRoute = require('./routes/post');
const userRoute = require('./routes/user');
//app.use(cors);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Authorization");
    // intercept OPTIONS method
    if ('OPTIONS' == req.method){
      res.status(200).send();
    }
    else {
      next();
    }
})
app.use("/images",express.static(path.join("./images")));

//connecting to database
mongoose.connect("mongodb+srv://admindb:admindb@cluster0.fujhd.mongodb.net/SocialMedia?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {console.log("Connected to database");})
.catch(err => console.log("error has been occured: ",err));



// ========= configuring routes ===========
app.use("/api/posts",postsRoute);
app.use("/api/user",userRoute);

module.exports =app;