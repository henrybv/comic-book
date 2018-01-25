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

    describe('Creating a user', function() {

        var clientA = supertest.agent(app);

        it('POST one', function(done) {
            clientA
                .post('/api/members')
                .send({
                    username: "newUserOne",
                    email: 'newUser@gmail.com',
                    password: '12345678'
                })
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.username).to.equal('newUserOne');
                    expect(res.body.email).to.equal('newUser@gmail.com');
                    expect(res.body.password).to.exist;
                    expect(res.body._id).to.exist;
                    User.findById(res.body._id, function(err, b) {
                        if (err) return done(err);
                        expect(b).to.not.be.null;
                        done();
                    });
                });
        });

    });

    describe('Getting all users', function() {

        var clientA = supertest.agent(app);

        var newUserID;
        var newUser = {
            username: 'aNewUser',
            email: 'user1@gmail.com',
            password: '1234567'
        };

        beforeEach('Create a user', function (done) {
            User.create(newUser)
            .then(function(user) {
                newUserID = user._id;
                done();
            });
        });

        it('GET all users', function(done) {
            clientA
                .get('/api/members')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(1);
                    done();
                });
        });

    });


    describe('Getting one story by ID', function() {

        var newUserID;
        var newUser = {
            username: 'aNewUser',
            email: 'user1@gmail.com',
            password: '1234567'
        };

        beforeEach('Create a user', function (done) {
            User.create(newUser)
            .then(function(user) {
                newUserID = user._id;
                done();
            });
        });

        var clientA = supertest.agent(app);

        it('GET one by ID', function(done) {
            clientA
                .get('/api/members/' + newUserID)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.username).to.equal('aNewUser');
                    expect(res.body.email).to.equal('user1@gmail.com');
                    expect(res.body.password).to.exist;
                    expect(res.body._id).to.exist;    
                    done();
                });
        });

    });


    describe('Updating a user', function() {

        var clientA = supertest.agent(app);

        var newUserID;
        var newUser = {
        	username: 'aNewUser',
        	email: 'user1@gmail.com',
        	password: '1234567'
        };

        beforeEach('Create a user', function (done) {
            User.create(newUser)
            .then(function(user) {
                newUserID = user._id;
                done();
            });
        });


        it('Adds avatar to user', function(done) {
            clientA
                .put('/api/members/' + newUserID)
                .send({
                    avatar: 'adataurlstring',
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.avatar).to.equal('adataurlstring');
                    expect(res.body.username).to.equal('aNewUser');
                    User.findById(res.body._id, function(err, b) {
                        if (err) return done(err);
                        expect(b).to.not.be.null;
                        done();
                    });
                });
        });

    });


    // // start here
    // describe('Deleting a collaborator/friend from a story', function() {

    //     var clientA = supertest.agent(app);

    //     var newUserID;
    //     var newUser = {
    //     	username: 'aNewUser',
    //     	email: 'user1@gmail.com',
    //     	password: '1234567'
    //     };

    //     beforeEach('Create a user', function (done) {
    //         User.create(newUser)
    //         .then(function(user) {
    //             newUserID = user._id;
    //             done();
    //         });
    //     });

    //     var newStoryID;
    //     var newStory = {
    //         title: 'Another Great Story',
    //     };

    //     beforeEach('Delete collaborator from a story', function (done) {
    //         Story.create(newStory)
    //         .then(function(newStory) {
    //             newStoryID = newStory._id;
    //             done();
    //         });
    //     });

    //     it('Adds friend to story', function(done) {
    //         clientA
    //             .put('/api/stories/' + newStoryID + '/collaborators')
    //             .send({
    //                 collaborators: [newUserID],
    //             })
    //             .expect(200)
    //             .end(function(err, res) {
    //             	console.log('STORY IN FORNT END', res.body)
    //                 if (err) return done(err);
    //                 expect(res.body.title).to.equal('Another Great Story');
    //                 expect(res.body.friends).to.be.an('array');
    //                 Story.findById(res.body._id, function(err, b) {
    //                     if (err) return done(err);
    //                     expect(b).to.not.be.null;
    //                     done();
    //                 });
    //             });
    //     });

    // });


});
