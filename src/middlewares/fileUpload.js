const { upload, uploadImage } = require('../utils/uploadConfig');

const handleFileUpload = {
  // For single file upload
  single: (fieldName) => {
    return (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        next();
      });
    };
  },

  // For multiple file uploads
  array: (fieldName, maxCount) => {
    return (req, res, next) => {
      upload.array(fieldName, maxCount)(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        next();
      });
    };
  },

  // For mixed file uploads (e.g., profileImage, coverImage, pitchDeck, etc.)
  
};

// Middleware for handling single image uploads using the 'uploadimage' instance
const handleImgUpload = {
  fields: (fields) => {
    return (req, res, next) => {
      uploadImage.fields(fields)(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        next();
      });
    };
  }
};

module.exports = { handleFileUpload, handleImgUpload };