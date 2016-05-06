'use strict';
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var updateCartWhenLoggingIn = require('./updateCartWhenLoggingIn.js');

module.exports = function (app) {

    var thisUser;
    var facebookConfig = app.getValue('env').FACEBOOK;

    var facebookCredentials = {
        clientID: facebookConfig.clientID,
        clientSecret: facebookConfig.clientSecret,
        callbackURL: facebookConfig.callbackURL
    };

    var verifyCallback = function (accessToken, refreshToken, profile, done) {

        UserModel.findOne({ 'facebook.id': profile.id }).exec()
            .then(function (user) {

                        console.log(profile)
                if (user) {
                    return user;
                } else {
                    return UserModel.create({
                        username: profile.displayName,
                        facebook: {
                            id: profile.id,
                            username: profile.displayName
                        }
                    });
                }

            })
            .then(function (userToLogin) {
                thisUser = userToLogin;
                done(null, userToLogin);
            })
            .catch(function (err) {
                console.error('Error creating user from Facebook authentication', err);
                done(err);
            })

    };

    passport.use(new FacebookStrategy(facebookCredentials, verifyCallback));

    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: '/login' }),
        function (req, res) {
            updateCartWhenLoggingIn(thisUser, req.session)
            .then(function() {
                res.redirect('/');
            });
        });

};
