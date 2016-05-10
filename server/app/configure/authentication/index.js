'use strict';
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var path = require('path');
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens


var ENABLED_AUTH_STRATEGIES = [
    'local',
    'twitter',
    'facebook',
    'google'
];

module.exports = function (app) {

    // First, our session middleware will set/read sessions from the request.
    // Our sessions will get stored in Mongo using the same connection from
    // mongoose. Check out the sessions collection in your MongoCLI.
    
    // Jeff: No longer need sessions
    // app.use(session({
    //     secret: app.getValue('env').SESSION_SECRET,
    //     store: new MongoStore({mongooseConnection: mongoose.connection}),
    //     resave: false,
    //     saveUninitialized: false
    // }));

    // Initialize passport and also allow it to read
    // the request session information.
    app.use(passport.initialize());
    app.use(passport.session());

    // Jeff: No longer need sessions
    // app.use('/', function(req, res, next){
    //        console.log('session : ', req.session);
    //        console.log('session id ', req.session.id);
    //     next();
    // })

    // When we give a cookie to the browser, it is just the userId (encrypted with our secret).
    passport.serializeUser(function (user, done) {
        console.log('id in serializeUser', user)
        done(null, user.id);
    });

    // When we receive a cookie from the browser, we use that id to set our req.user
    // to a user found in the database.
    passport.deserializeUser(function (id, done) {
        console.log('id in deserializeUser', id)
        UserModel.findById(id, done);
    });

    // We provide a simple GET /session in order to get session information directly.
    // This is used by the browser application (Angular) to determine if a user is
    // logged in already.
    // Jeff: Changing this from the commented out session get request to
    // a get request that gets its user from $localStorage
    // You actually CAN NOT access $localStorage here (undefined, and since we 
    // are not longer useing sessions, this get request is not neccessary -- verify with group
    app.get('/session', function (req, res) {
        console.log(req.body)
        if (req.user) {
            res.send({ user: req.user.sanitize() });
            // Jeff: to Verify Token, maybe we want to verify the token in this '/session' get request
            // We can do this by passing the $localStorage object when this get request gets made
        } else {
            res.status(401).send('No authenticated user.');
        }
    });
    // app.get('/session', function (req, res) {
    //     if (req.user) {
    //         res.send({ user: req.user.sanitize() });
    //     } else {
    //         res.status(401).send('No authenticated user.');
    //     }
    // });

    // Simple /logout route.
    app.get('/logout', function (req, res) {
        // req.logout();
        res.status(200).end();
    });

    // Each strategy enabled gets registered.
    ENABLED_AUTH_STRATEGIES.forEach(function (strategyName) {
        require(path.join(__dirname, strategyName))(app);
    });

};
