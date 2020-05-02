const express = require('express');
const router = express.Router({mergeParams: true});

const Campgound = require('../models/campground');
const Comment = require('../models/comment');
const {isLoggedIn} = require("../middleware");

router.get("/", isLoggedIn, (req, res) => {
  Campgound.find({ "author.id": req.user._id }, (err, foundCampgrounds) => {
    Comment.find({ "author.id": req.user._id }, (camperr, foundComments) => {
      res.render("user/index", {campgrounds: foundCampgrounds, comments: foundComments});
    })
  })
})

router.get("/:id", isLoggedIn, (req, res) => {
  let campgrounds = [];
  let comments = [];
  console.log(req.user)
  Campgound.find({author: {id: req.params.id}}, (err, foundCampgrounds) => {
    console.log(foundCampgrounds)
    campgrounds = foundCampgrounds;
  })
  Comment.find({author: {id: req.params.id}}, (err, foundComments) => {
    console.log(foundComments);
    comments = foundComments;
  })
  res.render("user/show", {campgrounds: campgrounds, comments: comments});
})


module.exports = router;