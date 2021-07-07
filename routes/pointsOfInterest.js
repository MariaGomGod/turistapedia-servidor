const express = require("express");
const router = express.Router();
const ramda = require("ramda");
const PointOfInterest = require("../models/pointOfInterest");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next, requiresAdminAccess) => {
    const authorizationHeader = req.get("Authorization") || "";
    const token = authorizationHeader.split(" ")[1]; // "Authorization" tendrá un valor de la forma "Bearer <token>".
    jwt.verify(token, process.env.SEED, (error, payload) => {
         // payload tiene la forma { "user": { "email": "blabla", "password": "blabla", "securityQuestion": "blabla", "admin" : false|true }}
        if (error) {
            res.status(401).json(error);
        } else if (requiresAdminAccess && !payload.user.admin) {
            res.status(403).json({ "message": "Forbidden" });
        } else {
            req.headers['author'] = payload.user.email; // Con esto informamos a los middleware que se ejecuten a continuación quién es el usuario que 
                                                        // está intentando ejecutar esta operación, mediante una cabecera "author" que contiene el e-mail
            req.headers['admin'] = payload.user.admin;  // Con esto informamos a los middleware que se ejecuten a continuación si el usuario es admin
            next(); // llama a la siguiente pieza de middleware
        }
    });
};

router.get("/", (req, res) => {

    /* MongoDB hace consultas mediante ejemplos. En este caso le estamos pidiendo que nos devuelva documentos similares al que le ofrecemos
    como primer argumento. */
    const latitude = req.query.latitude || 0;
    const longitude = req.query.longitude || 0;
    const categories = req.query.categories.split(",");
    const accessible = req.query.accessible.split(",");

    /* Restrinjo la búsqueda a aquellos documentos que cumplan con los filtros de accesibilidad, es decir, cuyo nombre esté presente
    en el array "accessible". */
    const accessibleFilter = {};

    // Solo incluimos aquellos filtros que están contenidos en el array "accessible".
    if (accessible.includes("adaptedAccess")) {
        accessibleFilter["accessible.adaptedAccess"] = true;
    }
    if (accessible.includes("adaptedToilet")) {
        accessibleFilter["accessible.adaptedToilet"] = true;
    }
    if (accessible.includes("adaptedRoom")) {
        accessibleFilter["accessible.adaptedRoom"] = true;
    }
    if (accessible.includes("audioGuide")) {
        accessibleFilter["accessible.audioGuide"] = true;
    }

    PointOfInterest.find({
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: 1000
            }
        },
        categories: { "$in": categories },
        ...accessibleFilter,
        active: true
    }).exec((error, pointsOfInterest) => {

        /* La función find devuelve un objeto de tipo Query. La misma no se ejecutará hasta que no llamemos a su función exec. */

        /* Utilizamos split para separar los string categories y que la petición no te la haga como un solo string. Ejemplo: si no hiciéramos el split
        y desde el front end seleccionáramos restauración y monumento como categorías, la consulta hacia MongoDB la estaríamos haciendo
        con un único string "restauración,monumento", lo cual nos daría 0 resultados. */

        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json(pointsOfInterest);
        }
    });
});

router.get("/all", (req, res, next) => verifyToken(req, res, next, false), (req, res) => {
    const query = {};
    if (!req.get('admin')) {
        query.author = req.get('author'); // Si no es administrador, tenemos que filtrar aquellos
                                          // puntos de interés cuyo autor tenga el mismo e-mail
                                          // que el usuario que está llamando al endpoint 
    }
    PointOfInterest.find(query).exec((error, pointsOfInterest) => {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json(pointsOfInterest);
        }
    });
});

router.get("/:id", (req, res, next) => verifyToken(req, res, next, false), (req, res) => {
    const id = req.params.id;
    PointOfInterest.findOne({_id: id}).exec((error, pointOfInterest) => {
        if (error) {
            res.status(500).json(error);
        } else if (!pointOfInterest) {
            res.status(404).json({ ok: false, error: "Point of interest not found" });
        } else if (!req.get('admin') && req.get('author') !== pointOfInterest.author) {
            res.status(403).json({ ok: false, error: "Forbidden" });
        } else {
            res.status(200).json(pointOfInterest);
        }
    });
});

