// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var Story = mongoose.model('Story');
var User = mongoose.model('User');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest');
var app = require('../../../server/app');


describe('Story Route', function() {

    beforeEach('Establish DB connection', function(done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function(done) {
        clearDB(done);
    });


    describe('Getting all addons', function() {

        var clientA = supertest.agent(app);

        it('GET all addons', function(done) {
            clientA
                .get('/api/addons')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });

    });

});
