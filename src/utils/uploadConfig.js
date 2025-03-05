const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2; // Ensure cloudinary is imported and initialized
const env = require('dotenv');

// Load environment variables from .env file
env.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Pass the cloudinary object here
  params: {
    folder: 'founder-profiles', // Folder in Cloudinary where files will be stored
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Allowed file formats
    resource_type: 'auto', // Automatically detect resource type (image, video, raw)
  },
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  // console.log(`Fieldname: ${file.fieldname}, MIME Type: ${file.mimetype}`); // Debugging

  // Allow only specific fields and file types
  if (file.fieldname === 'pitchDeck') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true); // Accept PDF files for pitchDeck
    } else {
      cb(new Error('Pitch deck must be a PDF file'), false); // Reject non-PDF files
    }
  } else if (file.fieldname === 'productDemos' || file.fieldname === 'multimedia') {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true); // Accept images and videos for productDemos and multimedia
    } else {
      cb(new Error('Invalid file type for product demos or multimedia'), false); // Reject other file types
    }
  } else if (file.fieldname === 'profileImage' || file.fieldname === 'coverImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept image files for profileImage and coverImage
    } else {
      cb(new Error('Only image files are allowed for profile and cover images'), false); // Reject non-image files
    }
  } else {
    cb(new Error('Unexpected field'), false); // Reject unexpected fields
  }
};

// Configure Multer for general file uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 5, // Maximum of 5 files per request
  },
});

// Configure Multer for single image uploads
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 2, // Maximum of 1 file per request
  },
});

// Export the configured Multer instances and Cloudinary
module.exports = { upload, uploadImage, cloudinary };