const mongoose = require("mongoose");
const movieSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        require:true
    },
    email:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    }
})
const moviemodel = mongoose.model("Movies",movieSchema)
module.exports = moviemodel