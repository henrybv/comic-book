'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema

var schema = new mongoose.Schema({
    name: {
        type: String
    },
    source: {
        type: String,
        default: '/img/border.jpg'
    },
    type: {
      type: String, 
      enum: ['sticker', 'border', 'bubble', 'filter']
    }
});

mongoose.model('Addon', schema);