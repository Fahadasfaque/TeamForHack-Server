const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @desc    Create/publish a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    const {
        title,
        description,
        techStack,
        images,
        videoUrl,
        repoLink,
        liveLink,
        hackathonId,
        teamMembers,
        tags,
    } = req.body;

    try {
        const project = await Project.create({
            title,
            description,
            creator: req.user._id,
            techStack: techStack || [],
            images: images || [],
            videoUrl,
            repoLink,
            liveLink,
            hackathonId,
            teamMembers: teamMembers || [],
            tags: tags || [],
        });

        const populatedProject = await Project.findById(project._id)
            .populate('creator', 'name avatar')
            .populate('teamMembers', 'name avatar');

        res.status(201).json(populatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all projects (discovery)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { techStack, hackathon, featured } = req.query;

    try {
        const filter = {};
        if (techStack) filter.techStack = techStack;
        if (hackathon) filter.hackathonId = hackathon;
        if (featured === 'true') filter.featured = true;

        const projects = await Project.find(filter)
            .populate('creator', 'name avatar')
            .populate('teamMembers', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            projects,
            page,
            hasMore: projects.length === limit,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('creator', 'name avatar bio')
            .populate('teamMembers', 'name avatar')
            .populate('hackathonId', 'title');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Increment views
        project.views += 1;
        await project.save();

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like/unlike a project
// @route   POST /api/projects/:id/like
// @access  Private
const likeProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const likeIndex = project.likes.indexOf(req.user._id);

        if (likeIndex > -1) {
            // Unlike
            project.likes.splice(likeIndex, 1);
        } else {
            // Like
            project.likes.push(req.user._id);

            // Create notification
            if (project.creator.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: project.creator,
                    sender: req.user._id,
                    type: 'like_project',
                    message: `${req.user.name} liked your project "${project.title}"`,
                    link: `/projects/${project._id}`,
                });
            }
        }

        await project.save();
        res.json({ likes: project.likes.length, liked: likeIndex === -1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Comment on a project
// @route   POST /api/projects/:id/comment
// @access  Private
const commentOnProject = async (req, res) => {
    const { content } = req.body;

    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const comment = await Comment.create({
            author: req.user._id,
            content,
            targetType: 'Project',
            targetId: project._id,
        });

        project.commentCount += 1;
        await project.save();

        const populatedComment = await Comment.findById(comment._id).populate(
            'author',
            'name avatar'
        );

        // Create notification
        if (project.creator.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: project.creator,
                sender: req.user._id,
                type: 'comment_project',
                message: `${req.user.name} commented on your project "${project.title}"`,
                link: `/projects/${project._id}`,
            });
        }

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's projects
// @route   GET /api/projects/user/:id
// @access  Public
const getUserProjects = async (req, res) => {
    try {
        const projects = await Project.find({ creator: req.params.id })
            .populate('creator', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProject,
    likeProject,
    commentOnProject,
    getUserProjects,
};
