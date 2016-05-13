//FULLSTACK BASE - Eric
// var base = 'http://192.168.1.133:1337'
//FULLSTACK BASE - Jeff

//HOME BASE
// var base = 'http://192.168.1.7:1337'
// 127.0.0.1 dynamically routes to your local IP.
// var base = 'http://127.0.0.1:27017:1337'
var base = 'http://192.168.1.204:1337'

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var core = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'fsaPreBuilt', 'ngCordova', 'ngStorage'])


core.run(function($ionicPlatform, $rootScope, $state) {

  // event listener listening for state changes + put on rootScope
  $rootScope.$on('$stateChangeSuccess', function(event, toState) {
   $rootScope.$state = toState;
   console.log($rootScope.$state.name);
  });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

core.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('home', {
    url: '/home',
    templateUrl: 'js/home/home.template.html',
    controller: 'homeCtrl',
    resolve: {
      allStories: function (StoryFactory, $localStorage){
        return StoryFactory.getAllStories($localStorage.user._id)
      }
    }
  })
  .state('camera', {
    url: '/camera/:storyId',
    templateUrl: 'js/camera/camera.template.html',
    controller: 'CameraCtrl',
    resolve: {
      story: function(StoryFactory, $stateParams) {
        return StoryFactory.getStoryById($stateParams.storyId);
      }
    }
  })
  .state('storyCreate', {
    url: '/storyCreate',
    templateUrl: 'js/story/story.create.template.html',
    controller: 'StoryCreateCtrl',
    resolve: {
      loggedInUser: function (AuthService){
        return AuthService.getLoggedInUser()
      }
    }
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'js/signup/signup.html',
    controller: 'SignupCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'js/login/login.html',
    controller: 'LoginCtrl'
  })
  .state('story', {
    url: '/story/:storyId',
    templateUrl: 'js/story/story.template.html',
    controller: 'StoryCtrl',
    resolve: {
      story: function(StoryFactory, $stateParams) {
        return StoryFactory.getStoryById($stateParams.storyId);
      }
    }
  })
  .state('testState', {
    url: '/testState',
    templateUrl: 'js/testState/testState.template.html',
    controller: 'testStateCtrl',
    resolve: {
      getAddons: function(TestFactory, $stateParams) {
        return TestFactory.getFilters()
      }
    }
  })

  $urlRouterProvider.otherwise('/signup');

})
