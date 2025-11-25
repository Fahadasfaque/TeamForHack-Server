const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        techStack: [
            {
                type: String,
            },
        ],
        images: [
            {
                type: String,
            },
        ],
        videoUrl: {
            type: String,
        },
        repoLink: {
            type: String,
        },
        liveLink: {
            type: String,
        },
        hackathonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hackathon',
        },
        teamMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
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
        views: {
            type: Number,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        tags: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for discovery queries
projectSchema.index({ createdAt: -1 });
projectSchema.index({ views: -1 });
projectSchema.index({ featured: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
