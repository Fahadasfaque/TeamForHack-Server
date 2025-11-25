const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder',
    api_key: process.env.CLOUDINARY_API_KEY || 'placeholder',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder',
});

// Multer storage (memory storage for direct upload to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'));
        }
    },
});

// Upload image to Cloudinary
const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'teamforhack/images',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );

        uploadStream.end(file.buffer);
    });
};

// Upload video to Cloudinary
const uploadVideo = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'teamforhack/videos',
                resource_type: 'video',
                chunk_size: 6000000, // 6MB chunks
            },
            (error, result) => {
                if (error) reject(error);
                else resolve({
                    url: result.secure_url,
                    duration: result.duration,
                    thumbnail: result.secure_url.replace(/\.[^.]+$/, '.jpg'),
                });
            }
        );

        uploadStream.end(file.buffer);
    });
};

module.exports = {
    cloudinary,
    upload,
    uploadImage,
    uploadVideo,
};
