const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        country: {
            type: String,
            default: '',
        },
        education: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        socialLinks: {
            github: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            portfolio: { type: String, default: '' },
            devpost: { type: String, default: '' },
        },
        onboardingComplete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
