const Post = require('../models/Post');
const Follow = require('../models/Follow');

// @desc    Get global feed (algorithmic)
// @route   GET /api/feed/global
// @access  Public
const getGlobalFeed = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
        const posts = await Post.find()
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Simple ranking: newer posts with more engagement score higher
        const rankedPosts = posts.map((post) => ({
            ...post.toObject(),
            score:
                post.likes.length * 2 +
                post.commentCount * 3 +
                (Date.now() - post.createdAt) / (1000 * 60 * 60), // Recency factor
        }));

        rankedPosts.sort((a, b) => b.score - a.score);

        res.json({
            posts: rankedPosts,
            page,
            hasMore: posts.length === limit,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get following feed
// @route   GET /api/feed/following
// @access  Private
const getFollowingFeed = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
        // Get users current user is following
        const following = await Follow.find({ follower: req.user._id }).select(
            'following'
        );
        const followingIds = following.map((f) => f.following);

        // Get posts from followed users
        const posts = await Post.find({ author: { $in: followingIds } })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            posts,
            page,
            hasMore: posts.length === limit,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trending feed (last 24h, most engaged)
// @route   GET /api/feed/trending
// @access  Public
const getTrendingFeed = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const posts = await Post.find({ createdAt: { $gte: oneDayAgo } })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(100); // Get more posts to rank

        // Rank by engagement
        const rankedPosts = posts
            .map((post) => ({
                ...post.toObject(),
                engagementScore: post.likes.length * 2 + post.commentCount * 3,
            }))
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(skip, skip + limit);

        res.json({
            posts: rankedPosts,
            page,
            hasMore: rankedPosts.length === limit,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's posts
// @route   GET /api/feed/user/:id
// @access  Public
const getUserPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
        const posts = await Post.find({ author: req.params.id })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            posts,
            page,
            hasMore: posts.length === limit,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGlobalFeed,
    getFollowingFeed,
    getTrendingFeed,
    getUserPosts,
};
