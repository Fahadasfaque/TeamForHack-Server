const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Follow a user
// @route   POST /api/follow/:id
// @access  Private
const followUser = async (req, res) => {
    const userToFollow = req.params.id;

    if (userToFollow === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    try {
        // Check if user exists
        const targetUser = await User.findById(userToFollow);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        const existingFollow = await Follow.findOne({
            follower: req.user._id,
            following: userToFollow,
        });

        if (existingFollow) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Create follow relationship
        await Follow.create({
            follower: req.user._id,
            following: userToFollow,
        });

        // Create notification
        await Notification.create({
            recipient: userToFollow,
            sender: req.user._id,
            type: 'follow',
            message: `${req.user.name} started following you`,
            link: `/profile/${req.user._id}`,
        });

        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unfollow a user
// @route   DELETE /api/follow/:id
// @access  Private
const unfollowUser = async (req, res) => {
    const userToUnfollow = req.params.id;

    try {
        const result = await Follow.findOneAndDelete({
            follower: req.user._id,
            following: userToUnfollow,
        });

        if (!result) {
            return res.status(404).json({ message: 'Not following this user' });
        }

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's followers
// @route   GET /api/follow/:id/followers
// @access  Public
const getFollowers = async (req, res) => {
    try {
        const followers = await Follow.find({ following: req.params.id })
            .populate('follower', 'name avatar bio')
            .sort({ createdAt: -1 });

        res.json(followers.map((f) => f.follower));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get users being followed
// @route   GET /api/follow/:id/following
// @access  Public
const getFollowing = async (req, res) => {
    try {
        const following = await Follow.find({ follower: req.params.id })
            .populate('following', 'name avatar bio')
            .sort({ createdAt: -1 });

        res.json(following.map((f) => f.following));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if current user follows another user
// @route   GET /api/follow/:id/check
// @access  Private
const checkFollowing = async (req, res) => {
    try {
        const isFollowing = await Follow.findOne({
            follower: req.user._id,
            following: req.params.id,
        });

        res.json({ isFollowing: !!isFollowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get suggested users to follow
// @route   GET /api/follow/suggestions
// @access  Private
const getSuggestedUsers = async (req, res) => {
    try {
        // Get users current user is already following
        const following = await Follow.find({ follower: req.user._id }).select(
            'following'
        );
        const followingIds = following.map((f) => f.following);

        // Find users not being followed, excluding self
        const suggestions = await User.find({
            _id: { $nin: [...followingIds, req.user._id] },
        })
            .select('name avatar bio skills')
            .limit(10);

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkFollowing,
    getSuggestedUsers,
};
