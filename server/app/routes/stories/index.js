'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Story = mongoose.model('Story');
var Promise = require('bluebird');
module.exports = router;


router.get('/', function(req, res, next) {
    Story.find({}).exec()
    .then(function(stories) {
        res.status(200).send(stories);
    })
    .catch(next);
});

router.get('/:storyId', function(req, res, next) {
    Story.findById(req.params.storyId).exec()
    .then(function(story) {
        res.status(200).send(story);
    })
    .catch(next);
});

router.post('/', function(req, res, next) {
    console.log('req session ID:', req.session.id);
    console.log('req session in route to create story', req.session)
    Story.create(req.body)
    .then(function(stories) {
        console.log("story created!", stories);
        res.status(200).send(stories);
    })
    .catch(next);
});


// router.put('/:id', function(req, res, next){
//     Order.findByIdAndUpdate(req.params.id, req.body, {new: true})
//     .then(function(order){
//         if (!order) res.sendStatus(404);
//         else res.send(order);
//     })
//     .then(null, next)
//     .catch(next);
// });

// router.get('/getComplete/:userId', function(req, res, next) {
//     Order.find({user: req.params.userId, status: 'complete'}).populate('products.product user')
//     .then(function(orders) {
//         res.status(200).send(orders);
//     })
//     .catch(next);
// });

// // //*******WILL THIS STILL BE USED?**************
// // router.get('/findOneOrder', function(req, res, next) {
// //     Order.findOne({sessionId: req.session.id}).exec()
// //     .then(function(order) {
// //         res.status(200).send(order);
// //     })
// //     .catch(next);
// // });


// router.get('/getCart', function(req, res, next) {
//     Order.findOne({sessionId: req.session.id, status: 'cart'})
//     .populate('products.product')
//     .then(function(order) {
//         res.status(200).send(order);
//     })
//     .catch(next);
// });


// router.get('/getRecentComplete/:orderId', function(req, res, next){
//     Order.findOne({sessionId: req.session.id, _id: req.params.orderId, status: 'complete'})
//     .populate('products.product')
//     .then(function(order) {
//         res.status(200).send(order);
//     })
//     .catch(next);
// });

// router.get('/getAllComplete', function(req, res, next){
//     Order.find({sessionId: req.session.id, status: 'complete'})
//     .populate('products.product')
//     .then(function(orders) {
//         res.status(200).send(orders);
//     })
//     .catch(next);
// });


// router.put('/addToCart/:productId', function(req,res,next){
//     var userId = req.user ? req.user._id: undefined;
//     Order.findOrCreate(req.session.id, userId)
//     .then(function(order){
//         return order.addProduct(req.params.productId, req.body.quantity);
//     })
//     .then(function(updatedCart){
//         return Order.findOne({_id: updatedCart._id}).populate('products.product');
//     })
//     .then(function(updatedCart) {
//         res.send(updatedCart);
//     })
//     .catch(next);
// });

// router.put('/removeOneFromCart/:productId', function(req,res,next){
//     Order.findOne({sessionId: req.session.id, status: 'cart'})
//     .then(function(order){
//         return order.deleteOneProduct(req.params.productId);
//     })
//     .then(function(updatedCart){
//         return Order.findOne({_id: updatedCart._id}).populate('products.product');
//     })
//     .then(function(updatedCart) {
//         res.send(updatedCart);
//     })
//     .catch(next);
// });


// router.get('/findOneOrder', function(req, res, next) {
//     Order.findOne({sessionId: req.session.id}).popular('user').exec()
//     .then(function(order) {
//         res.status(200).send(order);
//     })
//     .catch(next);
// });

// router.put('/removeFromCart/:productId', function(req,res,next){
//     Order.findOne({sessionId: req.session.id, status:'cart'})
//     .then(function(order){
//         return order.deleteProduct(req.params.productId);
//     })
//     .then(function(updatedCart){
//         console.log('NOT HAPPENING updatedCart in remove from cart', updatedCart);
//         res.send(updatedCart);
//     })
//     .catch(next);
// });

// router.get('/findOneOrderById/:orderId', function(req, res, next) {
//     Order.findOne({_id: req.params.orderId}).populate('products').exec()
//     .then(function(order) {
//         res.status(200).send(order);
//     })
//     .catch(next);
// });

// router.put('/changeStatus/:orderId/:newStatus', function(req, res, next){
//     var newStatus = req.params.newStatus;
//     return Order.findOne({sessionId: req.session.id, _id: req.params.orderId}).exec()
//     .then(function(order){
//         var currentStatus = order.status;
//         if (currentStatus === 'cart' && newStatus === 'complete') {
//             return order.cartToComplete();
//         }
//         if (currentStatus === 'complete' && newStatus === 'cancelled') {
//             return order.cancel();
//         }
//         else {
//             return order
//         }
//     })
//     .then(function(updatedOrder){
//         console.log('updated order after confirmatin', updatedOrder)
//         res.json(updatedOrder);
//     })
//     .catch(next);
// })

// router.delete('/:orderId', function(req, res, next) {

//     if(!req.user.isAdmin) return res.sendStatus(401);
//     Order.findByIdAndRemove({_id: req.params.orderId})
//     .then(function(order){
//         res.send(order);
//     })
//     .catch(next)
// });

// // router.get('/checkout')
// // //get checkout info


