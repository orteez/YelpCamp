const express = require('express');
const router = express.Router();
const passport = require("passport")
const User = require('../models/user');


router.get("/login", (req, res) => {
  res.render("auth/login")
})

router.post("/login", passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Issue logging in. Please try again.",
}), (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  res.redirect("/campgrounds");
})

router.get("/register", (req, res) => {
  res.render("auth/register")
})

router.post("/register", (req, res) => {
  const user = new User({username: req.body.username});
  User.register(user, req.body.password, (err, user) => {
    if(err) {
      console.log(err)
      req.flash("error", err.message)
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, () => {
        req.flash("success", `Welcome to Yelp Camp, ${user.username}!`)
        res.redirect("/campgrounds")
      })
    }
  })
})

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged out.")
  res.redirect("/campgrounds")
})

module.exports = router;