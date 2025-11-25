const mongoose = require('mongoose');

const achievementSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: [
                'hackathon_participation',
                'team_leader',
                'content_creator',
                'skill_master',
                'project_showcase',
                'social_butterfly',
                'early_adopter',
            ],
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        icon: {
            type: String,
        },
        tier: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            default: 'bronze',
        },
        progress: {
            current: { type: Number, default: 0 },
            target: { type: Number, default: 1 },
        },
        unlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for querying user achievements
achievementSchema.index({ userId: 1, type: 1 });
achievementSchema.index({ userId: 1, unlocked: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
