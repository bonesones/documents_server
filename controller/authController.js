const User = require('../models/User')
const { secret } = require('../config')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { EditorState, convertToRaw } = require('draft-js')

const generateAccessToken = function(id) {
    const payload = { id };
    
    return jwt.sign(payload, secret, {
        expiresIn: "24h"
    })
}

let count = 1

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

            const editorState = EditorState.createEmpty();
            const rawState = convertToRaw(editorState.getCurrentContent());
            
            const documentState = {
                title: "Новый текстовый документ",
                document: rawState
            }

            const jsonDocument = JSON.stringify(documentState)

            const user = new User({username: username, password: hashPassword, documents: [jsonDocument]})
            await user.save()

            return res.status(200).json({message: "user has been registered"})
        } catch(e) {
            res.status(400).json({message: e.message})
        }
    }
    async login (req, res) {
        try {
            const {username, password} = req.body;
            const user = await User.findOne({
                username: username
            });

            if(!user) {
                throw Error("Пользователь не найден")
            }

            const isValidPassword = bcryptjs.compareSync(password, user.password);

            if(!isValidPassword) {
                throw Error("Пароль не найден")
                
            }

            const token = generateAccessToken(user._id);
            return res.status(200).json({
                token,
                authorized: true,
                username,
                documents: user.documents
            });

        } catch(e) {
            res.status(403).json({message: e.message})
        }
    }
    async verifyToken (req, res) {
        try {

            const { username } = req.headers;

            const user = await User.findOne({
                username: username
            })

            if(user) {
                res.status(200).json({
                    message: "success",
                    documents: user.documents
                })
            }
        } catch(e) {
            console.log(e)
        }
    }

    async getDocuments (req, res) {
        try {
            const username = req.headers.username;
            
            const user = await User.findOne({
                username: username
            });


            return res.status(200).json({
                documents: user.documents
            })
        } catch(e) {
            console.log(e);
        }
    }

    async addDocument (req, res) {
        try {
            const { username } = req.body

            

            const user = await User.findOne({
                username
            })

            const editorState = EditorState.createEmpty();
            const rawState = convertToRaw(editorState.getCurrentContent());
            const documentState = {
                id: user.documents.length + 1,
                title: "Новый текстовый документ",
                document: rawState
            }
            const jsonDocument = JSON.stringify(documentState)     
            user.documents.push(jsonDocument)
            user.save()

            const user2 = await User.findOne({
                username: username
            })

            console.log(user2)

            console.log(user)
        

            return res.status(200).json({
                message: "Документ добавлен"
            })
        } catch(e) {
            console.log(e)
            return res.status(401)
        }
    }

    async changeDocumentTitle () {
        try {
            const { id, newTitle, username } = req.body;
            const user = await User.findOne({
                username: username
            })
            const documentIndex = user.documents.findIndex(doc => doc.id === id);
            
            user.documents[documentIndex].title = newTitle;
            user.save()

            return res.status(200).json({
                message: "Title has been edited"
            })
        } catch (e) {
            console.log(e)
            return res.status(401)
        }
    }
}

module.exports = new authController()