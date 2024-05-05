const Router = require('express')
const controller = require('../controller/authController')
const { check } = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware')
const router = new Router()


router.post('/registration',[
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('username', 'Пароль должен содержать больше 4 символов').isLength({ min: 4 })],
    controller.registration)
router.post('/login', controller.login)
router.get('/verify', authMiddleware, controller.verifyToken)
router.post('/addDocument', controller.addDocument);
router.get('/getDocuments', authMiddleware, controller.getDocuments)
router.post('/changeTitle', authMiddleware, controller.changeDocumentTitle)

module.exports = router