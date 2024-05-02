const User = require('../models/User')
const { secret } = require('../config')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const generateAccessToken = function(id) {
    const payload = { id };
    
    return jwt.sign(payload, secret, {
        expiresIn: "24h"
    })
}

class authController {
    async registration (req, res) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty) {
                throw Error("Поля заполнены неверно")
            }
            const {username, password} = req.body
            const candidate = await User.findOne({username})

            if(candidate) {
                throw Error("Пользователь существует!")
            }
            const hashPassword = bcryptjs.hashSync(password, 7)
            const user = new User({username: username, password: hashPassword})
            await user.save()

            return res.status(200).json({message: "user has been registered"})
        } catch(e) {
            res.status(400).json({message: e.message})
        }
    }
    async login (req, res) {
        try {
            const {username, password} = req.body;
            const user = await User.findOne({username});

            if(!user) {
                throw Error("Пользователь не найден")
            }

            const isValidPassword = bcryptjs.compareSync(password, user.password);

            if(!isValidPassword) {
                throw Error("Пароль не найден")
            }

            const token = generateAccessToken(user._id);
            return res.status(200).json({
                token
            });

        } catch(e) {
            res.status(400).json({message: e.message})
        }
    }
    async getUsers (req, res) {
        try {
            res.json('alles gut')
        } catch(e) {

        }
    }
}

module.exports = new authController()