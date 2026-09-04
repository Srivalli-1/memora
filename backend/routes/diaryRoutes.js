const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', diaryController.getDiaryEntries);
router.get('/:id', diaryController.getDiaryEntryById);
router.post('/', uploadMultiple('images', 5), diaryController.createDiaryEntry);
router.put('/:id', uploadMultiple('images', 5), diaryController.updateDiaryEntry);
router.delete('/:id', diaryController.deleteDiaryEntry);
router.delete('/:id/images/:imageId', diaryController.deleteDiaryImage);

module.exports = router;
