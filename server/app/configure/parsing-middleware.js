'use strict';
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

module.exports = function (app) {

    // Important to have this before any session middleware
    // because what is a session without a cookie?
    // No session at all.
    app.use(cookieParser());

    // Parse our POST and PUT bodies.
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

};