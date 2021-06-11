const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required"] 
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    securityQuestion: {
        type: String,
        required: [true, "Security question is required"]
    },
    admin: {
        type: Boolean,
        required: [true, "Admin is required"]
    }
});

module.exports = mongoose.model("User", userSchema);
