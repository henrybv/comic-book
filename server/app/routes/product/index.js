'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
module.exports = router;


// this router also allows us to find by query
router.get('/', function(req, res, next){
    // var query = {seller: req.params.sellerId} || {}
    console.log('IN QUERY',req.query);
    Product.find({})
    .then(function(products){
        res.json(products);
    })
    .then(null, next)
});

router.get('/:productId', function(req, res, next){

    Product.findById(req.params.productId)
    .then(function(product){
        res.json(product);
    })
    .then(null, next);

});

router.post('/', function(req, res, next){

    Product.create(req.body)
    .then(function(product){
        res.status(201).send(product);
    })
    .then(null, next);

});

router.put('/:productId', function(req, res, next){

    Product.findByIdAndUpdate(req.params.productId, req.body, {new: true})
    .then(function(response){
        res.send(response)
    })
    .then(null, next)

});

router.put('/', function(req, res, next){

    Product.update(req.query, req.body, {multi: true})
    .then(function(products) {
        res.send(products);
    })
    .then(null, next);

});

router.put('/categories/:productId', function(req, res, next){

    // We need to send on Req.body {addedCategories:...}
    Product.findById(req.params.productId)
    .then(function(product){
        product.categories = product.categories.concat(req.body.addedCategories)
        return product.save()
    })
    .then(function(product){
        res.send(product)
    })
    .then(null, next)

})

router.delete('/:productId', function(req, res, next) {

    Product.remove({_id: req.params.productId})
    .then(function() {
        res.sendStatus(204);
    })
    .then(null, next);

});





