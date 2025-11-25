const Reel = require('../models/Reel');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @desc    Upload a new reel
// @route   POST /api/reels
// @access  Private
const uploadReel = async (req, res) => {
    const { videoUrl, thumbnail, caption, duration, tags, hackathonId, projectId } = req.body;

    try {
        const reel = await Reel.create({
            creator: req.user._id,
            videoUrl,
            thumbnail,
            caption,
            duration,
            tags: tags || [],
            hackathonId,
            projectId,
        });

        const populatedReel = await Reel.findById(reel._id).populate('creator', 'name avatar');

        res.status(201).json(populatedReel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trending reels
// @route   GET /api/reels/trending
// @access  Public
const getTrendingReels = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const reels = await Reel.find({ createdAt: { $gte: oneDayAgo } })
            .populate('creator', 'name avatar')
            .sort({ views: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            reels,
            page,
            hasMore: reels.length === limit,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reels (for feed)
// @route   GET /api/reels
// @access  Public
const getReels = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const reels = await Reel.find()
            .populate('creator', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            reels,
            page,
            hasMore: reels.length === limit,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's reels
// @route   GET /api/reels/user/:id
// @access  Public
const getUserReels = async (req, res) => {
    try {
        const reels = await Reel.find({ creator: req.params.id })
            .populate('creator', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(reels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reel by ID
// @route   GET /api/reels/:id
// @access  Public
const getReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id).populate('creator', 'name avatar');

        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }

        res.json(reel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment reel view count
// @route   POST /api/reels/:id/view
// @access  Public
const incrementView = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }

        reel.views += 1;
        await reel.save();

        res.json({ views: reel.views });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like/unlike a reel
// @route   POST /api/reels/:id/like
// @access  Private
const likeReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }

        const likeIndex = reel.likes.indexOf(req.user._id);

        if (likeIndex > -1) {
            // Unlike
            reel.likes.splice(likeIndex, 1);
        } else {
            // Like
            reel.likes.push(req.user._id);

            // Create notification if not own reel
            if (reel.creator.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: reel.creator,
                    sender: req.user._id,
                    type: 'like_reel',
                    message: `${req.user.name} liked your reel`,
                    link: `/reels/${reel._id}`,
                });
            }
        }

        await reel.save();
        res.json({ likes: reel.likes.length, liked: likeIndex === -1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Comment on a reel
// @route   POST /api/reels/:id/comment
// @access  Private
const commentOnReel = async (req, res) => {
    const { content } = req.body;

    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }

        const comment = await Comment.create({
            author: req.user._id,
            content,
            targetType: 'Reel',
            targetId: reel._id,
        });

        reel.commentCount += 1;
        await reel.save();

        // Create notification for reel creator
        if (reel.creator.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: reel.creator,
                sender: req.user._id,
                type: 'comment_reel',
                message: `${req.user.name} commented on your reel`,
                link: `/reels/${reel._id}`,
            });
        }

        // Fetch all comments for this reel
        const allComments = await Comment.find({ targetType: 'Reel', targetId: reel._id })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(201).json({
            comments: allComments,
            commentCount: reel.commentCount,
        });
    } catch (error) {
        console.error('Comment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Private
const deleteReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }

        // Check if user is the creator
        if (reel.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this reel' });
        }

        await reel.deleteOne();
        res.json({ message: 'Reel deleted successfully' });
    } catch (error) {
        console.error('Delete reel error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadReel,
    getTrendingReels,
    getReels,
    getUserReels,
    getReel,
    incrementView,
    likeReel,
    commentOnReel,
    deleteReel,
};
