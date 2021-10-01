//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
  console.log("Successfully connected to mongodb server");
};

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

main().catch(err => console.log(err));

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });

  newUser.save((err, doc) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    };
  });
});

app.post("/login", (req, res) => {
  const login_username = req.body.username;
  const login_password = req.body.password;

  User.findOne({username: login_username}, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === login_password) {
          res.render("secrets");
        } else {
          console.log("Incorrect Password");
        }
      } else {
        console.log("No user found");
      };
    };
  });
});



app.listen(3000, () => {
  console.log("Server started on port 3000.");
})
