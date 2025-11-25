const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { teamId, title, description, priority, assignedTo, deadline } = req.body;

    try {
        const task = await Task.create({
            teamId,
            title,
            description,
            priority,
            assignedTo,
            deadline,
            createdBy: req.user._id,
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name avatar')
            .populate('createdBy', 'name avatar');

        // Emit socket event for real-time update
        if (req.app.get('io')) {
            req.app.get('io').to(teamId).emit('task-created', populatedTask);
        }

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tasks by team
// @route   GET /api/tasks/team/:teamId
// @access  Private
const getTasksByTeam = async (req, res) => {
    try {
        const tasks = await Task.find({ teamId: req.params.teamId })
            .populate('assignedTo', 'name avatar')
            .populate('createdBy', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            task.status = req.body.status || task.status;
            task.title = req.body.title || task.title;
            task.description = req.body.description || task.description;
            task.assignedTo = req.body.assignedTo || task.assignedTo;

            const updatedTask = await task.save();
            const populatedTask = await Task.findById(updatedTask._id).populate('assignedTo', 'name avatar');

            // Emit socket event for real-time update
            if (req.app.get('io')) {
                req.app.get('io').to(task.teamId.toString()).emit('task-updated', populatedTask);
            }

            res.json(populatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            await task.deleteOne();
            res.json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasksByTeam,
    updateTask,
    deleteTask,
};
