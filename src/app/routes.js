const express = require("express");

const profileRoutes = require("../modules/profile/routes/founderRoutes.js");
const postRoutes = require("../modules/activityFeed/routes/postRoutes.js");
const trendingTopicsRoutes = require("../modules/trendingTopics/routes/trendingTopicsRoutes.js");
const userRoutes = require("../modules/auth/routes/userRoutes.js");
const founderRoutes = require("../modules/profile/routes/founderRoutes.js");
const investorRoutes = require("../modules/profile/routes/investorRoutes.js");
const urlRoute = require("../modules/urlShortner/routes/urlShortnerRoutes.js");
const chatRoutes = require("../modules/messaging/routes/chatRoutes.js");
const messageRoutes = require("../modules/messaging/routes/messageRoutes.js");

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/trending", trendingTopicsRoutes);

router.use("/users", userRoutes);
router.use("/trending", trendingTopicsRoutes);
router.use("/url", urlRoute);
router.use("/founders", founderRoutes);
router.use("/investors", investorRoutes);
router.use("/posts", postRoutes);
router.use("/chats", chatRoutes);
router.use("/message", messageRoutes);


module.exports = router;
