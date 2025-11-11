const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { upload, handleMulterError } = require('../middleware/upload');

router.get('/', userController.getAllUsers);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/password', userController.changePassword);
router.put('/:userId/profile', upload, handleMulterError, userController.updateProfile);

module.exports = router;