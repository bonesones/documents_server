const User = require('../models/User')
const { secret } = require('../config')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { EditorState, convertToRaw } = require('draft-js')
const crypto = require('crypto')

const generateAccessToken = function(id) {
    const payload = { id };
    
    return jwt.sign(payload, secret, {
        expiresIn: "2h"
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

            const editorState = EditorState.createEmpty();
            const rawState = convertToRaw(editorState.getCurrentContent());
            
            const documentState = {
                id: crypto.randomUUID(),
                title: "Новый текстовый документ",
                document: rawState
            }

            const jsonDocument = JSON.stringify(documentState)

            const user = new User({username: username, password: hashPassword, documents: [jsonDocument]})
            user.save()

            return res.status(200).json({
               message: "user has been registered"
            })
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
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.decode(token, secret)

            return res.status(200).json({
                message: "token confirmed"
            })
        } catch(e) {
            console.log(e)
            return res.status(403)
        }
    }
    async getDocuments (req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const { id } = jwt.decode(token, secret)
            
            const user = await User.findById(id)

            return res.status(200).json({
                documents: user.documents
            })
        } catch(e) {
            console.log(e);
        }
    }
    async addDocument (req, res) {
        try {
            const { id } = req.user

            const user = await User.findById(id)

            const editorState = EditorState.createEmpty();
            const rawState = convertToRaw(editorState.getCurrentContent());
            const documentState = {
                id: crypto.randomUUID(),
                title: "Новый текстовый документ",
                document: rawState
            }
            const jsonDocument = JSON.stringify(documentState)     
            user.documents.unshift(jsonDocument)
            user.save()


            return res.status(200).json({
                message: "Документ добавлен"
            })
        } catch(e) {
            console.log(e)
            return res.status(401)
        }
    }

    async changeDocumentTitle (req, res) {
        try {
            const { newTitle, id: documentId } = req.body;
            const { id } = req.user;
            const user = await User.findById(id)

            const documents = user.documents.map(el => JSON.parse(el));
            const newDocuments = documents.map(doc => {
                const temp = Object.assign({}, doc)
                if(temp.id === documentId) {
                    temp.title = newTitle;
                }
                return temp
            })
            
            user.documents = newDocuments.map((doc) => JSON.stringify(doc))
            user.save()

            return res.status(200).json({
                message: "Title has been edited"
            })
        } catch (e) {
            console.log(e)
            return res.status(401)
        }
    }

    async removeDocument(req, res) {
        try {
            const { id: documentId } = req.body;
            const { id } = req.user

            const user = await User.findById(id)

            const documents = user.documents.map(el => JSON.parse(el));

            const newDocuments = documents.filter(doc => {
                if(doc.id === documentId) {
                    return false
                }
                return true
            })
            user.documents = newDocuments.map((doc) => JSON.stringify(doc))
            user.save()
            
            return res.status(200).json({
                message: "Document has been deleted"
            })
        } catch(e) {
            console.log(e)
        }
    }

    async saveDocument (req, res) {
        try {
            const { id: documentId, document: newData } = req.body;
            const { id } = req.user
        
            const user = await User.findById(id)

            const documents = user.documents.map(el => JSON.parse(el));
            const newDocuments = documents.map(doc => {
                const temp = Object.assign({}, doc)
                if(temp.id === documentId) {
                    temp.document = newData;
                } 
                return temp
            })

            user.documents = newDocuments.map((doc) => JSON.stringify(doc))
            user.save()
            
            return res.status(200).json({
                message: "document.saved"
            })
        } catch (e) {
            console.log(e)
            return res.status(401)
        }
    }
}

module.exports = new authController()