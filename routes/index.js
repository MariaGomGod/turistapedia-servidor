const express = require("express");
const app = express();

// app.use("/users", require("./users")); // asignamos la URL /users a la familia de endpoints de users
app.use("/poi", require("./pointsOfInterest")); // asignamos la URL /poi a la familia de endpoints de pointOfInterest

module.exports = app;