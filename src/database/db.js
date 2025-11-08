const mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config(); 
const connect = ()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("SERVER CONNECTED");
    })
    .catch((err)=>{
        console.log(err);
    })
}


module.exports = connect;