const express = require("express");
const usersmodel = require("../models/user.model");
const Task = require("../models/task.model");
const event = require("../models/add-event.model");
const router = express.Router();

// ================== INDEX / SIGNUP ==================
router.get("/", (req, res) => {
    res.render("index");
});

router.get("/sign", (req, res) => {
    res.send("Please Enter Data");
});

router.post("/sign", async (req, res) => {
    const { email, password } = req.body;

    await usersmodel.create({
        email,
        password
    });
    res.send("SUCCESS");
});

// ================== LOGIN ==================
router.post("/", async (req, res) => {
    const { email, password } = req.body;

    const user = await usersmodel.findOne({ email });
    if (!user) return res.send("USER NOT FOUND, PLEASE CONTACT MENTOR");
    if (user.password !== password) return res.send("Invalid Password");

    req.session.email = user.email; // set session
    res.redirect("/home");
});

// ================== HOME ==================
router.get("/home", async (req, res) => {
    try {
        if (!req.session.email) return res.send("Please login first");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // ✅ Tasks for today (not completed)
        const tasks = await Task.find({
            email: req.session.email,
            date: { $gte: today, $lt: tomorrow },
            completed: false
        });

        // ✅ Recently completed tasks
        const completedTasks = await Task.find({
            email: req.session.email,
            completed: true
        }).sort({ date: -1 }).limit(5);

        // ✅ Upcoming events
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const events = await event.find({ email: req.session.email }).sort("date");

        const upcoming = events
            .filter(ev => {
                const evDate = new Date(ev.date);
                evDate.setHours(0, 0, 0, 0);
                return evDate >= todayDate;
            })
            .map(ev => {
                const evDate = new Date(ev.date);
                evDate.setHours(0, 0, 0, 0);

                const diffTime = evDate - todayDate;
                const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                return {
                    title: ev.title,
                    daysLeft: daysLeft === 0 ? "Today" : `${daysLeft} Days Left`
                };
            });

        res.render("home", { tasks, completedTasks, upcoming });

    } catch (err) {
        console.log(err);
        res.send("Error aaya");
    }
});

// ================== MARK TASKS AS COMPLETED ==================
router.post("/complete-tasks", async (req, res) => {
    if (!req.session.email) return res.status(401).send("Please login first");

    const { completedTasks } = req.body; // array of task IDs
    if (!completedTasks || completedTasks.length === 0) return res.status(400).send("No tasks selected");

    try {
        await Task.updateMany(
            { _id: { $in: completedTasks }, email: req.session.email },
            { $set: { completed: true } }
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// ✅ Route for chart data (JSON)
router.get("/graph", (req, res) => {
  res.json({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    tasksDone: [1, 2, 3, 4, 5, 6],
    upcomingEvents: [3, 5, 2, 1, 0, 2],
  });
});

// ✅ Route for dashboard view (EJS)
router.get("/dashboard", (req, res) => {
  res.render("graph"); // your EJS file name (dashboard.ejs)
});



module.exports = router;
