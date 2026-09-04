const express = require('express');
const router = express.Router();
const commitmentController = require('../controllers/commitmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', commitmentController.getCommitments);
router.get('/:id', commitmentController.getCommitmentById);
router.post('/', commitmentController.createCommitment);
router.put('/:id', commitmentController.updateCommitment);
router.post('/:id/sign', commitmentController.signCommitment);
router.patch('/:id/complete', commitmentController.completeCommitment);
router.delete('/:id', commitmentController.deleteCommitment);

module.exports = router;
