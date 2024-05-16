const mongoose = require('mongoose')

const tipoUsuarioSchema = mongoose.Schema({
    descripcion: String
});

const tipoUsuarioModel = mongoose.model('TipoUsuarios', tipoUsuarioSchema);

module.exports = tipoUsuarioModel;