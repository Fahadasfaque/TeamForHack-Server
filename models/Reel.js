const mongoose = require('mongoose');

const reelSchema = mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
        },
        caption: {
            type: String,
            maxlength: 500,
        },
        duration: {
            type: Number, // in seconds
        },
        views: {
            type: Number,
            default: 0,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        commentCount: {
            type: Number,
            default: 0,
        },
        tags: [
            {
                type: String,
            },
        ],
        hackathonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hackathon',
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
    },
    {
        timestamps: true,
    }
);

// Index for feed queries
reelSchema.index({ createdAt: -1 });
reelSchema.index({ views: -1 });
reelSchema.index({ creator: 1, createdAt: -1 });

const Reel = mongoose.model('Reel', reelSchema);

module.exports = Reel;
