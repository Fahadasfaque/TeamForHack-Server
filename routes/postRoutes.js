const express = require('express');
const router = express.Router();
const {
    createPost,
    getPost,
    likePost,
    commentOnPost,
    getPostComments,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.get('/:id', getPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentOnPost);
router.get('/:id/comments', getPostComments);

module.exports = router;
