const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', gameController.getGames);
router.post('/', gameController.createGame);
router.post('/generate-quiz', gameController.generateMemoryQuiz);
router.get('/spin', gameController.spinMemory);
router.get('/this-or-that', gameController.getThisOrThatQuestions);
router.post('/result', gameController.submitResult);

module.exports = router;
