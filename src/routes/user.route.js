const express = require("express");
const usersmodel = require("../models/user.model");
const Task = require("../models/task.model");
const event = require("../models/add-event.model");
const router = express.Router();
const Subject = require("../models/subject.model");
const Movies = require("../models/movies.model");

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
        const subjects = await Subject.find();

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

        res.render("home", { tasks, completedTasks, upcoming,subjects });

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


// ✅ Route for dashboard view (EJS)
router.get("/dashboard", (req, res) => {
  res.render("graph"); // your EJS file name (dashboard.ejs)
});

router.get("/collections",(req,res)=>{
    res.render("collection/collection");
})


router.get("/collections/movies", async (req, res) => {
    if (!req.session.email)
        return res.status(401).send("Please login first");

    const userMovies = await Movies.find();

    const watched = userMovies.filter(m => m.status === "watched");
    const notWatched = userMovies.filter(m => m.status === "not watched");

    res.render("collection/movies/movies", { watched, notWatched });
});


router.post("/collections/movies", async (req, res) => {
    const { name, category, status, poster } = req.body;

    if (!req.session.email)
        return res.status(401).send("Please login first");

    if (!name || !category || !poster)
        return res.status(400).send("All fields are required");

    // check duplicate movie
    const existing = await Movies.findOne({ name, email: req.session.email });
    if (existing) return res.send("MOVIE ALREADY EXISTS");

    await Movies.create({
        name,
        category,
        status: status || "not watched",
        poster,
        email: req.session.email
    });

    res.send("SUCCESS");
});
router.get("/collections/add-movies",(req,res)=>{
    res.render("collection/movies/add-movies")
})


router.post("/collections/add-movies", async (req, res) => {
    try {
        const { name, category, poster, status } = req.body;

        // Validation
        if (!name || !category || !poster) {
            return res.status(400).send("All fields are required");
        }

        // Create movie
        await Movies.create({
            name,
            category,
            poster,
            status: status || "not watched"
        });

        res.redirect("/collections/movies");  // Redirect to movies list page
        // OR: res.send("SUCCESS");

    } catch (err) {
        console.error("Error adding movie:", err);
        res.status(500).send("Server Error");
    }
});

router.post("/collections/movies/toggle/:id", async (req, res) => {
    try {
        const movie = await Movies.findById(req.params.id);

        if (!movie) return res.status(404).send("Movie not found");

        movie.status = movie.status === "watched" ? "not watched" : "watched";
        await movie.save();

        res.redirect("/collections/movies");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating movie");
    }
});

router.post("/collections/movies/delete/:id", async (req, res) => {
    try {
        await Movies.findByIdAndDelete(req.params.id);
        res.redirect("/collections/movies");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error deleting movie");
    }
});



module.exports = router;
