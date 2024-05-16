const mongoose = require('mongoose')

const usuarioSchema = mongoose.Schema({
    nombre: String,
    correo: String,
    telefono: String,
    clave: String,
    estado: Number,
});

const usuarioModel = mongoose.model('Usuarios', usuarioSchema);

module.exports = usuarioModel;