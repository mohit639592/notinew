const express = require('express');
const router = express.Router();
const Task = require('../models/task.model');
const Event = require("../models/add-event.model");
const Movies = require("../models/movies.model");

// ================== TASKS ==================
router.get('/tasks', (req, res) => {
  if (!req.session.email) return res.status(401).send("Please login first");
  res.render('tasks');
});

router.post('/tasks', async (req, res) => {
  if (!req.session.email) return res.status(401).send("Please login first");

  const { title, description, date } = req.body;
  if (!title || !date)
    return res.status(400).json({ success: false, message: 'Title and date are required' });

  await Task.create({
    title,
    description,
    date,
    completed: false,
    email: req.session.email
  });

  res.send("SUCCESS");
});

// ================== EVENTS ==================
router.get("/add-event", (req, res) => {
  if (!req.session.email) return res.status(401).send("Please login first");
  res.render("add-event");
});

router.post("/add-event", async (req, res) => {
  if (!req.session.email) return res.status(401).send("Please login first");

  const { title, date } = req.body;

  await Event.create({
    title,
    email: req.session.email,
    date
  });

  res.send("SUCCESS");
});

// ================== MOVIES ==================
router.post("/movies", async (req, res) => {
  const { name, category, status, email } = req.body;
  const existingMovie = await Movies.findOne({ email, name });

  if (existingMovie) return res.send("MOVIE ALREADY EXIST");

  await Movies.create({ name, category, status, email });
  res.send("SUCCESS");
});

router.get("/movies", async (req, res) => {
  if (!req.session.email) return res.status(401).send("Please login first");

  const userMovies = await Movies.find({ email: req.session.email });
  const completedMovies = userMovies.filter(m => m.status === "completed");
  const notWatchedMovies = userMovies.filter(m => m.status === "not watched");

  res.render("./movies/movies", { completedMovies, notWatchedMovies });
});

// ================== DASHBOARD (using Task flags) ==================
router.get('/lifetime', async (req, res) => {
  if (!req.session.email) return res.status(401).send("Please login first");

  // Fetch user’s tasks
  const tasks = await Task.find({ email: req.session.email });

  // Count completed and pending
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  // Optional: Events
  const events = await Event.find({ email: req.session.email });
  const totalEvents = events.length;

  // Prepare simple graph data by month (optional)
  const monthlyStats = {};
  tasks.forEach(t => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!monthlyStats[month]) monthlyStats[month] = { total: 0, completed: 0 };
    monthlyStats[month].total++;
    if (t.completed) monthlyStats[month].completed++;
  });

  const graphData = Object.entries(monthlyStats).map(([month, val]) => ({
    month,
    score: Math.round((val.completed / val.total) * 100)
  }));

  res.render('lifetime', { completedTasks, pendingTasks, totalEvents, graphData });
});


module.exports = router;
