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
        username: 'topdogg',
        email: 'admin@me.com',
        password: '123',
    },
    {   
        username: 'itsmeg',
        email: 'me@me.com',
        password: '123',
    },
    {
        username: 'dbdogg',
        email: 'debanshi@me.com',
        password: '123',
    },
    {   
        username: 'mynamejeff',
        email: 'jeff@me.com',
        password: '123',
    },
    {
        username: 'henrythehomie',
        email: 'henry@me.com',
        password: '123',
    },
    {
        username: 'traubitz',
        email: 'eric@me.com',
        password: '123',
    },
    {
        username: 'katmello',
        email: 'kat@me.com',
        password: '123',
    },
    {
        username: 'rotatingrafi',
        email: 'rafi@me.com',
        password: '123',
    },
    {
        username: 'daninthevans',
        email: 'dan@me.com',
        password: '123',
    },
    {
        username: 'gabetheninja',
        email: 'gabe@me.com',
        password: '123',
    },
    {
        username: 'omriwankanobi',
        email: 'omri@me.com',
        password: '123',
    },
    {
        username: 'itsjoeyo',
        email: 'joe@me.com',
        password: '123',
    },
    {
        username: 'nowayjose',
        email: 'jose@me.com',
        password: '123',
    },
    {
        username: 'dyang',
        email: 'david@me.com',
        password: '123',
    },
    {
        username: 'nimitinit',
        email: 'nimit@me.com',
        password: '123',
    }
];

