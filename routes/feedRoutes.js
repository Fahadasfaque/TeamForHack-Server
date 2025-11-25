const express = require('express');
const router = express.Router();
const {
    getGlobalFeed,
    getFollowingFeed,
    getTrendingFeed,
    getUserPosts,
} = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

router.get('/global', getGlobalFeed);
router.get('/following', protect, getFollowingFeed);
router.get('/trending', getTrendingFeed);
router.get('/user/:id', getUserPosts);

module.exports = router;
