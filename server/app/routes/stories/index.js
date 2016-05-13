'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Story = mongoose.model('Story');
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
    console.log('user id', req.params.userId)
    Story.find({owner: req.params.userId}).exec()
    .then(function(stories) {
        res.status(200).send(stories);
    })
    .catch(next)
});

// get all stories a user is a collaborator on
router.get('/collaborator/:userId', function(req, res, next) {
    Story.find({friends: req.params.userId}).exec()
    .then(function(stories) {
        res.status(200).send(stories);
    })
    .catch(next)
});

router.post('/', function(req, res, next) {
    Story.create(req.body)
    .then(function(story) {
        console.log('story before populate', story)
        return  Story.findById(story._id).populate('friends');
    })
    .then(function(story) {
        console.log('story in after populate', story)
        res.send(story);
    })
    .catch(next)
});

//create new square AND update story with a new square
router.put('/:storyId/squares', function(req, res, next){
    var SQUARETOSEND;
    return mongoose.model('Square').create({})
    .then(function(newSquare){
        // console.log('NEW SQUARE: ', newSquare);
        // var writeToPath = path.join(__dirname, '../../assets/' + newSquare._id);
        // fs.writeFile(writeToPath, req.body.dataUrl, function(err) {
            // console.log('hit callback');
        // })
        return mongoose.model('Square')
        .findByIdAndUpdate(newSquare._id, {upsert: true, new: true})
    })
    .then(function(square) {
        SQUARETOSEND = square;
        console.log('SQUARE WITH SRC PATH AS FINAL IMAGE: ', square)
        return Story.findByIdAndUpdate(req.params.storyId, {$push: {'squares': square._id}}, {upsert: true, new: true});
    })
    .then(function(){
        console.log('still access to SQUARE', SQUARETOSEND)
        res.status(200).send(SQUARETOSEND);
    })
    .catch(next)
});







    // function decodeBase64Image(dataString) {
    //   var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    //   var response = {};
    //   if (matches.length !== 3) {
    //     return new Error('Invalid input string');
    //   }
    //   response.type = matches[1];
    //   response.data = new Buffer(matches[2], 'base64');
    //   return response;
    // }
    // var imageBuffer = decodeBase64Image(req.body.dataUrl);
    // console.log('IMAGE BUFFER: ', imageBuffer);









