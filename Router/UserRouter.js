const router = require('express').Router();
const Auth = require('../Middleware/AuthMiddleware');
const Admin = require('../Middleware/AdminMiddleware');
const UserController = require('../Controllers/UserController');

router.get('/', [Auth, Admin], UserController.users);

router.get('/me', [Auth], UserController.getMe);

router.patch('/me', [Auth], UserController.updateMe);

// router.post('/', UserController.store);

router.patch('/:id', UserController.updateUser);

router.delete('/:id', UserController.deleteUser);

router.post('/login', UserController.login);

router.post('/register', UserController.register);

router.post('/forgot-password', UserController.forgotPassword);


module.exports = router;