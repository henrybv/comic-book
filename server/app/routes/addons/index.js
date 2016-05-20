'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Addon = mongoose.model('Addon');
var Promise = require('bluebird');
module.exports = router;


router.get('/', function(req, res, next) {
    Addon.find({}).exec()
    .then(function(addons) {
        console.log('in addons route')
        res.status(200).send(addons);
    })
    .catch(next);
});

// router.get('/:storyId', function(req, res, next) {
//     Story.findById(req.params.storyId).exec()
//     .then(function(story) {
//         res.status(200).send(story);
//     });
// });

// router.get('/user/:userId', function(req, res, next) {
//     console.log('user id', req.params.userId)
//     Story.find({owner: req.params.userId}).exec()
//     .then(function(stories) {
//         res.status(200).send(stories);
//     })
//     .catch(next);
// });

// router.post('/', function(req, res, next) {
//     Story.create(req.body)
//     .then(function(stories) {
//         res.status(200).send(stories);
//     })
//     .catch(next);
// });


