const mongoose = require("mongoose");
const { mainDB } = require("../database/db");
const usersSchema = new mongoose.Schema({
    email:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    }
})

const usersmodel = mainDB.model("users",usersSchema)

module.exports = usersmodel;