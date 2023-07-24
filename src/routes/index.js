const express = require("express");
const router = express.Router();
const { 
    fetchPage,
    getSummary,
} = require('../services/chat');

router.get("/fetch_page", async(req, res) => {
    const data = await fetchPage();
    res.json({data:data});
});
router.get("/get_summary", async(req, res) => {
    const data = await getSummary(req);
    res.json({data:data});
});
router.get("/", async(req, res) => {
    res.json("Welcome!!!");
})

module.exports = router;