const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', timelineController.getTimelineEvents);
router.post('/', uploadMultiple('images', 5), timelineController.createTimelineEvent);
router.put('/:id', uploadMultiple('images', 5), timelineController.updateTimelineEvent);
router.delete('/:id', timelineController.deleteTimelineEvent);

module.exports = router;
