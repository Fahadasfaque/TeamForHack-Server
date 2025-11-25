const mongoose = require('mongoose');

const teamInvitationSchema = mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
        message: {
            type: String,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Index for queries
teamInvitationSchema.index({ receiver: 1, status: 1 });
teamInvitationSchema.index({ team: 1, status: 1 });

const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);

module.exports = TeamInvitation;
