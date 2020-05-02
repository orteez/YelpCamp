const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local")
const session = require("client-sessions")

if(process.env.NODE_ENV == "development") {
  require('dotenv').config();
}

const User = require("./models/user")
const methodOverride = require("method-override")
const flash = require('connect-flash');

const campgounds = require("./routes/campgrounds");
const comments = require("./routes/comments");
const auth = require("./routes/auth");
const user = require("./routes/user");

const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO || "mongodb://localhost/yelp_camp"

//const seed = require("./seed");

mongoose.connect(encodeURI(MONGO), { useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if(err) {
    console.log(err);
  } else {
    console.log("Successfully connected to MongoDB");
  }
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');


//Passport config
app.use(session({
  cookieName: 'session', 
  secret: process.env.SECRET || 'secret', 
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 5
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use( new LocalStrategy(User.authenticate()) );
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.user = req.user,
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


app.use("/", auth);
app.use("/campgrounds/", campgounds);
app.use("/campgrounds/:id/comments", comments);
app.use("/user/", user);

app.get("/", (req, res) =>{
  res.render("landing")
})

app.get("/about", (req, res) => {
  res.render("about");
})

app.get("*", (req, res) => {
  res.render("missing")
})

app.listen(PORT, ()=> {
  console.log(`Server starting on port: ${PORT}`)
})