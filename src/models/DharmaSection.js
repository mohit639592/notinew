const mongoose = require("mongoose");
const { collectionsDB } = require("../database/db");
const dharmaSchema = new mongoose.Schema({
  email: String,          // user-based content
  title: String,          // big heading
  description: String,    // paragraph
  imageUrl: String,          // image URL
  order: Number           // scroll order
});

module.exports = collectionsDB.model("DharmaSection", dharmaSchema);