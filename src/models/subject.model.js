// models/Subject.js
const mongoose = require("mongoose");
const { mainDB } = require("../database/db");
const syllabusSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  syllabus: [syllabusSchema],
});

module.exports = mainDB.model("Subject", subjectSchema);
