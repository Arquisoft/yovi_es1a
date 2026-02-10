const mongoose = require('mongoose');

const conectarBD = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Base de Datos conectada con éxito");
    } catch (error) {
        console.error("Error crítico: No se pudo conectar a la BD");
        console.error(error);
        process.exit(1);
    }
};

module.exports = conectarBD;