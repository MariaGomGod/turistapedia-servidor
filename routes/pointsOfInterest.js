const express = require("express");
const router = express.Router();
const ramda = require("ramda");
const PointOfInterest = require("../models/pointOfInterest");

router.get("/", (req, res) => {
    PointOfInterest.find({ categories: {"$in": req.query.categories.split(",")}, active: true }).exec((error, pointsOfInterest) => {
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
        if (error) {
            res.status(400).json(error);
        } else {
            res.status(200).json(newPointOfInterest);
        }
    });
});

router.put("/:id", (req,res) => {
    const id = req.params.id;
    const body = ramda.pick(["name", "description", "links", "categories", "photos", "review", "latitude", "logitude", "accessible", "address", "active"], req.body);

    PointOfInterest.findByIdAndUpdate(
        id, 
        body, 
        { new: true, runValidators: true, context: "query" }, // options
        (error, updatePointOfInterest) => {
            if (error) {
                res.status(400).json({ ok: false, error });
            } else if (!updatePointOfInterest) {
                res.status(404).json({ ok: false, error: "Point of interest not found"} );
            } else {
                res.status(200).json({ ok: true, updatePointOfInterest });
            }
        }
    );
});

router.put("/:id/publish", (req,res) => {
    const id = req.params.id;
    
    PointOfInterest.findByIdAndUpdate(
        id, 
        { $set: { active: true } }, 
        { new: true, runValidators: true, context: "query" }, // options
        (error, updatePointOfInterest) => {
            if (error) {
                res.status(400).json({ ok: false, error });
            } else if (!updatePointOfInterest) {
                res.status(404).json({ ok: false, error: "Point of interest not found"} );
            } else {
                res.status(200).json({ ok: true, updatePointOfInterest });
            }
        }
    );
});

router.delete("/:id", (req,res) => {
    const id = req.params.id;

    PointOfInterest.findByIdAndUpdate(
        id, 
        { $set: { active: false } }, 
        { new: true, runValidators: true, context: "query" }, // options
        (error, updatePointOfInterest) => {
            if (error) {
                res.status(400).json({ ok: false, error });
            } else if (!updatePointOfInterest) {
                res.status(404).json({ ok: false, error: "Point of interest not found"} );
            } else {
                res.status(200).json({ ok: true, updatePointOfInterest });
            }
        }
    );
});

module.exports = router; // exportamos por defecto