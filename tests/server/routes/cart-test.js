// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var Order = mongoose.model('Order');
var User = mongoose.model('User');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest');
var app = require('../../../server/app');



describe('Order Route', function() {

    beforeEach('Establish DB connection', function(done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);

    });

    beforeEach('Create a cart and order', function(done) {
        var newOrder;
        Order.findOrCreate('0000')
        .then(function(response){
            newOrder = response;
            console.log("newOrder", newOrder)
            done()
        })
    });

    // beforeEach('Create a User', function(done) {
    //     var agent = chai.request.agent(app)
    //     agent
    //     .post('/session')
    //     .send({ username: 'me', password: '123' })
    //     .then(function (res) {
    //         expect(res).to.have.cookie('sessionid');
    //         sessionId = res.session.id
    //         // The `agent` now has the sessionid cookie saved, and will send it
    //         // back to the server in the next request:
    // });

    afterEach('Clear test database', function(done) {
        clearDB(done);
    });

    describe('Creating a cart', function() {

        var agent = supertest.agent(app);

        it('Get One', function(done) {
            agent
                .get('/api/orders')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body[0].sessionId).to.equal('0000');
                    expect(res.body[0].status).to.equal('cart');
                    expect(res.body[0]._id).to.exist;
                    Order.findById(res.body[0]._id, function(err, b) {
                        if (err) return done(err);
                        expect(b).to.not.be.null;
                        expect(res.body).to.eql(toPlainObject(b));
                        done();
                    });
                });
        });

        });
   });

