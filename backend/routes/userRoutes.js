const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/profile', userController.getProfileAndStats);
router.put('/profile', uploadSingle('avatar'), userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);

module.exports = router;
