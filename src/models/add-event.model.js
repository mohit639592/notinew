const mongoose = require("mongoose")
const { mainDB } = require("../database/db");
const eventSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    email:{
        type:String,
        require: true
    },
    date:{
        type: Date,
        require:true
    }
})

const eventmodel = mainDB.model("event",eventSchema);
module.exports = eventmodel;