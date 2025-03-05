const mongoose = require("mongoose");

// Schema for file uploads (used for profile image, cover image, pitch deck, etc.)
const FileSchema = new mongoose.Schema({
  url: { type: String }, // URL of the file (e.g., Cloudinary URL)
  publicId: { type: String }, // Public ID of the file (e.g., Cloudinary public ID)
  fileType: { type: String } // Type of file (e.g., image, video, pdf)
});

// Schema for founder profile
const FounderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
    startUpName: { type: String, required: true }, // Name of the startup
    industry: { type: String, required: true }, // Industry of the startup
    businessIdea: {
      problemStatement: { type: String }, // Problem the startup is solving
      uniqueValueProposition: { type: String }, // Unique value proposition
      businessModel: { type: String }, // Business model of the startup
      marketPotential: { type: String }, // Market potential of the startup
      growthProjections: { type: String } // Growth projections
    },
    traction: {
      userBase: { type: Number, default: 0 }, // Number of users
      revenue: { type: Number, default: 0 }, // Revenue generated
      partnerships: { type: String }, // Partnerships
      testimonials: [{ type: String }] // Testimonials
    },
    fundingNeeds: {
      amount: { type: Number }, // Amount of funding needed
      usagePlan: { type: String } // Plan for using the funds
    },
    location: { type: String }, // Location of the startup
    projectPortfolio: {
      pitchDeck: FileSchema, // Pitch deck file
      productDemos: [FileSchema], // Array of product demo files
      multimedia: [FileSchema] // Array of multimedia files
    },
    startupStage: {
      type: String,
      enum: ["Bootstrapping", "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "IPO"] // Stage of the startup
    },
    milestoneTracker: [
      {
        milestoneName: { type: String }, // Name of the milestone
        dateAchieved: { type: Date }, // Date the milestone was achieved
        description: { type: String } // Description of the milestone
      }
    ],
    // New fields for profile and cover images
    profileImage: FileSchema, // Profile image of the founder
    coverImage: FileSchema // Cover image for the founder's profile
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the Founder model
const Founder = mongoose.model("Founder", FounderSchema);

module.exports = { Founder };