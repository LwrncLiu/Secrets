//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(session({
  secret: "secret phrase.",
  resave: false,
  saveUninitialized:false,
}))
app.use(passport.initialize());
app.use(passport.session());

async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
  console.log("Successfully connected to mongodb server");
};
main().catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  };
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})

app.post("/register", (req, res) => {
  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    };
  });
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
    res.redirect('/secrets');
});
// app.post("/login", (req, res) => {
//   const user = new User({
//     username: req.body.username,
//     password: req.body.password,
//   });
//
//   req.login(user, function(err){
//     if (err) {
//       console.log(err);
//     } else {
//       passport.authenticate("local")(req, res, () => {
//         res.redirect("/secrets");
//       });
//     };
//   });
// });

app.listen(3000, () => {
  console.log("Server started on port 3000.");
})
