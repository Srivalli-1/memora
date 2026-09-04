const express = require('express');
const router = express.Router();
const sharedSpaceController = require('../controllers/sharedSpaceController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', sharedSpaceController.getMySpaces);
router.get('/:id', sharedSpaceController.getSpaceById);
router.post('/', uploadSingle('coverImage'), sharedSpaceController.createSpace);
router.put('/:id', uploadSingle('coverImage'), sharedSpaceController.updateSpace);
router.delete('/:id', sharedSpaceController.deleteSpace);

router.post('/:id/invite', sharedSpaceController.inviteUserToSpace);
router.post('/invitations/:invitationId/respond', sharedSpaceController.respondToInvitation);
router.delete('/:id/members/:memberUserId', sharedSpaceController.removeMember);

module.exports = router;
