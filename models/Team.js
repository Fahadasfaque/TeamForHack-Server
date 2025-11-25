const mongoose = require('mongoose');

const teamSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        logo: {
            type: String,
            default: '',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        hackathon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hackathon',
        },
        invites: [
            {
                email: String,
                status: {
                    type: String,
                    enum: ['Pending', 'Accepted', 'Declined'],
                    default: 'Pending',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
