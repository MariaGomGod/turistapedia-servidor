const express = require("express");
const app = express();

// app.use("/users", require("./users"));
app.use("/poi", require("./pointsOfInterest"));

module.exports = app;