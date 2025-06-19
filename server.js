const express = require('express')
const authRouter = require('./routes/auth')
const mongoose = require('mongoose')
const app = express()
app.use(express.json())

app.use('/auth', authRouter)
mongoose.connect('mongodb://localhost/dashBoard')
app.listen(process.env.PORT || 3000, (error) => {
    if (error) throw error
})