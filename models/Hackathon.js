const mongoose = require('mongoose');

const hackathonSchema = mongoose.Schema(
    {
        // Basic Information
        title: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
            default: '',
        },
        banner: {
            type: String,
            default: '',
        },
        organizer: {
            type: String,
            required: true,
        },
        hostedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Dates and Timing
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        registrationDeadline: {
            type: Date,
            required: true,
        },

        // Details
        description: {
            type: String,
            required: true,
        },
        theme: {
            type: String,
            required: true,
        },
        objective: {
            type: String,
            default: '',
        },

        // Location
        isOnline: {
            type: Boolean,
            default: true,
        },
        location: {
            type: String,
            default: 'Online',
        },
        whatsappLink: {
            type: String,
            default: '',
        },

        // Rules and Guidelines
        rules: [{
            type: String,
        }],

        // Prizes
        prizes: [{
            place: String,          // "1st Place", "2nd Place", etc.
            reward: String,         // "$10,000", "Internship + $5,000"
            description: String,    // Additional details
        }],

        // Eligibility
        eligibility: {
            type: String,
            required: true,
        },

        // Schedule
        schedule: [{
            time: String,           // "10:00 AM"
            title: String,          // "Opening Ceremony"
            description: String,    // Details
        }],

        // Sponsors
        sponsors: [{
            name: String,
            logo: String,
            website: String,
        }],

        // FAQ
        faq: [{
            question: String,
            answer: String,
        }],

        // Contact
        contactEmail: {
            type: String,
            default: '',
        },
        contactPhone: {
            type: String,
            default: '',
        },

        // Participation
        maxTeams: {
            type: Number,
            default: 100,
        },
        participatingTeams: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
        }],

        // Status
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed'],
            default: 'upcoming',
        },
    },
    {
        timestamps: true,
    }
);

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

module.exports = Hackathon;
