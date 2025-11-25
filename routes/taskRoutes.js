const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasksByTeam,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createTask);
router.route('/team/:teamId').get(protect, getTasksByTeam);
router.route('/:id').patch(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
