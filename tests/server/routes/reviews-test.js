// // Instantiate all models
// var mongoose = require('mongoose');
// require('../../../server/db/models');
// var Reviews = mongoose.model('Reviews');

// var expect = require('chai').expect;

// var dbURI = 'mongodb://localhost:27017/testingDB';
// var clearDB = require('mocha-mongoose')(dbURI);

// var supertest = require('supertest');
// var app = require('../../../server/app');


// describe('Reviews Route', function() {

//     beforeEach('Establish DB connection', function(done) {
//         if (mongoose.connection.db) return done();
//         mongoose.connect(dbURI, done);
//     });

//     afterEach('Clear test database', function(done) {
//         clearDB(done);
//     });

//     describe('Creating a review', function() {

//         var clientA = supertest.agent(app);

//         it('POST one', function(done) {
//             clientA
//                 .post('/api/reviews')
//                 .send({
//                     rating: 4,
//                     comment: 'Really loved this place'
//                 })
//                 .expect(201)
//                 .end(function(err, res) {
//                     if (err) return done(err);
//                     expect(res.body.rating).to.equal(4);
//                     expect(res.body.comment).to.equal('Really loved this place');
//                     expect(res.body._id).to.exist;
//                     Reviews.findById(res.body._id, function(err, b) {
//                         if (err) return done(err);
//                         expect(b).to.not.be.null;
//                         done();
//                     });
//                 });
//         });

//     });

//     describe('Getting all reviews', function() {

//         var clientA = supertest.agent(app);

//         it('GET all reviews', function(done) {
//             clientA
//                 .get('/api/reviews')
//                 .expect(200)
//                 .end(function(err, res) {
//                     if (err) return done(err);
//                     expect(res.body).to.be.an('array');
//                     done();
//                 });
//         });

//     });


//     describe('Getting one review by ID', function() {

//         var newReview = {
//             rating: 3,
//             comment: 'Not too shabby',
//         };

//         var newReviewID;

//         beforeEach('Create a review', function (done) {
//             Reviews.create(newReview)
//             .then(function(review) {
//                 newReviewID = review._id;
//                 done();
//             });
//         });


//         var clientA = supertest.agent(app);

//         it('GET one by ID', function(done) {
//             clientA
//                 .get('/api/reviews/' + newReviewID)
//                 .expect(200)
//                 .end(function(err, res) {
//                     if (err) return done(err);
//                     expect(res.body.rating).to.equal(3);
//                     expect(res.body.comment).to.equal('Not too shabby');
//                     expect(res.body).to.be.an('object');
//                     expect(res.body._id).to.exist;    
//                     done();
//                 });
//         });

//     });



//     describe('Deletes one review by ID', function() {

//         var newReview = {
//             rating: 3,
//             comment: 'Not too shabby',
//         };

//         var newReviewID;

//         beforeEach('Create a review', function (done) {
//             Reviews.create(newReview)
//             .then(function(review) {
//                 newReviewID = review._id;
//                 done();
//             });
//         });


//         var clientA = supertest.agent(app);

//         it('DELETE one by ID', function(done) {
//             clientA
//                 .delete('/api/reviews/' + newReviewID)
//                 .expect(204)
//                 .end(function(err, res) {
//                     if (err) return done(err);    
//                     done();
//                 });
//         });

//     });

// });
