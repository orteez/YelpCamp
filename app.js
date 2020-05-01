const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const seedDB = require("./seed");
const passport = require("passport");
const LocalStrategy = require("passport-local")
const session = require("client-sessions")
const User = require("./models/user")
const methodOverride = require("method-override")
const flash = require('connect-flash');

const campgounds = require("./routes/campgrounds");
const comments = require("./routes/comments");
const auth = require("./routes/auth");

const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');


//Passport config
app.use(session({
  cookieName: 'session', // session for drop in name for express-session
  secret: 'blue', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use( new LocalStrategy(User.authenticate()) );
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// seed DB with Campgrounds
// seedDB();

app.use((req, res, next) => {
  res.locals.user = req.user,
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


app.use("/", auth)
app.use("/campgrounds/", campgounds )
app.use("/campgrounds/:id/comments", comments )


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
  console.log(`The YelpCamp Server has started on port ${PORT}`)
})