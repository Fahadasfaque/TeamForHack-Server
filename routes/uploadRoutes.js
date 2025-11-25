const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadVideo } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @desc    Upload image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = await uploadImage(req.file);
        res.json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', protect, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadPromises = req.files.map((file) => uploadImage(file));
        const imageUrls = await Promise.all(uploadPromises);

        res.json({ urls: imageUrls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload video
// @route   POST /api/upload/video
// @access  Private
router.post('/video', protect, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const videoData = await uploadVideo(req.file);
        res.json(videoData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
