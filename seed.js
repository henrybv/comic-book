/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = mongoose.model('User');
var Addon = mongoose.model('Addon');
var Story = mongoose.model('Story');
var Square = mongoose.model('Square');



var userSeed = [
    {
        email: 'admin@me.com',
        password: '123',
    },
    {
        email: 'me@me.com',
        password: '123',
    },
    {
        email: 'debanshi@me.com',
        password: '123',
    },
    {
        email: 'jeff@me.com',
        password: '123',
    },
    {
        email: 'henry@me.com',
        password: '123',
    },
    {
        email: 'eric@me.com',
        password: '123',
    },
    {
        email: 'kat@me.com',
        password: '123',
    },
    {
        email: 'rafi@me.com',
        password: '123',
    },
    {
        email: 'dan@me.com',
        password: '123',
    },
    {
        email: 'gabe@me.com',
        password: '123',
    },
    {
        email: 'omri@me.com',
        password: '123',
    },
    {
        email: 'joe@me.com',
        password: '123',
    },
    {
        email: 'jose@me.com',
        password: '123',
    },
    {
        email: 'david@me.com',
        password: '123',
    },
    {
        email: 'nimit@me.com',
        password: '123',
    }
];

var addonSeed = [
    {
        name: 'Bubble A',
        source: 'https://placehold.it/125x125/934636/025462/?text=Bubble+A+125+x+125',
        type: 'bubble'
    },    
    {
        name: 'Bubble B',
        source: 'https://placehold.it/125x125/934636/025462/?text=Bubble+B+125+x+125',
        type: 'bubble'
    },    
    {
        name: 'Bubble C',
        source: 'https://placehold.it/125x125/934636/025462/?text=Bubble+C+125+x+125',
        type: 'bubble'
    },    
    {
        name: 'Bubble D',
        source: 'https://placehold.it/125x125/934636/025462/?text=Bubble+D+125+x+125',
        type: 'bubble'
    },    
    {
        name: 'Sticker A',
        source: 'https://placehold.it/125x125/466636/025462/?text=Sticket+A+125+x+125',
        type: 'sticker'
    },
    {
        name: 'Sticker B',
        source: 'https://placehold.it/125x125/466636/025462/?text=Sticket+B+125+x+125',
        type: 'sticker'
    },    {
        name: 'Sticker C',
        source: 'https://placehold.it/125x125/466636/025462/?text=Sticket+C+125+x+125',
        type: 'sticker'
    },    {
        name: 'Sticker D',
        source: 'https://placehold.it/125x125/466636/025462/?text=Sticket+D+125+x+125',
        type: 'sticker'
    },
    {
        name: 'Border A',
        source: 'https://placehold.it/125x125/233376/025462/?text=Border+A+125+x+125',
        type: 'border'
    },
    {
        name: 'Border B',
        source: 'https://placehold.it/125x125/233376/025462/?text=Border+B+125+x+125',
        type: 'border'
    },    
    {
        name: 'Border C',
        source: 'https://placehold.it/125x125/233376/025462/?text=Border+C+125+x+125',
        type: 'border'
    },    
    {
        name: 'Border D',
        source: 'https://placehold.it/125x125/233376/025462/?text=Border+D+125+x+125',
        type: 'border'
    },
    {
        name: 'Filter A',
        source: 'https://placehold.it/125x125/563376/025462/?text=Filter+A+125+x+125',
        type: 'filter'
    },
    {
        name: 'Filter B',
        source: 'https://placehold.it/125x125/563376/025462/?text=Filter+B+125+x+125',
        type: 'filter'
    },    
    {
        name: 'Filter C',
        source: 'https://placehold.it/125x125/563376/025462/?text=Filter+C+125+x+125',
        type: 'filter'
    },    
    {
        name: 'Filter D',
        source: 'https://placehold.it/125x125/563376/025462/?text=Filter+D+125+x+125',
        type: 'filter'
    },


];

