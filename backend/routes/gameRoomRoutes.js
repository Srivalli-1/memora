const express = require('express');
const router = express.Router();
const gameRoomController = require('../controllers/gameRoomController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', gameRoomController.createGameRoom);
router.get('/:gameRoomId', gameRoomController.getGameRoom);
router.post('/:gameRoomId/join', gameRoomController.joinGameRoom);
router.post('/:gameRoomId/ready', gameRoomController.setPlayerReady);
router.post('/:gameRoomId/submit-answer', gameRoomController.submitAnswer);
router.post('/:gameRoomId/complete', gameRoomController.completeGameRoom);
router.post('/:gameRoomId/leave', gameRoomController.leaveGameRoom);

module.exports = router;
