const express = require("express");
const router = express.Router();

const usersmodel = require("../models/user.model");
const Task = require("../models/task.model");
const event = require("../models/add-event.model");
const Subject = require("../models/subject.model");
const Movies = require("../models/movies.model");
const Life = require("../models/life.model");
const DharmaSection = require("../models/DharmaSection");   // ✅ correct name


// ================== INDEX / SIGNUP ==================
router.get("/", (req, res) => {
    res.render("index");
});

router.get("/sign", (req, res) => {
    res.send("Please Enter Data");
});

router.post("/sign", async (req, res) => {
    const { email, password } = req.body;

    await usersmodel.create({ email, password });
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

        const tasks = await Task.find({
            email: req.session.email,
            date: { $gte: today, $lt: tomorrow },
            completed: false
        });

        const subjects = await Subject.find();

        const completedTasks = await Task.find({
            email: req.session.email,
            completed: true
        }).sort({ date: -1 }).limit(5);

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

                const diff = evDate - todayDate;
                const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

                return {
                    title: ev.title,
                    daysLeft: daysLeft === 0 ? "Today" : `${daysLeft} Days Left`
                };
            });

        res.render("home", { tasks, completedTasks, upcoming, subjects });

    } catch (err) {
        console.log(err);
        res.send("Error aaya");
    }
});


