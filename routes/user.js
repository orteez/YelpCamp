const express = require('express');
const router = express.Router({mergeParams: true});

const Campgound = require('../models/campground');
const Comment = require('../models/comment');
const {isLoggedIn, isAuthorizedComment} = require("../middleware");

router.get("/", isLoggedIn, (req, res) =>{
  res.render("user/index", {campgrounds: [], comments: []});
})

module.exports = router;