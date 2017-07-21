Comic Pow-Wow
=====================

Comic Pow-Wow is a collaborative mobile application that allows you to create comic strips with your friends in real-time. Users can add photos from their image library or instantly snap a live pic, "comify" their image using filters, borders, text bubbles and stickers, and add 'comified' squares to their comic strip.

We used Ionic and Angular to build our mobile application. With Firebase, every time a new comic frame is added, all friends in the same story are instantly notified. In addition, we used MongoDB, HTML5/ CSS3, and CamanJS library to make the app come to life.

The result is an intuitive, addictive mobile app that has many use cases, ranging from a way to capture shared experiences with friends to an outlet for your imagination.


![Screenshot1](http://i.imgur.com/DAp5dke.png)

## Viewing this project:

*Note: This is a cross-platform/ hybrid mobile app. To try the app with all its native mobile functionality, please email Henry at hbn2018@icloud.com with your name and nature of request for an invite. Thanks for your interest!

To test out the app on Web (limited functionality), follow these brief instructions:

Chrome (recommended):
  1. Go to www.comicpowwow.com in a chrome browser
  2. Open up chrome dev tools by hitting 'Cmd' + 'option' + 'j' 
  3. Use keyboard shortcut: 'Command" + "shift" + "m", or, in the upper left corner of your console, select the 'toggle device toolbar' button that looks like this:
  
  ![Screenshot1](http://i.imgur.com/6GQTscC.png)
  4. You MUST select 'iphone 6' from the dropdown menu, located above the application like in the image below:
  ![Screenshot1](http://i.imgur.com/fFtM35U.png)
  5. You may also choose to dock your console to the right, by selecting the button visible in the image from step 3
  6. Finally, you should sign in as --> email: admin@me.com, password: 123, to see some premade work, or create your own username and password.

Safari:
  1. Hit 'Command' + 'Option' + 'r', or from the 'Develop' dropdown, select "Enter Responsive Design Mode"
  2. Select the Iphone 6


You can watch our Beta presentation below, which includes a brief tech summary, or read on for a brief walkthrough.
Youtube: https://www.youtube.com/watch?v=cni-2cEVzt0

## Description

Comic Pow-Wow is a collaborative mobile application that allows you to create comic strips with your friends in real-time. Take photos using your phone camera, or upload from your photo library. Add your favorite comic book effects like speech bubbles, stickers, stylish borders and filters. When you're done, share your stories with your closest friends!

## Walkthrough:

When users sign in, they are brought to our Home Screen, where they can view all of their active stories and see which of their friends is a collaborating with them on the story.

![HomePage](http://i.imgur.com/LoNmAOK.png)

Clicking on a story will allow the user to view or edit a currently active story, or he can begin a new one by clicking the 'Create New Story' Button. Here, the user can give his story a title and add a few friends, or collaborators, to join the fun.

![Story_nofriends](http://i.imgur.com/A3hZL72.png) ![Story_friends](http://i.imgur.com/tcw7J0Q.png)

From here, our user is ready to make his/her own additions to the story, and is brought directly to our camera state.

![CameraState](http://i.imgur.com/XOSqmzN.png)

There is a live feed of the story that updates (along with the rest of our story viewing pages) in real time as the stories other collaborators add their own additions to the story. This feed allows the user to see how the story is developing, and where his/her own addition to the story will be placed.

![LiveFeed](http://i.imgur.com/qWaaxbN.png)

After taking a picture or selecting one from his/her photo library, the user can add filters, borders, responsive speech bubbles, and/or stickers to his image and submit it to the story.

![Filters](http://i.imgur.com/RuFGP3z.png)

Finally, he can get a quick overview of the story in our 'Squares Page', or view the comic as it was intended to be viewed - A comic strip!

![Squares_View](http://i.imgur.com/NYdEzAt.png)
![Strip_View](http://i.imgur.com/oKI1vHu.png)

## Usage

Make sure you have Ionic installed.

To open test browser:
Run IONIC SERVE in project root directory

To Login and test app:
Run npm start in project root

To run on local:
In app.js, change base to current IP Address
// var base = 'http://192.168.1.133:1337'

When Pushing to Heroku:
Change base to an empty string

***
That's it. Check it out and let us know if you have any thoughts or suggestions. 
Feel free to drop us a line at: hbn2018@icloud.com

Namaste,

Team ComicPowWow :)
