const express = require("express")
const path = require("path")
const userrouter = require("./routes/user.route")
const taskroute = require("./routes/task.route")
const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))


const session = require("express-session");

// ✅ session setup global level pe
app.use(session({
    secret: "your-secret-key",    // random string
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 din
        sameSite: "lax"               // localhost ke liye "lax" sahi hai
    }
}));

app.use("/",userrouter)
app.use("/", taskroute);
module.exports = app;