router.post("/", (req, res, next) => verifyToken(req, res, next, false), (req, res) => {
    const body = req.body;
    const accessible = body.accessible || {};
    const pointOfInterest = new PointOfInterest({
        name: body.name,
        description: body.description,
        links: body.links,
        categories: body.categories,
        photos: body.photos,
        location: body.location,
        accessible: ramda.pick(["adaptedAccess", "adaptedToilet", "adaptedRoom", "audioGuide"], accessible),
        /* El front end envía un array de strings, mientras que MongoDB espera un objeto compuesto por cuatro propiedades de tipo booleano, donde cada
        una de seas propiedades es verdadera si el punto de interés soporta esa opción de accesibilidad (por ejemplo, adaptedAccess). La manera de hacer
        que lo que envía el front end y lo que espera el back end se adapten, es hacer que cada propiedad del objeto "accessible" sea true si el string
        correspondiente fue enviado en el array desde el front end (lo que significa que el usuario marcó esa casilla), y falso en caso contrario. */
        active: false,
        updatedAt: new Date(),
        author: req.get("author")
    });

    pointOfInterest.save((error, newPointOfInterest) => {

        // save() equivale a insert

        if (error) {
            res.status(400).json(error);
        } else {
            res.status(200).json(newPointOfInterest);
        }
    });
});

router.put("/:id", (req, res, next) => verifyToken(req, res, next, false), (req, res) => {
    const id = req.params.id;
    const body = ramda.pick(["name", "description", "links", "categories", "photos", "location", "accessible", "active"], req.body);
    // Equivalente a const body = { req.body.name, req.body.description, req.body.links, etcétera }
    body.updatedAt = new Date();

    PointOfInterest.findByIdAndUpdate(
        id,
        body,
        { new: true, runValidators: true, context: "query" }, // options
        (error, updatePointOfInterest) => {
            if (error) {
                res.status(400).json({ ok: false, error });
            } else if (!updatePointOfInterest) {
                res.status(404).json({ ok: false, error: "Point of interest not found" });
            } else {
                res.status(200).json({ ok: true, updatePointOfInterest });
            }
        }
    );
});

router.put("/:id/publish", (req, res, next) => verifyToken(req, res, next, true), (req, res) => {
    const id = req.params.id;

    PointOfInterest.findByIdAndUpdate(
        id,
        { $set: { active: true, updatedAt: new Date() } },
        { new: true, runValidators: true, context: "query" }, // options
        (error, updatePointOfInterest) => {
            if (error) {
                res.status(400).json({ ok: false, error });
            } else if (!updatePointOfInterest) {
                res.status(404).json({ ok: false, error: "Point of interest not found" });
            } else {
                res.status(200).json({ ok: true, updatePointOfInterest });
            }
        }
    );
});

router.put("/:id/unpublish", (req, res, next) => verifyToken(req, res, next, true), (req, res) => {
    const id = req.params.id;

    PointOfInterest.findByIdAndUpdate(
        id,
        { $set: { active: false, updatedAt: new Date() } }, 
        { new: true, runValidators: true, context: "query" }, // options
        (error, updatePointOfInterest) => {
            if (error) {
                res.status(400).json({ ok: false, error });
            } else if (!updatePointOfInterest) {
                res.status(404).json({ ok: false, error: "Point of interest not found" });
            } else {
                res.status(200).json({ ok: true, updatePointOfInterest });
            }
        }
    );
});

router.delete("/:id", (req, res, next) => verifyToken(req, res, next, true), (req, res) => {
    const id = req.params.id;

    PointOfInterest.deleteOne(
        { "_id": id },
        (error) => {
            if (error) {
                res.status(400).json({ ok: false, error });
            } else {
                res.status(200).json({ ok: true });
            }
        }
    );
});

module.exports = router; // exportamos por defecto