var storySeed = [
    {
        title: 'Jeffs Story',
        friends: [],
        squares: []
    },
    {
        title: 'Henrys Story',
        friends: [],
        squares: []
    },
    {
        title: 'Erics Story',
        friends: [],
        squares: []
    },
    {
        title: 'Debanshis Story',
        friends: [],
        squares: []
    },
    {
        title: 'Jacks Story',
        friends: [],
        squares: []
    },
    {
        title: 'Jennifers Story',
        friends: [],
        squares: []
    },
    {
        title: 'Davids Story',
        friends: [],
        squares: []
    },
    {
        title: 'A Lovely Story',
        friends: [],
        squares: []
    },
    
];

var squareSeed = [
    {
        picture: "http://placehold.it/375x375?text=picture+375+x+375",
        filteredPic: "http://placehold.it/375x375/934636/025462/?text=filteredPic+375+x+375",
        finalImage: "http://placehold.it/375x375/132288/000000/?text=finalImage+375+x+375"
    },
    {
        picture: "http://placehold.it/375x375?text=picture+375+x+375",
        filteredPic: "http://placehold.it/375x375/934636/025462/?text=filteredPic+375+x+375",
        finalImage: "http://placehold.it/375x375/132288/000000/?text=finalImage+375+x+375"
    },
    {
        picture: "http://placehold.it/375x375?text=picture+375+x+375",
        filteredPic: "http://placehold.it/375x375/934636/025462/?text=filteredPic+375+x+375",
        finalImage: "http://placehold.it/375x375/132288/000000/?text=finalImage+375+x+375"
    },
    {
        picture: "http://placehold.it/375x375?text=picture+375+x+375",
        filteredPic: "http://placehold.it/375x375/934636/025462/?text=filteredPic+375+x+375",
        finalImage: "http://placehold.it/375x375/132288/000000/?text=finalImage+375+x+375"
    },
    {
        picture: "http://placehold.it/375x375?text=picture+375+x+375",
        filteredPic: "http://placehold.it/375x375/934636/025462/?text=filteredPic+375+x+375",
        finalImage: "http://placehold.it/375x375/132288/000000/?text=finalImage+375+x+375"
    }
];

var wipeCollections = function () {
    var models = [User, Addon, Story, Square];

    return Promise.map(models, function(model) {
        return model.remove({}).exec();
    });
};

var seedDB = function() {
    var randomizeSelector = function(array) {
      var random = Math.floor(Math.random() * array.length);
      var randomSelection = array[random];
      return randomSelection;
    };

    var storiesList;
    var squaresList
    var usersList;
    return Square.create(squareSeed)
    // .then(function(squares){
    //     squaresList = squares
    //     return Story.create(storySeed)
    // })
    .then(function(squares) {
        squaresList = squares;
        console.log("squaresList", squaresList)
        return User.create(userSeed);
    })
    .then(function(users){
        usersList = users;
        console.log("usersList", usersList)
        return Promise.map(storySeed, function(story) {
            //Creation of random squares and users
            var squareToAddToStory1 = randomizeSelector(squaresList);
            var squareToAddToStory2 = randomizeSelector(squaresList);
            var squareToAddToStory3 = randomizeSelector(squaresList);
            var squareToAddToStory4 = randomizeSelector(squaresList);
            var squareToAddToStory5 = randomizeSelector(squaresList);
            var userToAddToStory1 = randomizeSelector(usersList);
            var userToAddToStory2 = randomizeSelector(usersList);
            var userToAddToStory3 = randomizeSelector(usersList);
            // console.log("squareToAdd:", squareToAddToStory1)

            //Pushing them into the seedfile object
            story.squares.push(squareToAddToStory1._id);
            story.squares.push(squareToAddToStory2._id);
            story.squares.push(squareToAddToStory3._id);
            story.squares.push(squareToAddToStory4._id);
            story.squares.push(squareToAddToStory5._id);
            story.owner = randomizeSelector(usersList)
            story.friends.push(userToAddToStory1._id);
            story.friends.push(userToAddToStory2._id);
            story.friends.push(userToAddToStory3._id);

            //creating the story with the adjusted seedfile object, now populated with completed stories
            return Story.create(story);
        });
    })
    .then(function(stories){
        console.log("Stories", stories)
        return Addon.create(addonSeed)
    })
    .then(function(addons){
        console.log("ADDONS:", addons)
    })
};

connectToDb
    .then(function () {
        return wipeCollections();
    })
    .then(function () {
        return seedDB();
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
