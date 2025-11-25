const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    getProject,
    likeProject,
    commentOnProject,
    getUserProjects,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);
router.get('/', getProjects);
router.get('/user/:id', getUserProjects);
router.get('/:id', getProject);
router.post('/:id/like', protect, likeProject);
router.post('/:id/comment', protect, commentOnProject);

module.exports = router;
