const express = require('express');
const router = express.Router();
const {
    getHackathons,
    getHackathonById,
    createHackathon,
    updateHackathon,
    joinHackathon,
    leaveHackathon,
    getMyHostedHackathons,
    deleteHackathon,
} = require('../controllers/hackathonController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getHackathons).post(protect, createHackathon);
router.route('/my-hosted').get(protect, getMyHostedHackathons);
router.route('/:id').get(getHackathonById).put(protect, updateHackathon).delete(protect, deleteHackathon);
router.route('/:id/join').post(protect, joinHackathon);
router.route('/:id/leave').post(protect, leaveHackathon);

module.exports = router;