// ================== MARK TASKS AS COMPLETED ==================
router.post("/complete-tasks", async (req, res) => {
    if (!req.session.email) return res.status(401).send("Please login first");

    const { completedTasks } = req.body;

    if (!completedTasks || completedTasks.length === 0)
        return res.status(400).send("No tasks selected");

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


// ================== DASHBOARD ==================
router.get("/dashboard", (req, res) => {
    res.render("graph");
});


// ================== COLLECTION HOME ==================
router.get("/collections", (req, res) => {
    res.render("collection/collection");
});


// ================== MOVIES ==================
router.get("/collections/movies", async (req, res) => {
    if (!req.session.email)
        return res.status(401).send("Please login first");

    const userMovies = await Movies.find({ email: req.session.email });

    const watched = userMovies.filter(m => m.status === "watched");
    const notWatched = userMovies.filter(m => m.status === "not watched");

    res.render("collection/movies/movies", { watched, notWatched });
});


router.get("/collections/add-movies", (req, res) => {
    res.render("collection/movies/add-movies");
});

router.post("/collections/add-movies", async (req, res) => {
    try {
        const { name, category, poster, status } = req.body;

        if (!name || !category || !poster)
            return res.status(400).send("All fields are required");

        await Movies.create({
            name,
            category,
            poster,
            status: status || "not watched",
            email: req.session.email
        });

        res.redirect("/collections/movies");

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


// ================== DEVOTION ==================
router.get("/collections/devotion", (req, res) => {
    res.render("collection/devotion/home");
});


// 🔐 LOGIN CHECK
function auth(req, res, next) {
    if (!req.session || !req.session.email) {
        return res.redirect("/");
    }
    next();
}


// ⭐ GET — Show Dharma Sections (God Photos)
router.get("/collections/devotion/god-photos", auth, async (req, res) => {
    try {
        const email = req.session.email;

        const sections = await DharmaSection.find({ email }).sort({ createdAt: -1 });

        res.render("collection/devotion/photo", { sections });

    } catch (err) {
        console.error(err);
        res.send("Something went wrong");
    }
});

router.get("/collections/devotion/god-photos/add",(req,res)=>{
    res.render("collection/devotion/god-photos")
})
// ⭐ POST — Add Dharma Section
router.post("/collections/devotion/dharma/add", auth, async (req, res) => {
    try {
        await DharmaSection.create({
            email: req.session.email,
            title: req.body.title,
            imageUrl: req.body.imageUrl
        });

        res.redirect("/collections/devotion/god-photos");

    } catch (err) {
        console.error(err);
        res.send("Failed to save photo");
    }
});



// DELETE DHARMA SECTION
// ================== DELETE DHARMA SECTION ==================
router.post(
    "/collections/devotion/god-photos/delete/:id",
    auth,
    async (req, res) => {
      try {
  
        console.log("🛑 DELETE CALLED");
        console.log("➡ ID:", req.params.id);
        console.log("➡ SESSION EMAIL:", req.session.email);
  
        const result = await DharmaSection.deleteOne({
          _id: req.params.id,
          email: req.session.email   // protect user data
        });
  
        console.log("➡ DELETE RESULT:", result);
  
        if (result.deletedCount === 0) {
          console.log("⚠ No record deleted — email or ID mismatch");
        }
  
        res.redirect("/collections/devotion/god-photos");
      }
      catch (err) {
        console.error("❌ DELETE ERROR:", err);
        res.send("Delete failed");
      }
    }
  );
  
  
//   STATISTICS 
// ✅ POST – ADD LIFE DATA (ONE TIME)
// router.post("/life", async (req, res) => {
//     try {
//       // check if data already exists
//       const exists = await Life.findOne();
//       if (exists) {
//         return res.status(400).json({
//           message: "LifeScorecard data already exists"
//         });
//       }
  
//       const life = new Life(req.body);
//       await life.save();
  
//       res.status(201).json({
//         message: "LifeScorecard data added successfully",
//         data: life
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Server error" });
//     }
//   });
  
//   // ✅ GET – FETCH LIFE DATA
//   router.get("/life", async (req, res) => {
//     try {
//       const lifeData = await Life.findOne();
//       if (!lifeData) return res.send("No LifeScorecard data found");
  
//       const yearsActive =
//         new Date().getFullYear() - lifeData.careerStart;
  
//       res.render("life/home", {
//         life: lifeData,
//         yearsActive
//       });
//     } catch (err) {
//       console.error(err);
//       res.send("Error loading page");
//     }
//   });
  
router.get("/life", async (req, res) => {
    try {
      const lifeData = await Life.findOne();
      if (!lifeData) {
        return res.send("LifeScorecard data not found");
      }
  
      const yearsActive =
        new Date().getFullYear() - lifeData.careerStart;
  
      res.render("life/home", {
        life: lifeData,
        yearsActive
      });
    } catch (err) {
      console.error(err);
      res.send("Error loading LifeScorecard");
    }
  });
  
  
  // ===============================
  // GET : ADMIN PAGE (PRIVATE)
  // URL : /life/admin
  // ===============================
  router.get("/life/admin", async (req, res) => {
    try {
      const lifeData = await Life.findOne();
      if (!lifeData) {
        return res.send("No LifeScorecard data");
      }
  
      res.render("life/admin", {
        life: lifeData
      });
    } catch (err) {
      console.error(err);
      res.send("Error loading admin page");
    }
  });
  
  
  // ===============================
  // PUT : UPDATE LIFE DATA
  // URL : /life
  // ===============================
  router.put("/life", async (req, res) => {
    try {
      await Life.findOneAndUpdate({}, req.body);
  
      res.redirect("/life"); // go back to public page
    } catch (err) {
      console.error(err);
      res.send("Update failed");
    }
  });
  
  
  // ===============================
  // POST : ADD LIFE DATA (ONE TIME)
  // URL : /life
  // ===============================
  router.post("/life", async (req, res) => {
    try {
      const exists = await Life.findOne();
      if (exists) {
        return res.json({
          message: "LifeScorecard data already exists"
        });
      }
  
      const life = new Life(req.body);
      await life.save();
  
      res.json({
        message: "LifeScorecard data added successfully"
      });
    } catch (err) {
      console.error(err);
      res.send("Error saving data");
    }
  });
  
  
  // ===============================
  // DELETE : RESET DATA (OPTIONAL)
  // URL : /life
  // ===============================
  router.delete("/life", async (req, res) => {
    try {
      await Life.deleteMany({});
      res.json({ message: "LifeScorecard reset done" });
    } catch (err) {
      res.send("Delete failed");
    }
  });



  const fetchGitHubStats = require("../services/github.service");

  router.post("/life/sync-github", async (req, res) => {
    try {
      const githubData = await fetchGitHubStats();
  
      await Life.findOneAndUpdate(
        {},
        {
          $set: {
            "github.repos": githubData.repos,
            "github.followers": githubData.followers,
            "github.following": githubData.following,
            "github.avatar": githubData.avatar,
            "github.profileUrl": githubData.profileUrl,
            "github.githubSince": githubData.githubSince
          }
        },
        { new: true }
      );
  
      console.log("✅ GitHub stats merged (not overwritten)");
      res.redirect("/life/admin");
    } catch (err) {
      console.error("❌ GitHub sync failed:", err);
      res.send("GitHub sync failed");
    }
  });
  




module.exports = router
