const Campground = require("./models/campground");
const Comment = require("./models/comment")

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/login")
  }
};

const isAuthorized = (req, res, next) => {
  if(req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if(err) {
        console.log(err);
        req.flash("error", "Campground not found.");
        res.redirect("back");
      } else if(foundCampground.author.id.equals(req.user._id)) {
        return next();
      } else {
        req.flash("error", "You don't have permission to do that.");
        res.redirect("back");
      }
    })
  } else {
    // go back to where you came from
    req.flash("error", "You don't have permission to do that.");
    res.redirect("back");
  }
}

const isAuthorizedComment = (req, res, next) => {
  if(req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, comment) => {
      if(err) {
        console.log(err);
        res.redirect("back");
      } else if(comment.author.id.equals(req.user._id)) {
        return next();
      } else {
        req.flash("error", "You don't have permission to do that.");
        res.redirect("back");
      }
    })
  } else {
    // go back to where you came from
    req.flash("error", "You don't have permission to do that.");
    res.redirect("back");
  }
}


module.exports = { isLoggedIn, isAuthorized, isAuthorizedComment}
