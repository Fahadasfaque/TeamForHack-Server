const { StreamChat } = require('stream-chat');

const streamClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY || 'placeholder_key',
    process.env.STREAM_API_SECRET || 'placeholder_secret'
);

// @desc    Get Stream Token
// @route   POST /api/stream/token
// @access  Private
const getToken = async (req, res) => {
    try {
        const token = streamClient.createToken(req.user._id.toString());
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getToken };
