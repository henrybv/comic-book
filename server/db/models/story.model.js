'use strict';

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Promise = require('bluebird');

var _ = require('lodash');

var schema = new mongoose.Schema({
    title: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // required: true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    squares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Square'
    }]
});




mongoose.model('Story', schema);
schema.plugin(deepPopulate);






