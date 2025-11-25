const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
    const { name, description, hackathonId } = req.body;

    try {
        console.log('Creating team with:', { name, description, hackathonId, userId: req.user._id });

        const team = await Team.create({
            name,
            description,
            hackathon: hackathonId || null,
            owner: req.user._id,
            createdBy: req.user._id,
            members: [req.user._id],
        });

        const populatedTeam = await Team.findById(team._id)
            .populate('owner', 'name avatar email')
            .populate('members', 'name avatar email')
            .populate('hackathon', 'title');

        res.status(201).json(populatedTeam);
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's teams
// @route   GET /api/teams/my
// @access  Private
const getMyTeams = async (req, res) => {
    try {
        const teams = await Team.find({ members: req.user._id })
            .populate('owner', 'name avatar email')
            .populate('members', 'name avatar email')
            .populate('hackathon', 'title');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('owner', 'name avatar email')
            .populate('members', 'name avatar email')
            .populate('hackathon', 'title');

        if (team) {
            // Check if user is member
            const isMember = team.members.some(
                (member) => member._id.toString() === req.user._id.toString()
            );

            if (!isMember) {
                return res.status(401).json({ message: 'Not authorized to view this team' });
            }

            res.json(team);
        } else {
            res.status(404).json({ message: 'Team not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Invite member to team
// @route   POST /api/teams/:id/invite
// @access  Private
const inviteMember = async (req, res) => {
    const { email } = req.body;

    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if requester is owner
        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only owner can invite members' });
        }

        // Check if user exists
        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already member
        const isMember = team.members.some(
            (member) => member.toString() === userToInvite._id.toString()
        );

        if (isMember) {
            return res.status(400).json({ message: 'User already in team' });
        }

        // Add to members
        team.members.push(userToInvite._id);
        await team.save();

        const updatedTeam = await Team.findById(team._id)
            .populate('owner', 'name avatar email')
            .populate('members', 'name avatar email');

        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Owner only)
const updateTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if requester is owner
        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only owner can update team' });
        }

        team.name = req.body.name || team.name;
        team.description = req.body.description || team.description;

        const updatedTeam = await team.save();
        const populatedTeam = await Team.findById(updatedTeam._id)
            .populate('owner', 'name avatar email')
            .populate('members', 'name avatar email');

        res.json(populatedTeam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Owner only)
const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if requester is owner
        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only owner can delete team' });
        }

        await team.deleteOne();
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:memberId
// @access  Private (Owner or self)
const removeMember = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const isOwner = team.owner.toString() === req.user._id.toString();
        const isSelf = req.params.memberId === req.user._id.toString();

        // Only owner can remove others, anyone can remove themselves
        if (!isOwner && !isSelf) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Can't remove owner
        if (req.params.memberId === team.owner.toString()) {
            return res.status(400).json({ message: 'Cannot remove team owner' });
        }

        team.members = team.members.filter(
            (member) => member.toString() !== req.params.memberId
        );

        await team.save();

        const updatedTeam = await Team.findById(team._id)
            .populate('owner', 'name avatar email')
            .populate('members', 'name avatar email');

        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTeam,
    getMyTeams,
    getTeamById,
    inviteMember,
    updateTeam,
    deleteTeam,
    removeMember,
};
