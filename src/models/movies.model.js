const mongoose = require("mongoose");
const { collectionsDB } = require("../database/db");

const MovieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    poster: {
        type: String,
        required: true // URL of google image poster
    },

    status: {
        type: String,
        enum: ["watched", "not watched"],
        default: "not watched"
    },

    // email: {
    //     type: String,
    //     required: true
    // },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = collectionsDB.model("Movie", MovieSchema);
