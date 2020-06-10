const express = require('express');
const router = express.Router();
const moment = require('moment')

const Campground = require('../models/campground');

const {isAuthorized, isLoggedIn} = require('../middleware');
const {uploadFile} = require("../upload")

const multer  = require('multer')
const upload = multer({ dest: './photos' })

router.get("/", (req, res) => {
  Campground.find({}, (err, campgrounds) => {
    if(err) {
      console.log(err);
      req.flash("error", "Failed to load campgrounds... Please try again.")
      res.sendStatus(500);
    } else {
      res.render("campgrounds/index", {campgrounds: campgrounds})
    }
  });
})

//search campground by name
router.post("/search", (req, res) => {
  console.log(req.body.search)
  Campground.find({"name": {'$regex': req.body.search, '$options': 'i'}}, (err, campgrounds) => {
    if(err) {
      console.log(err);
      req.flash("error", "Failed to load campgrounds... Please try again.")
      res.sendStatus(500);
    } else {
      res.render("campgrounds/index", {campgrounds: campgrounds})
    }
  });
})

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
})

router.post("/", isLoggedIn, (req, res) => {
  const campground = {
    name: req.body.name,
    img: req.body.img,
    price: req.body.price,
    description: req.body.description,
    author: {
      id: req.user._id,
      username: req.user.username,
    }
  }
  Campground.create(campground, (err, newCamp) => {
    if(err) {
      console.log(err)
      req.flash("error", "Failed to create new campground.")
      res.redirect("back");
    } else {
      req.flash("success", `Created camp, ${newCamp.name}!`)
      res.redirect(`/campgrounds/${newCamp._id}`)
    }
  })
})

router.get("/:id", (req, res) => {
  Campground.findById(req.params.id)
  .populate({path: "comments", options: { sort: { created_at: -1}}}) // sorting by comment date
  .exec((err, campground) => {
    if(err) {
      console.log(err)
      req.flash("error", "Failed to load comments... Please try again.")
      res.sendStatus(500);
    } else if(!campground) {
      res.send("Not found.")
    } else {
      console.log(campground.photoUrls)
      res.render("campgrounds/show", {camp: campground})
    }
  })
})

// EDIT CAMPS - GET request
router.get("/:id/edit", isAuthorized, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
      res.render("campgrounds/edit", {camp: campground})
  })
});

// EDIT CAMPS - PUT request
router.put("/:id", isAuthorized, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, camp) => {
    if(err) {
      req.flash("error", "Failed to edit campground");
      res.redirect("back")
    } else {
      req.flash("success", `Successfully updated ${camp.name}`)
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
})

router.delete("/:id", isAuthorized, (req, res) => {
  console.log("deleting")
  Campground.findByIdAndRemove(req.params.id, (err, camp) => {
    if(err) {
      req.flash("error", "Failed to remove campground.")
      res.redirect("back");
    } else {
      req.flash("success", `Successfully updated ${camp.name}`)
      res.redirect("/campgrounds");
    }

  })
})

// EDIT CAMPS - GET request
router.get("/:id/upload", isAuthorized, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
      res.render("campgrounds/upload", {camp: campground})
  })
});

router.post("/:id/upload", isAuthorized, upload.single("photo"),  (req, res) => {
  uploadFile(req.params.id, req.file).then(() =>{
    res.redirect(`/campgrounds/${req.params.id}`)
  }).catch(err => {
    console.log(err)
    res.sendStatus(500)
  })
});

module.exports = router;