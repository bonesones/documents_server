const jwt = require('jsonwebtoken')
const {secret} = require('../config')

module.exports = function (req, res, next) {
    if(req.method === "OPTIONS") {
        next()
    }

    try {
        console.log(req.headers)
        const token = req.headers.authorization.split(' ')[1]

        if(!token) {
            throw Error('Токен отсутствует')
        }

        const decodedData = jwt.verify(token, secret)

        console.log(decodedData)
        req.user = decodedData;
        next()

    } catch(e) {
        console.log(e)
        return res.status(403).json({message: "Пользователь не авторизован"})
    }
}