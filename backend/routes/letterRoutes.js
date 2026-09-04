const express = require('express');
const router = express.Router();
const letterController = require('../controllers/letterController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', letterController.getLetters);
router.get('/:id', letterController.getLetterById);
router.post('/', letterController.createLetter);
router.put('/:id', letterController.updateLetter);
router.delete('/:id', letterController.deleteLetter);

module.exports = router;
