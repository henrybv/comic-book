// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var Product = mongoose.model('Product');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest');
var app = require('../../../server/app');


describe('Products Route', function() {

    beforeEach('Establish DB connection', function(done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function(done) {
        clearDB(done);
    });

    describe('Creating a product', function() {

        var clientA = supertest.agent(app);

        it('POST one', function(done) {
            clientA
                .post('/api/product')
                .send({
                    title: 'Package Paradise',
                    price: 1000000
                })
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.title).to.equal('Package Paradise');
                    expect(res.body._id).to.exist;
                    Product.findById(res.body._id, function(err, b) {
                        if (err) return done(err);
                        expect(b).to.not.be.null;
                        done();
                    });
                });
        });

    });

    describe('Getting all products', function() {

        var clientA = supertest.agent(app);

        it('GET all products', function(done) {
            clientA
                .get('/api/product')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });

    });


    describe('Getting one product by ID', function() {

        var newProduct = {
            title: 'Great Vacation',
            description: 'Beautiful mountains',
            price: 2000
        };

        var newProductID;

        beforeEach('Create a product', function (done) {
            Product.create(newProduct)
            .then(function(product) {
                newProductID = product._id;
                done();
            });
        });


        var clientA = supertest.agent(app);

        it('GET one by ID', function(done) {
            clientA
                .get('/api/product/' + newProductID)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    console.log('RES BODY:', res.body);
                    expect(res.body.title).to.equal('Great Vacation');
                    expect(res.body.description).to.equal('Beautiful mountains');
                    expect(res.body).to.be.an('object');
                    expect(res.body._id).to.exist;    
                    done();
                });
        });

    });


    describe('Updating one product by ID', function() {

        var newProduct = {
            title: 'Great Vacation',
            description: 'Beautiful mountains',
            price: 2000
        };

        var newProductID;

        beforeEach('Create a product', function (done) {
            Product.create(newProduct)
            .then(function(product) {
                newProductID = product._id;
                done();
            });
        });


        var clientA = supertest.agent(app);

        it('PUT one by ID', function(done) {
            clientA
                .put('/api/product/' + newProductID)
                .send({
                    price: 1000000,
                    description: 'worst place'
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.title).to.equal('Great Vacation');
                    expect(res.body.description).to.equal('worst place');
                    expect(res.body.price).to.equal(1000000);
                    expect(res.body).to.be.an('object');
                    expect(res.body._id).to.exist;    
                    done();
                });
        });

    });


    describe('Deletes one product by ID', function() {

        var newProduct = {
            title: 'Great Vacation',
            description: 'Beautiful mountains',
            price: 2000
        };

        var newProductID;

        beforeEach('Create a product', function (done) {
            Product.create(newProduct)
            .then(function(product) {
                newProductID = product._id;
                done();
            });
        });


        var clientA = supertest.agent(app);

        it('DELETE one by ID', function(done) {
            clientA
                .delete('/api/product/' + newProductID)
                .expect(204)
                .end(function(err, res) {
                    if (err) return done(err);    
                    done();
                });
        });

    });

});
