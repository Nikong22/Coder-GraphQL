const { optionsDB } = require('../options/mongoDB');
const mongoose = require('mongoose');

const ProductoSchema = mongoose.Schema({
    id: { type: Number, require: true },
    title: { type: String, require: true, minLength: 1, maxLength: 50 },
    price: { type: String, require: true, minLength: 1, maxLength: 25 },
    thumbnail: { type: String, require: true, minLength: 1 },
});
module.exports = ProductoDB = mongoose.model('productos', ProductoSchema)