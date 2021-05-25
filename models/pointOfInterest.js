const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const linkSchema = new Schema({ // Esquema para subdocumentos de tipo enlace donde obligamos a que el enlace sea obligatorio
    link: {
        type: String,
        required: [true, "Link is required"] 
    },
    description: {
        type: String
    }
});

const pointOfInterestSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"] 
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    links: {
        type: [linkSchema] // links es un Array de documentos que siguen el esquema linkSchema. Impido que el usuario introduzca un enlace mal formado
    },
    categories: {
        type: Array,
        required: [true, "Category is required"]
    },
    photos: {
        type: Array
    },
    /*review: {
        type: Number
    },*/
    latitude: {
        type: Number,
        required: [true, "Latitude is required"] 
    },
    longitude: {
        type: Number,
        required: [true, "Longitude is required"] 
    },
    accessible: {
        type: Boolean,
        required: [true, "Accessibility is required"] 
    },
    active: {
        type: Boolean,
        required: [true, "Active is required"] 
    }
}, { collection: 'pointsOfInterest' }); // Mongoose asume por defecto que la colección se llama igual que el modelo con una 's' detrás, en este caso eso no nos sirve

pointOfInterestSchema.plugin(uniqueValidator, { message: "{PATH} should be unique" });

module.exports = mongoose.model("PointOfInterest", pointOfInterestSchema);
