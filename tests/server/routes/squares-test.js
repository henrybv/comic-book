// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var Story = mongoose.model('Story');
var User = mongoose.model('User');
var Square = mongoose.model('Square');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest');
var app = require('../../../server/app');


describe('Square Route', function() {

    beforeEach('Establish DB connection', function(done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    var newUserID;
    var newUser = {
    	username: 'aNewUser'
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
        owner: newUserID
    };

    beforeEach('Add collaborator to a story', function (done) {
        Story.create(newStory)
        .then(function(newStory) {
            newStoryID = newStory._id;
            done();
        });
    });


    afterEach('Clear test database', function(done) {
        clearDB(done);
    });

    describe('Creating a square', function() {

        var clientA = supertest.agent(app);

        it('POST one', function(done) {
            clientA
                .put('/api/stories/' + newStoryID + '/squares')
                .send({
                    creator: newUserID,
                })
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(String(res.body.creator._id)).to.equal(String(newUserID));
                    expect(res.body._id).to.exist;
                    Square.findById(res.body._id, function(err, b) {
                        if (err) return done(err);
                        expect(b).to.not.be.null;
                        done();
                    });
                });
        });

    });


	// describe('Creating a square', function() {

 //        var clientA = supertest.agent(app);

 //        var newSquareID;

	// 	clientA
 //            .put('/api/stories/' + newStoryID + '/squares')
 //            .send({
 //                creator: newUserID,
 //        })
 //        .end(function(err, res) {
 //        	console.log('RES DATA:',res.data)
 //        	newSquareID = res.body._id;
 //        })

 //        it('Delete one square', function(done) {
 //            clientA
 //                .put('/api/stories/' + newStoryID + '/squares/' + newSquareID)
 //                .expect(201)
 //                .end(function(err, res) {
 //                    if (err) return done(err);
 //                    expect(res.body._id).to.exist;
 //                    expect(res.body.squares).to.have.lengthOf(0);
 //                    Square.findById(res.body._id, function(err, b) {
 //                        if (err) return done(err);
 //                        expect(b).to.not.be.null;
 //                        done();
 //                    });
 //                });
 //        });

 //    });




    describe('Getting square by ID', function() {

        var clientA = supertest.agent(app);

        var newSquareID;
	    var newSquare = {
	    	story: newStoryID
	    };
	    beforeEach('Create a square', function (done) {
	        Square.create(newSquare)
	        .then(function(square) {
	            newSquareID = square._id;
	            done();
	        });
	    });

        it('GET square by id', function(done) {
            clientA
                .get('/api/squares/' + newSquareID)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(String(res.body._id)).to.equal(String(newSquareID));
                    done();
                });
        });

    });


    describe('Updating a square', function() {

        var clientA = supertest.agent(app);

        var newSquareID;
        var newSquare = {
            story: newStoryID
        };
        beforeEach('Create a square', function (done) {
            Square.create(newSquare)
            .then(function(square) {
                newSquareID = square._id;
                done();
            });
        });


        it('Adds finalImage to square', function(done) {
            clientA
                .put('/api/squares/' + newSquareID)
                .send({
                    finalImage: 'adataurlstring',
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.finalImage).to.equal('adataurlstring');
                    expect(String(res.body._id)).to.equal(String(newSquareID));
                    Square.findById(res.body._id, function(err, b) {
                        if (err) return done(err);
                        expect(b).to.not.be.null;
                        done();
                    });
                });
        });

    });

});