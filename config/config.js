// configuramos la variable de entorno PORT para que 
// coja una existente o le asigne  el 8080 si no existiera

process.env.PORT = process.env.PORT || 8080;

process.env.SEED = process.env.SEED || "5EOBCVDjXJAZ5UunrykM"; // Se va a utilizar para generar el token y el hash de las contraseñas.