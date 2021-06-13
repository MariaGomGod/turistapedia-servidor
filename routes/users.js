const express = require("express");
const router = express.Router();
const ramda = require("ramda");
const User = require("../models/user");

router.post("/", (req, res) => {
    const body = req.body;
    const accessible = body.accessible || [];
    const user = new User({
        email: body.email,
        password: body.password,
        securityQuestion: body.securityQuestion,
        admin: false
    });

    user.save((error, newUser) => {

        // save equivale a insert

        if (error) {
            res.status(400).json(error);
        } else {
            res.status(200).json(newUser);
        }
    });
});

router.put("/reset-password", (req, res) => {

    const email = req.body.email;
    const securityQuestion = req.body.securityQuestion;

    User.find({ email: email, securityQuestion: securityQuestion }).exec((error, users) => {
        if (error) {
            res.status(500).json(error);
        } else if (!users || users.length === 0) {
            res.status(404).json({ ok: false, error: "User not found" });
        } else {
            User.findByIdAndUpdate(
                users[0]._id, // al declarar el email único y consultar por email, solo aspiro a recibir un único usuario como respuesta.
                { $set: { password: req.body.password } },
                { new: true, runValidators: true, context: "query" }, // options
                (error, updateUser) => {
                    if (error) {
                        res.status(400).json({ ok: false, error });
                    } else if (!updateUser) {
                        res.status(404).json({ ok: false, error: "User not found" });
                    } else {
                        res.status(200).json({ ok: true, updateUser });
                    }
                }
            );
        }
    });

});

module.exports = router; // exportamos por defecto