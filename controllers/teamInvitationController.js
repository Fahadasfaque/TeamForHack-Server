const Team = require('../models/Team');
const TeamInvitation = require('../models/TeamInvitation');
const Notification = require('../models/Notification');

// @desc    Send team invitation
// @route   POST /api/teams/:id/invite-user
// @access  Private (Team owner only)
const sendTeamInvitation = async (req, res) => {
    const { userId, message } = req.body;
    const teamId = req.params.id;

    try {
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if requester is team owner
        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team owner can send invitations' });
        }

        // Check if user is already a member
        if (team.members.includes(userId)) {
            return res.status(400).json({ message: 'User is already a team member' });
        }

        // Check if invitation already exists
        const existingInvitation = await TeamInvitation.findOne({
            team: teamId,
            receiver: userId,
            status: 'pending',
        });

        if (existingInvitation) {
            return res.status(400).json({ message: 'Invitation already sent' });
        }

        // Create invitation
        const invitation = await TeamInvitation.create({
            team: teamId,
            sender: req.user._id,
            receiver: userId,
            message: message || '',
        });

        // Create notification
        await Notification.create({
            recipient: userId,
            sender: req.user._id,
            type: 'team_invitation',
            message: `${req.user.name} invited you to join ${team.name}`,
            link: `/teams/invitations`,
        });

        const populatedInvitation = await TeamInvitation.findById(invitation._id)
            .populate('team', 'name description')
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar');

        res.status(201).json(populatedInvitation);
    } catch (error) {
        console.error('Send invitation error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's pending invitations
// @route   GET /api/teams/invitations/my
// @access  Private
const getMyInvitations = async (req, res) => {
    try {
        const invitations = await TeamInvitation.find({
            receiver: req.user._id,
            status: 'pending',
        })
            .populate('team', 'name description')
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept team invitation
// @route   POST /api/teams/invitations/:id/accept
// @access  Private
const acceptInvitation = async (req, res) => {
    try {
        const invitation = await TeamInvitation.findById(req.params.id);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Check if user is the receiver
        if (invitation.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation already processed' });
        }

        // Update invitation status
        invitation.status = 'accepted';
        await invitation.save();

        // Add user to team
        const team = await Team.findById(invitation.team);
        if (!team.members.includes(req.user._id)) {
            team.members.push(req.user._id);
            await team.save();
        }

        // Create notification for team owner
        await Notification.create({
            recipient: team.owner,
            sender: req.user._id,
            type: 'team_join',
            message: `${req.user.name} accepted your team invitation`,
            link: `/team/${team._id}`,
        });

        res.json({ message: 'Invitation accepted', team });
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject team invitation
// @route   POST /api/teams/invitations/:id/reject
// @access  Private
const rejectInvitation = async (req, res) => {
    try {
        const invitation = await TeamInvitation.findById(req.params.id);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Check if user is the receiver
        if (invitation.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation already processed' });
        }

        // Update invitation status
        invitation.status = 'rejected';
        await invitation.save();

        res.json({ message: 'Invitation rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendTeamInvitation,
    getMyInvitations,
    acceptInvitation,
    rejectInvitation,
};
