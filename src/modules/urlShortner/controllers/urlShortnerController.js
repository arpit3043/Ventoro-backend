const shortid = require("shortid");
const URL = require("../models/urlShortnerModel");

const generateShortURL = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // Check if the URL is already in the database
    const existingURL = await URL.findOne({ redirectURL: url });

    if (existingURL) {
      return res.status(200).json({
        success: true,
        message: "Short URL already exists",
        id: existingURL.shortId,
      });
    }

    // Generate new short ID if URL is not found
    const shortID = shortid.generate();
    await URL.create({
      shortId: shortID,
      redirectURL: url,
      visitHistory: [],
    });

    res.status(200).json({
      success: true,
      message: "Short URL generated successfully",
      id: shortID,
    });
  } catch (error) {
    console.error("Error generating short URL:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { shortId } = req.params;
    const result = await URL.findOne({ shortId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Analytics fetched successfully",
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getShortenUrl = async (req, res, next) => {
  try {
    const { shortId } = req.params;

    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    res.redirect(entry.redirectURL);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateShortURL, getAnalytics, getShortenUrl };
