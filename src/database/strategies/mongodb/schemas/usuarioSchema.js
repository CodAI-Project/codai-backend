const Mongoose = require('mongoose')


const UsuarioSchema = new Mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    insertedAt: {
        type: Date,
        default: new Date()
    },
    modifyAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = Mongoose.model('usuarios', UsuarioSchema)