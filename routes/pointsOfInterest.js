const express = require("express");
const router = express.Router();
const ramda = require("ramda");
const PointOfInterest = require("../models/pointOfInterest");

router.get("/", (req, res) => {

    /* MongoDB hace consultas mediante ejemplos. En este caso le estamos pidiendo que nos devuelva documentos similares al que le ofrecemos
    como primer argumento. */
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
        categories: { "$in": categories },
        ... accessibleFilter,
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

router.get("/pending", (req, res) => {
    PointOfInterest.find({ active: false }).exec((error, pointsOfInterest) => {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json(pointsOfInterest);
        }
    });
});

router.post("/", (req, res) => {
    const body = req.body;
    const pointOfInterest = new PointOfInterest({
        name: body.name,
        description: body.description,
        links: body.links,
        categories: body.categories,
        photos: body.photos,
        review: body.review,
        latitude: body.latitude,
        longitude: body.longitude,
        accessible: body.accessible,
        address: body.address,
        active: true
    });

    pointOfInterest.save((error, newPointOfInterest) => {

        // save equivale a insert

        if (error) {
            res.status(400).json(error);
        } else {
            res.status(200).json(newPointOfInterest);
        }
    });
});

router.put("/:id", (req, res) => {
    const id = req.params.id;
    const body = ramda.pick(["name", "description", "links", "categories", "photos", "review", "latitude", "logitude", "accessible", "address", "active"], req.body);
    // Equivalente a const body = { req.body.name, req.body.description, req.body.links, etcétera }

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

router.put("/:id/publish", (req, res) => {
    const id = req.params.id;

    PointOfInterest.findByIdAndUpdate(
        id,
        { $set: { active: true } },
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

router.delete("/:id", (req, res) => {
    const id = req.params.id;

    PointOfInterest.findByIdAndUpdate(
        id,
        { $set: { active: false } }, // borrado lógico (no borramos realmente el documento, sino que no le aparece al usuario)
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

module.exports = router; // exportamos por defecto