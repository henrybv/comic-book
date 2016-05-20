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
        console.log('get story from route', story)
        res.status(200).send(story);
    })
    .catch(next)
});

//get all stories created by a user
router.get('/user/:userId', function(req, res, next) {
    console.log('in route to get stories created by a user')
    Story.find({owner: req.params.userId})
    .populate('friends')
    .exec()
    .then(function(stories) {
        console.log('in route to get stories created by a user. returns: ', stories)
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
    console.log('ROUTE in post new story with req.body: ', req.body)
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
        return Story.findByIdAndUpdate(req.params.storyId, {$push: {'squares': square._id}}, { upsert: true, new: true });
    })
    .then(function(){
        console.log('still access to SQUARE', SQUARETOSEND)
        res.status(200).send(SQUARETOSEND);
    })
    .catch(next)
});

router.put('/:storyId/collaborators', function(req, res, next) {
    Story.update({ _id: req.params.storyId },{ $pushAll: { friends: req.body.collaborators }},{ upsert: true, new: true })
    .then(function(story) {
        console.log('UPDATED STORY: ', story);
        res.send(story);
    })
    .catch(next);
});

router.put('/:storyId/squares/:squareId', function(req, res, next) {
    var updatedStory;
    console.log('STORY ID:', req.params.storyId, 'SQUARE ID:', req.params.squareId);
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









