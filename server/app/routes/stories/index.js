'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Story = mongoose.model('Story');
var Square = mongoose.model('Square');
var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
module.exports = router;

//get all stories
router.get('/', function(req, res, next) {
    Story.find({}).exec()
    .then(function(stories) {
        res.status(200).send(stories);
    })
    .catch(next);
});

//TEST THIS
//get a specific story and all its squares
router.get('/:storyId', function(req, res, next) {
    Story.findById(req.params.storyId)
    .populate('squares friends')
    .exec()
    .then(function(story) {
        res.status(200).send(story);
    })
    .catch(next)
});

//get all stories created by a user
router.get('/user/:userId', function(req, res, next) {
    Story.find({owner: req.params.userId})
    .populate('friends')
    .exec()
    .then(function(stories) {
        res.status(200).send(stories);
    })
    .catch(next)
});

// get all stories a user is a collaborator on
router.get('/collaborator/:userId', function(req, res, next) {
    Story.find({friends: req.params.userId})
    .populate('owner')
    .exec()
    .then(function(stories) {
        res.status(200).send(stories);
    })
    .catch(next)
});

router.post('/', function(req, res, next) {
    Story.create(req.body)
    .then(function(story) {
        return  Story.findById(story._id).populate('friends');
    })
    .then(function(story) {
        res.send(story);
    })
    .catch(next)
});

//create new square AND update story with a new square
router.put('/:storyId/squares', function(req, res, next){
    var SQUARETOSEND;
    return mongoose.model('Square').create({creator: req.body.creator})
    .then(function(newSquare){
        return mongoose.model('Square')
        .findByIdAndUpdate(newSquare._id, {upsert: true, new: true})
    })
    .then(function(square) {
        SQUARETOSEND = square;
        return Story.findByIdAndUpdate(req.params.storyId, {$push: {'squares': square._id}}, { upsert: true, new: true });
    })
    .then(function(){
        res.status(200).send(SQUARETOSEND);
    })
    .catch(next)
});

router.put('/:storyId/collaborators', function(req, res, next) {
    Story.update({ _id: req.params.storyId },{ $pushAll: { friends: req.body.collaborators }},{ upsert: true, new: true })
    .then(function(story) {
        res.send(story);
    })
    .catch(next);
});

router.put('/:storyId/squares/:squareId', function(req, res, next) {
    var updatedStory;
    Story.update( {_id: req.params.storyId}, { $pull: {'squares': req.params.squareId} }, { upsert: true, new: true } )
    .then(function(story) {
        updatedStory = story;
        return Square.find({ _id: req.params.squareId }).remove().exec();
    })
    .then(function() {
        res.send(updatedStory);
    })
    .catch(next);
});
