const mongoose = require("mongoose");

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

const accesibleSchema = new Schema({ // Esquema para subdocumentos de tipo accesibilidad
    adaptedToilet: {
        type: Boolean
    },
    adaptedAccess: {
        type: Boolean
    },
    adaptedRoom: {
        type: Boolean
    },
    audioGuide: {
        type: Boolean
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
        type: [String],
        validate: [v => Array.isArray(v) && v.length > 0, "Category is required"]
    },
    photos: {
        type: [linkSchema]
    },
    latitude: {
        type: Number,
        required: [true, "Latitude is required"] 
    },
    longitude: {
        type: Number,
        required: [true, "Longitude is required"] 
    },
    accessible: {
        type: [accesibleSchema] // accesible es un Array de documentos que siguen el esquema accesibleSchema, que utilizaremos para poder filtrar en el mapa
    },
    active: {
        type: Boolean,
        required: [true, "Active is required"] 
    }
}, { collection: 'pointsOfInterest' }); // Mongoose asume por defecto que la colección se llama igual que el modelo con una 's' detrás, en este caso eso no nos sirve. Por tanto, especificamos el nombre de colección real.

module.exports = mongoose.model("PointOfInterest", pointOfInterestSchema);
