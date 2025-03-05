const express = require("express");
const cloudinary = require("cloudinary").v2;
const RateLimit = require("express-rate-limit");
const {
  loginUser,
  logoutUser,
  registerUser,
  googleOAuthLogin,
  googleOAuthCallback,
  userData,
  editData,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../../../middlewares/auth");
const { handleImgUpload } = require("../../../middlewares/fileUpload"); // Import both middlewares

const router = express.Router();

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

// Public routes
router.get("/", userData);
router.post("/register", limiter, registerUser);

// Edit user data with profile and cover image uploads
router.put(
  "/edit",
  isAuthenticated,
  handleImgUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  editData
);
// router.delete("/delete-image", async (req, res) => {
//   const { type } = req.query; // "profile" or "cover"
//   const userId = req.user.id; // Assuming you have user authentication

//   try {
//     // Delete the image from the database
//     await User.findByIdAndUpdate(userId, {
//       $set: { [type === "profile" ? "profilePicture" : "coverImage"]: null },
//     });

//     res.json({ success: true, message: "Image deleted successfully!" });
//   } catch (err) {
//     console.error("Error deleting image:", err);
//     res.status(500).json({ success: false, message: "Failed to delete image" });
//   }
// });
router.post("/login", limiter, loginUser);
router.get("/google", limiter, googleOAuthLogin);
router.get("/google/callback", limiter, googleOAuthCallback);

// Protected routes
router.get("/logout", limiter, isAuthenticated, logoutUser);

module.exports = router;