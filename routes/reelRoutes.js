const express = require('express');
const router = express.Router();
const {
    uploadReel,
    getTrendingReels,
    getReels,
    getUserReels,
    getReel,
    incrementView,
    likeReel,
    commentOnReel,
    deleteReel,
} = require('../controllers/reelController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, uploadReel);
router.get('/trending', getTrendingReels);
router.get('/user/:id', getUserReels);
router.get('/:id', getReel);
router.delete('/:id', protect, deleteReel);
router.post('/:id/view', incrementView);
router.post('/:id/like', protect, likeReel);
router.post('/:id/comment', protect, commentOnReel);
router.get('/', getReels);

module.exports = router;
