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

const pointSchema = new Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
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
        validate: [categoriesValue => Array.isArray(categoriesValue) && categoriesValue.length > 0, "Category is required"] 
        // En mongoose 5, required no comprueba que el array no esté vacío, solo que el campo sea una array.
        // Con esta función se comprueba que el campo es de tipo array y que no está vacío.
    },
    photos: {
        type: [linkSchema]
    },
    location: {
        type: pointSchema,
        required: true,
        index: '2dsphere' // El index es para decirle a MongoDB que agilice las consultas que utilicen este campo.
    },
    accessible: {
        type: accesibleSchema // accesible es un documento que sigue el esquema accesibleSchema, que utilizaremos para poder filtrar en el mapa
    },
    active: {
        type: Boolean,
        required: [true, "Active is required"] 
    },
    author: {
        type: String,
        required: [true, "Author is required"] 
    },
    updatedAt: {
        type: Date,
        required: [true, "UpdatedAt is required"] 
    }

}, { collection: 'pointsOfInterest' }); // Mongoose asume por defecto que la colección se llama igual que el modelo con una 's' detrás, en este caso eso no nos sirve. Por tanto, especificamos el nombre de colección real.

module.exports = mongoose.model("PointOfInterest", pointOfInterestSchema);
