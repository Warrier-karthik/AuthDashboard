require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../model/User')
const router = express.Router()
const bcrypt = require('bcrypt')

router.get('/post', authentication, async(req, res)=> {
    const users = await User.find({}) 
    res.json(users.filter(user => user.Uname === req.user.username))
})

router.post('/setStatus', authentication, async(req, res) => {
    const safeWords = ['accept', 'deny', 'wait']
    try {
        const user = await User.findOne({Uname:req.user.username})
        if (!user || user.Role !== "admin") {
            return res.status(403).json({message: "Unauthorized!!"})
        }
        const subject = await User.findOne({Uname: req.body.username})
        if (!subject) {
            res.json({message: "subject user not found... check username again"})
        } else {
            safeWords.includes(req.body.status) ? await subject.updateOne({"adminStatus": `${req.body.status}`}) : res.json({message : `cannot set status to ${req.body.status}`})
            res.json({message: `successfully updated the admin status of ${req.body.username} to ${req.body.status}`})
        }

    } catch(err) {
        console.log(err)
        return res.status(500).json({error: "internal server error"})
    }
})

router.post('/register', async (req, res) => {
    const {username, email, password, role} = req.body
    const name = await User.find({Uname:username}).exec()
    const encryptPassword = await bcrypt.hash(password, 10)
    const user = new User({
        Uname: username,
        email: email,
        password: encryptPassword,
        Role: role
    })
    if (name.length !== 0) {
        res.status(200).json({message: "username already exists"})
    } else {
        await user.save()
        res.status(200).json({message: "registeration successful"})
    }    
})
router.post('/login', async (req, res) => {
    const {username, password} = req.body
    const user = await User.find({Uname: username}).exec()

    if (await bcrypt.compare(password, user[0].password)) {
        const token = jwt.sign({username: user[0].Uname}, process.env.ACCESS_TOKEN, {expiresIn:"5m"})
        res.json({message: `welcome ${username}`, token:token})
    }

})

function authentication(req, res, next) {
    const authHeader = req.headers['authorization']
    console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1]
    token === null ? res.status(401).json({message: "User not found"}) : jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.status(403).json({message: "please login"})
        console.log(user)
        req.user = user
        next()
    })
}
module.exports = router