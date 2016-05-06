'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');
var User = mongoose.model('User');

router.get('/', function(req, res, next) {
    if(!req.user.isAdmin) return res.sendStatus(401)
    else next()
});

router.get('/create', function(req, res, next) {
    if(!req.user.isAdmin) return res.sendStatus(401)
    else next()
});

router.get('/order', function(req, res, next) {
    if(!req.user.isAdmin) return res.sendStatus(401)
    else next()
});

router.get('/user', function(req, res, next) {
    if(!req.user.isAdmin) return res.sendStatus(401)
    else next()
});

router.get('/edit/:id', function(req, res, next) {
    if(!req.user.isAdmin) return res.sendStatus(401)
    else next()
});
