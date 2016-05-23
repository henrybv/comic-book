'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Square = mongoose.model('Square');
var Promise = require('bluebird');
module.exports = router;


router.get('/:squareId', function(req, res, next){
	Square.findById(req.params.squareId)
    .populate('creator')
	.then(function(square){
		res.status(200).send(square);
	})
	.catch(next)
})


router.put('/:squareId', function(req, res, next){
	Square.findByIdAndUpdate(req.params.squareId, {$set: {'finalImage': req.body.finalImage}}, {new: true})
	.then(function(updatedSquare){
		res.status(200).send(updatedSquare);
	})
	.catch(next);
})
