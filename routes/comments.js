const express = require('express');
const router = express.Router({mergeParams: true});

const Campgound = require('../models/campground');
const Comment = require('../models/comment');
const {isLoggedIn, isAuthorizedComment} = require("../middleware");

router.post('/', isLoggedIn, (req, res) => {
  Campgound.findById(req.params.id, (err, camp) => {
    if(err) {
      console.log(err)
      res.redirect("/campgrounds")
    } else {
      req.body.comment.created_at = new Date();
      Comment.create(req.body.comment, (err, comment) => {
        if(err) {
          console.log(err)
          req.flash("error", "Comment could not be created.");
          res.redirect(`/campgrounds/${camp._id}`)
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.camp_id = camp._id; // adding relationship between camp and comments
          comment.save();
          camp.comments.push(comment)
          camp.save();
          req.flash("success", "Comment added!");
          res.redirect(`/campgrounds/${camp._id}`)
        }
      })
    }
  })
})

router.get('/:comment_id/edit', isAuthorizedComment, (req, res) => {
  Comment.findById(req.params.comment_id, (commentErr, comment) => {
    if(commentErr) {
      console.log(commentErr);
      res.redirect(`/campgrounds/${req.params.id}`)
    } else {
      res.render('comments/edit', {campground_id: req.params.id, comment: comment})
    }
  })
})

router.put('/:comment_id/edit', isAuthorizedComment, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err) => {
    if(err) {
      console.log(err);
    } else {
      req.flash("success", "Comment edited!");
      res.redirect(`/campgrounds/${req.params.id}`)
    }
  })
})

router.delete('/:comment_id', isAuthorizedComment, (req, res) => {
  console.log("deleteing")
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if(err) {
      console.log(err)
    } else {

      req.flash("success", "Comment deleted!");
      res.redirect(`/campgrounds/${req.params.id}`)
    }
  })
})

module.exports = router;