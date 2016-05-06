'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    picture: {
        type: String,
        default: '/img/originalPic.jpg'
    },
    filteredPic: {
        type: String,
        default: '/img/filteredPic.jpg'
    },
    border: {
        //may not need this one
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddOn',
    },
    addons: [addonChildSchema],
    finalImage: {
        //will get stored in firebase also with _id
        type: String,
        default: '/img/adam.jpg'
    }
});

var addonChildSchema = new mongoose.Schema({
    bubble: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Addon'
    },
    coordinateX: {
        type: Number
    },
    coordinateY: {
        type: Number
    },
    text: {
        type: String
    }
});


// schema.statics.changeInventory = function(productIdArray, quantityChangeArray){
//     var self = this;
//     var promises = productIdArray.map(function(productId, index) {
//         return self.findById(productId)
//         .then(function(product) {
//             product.inventory += quantityChangeArray[index];
//             return product.save();
//         });
//     });
//     return Promise.all(promises);
// };

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

mongoose.model('Square', schema);
