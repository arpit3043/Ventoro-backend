const mongoose = require("mongoose");

// Schema for file uploads (used for profile image, cover image, etc.)
const FileSchema = new mongoose.Schema({
  url: { type: String }, // URL of the file (e.g., Cloudinary URL)
  publicId: { type: String }, // Public ID of the file (e.g., Cloudinary public ID)
  fileType: { type: String } // Type of file (e.g., image, video, pdf)
});

// Schema for investor profile
const InvestorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
    experience: { type: String }, // Experience of the investor
    investmentPreferences: {
      minAmount: { type: Number }, // Minimum investment amount (e.g., 50K)
      maxAmount: { type: Number }, // Maximum investment amount (e.g., 500K)
      sectors: [{ type: String }], // Array of industries the investor prefers
      preferredInvestmentStages: {
        type: String,
        enum: ["Bootstrapping", "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "IPO"] // Preferred investment stages
      }
    },
    geographicalFocus: [{ type: String }], // Array of regions or countries
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portfolio" // Reference to the Portfolio model
    },
    // New fields for profile and cover images
    profileImage: FileSchema, // Profile image of the investor
    coverImage: FileSchema // Cover image for the investor's profile
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the Investor model
const Investor = mongoose.model("Investor", InvestorSchema);

module.exports = { Investor };