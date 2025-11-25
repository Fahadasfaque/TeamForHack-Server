const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    const { content, images, tags, mentions } = req.body;

    try {
        const post = await Post.create({
            author: req.user._id,
            content,
            images: images || [],
            tags: tags || [],
            mentions: mentions || [],
        });

        const populatedPost = await Post.findById(post._id).populate(
            'author',
            'name avatar'
        );

        // Create notifications for mentions
        if (mentions && mentions.length > 0) {
            const notifications = mentions.map((userId) => ({
                recipient: userId,
                sender: req.user._id,
                type: 'mention',
                message: `${req.user.name} mentioned you in a post`,
                link: `/post/${post._id}`,
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name avatar')
            .populate('mentions', 'name avatar');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like/unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(req.user._id);

            // Create notification if not own post
            if (post.author.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: post.author,
                    sender: req.user._id,
                    type: 'like_post',
                    message: `${req.user.name} liked your post`,
                    link: `/post/${post._id}`,
                });
            }
        }

        await post.save();
        res.json({ likes: post.likes.length, liked: likeIndex === -1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
const commentOnPost = async (req, res) => {
    const { content, mentions } = req.body;

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = await Comment.create({
            author: req.user._id,
            content,
            targetType: 'Post',
            targetId: post._id,
            mentions: mentions || [],
        });

        post.commentCount += 1;
        await post.save();

        const populatedComment = await Comment.findById(comment._id).populate(
            'author',
            'name avatar'
        );

        // Create notification for post author
        if (post.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: 'comment_post',
                message: `${req.user.name} commented on your post`,
                link: `/post/${post._id}`,
            });
        }

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
const getPostComments = async (req, res) => {
    try {
        const comments = await Comment.find({
            targetType: 'Post',
            targetId: req.params.id,
            parentId: null, // Only top-level comments
        })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPost,
    getPost,
    likePost,
    commentOnPost,
    getPostComments,
};
