//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
// const md5 = require("md5");
// const encrypt = require("mongoose-encryption");

const saltRounds = 10;
const app = express();

async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
  console.log("Successfully connected to mongodb server");
};

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

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
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if (err){
      console.log(err);
    } else {
      const newUser = new User({
        username: req.body.username,
        password: hash,
      });
      newUser.save((err, doc) => {
        if (err) {
          console.log(err);
        } else {
          res.render("secrets");
        };
      });
    }
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
        bcrypt.compare(login_password, foundUser.password, function(err, result) {
          if (result) {
            res.render("secrets");
          } else {
            console.log(err);
            console.log("wrong password");
          };
        });
      } else {
        console.log("No user found");
      };
    };
  });
});



app.listen(3000, () => {
  console.log("Server started on port 3000.");
})
