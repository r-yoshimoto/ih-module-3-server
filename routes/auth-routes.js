// routes/auth-routes.js

const express = require('express');
const authRoutes = express.Router();

const passport = require('passport');
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const ensureLogin = require("connect-ensure-login");

const transporter = require("../configs/nodemailer");

// require the user model !!!!
const User = require('../models/users');


function correctName(fullName) {
  return fullName.split(" ").map(word => {
    if (word.length > 2) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() }
    else { return word.toLowerCase() }
  }).join(" ");
}

authRoutes.post('/signup', (req, res, next) => {
const { email, password, fullName } = req.body;

if (fullName == "" || email == "" || password == "") {
  res.status(400).json({ message: `Name, e-mail and password can't be empty.`
  });
  return;
}

User.findOne({ email: email })
    .then(user => {
      if (user !== null) {
      if (user.status == "Active") {
        res.status(400).json({
          message:`This e-mail is already registered, if you lost you account <a href="${process.env.APP_URI}/recover">click here</a> to recover it.`
        });
        return;
      } else if (user.status == "Pending"){  
        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(password, salt);
  
        const characters =
          "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let emailConfirmationCode = "";
        for (let i = 0; i < 25; i++) {
          emailConfirmationCode +=
            characters[Math.floor(Math.random() * characters.length)];
        }

        let pendingUser = {
        password: hashPass,
        fullName: correctName(fullName),
        emailConfirmationCode: emailConfirmationCode,
        }

        User.findByIdAndUpdate(
          { _id: user._id }, 
          { $set: pendingUser,
        },
        {new: true})
        .then(user => {
            transporter
            .sendMail({
              from: "ih-feedback.herokuapp.com",
              to: user.email,
              subject: "Welcome to Feedback!",
              html: `In order to use our app, please click <a href="${process.env.APP_URI}/confirm/${user.emailConfirmationCode}">here</a> to confirm your e-mail.
              `
            })
            .then(info => console.log("nodemailer success -->", info))
            .catch(error => console.log(error));

            res.status(200).json({
            message: "Account created, we've send you a confirmation link to your e-mail. Welcome to Feedback!"
            });
            

        })
        .catch(err => {
          throw new Error(err);
        })
      }
      return
    }
    
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const characters =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let emailConfirmationCode = "";
      for (let i = 0; i < 25; i++) {
        emailConfirmationCode +=
          characters[Math.floor(Math.random() * characters.length)];
      }

      const newUser = new User({
        email,
        password: hashPass,
        fullName: correctName(fullName),
        emailConfirmationCode
      });

      newUser
        .save()
        .then(user => {
         
            transporter
            .sendMail({
              from: "ih-feedback.herokuapp.com",
              to: user.email,
              subject: "Welcome to Feedback!",
              html: `In order to use our app, please click <a href="${process.env.APP_URI}/confirm/${user.emailConfirmationCode}">here</a> to confirm your e-mail.
              `
            })
            .then(info => console.log("nodemailer success -->", info))
            .catch(error => console.log(error));

          res.status(200).json({message: "Account created, we've send you a confirmation link to your e-mail. Welcome to Feedback!"
          });
        })
        .catch(err => {
          throw new Error(err);
        });
      return
    })
    .catch(err => {
      throw new Error(err);
    });
  })

  authRoutes.get("/confirm/resend/:emailConfirmationCode", (req, res) => {
    const { emailConfirmationCode } = req.params;
  
    User.findOne({ emailConfirmationCode })
      .then(user => {
        transporter
          .sendMail({
            from: "ih-feedback.herokuapp.com",
            to: user.email,
            subject: "[RESEND] Welcome to Feedback!",
            html: `In order to use our app, please click <a href="${process.env.APP_URI}/confirm/${emailConfirmationCode}">here</a> to confirm your e-mail.
          `
          })
          .then(info => console.log("nodemailer success -->", info))
          .catch(error => console.log(error));
        
        res.status(200).json({message: "We've resend your code, please check your email."
        })
        return
      })
      .catch(err => {
        throw new Error(err);
      });

  });

  authRoutes.get("/confirm/:emailConfirmationCode", (req, res) => {
    const { emailConfirmationCode } = req.params;
  
    User.findOneAndUpdate(
      { emailConfirmationCode },
      { $set: { status: "Active" } },
      { new: true }
    )
      .then(user => {
        if (user) {
          res.status(200).json({
            message: "Your account has been activated!"});
            return
        } else {
          res.status(400).json({message: "Invalid confirmation code."});
          return
        }
      })
      .catch(err => {
        throw new Error(err);
      });
  });  


authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
    if (err) {
      res.status(500).json({ message: 'Something went wrong authenticating user' });
      return;
    }

    if (!theUser) {
      // "failureDetails" contains the error messages
      // from our logic in "LocalStrategy" { message: '...' }.
      res.status(401).json(failureDetails);
      return;
    }

    // save user in session
    req.login(theUser, (err) => {
      if (err) {
        res.status(500).json({ message: 'Session save went bad.' });
        return;
      }

      // We are now logged in (that's why we can also send req.user)
        res.status(200).json({
          message: "You're logged in!",
          userDetail: theUser,
        });
    });
  })(req, res, next);
});

authRoutes.post("/edit-profile", ensureLogin.ensureLoggedIn(), (req, res, next) => {

  const { fullName } = req.body;
  
  if (fullName == undefined) {
    if(fullName.length == 1){
      res.status(401).json({message: "Your name should have at least two characters"})
      return;  
    }
    res.status(401).json({message: "Please fill all fields."})
    return;
  }

  const updateUser = { fullName: correctName(fullName) };

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updateUser },
    { new: true }
  )
    .then(user => {
       res.status(200).json({
          message: "Your profile has been updated.",
          userDetail: user});
    })
    .catch(err => {
      res.status(500).json({ message: 'Something went wrong while trying to save your profile.' });
      return;
    });
});

authRoutes.post('/logout', (req, res, next) => {
  // req.logout() is defined by passport
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});

authRoutes.get('/loggedin', (req, res, next) => {
  // req.isAuthenticated() is defined by passport
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
    return;
  }
  res.status(403).json({ message: 'Unauthorized' });
});


module.exports = authRoutes;