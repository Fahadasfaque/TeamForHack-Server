const SkillXP = require('../models/SkillXP');

// @desc    Get user's skills
// @route   GET /api/skills/:userId
// @access  Public
const getUserSkills = async (req, res) => {
    try {
        const skills = await SkillXP.find({ userId: req.params.userId }).sort({ xp: -1 });

        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add XP to a skill category
// @route   POST /api/skills/add-xp
// @access  Private
const addXP = async (userId, category, amount) => {
    try {
        let skill = await SkillXP.findOne({ userId, category });

        if (!skill) {
            skill = await SkillXP.create({
                userId,
                category,
                xp: amount,
            });
        } else {
            skill.xp += amount;
        }

        skill.calculateLevel();
        await skill.save();

        return skill;
    } catch (error) {
        console.error('Error adding XP:', error);
    }
};

// @desc    Award XP based on user actions
const awardXP = async (userId, action, data = {}) => {
    let category = 'general';
    let amount = 0;

    switch (action) {
        case 'POST_CREATED':
            amount = 10;
            break;

        case 'REEL_UPLOADED':
            amount = 20;
            category = data.category || 'general';
            break;

        case 'PROJECT_PUBLISHED':
            amount = 50;
            category = data.category || 'general';
            break;

        case 'TEAM_CREATED':
            amount = 30;
            break;

        case 'TASK_COMPLETED':
            amount = 10;
            category = data.category || 'general';
            break;

        case 'HACKATHON_PARTICIPATED':
            amount = 100;
            category = data.category || 'general';
            break;

        default:
            break;
    }

    if (amount > 0) {
        await addXP(userId, category, amount);
    }
};

module.exports = {
    getUserSkills,
    addXP,
    awardXP,
};
