const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');

// @desc    Get all hackathons with search and filters
// @route   GET /api/hackathons
// @access  Public
const getHackathons = async (req, res) => {
    try {
        const { search, isOnline, status, minPrize } = req.query;

        let query = {};

        // Search by title, theme, or organizer
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { theme: { $regex: search, $options: 'i' } },
                { organizer: { $regex: search, $options: 'i' } },
            ];
        }

        // Filter by online/offline
        if (isOnline !== undefined) {
            query.isOnline = isOnline === 'true';
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const hackathons = await Hackathon.find(query)
            .populate('hostedBy', 'name avatar')
            .populate('participatingTeams', 'name')
            .sort({ startDate: 1 });

        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get hackathon by ID with full details
// @route   GET /api/hackathons/:id
// @access  Public
const getHackathonById = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id)
            .populate('hostedBy', 'name avatar email')
            .populate('participatingTeams', 'name owner members');

        if (hackathon) {
            res.json(hackathon);
        } else {
            res.status(404).json({ message: 'Hackathon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create hackathon
// @route   POST /api/hackathons
// @access  Private
const createHackathon = async (req, res) => {
    try {
        const hackathonData = {
            ...req.body,
            hostedBy: req.user._id,
        };

        const hackathon = await Hackathon.create(hackathonData);

        const populatedHackathon = await Hackathon.findById(hackathon._id)
            .populate('hostedBy', 'name avatar');

        res.status(201).json(populatedHackathon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update hackathon (host only)
// @route   PUT /api/hackathons/:id
// @access  Private
const updateHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);

        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // Check if user is the host
        if (hackathon.hostedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this hackathon' });
        }

        const updatedHackathon = await Hackathon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('hostedBy', 'name avatar');

        res.json(updatedHackathon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join hackathon with team
// @route   POST /api/hackathons/:id/join
// @access  Private
const joinHackathon = async (req, res) => {
    try {
        const { teamId } = req.body;
        const hackathon = await Hackathon.findById(req.params.id);

        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // Check if registration is still open
        if (new Date() > new Date(hackathon.registrationDeadline)) {
            return res.status(400).json({ message: 'Registration deadline has passed' });
        }

        // Check if max teams reached
        if (hackathon.participatingTeams.length >= hackathon.maxTeams) {
            return res.status(400).json({ message: 'Hackathon is full' });
        }

        // Check if team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if user is part of the team
        const isMember = team.members.includes(req.user._id) ||
            team.owner.toString() === req.user._id.toString();
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this team' });
        }

        // Check if team already joined
        if (hackathon.participatingTeams.includes(teamId)) {
            return res.status(400).json({ message: 'Team already joined this hackathon' });
        }

        // Add team to hackathon
        hackathon.participatingTeams.push(teamId);
        await hackathon.save();

        // Add hackathon to team
        team.hackathon = hackathon._id;
        await team.save();

        const updatedHackathon = await Hackathon.findById(hackathon._id)
            .populate('hostedBy', 'name avatar')
            .populate('participatingTeams', 'name');

        res.json({
            message: 'Successfully joined hackathon',
            hackathon: updatedHackathon,
            whatsappLink: hackathon.isOnline ? hackathon.whatsappLink : null,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Leave hackathon
// @route   POST /api/hackathons/:id/leave
// @access  Private
const leaveHackathon = async (req, res) => {
    try {
        const { teamId } = req.body;
        const hackathon = await Hackathon.findById(req.params.id);

        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // Check if team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if user is team owner
        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team owner can leave hackathon' });
        }

        // Remove team from hackathon
        hackathon.participatingTeams = hackathon.participatingTeams.filter(
            t => t.toString() !== teamId
        );
        await hackathon.save();

        // Remove hackathon from team
        team.hackathon = null;
        await team.save();

        res.json({ message: 'Successfully left hackathon' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's hosted hackathons
// @route   GET /api/hackathons/my-hosted
// @access  Private
const getMyHostedHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find({ hostedBy: req.user._id })
            .populate('participatingTeams', 'name')
            .sort({ createdAt: -1 });

        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a hackathon
// @route   DELETE /api/hackathons/:id
// @access  Private (Host only)
const deleteHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);

        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // Check if user is the host
        if (hackathon.hostedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this hackathon' });
        }

        // Remove hackathon reference from all participating teams
        await Team.updateMany(
            { _id: { $in: hackathon.participatingTeams } },
            { $unset: { hackathon: 1 } }
        );

        await Hackathon.findByIdAndDelete(req.params.id);

        res.json({ message: 'Hackathon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHackathons,
    getHackathonById,
    createHackathon,
    updateHackathon,
    joinHackathon,
    leaveHackathon,
    getMyHostedHackathons,
    deleteHackathon,
};
