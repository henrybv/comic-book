'use strict';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var updateCartWhenLoggingIn = require('./updateCartWhenLoggingIn.js');
var garbageCollectStrayCarts = require('./garbageCollectStrayCarts.js');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens


module.exports = function (app) {

    // When passport.authenticate('local') is used, this function will receive
    // the email and password to run the actual authentication logic.
    var strategyFn = function (email, password, done) {
        User.findOne({ email: email })
            .then(function (user) {
                // user.correctPassword is a method from the User schema.
                if (!user || !user.correctPassword(password)) {
                    done(null, false);
                } else {
                    // Properly authenticated.
                    done(null, user);
                }
            })
            .catch(done);
    };

    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, strategyFn));

    // A POST /login route is created to handle login.
    app.post('/login', function (req, res, next) {

        var authCb = function (err, user) {

            if (err) return next(err);

            if (!user) {
                var error = new Error('Invalid login credentials.');
                error.status = 401;
                return next(error);
            }

            // req.logIn will establish our session.
            req.logIn(user, function (loginErr) {
                if (loginErr) return next(loginErr);
                // We respond with a response object that has user with _id and email.
                // req.session.userID = user._id;
                
                //Jeff: Creation of Token on LogIn
                var token = jwt.sign({user: user}, app.get('superSecret'), {
                  // expiresInMinutes: 1440 // expires in 24 hours
                });

                console.log("JWT: ", token)

                //Jeff: Changed this to res.json (and added 'success' through 'token') --  a mistake?
                res.status(200).send({
                    user: user.sanitize(),
                    success: true,
                    token: token
                });
            });

        };

        passport.authenticate('local', authCb)(req, res, next);

    });



};
