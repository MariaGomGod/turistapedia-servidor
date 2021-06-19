const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/", (req, res) => {
    const body = req.body;
    const user = new User({
        email: body.email.toLowerCase(),
        password: bcrypt.hashSync(body.password, 10),
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

router.post("/login", (req, res) => {
    const body = req.body;

    User.findOne({email: body.email}, (error, user) => {
        if (error) {
            res.status(500).json(error);
        } else if (user && bcrypt.compareSync(body.password, user.password)) {
            const token = jwt.sign(
                {user: user}, // payload (el contenido que se quiere firmar)
                process.env.SEED,
                {expiresIn: 1800}
            );
            res.status(200).json({token: token, user: { email: user.email, admin: user.admin }});
        } else {
            // En el estado 401 introducido mensaje de "email o contraseña incorrectos", y no uno distinto para el caso de que el email
            // o la contraseña sean incorrectos, por seguridad, para no dar pistas a un usuario malintencionado.
            // Por ejemplo, si en el sitio web el usuario malintencionado va probando aleatoriamente emails, hasta dar con uno correcto porque el
            // el mensaje de error que recibe es que la contraseña es incorrecta, ese usuario malintencionado ya sabe que ya existe otro con ese 
            // email, y podría aprovecharlos para fines de spam u otras prácticas.
            res.status(401).json({message: "Email o contraseña incorrectos"});
        }
    })
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