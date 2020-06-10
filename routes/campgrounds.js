const express = require('express');
const router = express.Router();
const moment = require('moment')

const Campground = require('../models/campground');

const {
  isAuthorized,
  isLoggedIn
} = require('../middleware');
const {
  uploadFile
} = require("../upload")

const multer = require('multer')
const upload = multer({
  dest: './photos'
})

const AWS = require("aws-sdk");
const fs = require('fs')

require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
});

router.get("/", (req, res) => {
  Campground.find({}, (err, campgrounds) => {
    if (err) {
      console.log(err);
      req.flash("error", "Failed to load campgrounds... Please try again.")
      res.sendStatus(500);
    } else {
      res.render("campgrounds/index", {
        campgrounds: campgrounds
      })
    }
  });
})

//search campground by name
router.post("/search", (req, res) => {
  console.log(req.body.search)
  Campground.find({
    "name": {
      '$regex': req.body.search,
      '$options': 'i'
    }
  }, (err, campgrounds) => {
    if (err) {
      console.log(err);
      req.flash("error", "Failed to load campgrounds... Please try again.")
      res.sendStatus(500);
    } else {
      res.render("campgrounds/index", {
        campgrounds: campgrounds
      })
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
    if (err) {
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
    .populate({
      path: "comments",
      options: {
        sort: {
          created_at: -1
        }
      }
    }) // sorting by comment date
    .exec((err, campground) => {
      if (err) {
        console.log(err)
        req.flash("error", "Failed to load comments... Please try again.")
        res.sendStatus(500);
      } else if (!campground) {
        res.send("Not found.")
      } else {
        console.log(campground.photoUrls)
        res.render("campgrounds/show", {
          camp: campground
        })
      }
    })
})

// EDIT CAMPS - GET request
router.get("/:id/edit", isAuthorized, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    res.render("campgrounds/edit", {
      camp: campground
    })
  })
});

// EDIT CAMPS - PUT request
router.put("/:id", isAuthorized, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, camp) => {
    if (err) {
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
    if (err) {
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
    res.render("campgrounds/upload", {
      camp: campground
    })
  })
});

router.post("/:id/upload", isAuthorized, upload.single("photo"), (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.params.id}/${req.file.originalname || "photo"}`,
    Body: fs.createReadStream(req.file.path)
  };

  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) {
      console.log(err)
      res.flash("error", "Failed to upload image.")
      return
    } 

    Campground.update({
      "_id": req.params.id
    }, {
      $push: {
        "photoUrls": data.Location // add S3 url to url array
      }
    }, (err, camp) => {
      if (err) {
        console.log(err)
        req.flash("error", "Failed to upload image. Please try again")
      } else {
        req.flash("success", "Uploaded image!")
      }
    })

    res.redirect(`/campgrounds/${req.params.id}/upload`);    
  });
});

module.exports = router;