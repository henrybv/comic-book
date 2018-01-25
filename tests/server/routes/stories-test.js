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

    describe('Creating a story', function() {

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

        it('POST one', function(done) {
            clientA
                .post('/api/stories')
                .send({
                    title: "New Story",
                    owner: newUserID
                })
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.title).to.equal('New Story');
                    expect(res.body.owner).to.exist;
                    expect(res.body._id).to.exist;
                    Story.findById(res.body._id, function(err, b) {
                        if (err) return done(err);
                        expect(b).to.not.be.null;
                        done();
                    });
                });
        });

    });

    describe('Getting all stories', function() {

        var clientA = supertest.agent(app);

        it('GET all stories', function(done) {
            clientA
                .get('/api/stories')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });

    });


    describe('Getting one story by ID', function() {

    	var newStoryID;
        var newStory = {
            title: 'A Great Story',
        };

        beforeEach('Create a story', function (done) {
            Story.create(newStory)
            .then(function(newStory) {
                newStoryID = newStory._id;
                done();
            });
        });

        var clientA = supertest.agent(app);

        it('GET one by ID', function(done) {
            clientA
                .get('/api/stories/' + newStoryID)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.title).to.equal('A Great Story');
                    expect(res.body.squares).to.be.an('array');
                    expect(res.body.friends).to.be.an('array');
                    expect(res.body).to.be.an('object');
                    expect(res.body._id).to.exist;    
                    done();
                });
        });

    });



    describe('Deletes one story by ID', function() {

        var newStory = {
            title: 'Story To Delete'
        };

        var newStoryID;

        beforeEach('Delete a story', function (done) {
            Story.create(newStory)
            .then(function(newStory) {
                newStoryID = newStory._id;
                done();
            });
        });


        var clientA = supertest.agent(app);

        it('DELETE one by ID', function(done) {
            clientA
                .delete('/api/stories/' + newStoryID)
                .expect(204)
                .end(function(err, res) {
                    if (err) return done(err);    
                    done();
                });
        });

    });



    describe('Adding a collaborator/friend to a story', function() {

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

        var newStoryID;
        var newStory = {
            title: 'Another Great Story',
        };

        beforeEach('Add collaborator a story', function (done) {
            Story.create(newStory)
            .then(function(newStory) {
                newStoryID = newStory._id;
                done();
            });
        });

        it('Adds friend to story', function(done) {
            clientA
                .put('/api/stories/' + newStoryID + '/collaborators')
                .send({
                    collaborators: [newUserID],
                })
                .expect(200)
                .end(function(err, res) {
                	console.log('STORY IN FORNT END', res.body)
                    if (err) return done(err);
                    expect(res.body.title).to.equal('Another Great Story');
                    expect(res.body.friends).to.be.an('array');
                    Story.findById(res.body._id, function(err, b) {
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
