'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Reviews = mongoose.model('Reviews');
module.exports = router;

//DEVELOPER ROUTES
router.get('/:reviewId', function(req, res, next){

    Reviews.findById(req.params.reviewId)
    .populate('product')
    .populate('user')
    .then(function(review){
        res.json(review)
    })
    .then(null, next)

})


//USER ROUTES
router.get('/product/:productId', function(req, res, next){

    Reviews.find({product: req.params.productId})
    .populate('user')
    .then(function(reviews){
        if (!reviews) res.sendStatus(404);
        res.json(reviews);
    })
    .then(null, next)

});

router.get('/user/:userId', function(req, res, next){

    Reviews.find({user: req.params.userId})
    .populate('product')
    .then(function(reviews){
        if (!reviews) res.sendStatus(404);
        res.json(reviews);
    })
    .then(null, next);

});

router.get('/', function(req, res, next){

    Reviews.find(req.body)
    .populate('product user')
    .then(function(reviews){
        if (!reviews) res.sendStatus(404);
        res.json(reviews);
    })
    .then(null, next);

});

router.get('/user/:userId', function(req, res, next){

    Reviews.find({user: req.params.userId})
    .populate('product')
    .then(function(reviews){
        if (!reviews) res.sendStatus(404);
        else res.json(reviews);
    })
    .then(null, next);

});

router.post('/', function(req, res, next){
// Reviews can only be left by authenticated users (todo)
    Reviews.create(req.body)
    .then(function(review){
        res.status(201).send(review);
    })
    .then(null, next);

});


router.delete('/:reviewId', function(req, res, next) {

    Reviews.remove({_id: req.params.reviewId})
    .then(function(reviews) {
        if (reviews.result.n === 0) res.sendStatus(404);
        else res.sendStatus(204);
    })
    .then(null, next);

});
