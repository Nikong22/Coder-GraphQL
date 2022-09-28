const { optionsDB } = require('../options/mongoDB');
const mongoose = require('mongoose');

const MensajeSchema = mongoose.Schema({
    autor: {
      id: String,
      nombre: String,
      apellido: String,
      edad: Number,
      alias: String,
      avatar: String
    },
    texto: { type: String, require: true, minLength: 1, maxLength: 25 },
    fecha: { type: String, require: true, minLength: 1 },
  });
  module.exports = MensajeDB = mongoose.model('mensajes', MensajeSchema)