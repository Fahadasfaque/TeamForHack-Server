const express = require('express');
const router = express.Router();
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkFollowing,
    getSuggestedUsers,
} = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

router.get('/suggestions', protect, getSuggestedUsers);
router.post('/:id', protect, followUser);
router.delete('/:id', protect, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/:id/check', protect, checkFollowing);

module.exports = router;
