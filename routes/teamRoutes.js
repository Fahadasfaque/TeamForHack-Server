const express = require('express');
const router = express.Router();
const {
    createTeam,
    getMyTeams,
    getTeamById,
    inviteMember,
    updateTeam,
    deleteTeam,
    removeMember,
} = require('../controllers/teamController');
const {
    sendTeamInvitation,
    getMyInvitations,
    acceptInvitation,
    rejectInvitation,
} = require('../controllers/teamInvitationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createTeam);
router.route('/my').get(protect, getMyTeams);
router.route('/invitations/my').get(protect, getMyInvitations);
router.route('/invitations/:id/accept').post(protect, acceptInvitation);
router.route('/invitations/:id/reject').post(protect, rejectInvitation);
router.route('/:id').get(protect, getTeamById).put(protect, updateTeam).delete(protect, deleteTeam);
router.route('/:id/invite').post(protect, inviteMember);
router.route('/:id/invite-user').post(protect, sendTeamInvitation);
router.route('/:id/members/:memberId').delete(protect, removeMember);

module.exports = router;
