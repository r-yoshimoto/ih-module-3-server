const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const app = express();
const User = require("../models/users");




passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: "email"
    },
    (req, email, password, next) => {
      User.findOne({ email }, (err, user) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(null, false, { message: "Incorrect username" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return next(null, false, { message: "Incorrect password" });
        }
        if (user.status == "Pending") {
          return next(null, false, { message: `Please validade your email. <a href="/confirm/resend/${user.emailConfirmationCode}">Click here to resend.</a>` });
        }

        return next(null, user);
      });
    }
  )
);

module.exports = app;