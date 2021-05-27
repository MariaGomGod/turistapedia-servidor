require("./config/config");

const mongoose = require("mongoose");
// mongoose.set('debug', true);
const express = require("express");
const cors = require("cors"); // para permitir peticiones desde un dominio distinto (localhost:3000 => localhost:8080)
const app = express();
app.use(cors());
app.use(express.json());
app.use(require("./routes/index"));

mongoose.connect("mongodb://localhost:27017/turistapedia", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;

db.on("error", err => console.log("Connection to DB failed ", err));
db.once("open", () => console.log("Connected to DB successfuly"));

app.listen(process.env.PORT, () => {
    console.log("Listening on port: ", process.env.PORT);
})