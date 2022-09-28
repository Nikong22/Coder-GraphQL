const mongoose = require('mongoose');
const logger = require('../logger');

const URI = 'mongodb+srv://fercamm:fercamm@cluster0.5f3mw6d.mongodb.net/test';
// const URI = 'mongodb://localhost:27017/coder'

const optionsDB = mongoose.connect(URI,
  {
    serverSelectionTimeoutMS: 1000
  },
  (error) => {
    if (error) {
      console.log('error database')
      throw 'Error al conectarse a la base de datos';
    } else {
      ProductoDB.find({})
        .then((productosDB) => {
          for (let productos of productosDB) {
            // productos.push(productos)
          }
          // console.log("Conectado a la base de datos mongo...")
          logger.debug("Conectado a la base de datos mongo...");
        })
    }
  })
module.exports = {
    optionsDB
}