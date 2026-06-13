const mongoose = require("mongoose");
const { statsDB } = require("../database/db");
const lifeSchema = new mongoose.Schema({
  name: String,
  role: String,
  careerStart: Number,

  stats: {
    totalProjects: Number,
    domains: Number,
    skillsRated: Number
  },

  github: {
    repos: Number,
    followers: Number,
    following: Number,
    avatar: String,
    profileUrl: String,
    githubSince: String
  }
}, { timestamps: true });

module.exports = statsDB.model("Stats", lifeSchema);
