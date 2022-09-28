const { optionsDB } = require('../options/mongoDB');
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    id: { type: Number, require: true },
    username: { type: String, require: true, minLength: 1, maxLength: 30 },
    password: { type: String, require: true, minLength: 1 },
});
module.exports = User = mongoose.model('usuarios', UserSchema)
