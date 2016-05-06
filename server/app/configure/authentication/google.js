'use strict';

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var updateCartWhenLoggingIn = require('./updateCartWhenLoggingIn.js');

module.exports = function (app) {

    var thisUser;
    var googleConfig = app.getValue('env').GOOGLE;

    var googleCredentials = {
        clientID: googleConfig.clientID,
        clientSecret: googleConfig.clientSecret,
        callbackURL: googleConfig.callbackURL
    };

    var verifyCallback = function (accessToken, refreshToken, profile, done) {

        UserModel.findOne({ 'google.id': profile.id }).exec()
            .then(function (user) {

                if (user) {
                    return user;
                } else {
                    return UserModel.create({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        google: {
                            id: profile.id,
                            username: profile.displayName,
                            email: profile.emails[0].value,
                            token: accessToken
                        }
                    });
                }
            })
            .then(function (userToLogin) {
                thisUser = userToLogin;
                done(null, userToLogin);
            })
            .catch(function (err) {
                console.error('Error creating user from Google authentication', err);
                done(err);
            });

    };

    passport.use(new GoogleStrategy(googleCredentials, verifyCallback));

    app.get('/auth/google', passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function (req, res) {
            updateCartWhenLoggingIn(thisUser, req.session)
            .then(function() {
                res.redirect('/');
            });
        });

};
