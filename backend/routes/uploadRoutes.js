const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many uploads from this IP, please try again later.' }
});

// Configure Cloudinary if env variables are available
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (useCloudinary) {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
}

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure local multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Configure Multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images Only! Allowed types: jpeg, jpg, png, webp'));
    }
  }
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, uploadLimiter, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Secure File Upload Validation: Check Magic Bytes
    const fileTypeModule = await import('file-type');
    const buffer = fs.readFileSync(req.file.path);
    const type = await fileTypeModule.fileTypeFromBuffer(buffer);

    if (!type || !['image/jpeg', 'image/png', 'image/webp'].includes(type.mime)) {
      fs.unlinkSync(req.file.path); // Delete malicious file immediately
      return res.status(400).json({ message: 'Invalid file type signature. Detected malicious or unsupported file.' });
    }

    if (useCloudinary) {
      // Upload raw file path to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'marketplace',
      });
      
      // Cleanup locally stored file after successful cloud upload
      fs.unlinkSync(req.file.path);
      
      res.status(201).json({ url: result.secure_url });
    } else {
      // Return local file path structured for Express static retrieval
      const localUrl = `/uploads/${req.file.filename}`;
      // In production/local mix, maybe full URL is nicer, but absolute path is fine for relative frontend logic
      res.status(201).json({ url: localUrl });
    }
  } catch (error) {
    // Attempt cleanup if err
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('[uploadRoutes.post Error]:', error);
    const message = process.env.NODE_ENV === 'production' ? 'Upload failed due to a server error.' : error.message;
    res.status(500).json({ message });
  }
});

module.exports = router;
