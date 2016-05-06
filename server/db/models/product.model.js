'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    categories: {
        type: [String],
        index: true
    },
    price: {
        type: Number,
        required: true
    },
    images: {
        type: [String],
        default: '/assets/images/placeholder.jpg'
    },
    inventory: {
        type: Number,
        min: 0
    },
    coordinates: {
        type: [Number]
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

schema.statics.changeInventory = function(productIdArray, quantityChangeArray){
    var self = this;
    var promises = productIdArray.map(function(productId, index) {
        return self.findById(productId)
        .then(function(product) {
            product.inventory += quantityChangeArray[index];
            return product.save();
        });
    });
    return Promise.all(promises);
};

// schema.statics.decreaseInventory = function(productIdArray){
//     return this.find({'_id': {$in: productIdArray}})
//     .then(function(productArray){
//         return Promise.all(productArray.map(function(product){
//             product.inventory--;
//             return product.save();
//         }))
//     })
//     .catch(function(err){
//         console.error(err);
//     })
// }

// schema.statics.increaseInventory = function(productIdArray){
//     return this.find({'_id': {$in: productIdArray}})
//     .then(function(productArray){
//         return Promise.all(productArray.map(function(product){
//             product.inventory++;
//             return product.save();
//         }))
//     })
//     .catch(function(err){
//         console.error(err);
//     })
// }

mongoose.model('Product', schema);
