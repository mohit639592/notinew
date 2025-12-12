const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// MAIN DATABASE (Default)
const mainDB = mongoose.createConnection(process.env.MONGO_URI);

mainDB.on("connected", () => console.log("Main DB Connected"));
mainDB.on("error", err => console.log("Main DB Error:", err));

// SECOND DATABASE (Collections)
const collectionsDB = mongoose.createConnection(process.env.MONGO_URI2);

collectionsDB.on("connected", () => console.log("Collections DB Connected"));
collectionsDB.on("error", err => console.log("Collections DB Error:", err));

module.exports = { mainDB, collectionsDB };
