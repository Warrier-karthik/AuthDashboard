const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    Uname: {
        type: "string",
        required: true
    },
    email: {
        type: "string",
        required: true
    },
    password: {
        type: "string",
        required: true
    },
    Role: {
        type: "string",
        required: true
    },
    adminStatus: {
        type: "string",
        default: "waiting"
    }
})

module.exports = mongoose.model('User', userSchema)