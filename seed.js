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
var Order = mongoose.model('Order');
var Product = mongoose.model('Product');
var Review = mongoose.model('Reviews');



var userSeed = [
    {
        username: 'Admin',
        email: 'admin@me.com',
        password: '123',
        isAdmin: true,
        role: 'Admin',
        firstName: 'Jennifer',
        lastName: 'Rittwiger',
        avatar: '/assets/images/user1.jpg'
    },
    {
        username: 'Cassandra',
        email: 'me@me.com',
        password: '123',
        isAdmin: false,
        role: 'Seller',
        firstName: 'Cassandra',
        lastName: 'Redding',
        avatar: '/assets/images/user2.jpg'
    },
    {
        username: 'Alyx',
        email: 'me1@me.com',
        password: '123',
        isAdmin: false,
        role: 'Customer',
        firstName: 'Alyx',
        lastName: 'Bookman',
        avatar: '/assets/images/user3.jpg'
    },
    {
        username: 'Erik',
        email: 'me2@me.com',
        password: '123',
        isAdmin: false,
        role: 'Customer',
        firstName: 'Erik',
        lastName: 'Huntington',
        avatar: '/assets/images/user4.jpg'
    },
    {
        username: 'Jon',
        email: 'me3@me.com',
        password: '123',
        isAdmin: false,
        role: 'Seller',
        firstName: 'Jon',
        lastName: 'Russel',
        avatar: '/assets/images/user5.jpg'
    },
    {
        username: 'Ryan',
        email: 'me4@me.com',
        password: '123',
        isAdmin: false,
        role: 'Customer',
        firstName: 'Ryan',
        lastName: 'Callahan',
        avatar: '/assets/images/user6.jpg'
    }
];

var orderSeed = [
    {
        sessionId: 'OblUqs2K95KldfV3oV1EEZnMUZjUJeY8',
        status: 'cart',
        products: []
    },
    {
        sessionId: 'DBHDEZMz3d3eXQA7q9G1g9Nln9KoeSXN',
        status: 'cart',
        products: []
    },
    {
        sessionId: 'DBHDEZMz3d3eXQA7q9G1g9Nln9KoeSXN',
        status: 'complete',
        products: []
    },
    {
        sessionId: 'wSKeHI5b4qOMG3mAQW1k7b0mbuYZ0PiC-',
        status: 'complete',
        products: []
    },
    {
        sessionId: 'OblUqs2K95KldfV3oV1EEZnMUZjUJeY8',
        status: 'complete',
        products: []
    }
];

