const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');

// Achievement definitions
const ACHIEVEMENTS = {
    FIRST_POST: {
        type: 'content_creator',
        name: 'First Post',
        description: 'Created your first post',
        icon: '📝',
        tier: 'bronze',
    },
    FIRST_REEL: {
        type: 'content_creator',
        name: 'Video Creator',
        description: 'Uploaded your first reel',
        icon: '🎥',
        tier: 'bronze',
    },
    FIRST_PROJECT: {
        type: 'project_showcase',
        name: 'Project Publisher',
        description: 'Published your first project',
        icon: '🚀',
        tier: 'bronze',
    },
    FIRST_TEAM: {
        type: 'team_leader',
        name: 'Team Founder',
        description: 'Created your first team',
        icon: '👥',
        tier: 'bronze',
    },
    SOCIAL_10: {
        type: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Got 10 followers',
        icon: '🦋',
        tier: 'silver',
    },
    VIRAL_REEL: {
        type: 'content_creator',
        name: 'Viral Creator',
        description: 'Got 10K views on a reel',
        icon: '🔥',
        tier: 'gold',
    },
};

// @desc    Get user achievements
// @route   GET /api/achievements/:userId
// @access  Public
const getUserAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find({ userId: req.params.userId }).sort({
            createdAt: -1,
        });

        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Award achievement to user
// @route   POST /api/achievements/award
// @access  Private (internal use)
const awardAchievement = async (userId, achievementKey) => {
    try {
        const achievementDef = ACHIEVEMENTS[achievementKey];
        if (!achievementDef) return;

        // Check if already awarded
        const existing = await Achievement.findOne({
            userId,
            type: achievementDef.type,
            name: achievementDef.name,
        });

        if (existing) return;

        // Create achievement
        const achievement = await Achievement.create({
            userId,
            ...achievementDef,
            unlocked: true,
        });

        // Create notification
        await Notification.create({
            recipient: userId,
            type: 'achievement',
            message: `Achievement unlocked: ${achievementDef.name}!`,
            link: '/achievements',
        });

        return achievement;
    } catch (error) {
        console.error('Error awarding achievement:', error);
    }
};

// @desc    Check and award achievements based on user actions
const checkAchievements = async (userId, action, data = {}) => {
    switch (action) {
        case 'POST_CREATED':
            await awardAchievement(userId, 'FIRST_POST');
            break;

        case 'REEL_UPLOADED':
            await awardAchievement(userId, 'FIRST_REEL');
            if (data.views >= 10000) {
                await awardAchievement(userId, 'VIRAL_REEL');
            }
            break;

        case 'PROJECT_PUBLISHED':
            await awardAchievement(userId, 'FIRST_PROJECT');
            break;

        case 'TEAM_CREATED':
            await awardAchievement(userId, 'FIRST_TEAM');
            break;

        case 'FOLLOWER_COUNT':
            if (data.count >= 10) {
                await awardAchievement(userId, 'SOCIAL_10');
            }
            break;

        default:
            break;
    }
};

module.exports = {
    getUserAchievements,
    awardAchievement,
    checkAchievements,
};
