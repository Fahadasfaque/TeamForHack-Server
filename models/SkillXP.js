const mongoose = require('mongoose');

const skillXPSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: String,
            enum: [
                'web_dev',
                'mobile_dev',
                'ai_ml',
                'design',
                'cloud',
                'blockchain',
                'cybersecurity',
                'general',
            ],
            required: true,
        },
        xp: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one skill per user per category
skillXPSchema.index({ userId: 1, category: 1 }, { unique: true });

// Method to calculate level from XP
skillXPSchema.methods.calculateLevel = function () {
    // Formula: level = floor(sqrt(xp / 100))
    this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
    return this.level;
};

// Method to get XP needed for next level
skillXPSchema.methods.getXPForNextLevel = function () {
    const nextLevel = this.level + 1;
    return nextLevel * nextLevel * 100;
};

const SkillXP = mongoose.model('SkillXP', skillXPSchema);

module.exports = SkillXP;