var productSeed = [
    {
        title: 'Hawaian Getaway',
        description: 'Hawaii is a destination dreamt by most of the people. If you like good weather, perfect setting, magnificent views, beautiful blue waters, traditional hula-dancing and exquisite cuisine, come to Hawaii to experience the true Polynesian culture. You can start your discovery by visiting all the islands that form this magnificent archipelago. Kauiai is the northernmost island in this volcanic chain and offers an unforgettable sight of natural and wild beauty. The beaches along the Coconut Coast are the perfect place to take a long, relaxing walk or to enjoy a romantic escapade. New discoveries are to be made at the Grand Canyon of the Pacific, in the massive Waimea Canyon. Oahu is the place where you will meet a lot of people of different origins, traditions and culture. Most of the island rises to the expectations of the 21st century and cultural, natural wonders will amaze you. The North Shore is usually very busy during the time of big winter waves, when the surfers are repeatedly attempting to defeat the powers of the ocean. If youre not such a great surfer but would like to catch an insight to the wonders of surfing, try it yourself on Waikiki beach, the perfect place for new-comers and amateurs.The island of Molokai is not as modern as the rest. It managed to preserve its natural setting, its history and native culture. Kaunakakaki is more of a sleepy-town which is just perfect for relaxing and meditating. Halawa Valley is a sight not to be missed by any chance thanks to its verdant flora.',
        location: 'Hawaii',
        categories: ['waterfalls', 'ocean', 'mountains', 'nature', 'beaches', 'snorkeling', 'fish', 'hiking', 'swimming'],
        price: 5000,
        inventory: 500,
        coordinates: [19.8968, 155.5828],
        images: ['http://hdwallpaperfun.com/wp-content/uploads/2014/09/Hawaii-Wallpaper-High-Res-Pics-54655.jpeg', 'http://soaquipassagensbaratas.com.br/wp-content/uploads/2014/08/eua7.jpg', 'https://i.ytimg.com/vi/EebVVEvm75Y/maxresdefault.jpg', 'http://www.aloha-hawaiian.com/images/newsite/HawaiiSunsetHoneymoon.jpg']
    },
    {
        title: 'Grand Canyon Expidition',
        description: 'The Territory of Arizona comprises the extreme south-western portion of the United States. It is bounded on the north by Nevada and Utah, on the east by New Mexico, on the south by Sonora, on the west by California and Nevada. It extends from the one hundred and ninth meridian west to the Great Colorado; and from 31° 28 of north latitude to the thirty-seventh parallel, and contains an area of about 114,000 square miles. The physical features of the Territory may be described as a series of elevated plateau, having an altitude of from 100 feet in the south-west, up to 6,000 and 7,000 feet above the sea level, in the north. Mountain ranges, having a general direction of north-west by south-east, extend over this lofty plateau the entire length of the Territory. These mountains often present the appearance of broken and detached spurs, and sometimes occur in regular and continuous ranges. Narrow valleys and wide, open plains lie between the mountains, while deep canyons and gorges, formed by the rains and floods, which sometimes rush with irresistible force from the mountain barriers, cross the country in every direction. The most extensive of these grand mesas, or table lands, is the Colorado plateau, in the northern portion of the Territory, occupying nearly two-fifths of its entire area. This great plateau has an average altitude of between 5,000 and 6,000 feet. Its surface is diversified by lofty peaks and isolated ranges; it is covered nearly its entire extent with fine grasses; it is penetrated on the west by the Rio Colorado, which has worn a channel thousands of feet in depth. It is also cut by the San Juan on the north-east, and the Little Colorado, the Verde, the Salinas, and the San Francisco on the south. These rivers form in places deep gorges, and again widen into beautiful and productive valleys.',
        location: 'Arizona',
        categories: ['Grand Canyon', 'hot', 'desert', 'sun', 'hiking'],
        price: 3000,
        inventory: 500,
        coordinates: [36.1128, -113.9961],
        images: ['http://www.thecanyon.com/assets/css/images/grandcanyon1.jpg', 'https://media.deseretdigital.com/file/b41fa91284?crop=top:0%7Cleft:0%7Cwidth:1260%7Cheight:670%7Cgravity:Center&resize=width:1260&order=resize,crop&c=14&a=c856f78c', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUujpnAirDSgJhNJ-AifEWa0NDXi7ODarSVVHdS1AnvroIJfdi', 'http://i.huffpost.com/gen/1585786/images/o-GRAND-CANYON-RIVER-facebook.jpg']

    },
    {
        title: 'African Adventure',
        description: 'Africa is a land of great diversity. It is the second largest continent in the world. If you were to travel through the 53 countries of Africa, you would see many things. The weather ranges from very hot desert climate to wet rainforests to permanently frozen glaciers. The landforms include tropical islands, flat plains, and very steep mountains.The people of Africa are just as diverse. There are over a thousand languages spoken in Africa. People come from many tribes. They practice many religions. They hold a variety of jobs, from simple farming to service jobs in teaching and medicine to industrial jobs.Despite all this diversity, Africa has a strong identity as a continent. This book will look at the physical geography of Africa and how it has affected life there.',
        location: 'Africa',
        categories: ['animals', 'safari', 'sahara', 'wildlife', 'nature'],
        price: 4000,
        inventory: 500,
        coordinates: [17.5707, 3.9962],
        images: ['https://i.ytimg.com/vi/lugard7P0nw/maxresdefault.jpg', 'http://eskipaper.com/images/africa-landscape-wallpaper-1.jpg', 'http://cdn.playbuzz.com/cdn/a9ef0d8c-0aa0-4796-b512-8f348ea8eeb5/2faf3263-7f6d-4843-9156-bc257dbf8911.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaMUt6UIfVaiEqyPDFSK7v0qNGJmtwR0ThSosz1p5OdXFrcZMn']
    },
    {
        title: 'Australian Undertaking',
        description: 'Australia is a stable, democratic and culturally diverse nation with a highly skilled workforce and one of the strongest performing economies in the world.With spectacular landscapes and a rich ancient culture, Australia is a land like no other. It is the earths sixth-largest country in land area and is the only nation to govern an entire continent.Australia in Brief provides an authoritative overview of Australias history, the land, its people and their way of life. It also looks at Australias economic, scientific and cultural achievements and its foreign, trade and defence policies.  This is the 50th edition of Australia in Brief, revised and updated in October 2014. The Department of Foreign Affairs and Trade is grateful for assistance from other Government departments and agencies, and various private organisations who have licensed the use of photos and graphics. Money values are given in Australian dollars unless otherwise indicated. Weights and measures are metric and imperial.',
        location: 'Australia',
        categories: ['wildlife', 'desert', 'hot', 'safari', 'ocean', 'nature', 'biking', 'snorkeling'],
        price: 2000,
        inventory: 500,
        coordinates: [-25.2744, 133.7751],
        images: ['https://images.unsplash.com/photo-1456023054428-0f2118ef3180?crop=entropy&dpr=2&fit=crop&fm=jpg&h=750&ixjsv=2.1.0&ixlib=rb-0.3.5&q=50&w=1300', 'https://images.unsplash.com/photo-1447953696461-df240a5320a3?crop=entropy&dpr=2&fit=crop&fm=jpg&h=750&ixjsv=2.1.0&ixlib=rb-0.3.5&q=50&w=1300', 'https://images.unsplash.com/photo-1421992110690-5b12e022c666?crop=entropy&dpr=2&fit=crop&fm=jpg&h=750&ixjsv=2.1.0&ixlib=rb-0.3.5&q=50&w=1300', 'https://images.unsplash.com/photo-1445986478946-8504638d4eab?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=1080&fit=max&s=e25648c37ff5bef668a03376e7df17bd']
    },
    {
        title: 'Egyptian Excursion',
        description: 'The Nile Valley and Delta, the most extensive oasis on earth, was created by the worlds longest river and its seemingly inexhaustible sources. Without the topographic channel that permits the Nile to flow across the Sahara, Egypt would be entirely desert. The length within Egypt of the River Nile in its northwards course from three central African sources – the White Nile, the Blue Nile, and the Atbara – totals some 1,600 km.The White Nile, which begins at Lake Victoria in Uganda, supplies about 28% of the Niles Egyptian waters. In its course from Lake Victoria to Juba in South Sudan, the White Niles channel drops more than 600 m. In its 1,600-km course from Juba to Khartoum, Sudans capital, the river descends just 75 m. In South Sudan, the White Nile passes through the Sudd, a wide, flat plain covered with swamp vegetation and slows almost to the point of stagnation.The Blue Nile, which originates at Lake Tana in Ethiopia, provides on average some 58% of the Niles Egyptian waters. This river has a steeper gradient and therefore flows more swiftly than the White Nile, which it joins at Khartoum. Unlike the White Nile, the Blue Nile carries a considerable amount of sediment. For several kilometres north of Khartoum, water closer to the eastern bank of the river, coming from the Blue Nile, is visibly muddy, while that closer to the western bank, and coming from the White Nile, is clearer.The much shorter Atbara River, which also originates in Ethiopia, joins the main Nile north of Khartoum between the fifth and sixth cataracts (areas of steep rapids) and provides about 14% of the Niles waters in Egypt. During the low-water season, which runs from January to June, the Atbarah shrinks to a number of pools. But, in late-summer, when torrential rains fall on the Ethiopian Highlands, the Atbarah provides 22% of the Niles flow.The Blue Nile has a similar pattern. It contributes 17% of the Niles waters in the low-water season and 68% during the high-water season. In contrast, the White Nile provides only 10% of the Niles waters during the high-water season but contributes more than 80% during the low-water period. Thus, before the Aswan High Dam was completed in 1971, the White Nile watered the Egyptian stretch of the river throughout the year, whereas the Blue Nile, carrying seasonal rain from Ethiopia, caused the Nile to overflow its banks and deposit a layer of fertile mud over adjacent fields. The great flood of the main Nile usually occurred in Egypt during August, September, and October, but it sometimes began as early as June at Aswan and often did not completely wane until January.The Nile enters Egypt a few kilometers north of Wadi Halfa, a Sudanese town that was completely rebuilt on high ground when its original site was submerged in the reservoir created by the Aswan High Dam. As a result of the dams construction, the Nile actually begins its flow into Egypt as Lake Nasser, which extends southwards from the dam for 320 km to the border and for an additional 158 km within Sudan. Lake Nassers waters fill the area through Lower Nubia (Upper Egypt and northern Sudan) within the narrow canyon between the cliffs of sandstone and granite created by the flow of the river over many centuries.',
        location: 'Egypt',
        categories: ['pyramids', 'Nile River', 'desert', 'sphynx'],
        price: 10000,
        inventory: 500,
        coordinates: [29.9792, 31.1342],
        images: ['http://www.freedomofresearch.org/sites/default/files/ancient-egypt-pyramids-wallpaper.jpg', 'https://www.teachaway.com/sites/default/files/headers/egypt-header-01.jpg', 'http://www.utsegypt.com/wp-content/uploads/2015/08/Egypt-1.jpg', 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Great_Sphinx_of_Giza_-_20080716a.jpg']
    },
    {
        title: 'Exploring China',
        description: 'Viewing the world map, you will find that China is a vast country situated at the eastern part of Eurasia and the western coast of the Pacific Ocean. Covering a land area of 3,706,581 square miles (9,600,000 square kilometers), China is the third largest of the world, inferior to Russia and Canada. It is 3,231 miles long from east to west and 3,417.5 miles long from north to south. With the entire territory shaping like a rooster, its northernmost end reaches Mohe in Heilongjiang Province; the southernmost is at Zengmu Ansha in Nansha Islands, the easternmost at conjunction of Heilongjiang River and the Wusuli River, while the western at the Pamirs. China is an ancient country having a profound history. Originated in the eastern area of the Yellow River Region, the countrys civilization is over 5,000 years old and was considered one of four ancient civilizations of the world, along with the civilizations of the ancient Babylon, the ancient Egypt and the ancient India. The first dynasty of Chinese history started from the Xia Dynasty (2070BC-1600BC) and the last one was the Qing Dynasty (1644-1912), while the most glorious period were the Qin (221BC-206BC), Han (206BC-220), Tang (618-907) and Ming (1368-1644) dynasties. During thousands of years of feudal ruling, Chinese people have created brilliant science and art culture, like the Four Great Inventions, the poetry, paintings and Chinese calligraphy. Also, a great amount of cultural relics such as the Great Wall and the Terra Cotta Warriors left by ancestors have become the treasures of the nation and the wonder of the world. Founded in 1949 by the Communist Party, the Peoples Republic of China (PRC) is a unified multi-ethnic country. 56 nationalities are now living in 34 direct administrative regions including 23 provinces, five autonomous regions, four directly-governed city regions–Beijing, Shanghai, Tianjin and Chongqing and two special administrative regions (SAR)–Hong Kong and Macau. The 55 ethnic minorities mainly live in Chongqing, Gansu, Guangxi, Guizhou, Hainan, Heilongjiang, Hubei, Hunan, Inner Mongolia, Jilin, Liaoning, Ningxia, Qinghai, Sichuan, Tibet, Xinjiang and Yunnan. China is also the most populous country in the world. Being over 1.3 billion (in the end of 2007), the countrys population is about 22 percent of the world population. The most populous part is the eastern coastal areas. Almost 94 percent of Chinese people live in the Southeast part of the country which covers 43 percent of its land area; while the other six percent people live in the northwestern areas which cover 57 percent of the territory.',
        location: 'China',
        categories: ['Great Wall of China', 'Genearl Tsos Chicken', 'mountains', 'nature', 'hiking', 'biking', 'food'],
        price: 7000,
        inventory: 500,
        coordinates: [35.8617, 104.1954],
        images: ['http://i.imgur.com/RWcZ0.jpg', 'http://wallpapercave.com/wp/VRvyWZC.jpg', 'http://64.78.58.53/wp-content/uploads/2015/04/wall-clouds.jpg', 'http://wallpaperbeta.com/wallpaper_3840x2160/snowy_mountains_china_pagoda_landscapes_ultra_3840x2160_hd-wallpaper-35203.jpg']
    },
    {
        title: 'Traversing Greece',
        description: 'On the Greek mainland facing the Cyclades Islands and the Aegean Sea the Sunium promontory stands out from the Attic land. When you have rounded the promontory you see a harbor and a temple to Athena of Sunium on the peak of the promontory. Farther on is Laurium, where once the Athenians had silver mines, and a small uninhabited island called the Island of Patroclus. For a fortification was built on it and a palisade constructed by Patroclus, who was admiral in command of the Egyptian men-of-war sent by Ptolemy, son of Ptolemy, son of Lagus, to help the Athenians, when Antigonus, son of Demetrius, was ravaging their country, which he had invaded with an army, and at the same time was blockading them by sea with a fleet.',
        location: 'Greece',
        categories: ['food', 'beauty', 'Mediteranean'],
        price: 7000,
        inventory: 500,
        coordinates: [39.0742, -21.8243],
        images: ['https://tap4call.files.wordpress.com/2014/12/greece.jpg', 'https://cdn.wallpapersbuzz.com/image/2257/b_greece-landscape.jpg', 'data:image/jpeg;base64,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', 'http://resources.touropia.com/gfx/d/tourist-attractions-in-greece/santorini.jpg']
    }
];

var reviewSeed = [
    {
        rating: 5,
        comment: 'This is a great package, I would highly recomend it to anyone who is considering going here. The water is clear and the air is fresh.  It was an overall wonderful journey.'
    },
    {
        rating: 4,
        comment: 'I really enjoyed this package.  I had the time of my life!  An adventure I will never forget!  My family and I explored the whole country and loved every minute of it.  I saw things that I never thought I would ever see in my life.  Highly recomend this package, Trekly is awesome!'
    },
    {
        rating: 5,
        comment: 'Totally amazing!  What a great vacation, cant wait until I go again!  The mountains were beautiful and the nature was stunning.  The wildlife is amazing too.  This is a great place to go on vacation with with your spuse, kids, parents - whoever!  Go on this trip!'
    },
    {
        rating: 3,
        comment: 'This was a pretty good package.  It was great to get out of the normal routine of life and take an adventure across the world.  I am so glad there is a website like trekly, I love them so much.  You guys are the best!'
    },
        {
        rating: 4,
        comment: 'Wow! What a vacation!  It was such a great experience and I owe it all to trekly!  Thanks for the wonderful package.  The landsscape here is stunning and the fresh air tastes so good!  If you are looking to get out the everyday routine of life and experience something new, this is the package for you!  I had the time of my life!'
    },
        {
        rating: 2,
        comment: 'This was a great vacation!  The traveling was great and everything went really smoothly.  The only reason I gave it a 2 was because I was sick the whole time - it had nothing to do with trekly - they are great!  It was still a blast and I would recomend everyone go on this trip if you get the opportunity.'
    },
        {
        rating: 5,
        comment: 'This is a great package, I would highly recomend it to anyone who is considering going here. The water is clear and the air is fresh.  It was an overall wonderful journey.'
    },
    {
        rating: 4,
        comment: 'I really enjoyed this package.  I had the time of my life!  An adventure I will never forget!  My family and I explored the whole country and loved every minute of it.  I saw things that I never thought I would ever see in my life.  Highly recomend this package, Trekly is awesome!'
    },
    {
        rating: 5,
        comment: 'Totally amazing!  What a great vacation, cant wait until I go again!  The mountains were beautiful and the nature was stunning.  The wildlife is amazing too.  This is a great place to go on vacation with with your spuse, kids, parents - whoever!  Go on this trip!'
    },
    {
        rating: 3,
        comment: 'This was a pretty good package.  It was great to get out of the normal routine of life and take an adventure across the world.  I am so glad there is a website like trekly, I love them so much.  You guys are the best!'
    },
        {
        rating: 4,
        comment: 'Wow! What a vacation!  It was such a great experience and I owe it all to trekly!  Thanks for the wonderful package.  The landsscape here is stunning and the fresh air tastes so good!  If you are looking to get out the everyday routine of life and experience something new, this is the package for you!  I had the time of my life!'
    },
        {
        rating: 2,
        comment: 'This was a great vacation!  The traveling was great and everything went really smoothly.  The only reason I gave it a 2 was because I was sick the whole time - it had nothing to do with trekly - they are great!  It was still a blast and I would recomend everyone go on this trip if you get the opportunity.'
    },    {
        rating: 5,
        comment: 'This is a great package, I would highly recomend it to anyone who is considering going here. The water is clear and the air is fresh.  It was an overall wonderful journey.'
    },
    {
        rating: 4,
        comment: 'I really enjoyed this package.  I had the time of my life!  An adventure I will never forget!  My family and I explored the whole country and loved every minute of it.  I saw things that I never thought I would ever see in my life.  Highly recomend this package, Trekly is awesome!'
    },
    {
        rating: 5,
        comment: 'Totally amazing!  What a great vacation, cant wait until I go again!  The mountains were beautiful and the nature was stunning.  The wildlife is amazing too.  This is a great place to go on vacation with with your spuse, kids, parents - whoever!  Go on this trip!'
    },
    {
        rating: 3,
        comment: 'This was a pretty good package.  It was great to get out of the normal routine of life and take an adventure across the world.  I am so glad there is a website like trekly, I love them so much.  You guys are the best!'
    },
        {
        rating: 4,
        comment: 'Wow! What a vacation!  It was such a great experience and I owe it all to trekly!  Thanks for the wonderful package.  The landsscape here is stunning and the fresh air tastes so good!  If you are looking to get out the everyday routine of life and experience something new, this is the package for you!  I had the time of my life!'
    },
        {
        rating: 2,
        comment: 'This was a great vacation!  The traveling was great and everything went really smoothly.  The only reason I gave it a 2 was because I was sick the whole time - it had nothing to do with trekly - they are great!  It was still a blast and I would recomend everyone go on this trip if you get the opportunity.'
    },    {
        rating: 5,
        comment: 'This is a great package, I would highly recomend it to anyone who is considering going here. The water is clear and the air is fresh.  It was an overall wonderful journey.'
    },
    {
        rating: 4,
        comment: 'I really enjoyed this package.  I had the time of my life!  An adventure I will never forget!  My family and I explored the whole country and loved every minute of it.  I saw things that I never thought I would ever see in my life.  Highly recomend this package, Trekly is awesome!'
    },
    {
        rating: 5,
        comment: 'Totally amazing!  What a great vacation, cant wait until I go again!  The mountains were beautiful and the nature was stunning.  The wildlife is amazing too.  This is a great place to go on vacation with with your spuse, kids, parents - whoever!  Go on this trip!'
    },
    {
        rating: 3,
        comment: 'This was a pretty good package.  It was great to get out of the normal routine of life and take an adventure across the world.  I am so glad there is a website like trekly, I love them so much.  You guys are the best!'
    },
        {
        rating: 4,
        comment: 'Wow! What a vacation!  It was such a great experience and I owe it all to trekly!  Thanks for the wonderful package.  The landsscape here is stunning and the fresh air tastes so good!  If you are looking to get out the everyday routine of life and experience something new, this is the package for you!  I had the time of my life!'
    },
        {
        rating: 2,
        comment: 'This was a great vacation!  The traveling was great and everything went really smoothly.  The only reason I gave it a 2 was because I was sick the whole time - it had nothing to do with trekly - they are great!  It was still a blast and I would recomend everyone go on this trip if you get the opportunity.'
    },
];

var wipeCollections = function () {
    var models = [User, Order, Product, Review];

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

    var productsList;
    var usersList;

    return Product.create(productSeed)
    .then(function(products) {
        productsList = products;
        return User.create(userSeed);
    })
    .then(function(users){
        usersList = users;
        // productsList.forEach(function(product) {
        //     product.seller = randomizeSelector(users);
        // });
            // console.log(productsList)
        return Promise.map(orderSeed, function(order) {
            var productToAddToOrder = randomizeSelector(productsList);
            var price;
            if(order.status !== 'cart') {
                price = productToAddToOrder.price;
                order.date = Date();
            }
            order.products.push({product: productToAddToOrder, quantity: 1, finalPrice: price});
            order.user = randomizeSelector(users);

            return Order.create(order);
        });
    })
    .then(function() {
        return Promise.map(reviewSeed, function(review) {
            review.user = randomizeSelector(usersList);
            review.product = randomizeSelector(productsList);
            return Review.create(review);
        });
    });
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
