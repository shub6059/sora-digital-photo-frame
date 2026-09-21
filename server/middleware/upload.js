const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { getMaxFileSize, formatBytes } = require('../utils/fileSize');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.body.path || 'uploads';
    const fullPath = path.join(__dirname, '..', uploadPath);
    console.log('Upload destination:', uploadPath, 'Full path:', fullPath);
    fs.ensureDirSync(fullPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: getMaxFileSize()
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/mpeg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only JPEG, PNG, GIF, WebP, MP4, WebM, MOV, AVI, and MPEG are allowed. Maximum size is ${formatBytes(getMaxFileSize())}.`));
    }
  }
});

module.exports = upload;
