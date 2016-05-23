'use strict';

var mongoose = require('mongoose');

// var addonChildSchema = new mongoose.Schema({
//     bubble: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Addon'
//     },
//     coordinateX: {
//         type: Number
//     },
//     coordinateY: {
//         type: Number
//     },
//     text: {
//         type: String
//     }
// });

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
    // addons: [addonChildSchema],
    finalImage: {
        //will get stored in firebase also with _id
        type: String,
        default: '/img/adam.jpg'
    }
});





mongoose.model('Square', schema);
