const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', memoryController.getMemories);
router.get('/:id', memoryController.getMemoryById);
router.post('/', uploadMultiple('images', 10), memoryController.createMemory);
router.put('/:id', uploadMultiple('images', 10), memoryController.updateMemory);
router.delete('/:id', memoryController.deleteMemory);
router.delete('/:id/images/:imageId', memoryController.deleteMemoryImage);

module.exports = router;
