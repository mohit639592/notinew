const mongoose = require('mongoose');
const { mainDB } = require("../database/db");
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },          // Task title
  description: { type: String },                    // Optional description
  date: { type: Date, required: true },            // Task date
  completed: { type: Boolean, default: false },
  email:{type:String, requiresd:true},  
});

module.exports = mainDB.model('Task', taskSchema);
