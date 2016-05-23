'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Addon = mongoose.model('Addon');
var Promise = require('bluebird');
module.exports = router;


router.get('/', function(req, res, next) {
    Addon.find({}).exec()
    .then(function(addons) {
        res.status(200).send(addons);
    })
    .catch(next);
});



