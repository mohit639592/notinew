const mongoose = require("mongoose")

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

const eventmodel = mongoose.model("event",eventSchema);
module.exports = eventmodel;