const express = require("express");
const { getShortenUrl, generateShortURL, getAnalytics } = require("../controllers/urlShortnerController");
const router = express.Router();


router.post("/", generateShortURL);
router.get("/analytics/:shortId", getAnalytics);


module.exports = router;