var addonSeed = [
    {
        name: 'none_none_narration',
        source: 'assets/bubbles/thought_rightTop.png',
        thumbnail: 'assets/bubbles/narration_white_black.png',
        type: 'bubble'
    },    
    {
        name: 'left_bottom_speech',
        source: 'assets/bubbles/speech_leftBottom.png',
        thumbnail: 'assets/bubbles/speech_leftBottom.png',
        type: 'bubble'
    },    
    {
        name: 'left_top_speech',
        source: 'assets/bubbles/speech_leftTop.png',
        thumbnail: 'assets/bubbles/speech_leftTop.png',
        type: 'bubble'
    },    
    {
        name: 'right_bottom_speech',
        source: 'assets/bubbles/speech_rightBottom.png',
        thumbnail: 'assets/bubbles/speech_rightBottom.png',
        type: 'bubble'
    },    
    {
        name: 'right_top_speech',
        source: 'assets/bubbles/speech_rightTop.png',
        thumbnail: 'assets/bubbles/speech_rightTop.png',
        type: 'bubble'
    },        
    {
        name: 'left_bottom_thought',
        source: 'assets/bubbles/thought_leftBottom.png',
        thumbnail: 'assets/bubbles/thought_leftBottom.png',
        type: 'bubble'
    },    
    {
        name: 'right_bottom_thought',
        source: 'assets/bubbles/thought_rightBottom.png',
        thumbnail: 'assets/bubbles/thought_rightBottom.png',
        type: 'bubble'
    },    
    {
        name: 'left_top_thought',
        source: 'assets/bubbles/thought_leftTop.png',
        thumbnail: 'assets/bubbles/thought_leftTop.png',
        type: 'bubble'
    },    
    {
        name: 'right_top_thought',
        source: 'assets/bubbles/thought_rightTop.png',
        thumbnail: 'assets/bubbles/thought_rightTop.png',
        type: 'bubble'
    },      
    {
        name: 'Sticker A',
        source: 'assets/stickers/baaam.png',
        thumbnail: 'assets/stickers/baaam.png',
        type: 'sticker'
    },
    {
        name: 'Sticker B',
        source: 'assets/stickers/boooom.png',
        thumbnail: 'assets/stickers/boooom.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker C',
        source: 'assets/stickers/call_me.png',
        thumbnail: 'assets/stickers/call_me.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker D',
        source: 'assets/stickers/coolio.png',
        thumbnail: 'assets/stickers/coolio.png',
        type: 'sticker'
    },
    {
        name: 'Sticker E',
        source: 'assets/stickers/exclamation.png',
        thumbnail: 'assets/stickers/exclamation.png',
        type: 'sticker'
    },
    {
        name: 'Sticker F',
        source: 'assets/stickers/exclamation2.png',
        thumbnail: 'assets/stickers/exclamation2.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker G',
        source: 'assets/stickers/fist_bump.png',
        thumbnail: 'assets/stickers/fist_bump.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker H',
        source: 'assets/stickers/huh.png',
        thumbnail: 'assets/stickers/huh.png',
        type: 'sticker'
    },
    {
        name: 'Sticker I',
        source: 'assets/stickers/i_like.png',
        thumbnail: 'assets/stickers/i_like.png',
        type: 'sticker'
    },
    {
        name: 'Sticker J',
        source: 'assets/stickers/kapow.png',
        thumbnail: 'assets/stickers/kapow.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker K',
        source: 'assets/stickers/lolol.png',
        thumbnail: 'assets/stickers/lolol.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker L',
        source: 'assets/stickers/luv_u.png',
        thumbnail: 'assets/stickers/luv_u.png',
        type: 'sticker'
    },
    {
        name: 'Sticker M',
        source: 'assets/stickers/okiedokie.png',
        thumbnail: 'assets/stickers/okiedokie.png',
        type: 'sticker'
    },
    {
        name: 'Sticker N',
        source: 'assets/stickers/omg.png',
        thumbnail: 'assets/stickers/omg.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker O',
        source: 'assets/stickers/ooopsie.png',
        thumbnail: 'assets/stickers/ooopsie.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker P',
        source: 'assets/stickers/pow.png',
        thumbnail: 'assets/stickers/pow.png',
        type: 'sticker'
    },
    {
        name: 'Sticker Q',
        source: 'assets/stickers/powpow.png',
        thumbnail: 'assets/stickers/powpow.png',
        type: 'sticker'
    },
    {
        name: 'Sticker R',
        source: 'assets/stickers/pretty_please.png',
        thumbnail: 'assets/stickers/pretty_please.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker S',
        source: 'assets/stickers/so_sorry.png',
        thumbnail: 'assets/stickers/so_sorry.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker T',
        source: 'assets/stickers/thank_you.png',
        thumbnail: 'assets/stickers/thank_you.png',
        type: 'sticker'
    },
    {
        name: 'Sticker U',
        source: 'assets/stickers/wow.png',
        thumbnail: 'assets/stickers/wow.png',
        type: 'sticker'
    },
    {
        name: 'Sticker V',
        source: 'assets/stickers/yessir.png',
        thumbnail: 'assets/stickers/yessir.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker W',
        source: 'assets/stickers/zaaaaaaap.png',
        thumbnail: 'assets/stickers/zaaaaaaap.png',
        type: 'sticker'
    },    
    {
        name: 'Sticker X',
        source: 'assets/stickers/zaaap.png',
        thumbnail: 'assets/stickers/zaaap.png',
        type: 'sticker'
    },
    {
        name: 'Blue Border',
        source: 'assets/borders/blue-border.png',
        thumbnail: 'assets/borders/thumbnails/blue-border.png',
        type: 'border'
    },
    {
        name: 'Green Border',
        source: 'assets/borders/green-border.png',
        thumbnail: 'assets/borders/thumbnails/green-border.png',
        type: 'border'
    },    
    {
        name: 'Orange Border',
        source: 'assets/borders/orange-border.png',
        thumbnail: 'assets/borders/thumbnails/orange-border.png',
        type: 'border'
    },
    {
        name: 'Maroon Border',
        source: 'assets/borders/maroon-border1.png',
        thumbnail: 'assets/borders/thumbnails/maroon-border1.png',
        type: 'border'
    },
    {
        name: 'Dark Blue Border',
        source: 'assets/borders/dar-blue-border1.png',
        thumbnail: 'assets/borders/thumbnails/dar-blue-border1.png',
        type: 'border'
    },    
    {
        name: 'Yellow Border',
        source: 'assets/borders/yellow-border1.png',
        thumbnail: 'assets/borders/thumbnails/yellow-border1.png',
        type: 'border'
    }, 
    {
        name: 'Dark Red Border',
        source: 'assets/borders/red-border1.png',
        thumbnail: 'assets/borders/thumbnails/red-border1.png',
        type: 'border'
    },    
    {
        name: 'Black Border',
        source: 'assets/borders/black-border1.png',
        thumbnail: 'assets/borders/thumbnails/black-border1.png',
        type: 'border'
    },   
    // {
    //     name: 'Border D',
    //     source: 'assets/borders/purpleframe.png',
    //     thumbnail: 'assets/borders/thumbnails/purpleframe.png',
    //     type: 'border'
    // },
    // {
    //     name: 'Border E',
    //     source: 'assets/borders/redframe.png',
    //     thumbnail: 'assets/borders/thumbnails/redframe.png',
    //     type: 'border'
    // },
    // {
    //     name: 'Border F',
    //     source: 'assets/borders/redheart.png',
    //     thumbnail: 'assets/borders/thumbnails/redheart.png',
    //     type: 'border'
    // },    
    // {
    //     name: 'Border G',
    //     source: 'assets/borders/whitecircle.png',
    //     thumbnail: 'assets/borders/thumbnails/whitecircle.png',
    //     type: 'border'
    // },    
    // {
    //     name: 'Border H',
    //     source: 'assets/borders/whitefunky.png',
    //     thumbnail: 'assets/borders/thumbnails/whitefunky.png',
    //     type: 'border'
    // },
    {
        name: 'Border I',
        source: 'assets/borders/whitesquare.png',
        thumbnail: 'assets/borders/thumbnails/whitesquare.png',
        type: 'border'
    },
    {
        name: 'Filter A',
        source: 'https://placehold.it/125x125/563376/025462/?text=Filter+A+125+x+125',
        thumbnail: 'https://placehold.it/125x125/934636/025462/?text=Bubble+A+125+x+125',
        type: 'filter'
    },
    {
        name: 'Filter B',
        source: 'https://placehold.it/125x125/563376/025462/?text=Filter+B+125+x+125',
        thumbnail: 'https://placehold.it/125x125/934636/025462/?text=Bubble+A+125+x+125',
        type: 'filter'
    },    
    {
        name: 'Filter C',
        source: 'https://placehold.it/125x125/563376/025462/?text=Filter+C+125+x+125',
        thumbnail: 'https://placehold.it/125x125/934636/025462/?text=Bubble+A+125+x+125',
        type: 'filter'
    },    
    {
        name: 'Filter D',
        source: 'https://placehold.it/125x125/563376/025462/?text=Filter+D+125+x+125',
        thumbnail: 'https://placehold.it/125x125/934636/025462/?text=Bubble+A+125+x+125',
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
