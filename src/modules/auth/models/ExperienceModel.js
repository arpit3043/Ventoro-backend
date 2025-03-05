const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  employmentType: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  locationType: {
    type: String,
    enum: ["Remote", "On-site", "Hybrid"],
    required: true,
  },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
});

// Automatically set `isCurrent` based on `endDate`
experienceSchema.pre("save", function (next) {
  this.isCurrent = !this.endDate || this.endDate > new Date();
  next();
});

// Ensure `endDate` is after `startDate`
experienceSchema.path("endDate").validate(function (value) {
  return !value || value > this.startDate;
}, "End date must be after start date.");

const Experience = mongoose.model("Experience", experienceSchema);
module.exports = Experience;
