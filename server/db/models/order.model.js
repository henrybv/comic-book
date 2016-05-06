'use strict';

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Promise = require('bluebird');

// var _ = require('lodash');

var productChildSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        min: 0
    },
    finalPrice: {
        type: Number
    }
});

var schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sessionId: {
        type: String
    },
    products: [productChildSchema],
    // finalPrice: [{
    //     type: Number,
    // }], //array of product prices
    status: {
        type: String,
        enum:   ['cart',
                // 'confirmed',
                // 'processing',
                'paid',
                'cancelled',
                'complete'
                ],
        default: 'cart'
    },
    date: {
        type: Date
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }
});

//get total price ARRAY of all products AT CURRENT PRICE IN DATABASE
schema.methods.getLiveProductPrices = function(){
    return mongoose.model('Order').findById(this._id)
    .then(function(order) {
        if (!order.products) return;
        var promises = order.products.map(function(product) {
            return mongoose.model('Product').findById(product.product);
        });
        return Promise.all(promises);
    })
    .then(function(arrayOfProducts) {
        return arrayOfProducts.map(product => product.price);
    });
};

//route to change status to 'complete' calls this method
schema.methods.cartToComplete = function(){
    var thisOrder;
    return this.getLiveProductPrices()
    .then((liveProductPrices) => {
        liveProductPrices.forEach((price, index) => {
            this.products[index].finalPrice = price;
        });
        this.status = 'complete';
        this.date = Date();
        return this.save();
    })
    .then(function(updatedOrder){
        thisOrder = updatedOrder;
        return mongoose.model('Product')
        .changeInventory(
            updatedOrder.products.map(productChild => productChild.product),
            updatedOrder.products.map(productChild => -1 * productChild.quantity)
        );
    })
    .then(function(){
        return thisOrder;
    });
};


//route to change status to 'cancelled' calls this method
schema.methods.cancel = function(){
    var thisOrder = this;
    thisOrder.status = 'cancelled';
    return thisOrder.save()
    .then(function(updatedOrder){
        thisOrder = updatedOrder;
        return mongoose.model('Product').changeInventory(
            updatedOrder.products.map(productChild => productChild.product),
            updatedOrder.products.map(productChild => productChild.quantity)
        );
    })
    .then(function(updatedProducts){
        return thisOrder;
    });
};

//find cart by sessionID or create a new card, specifying product ID, session ID, and user ID if exists
schema.statics.findOrCreate = function(sessionId, userId){
    var self = this;
    return this.findOne({sessionId: sessionId, status: 'cart'})
    .exec()
    .then(function(order){
        if (!order){
            var newOrder = new self();
            newOrder.sessionId = sessionId;
            if (userId) newOrder.user = userId;
            return newOrder.save();
        }
        else return order;
    });
};

// method to add to order
schema.methods.addProduct = function (productId, quantity) {
    if (this.status !== 'cart') return;
    var number = quantity || 1;
    // if this.products has an element with a product matching productId, then increment the quantity on that element
    var index = this.products.map(productChild => productChild.product.toString()).indexOf(productId);
    if (index !== -1) {
        this.products[index].quantity += +number;
    }
    // else push a new product child to the order's products array
    else {
        var newProductChildToAdd = {
            product: productId,
            quantity: number
        };
        this.products.push(newProductChildToAdd);
    }
    return this.save();
};


// method to remove product from order
schema.methods.deleteOneProduct = function (productId) {
    if (this.status !== 'cart') return;
    var index = this.products.map(productChild => productChild.product.toString()).indexOf(productId);
    this.products[index].quantity--;
    return this.save();
};


schema.methods.deleteProduct = function (productId) {
    console.log('THIS', this);
    if (this.status !== 'cart') return;
    console.log('this.products', this.products);
    var index = this.products.map(productChild => productChild.product.toString()).indexOf(productId);
    console.log('index', index);
    this.products.splice(index, 1);
    return this.save();
};


mongoose.model('Order', schema);
schema.plugin(deepPopulate);






