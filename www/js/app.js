var base = '';

var core = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'fsaPreBuilt', 'ngCordova', 'ngStorage', 'hmTouchEvents'])


core.run(function($ionicPlatform, $rootScope, $state, EnvironmentFactory) {
  EnvironmentFactory.getEnvironment()
  .then(isProduction => {
    if(isProduction){
      console.log = function(){};
    }
  });
  // event listener listening for state changes + put on rootScope
  $rootScope.$on('$stateChangeSuccess', function(event, toState) {
   $rootScope.$state = toState;
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
    cache: false,
    url: '/home',
    templateUrl: 'js/home/home.template.html',
    controller: 'homeCtrl',
    resolve: {
      myStories: function (StoryFactory, $localStorage){
        return StoryFactory.getMyStories($localStorage.user._id);
      },
      myCollabs: function(StoryFactory, $localStorage) {
        return  StoryFactory.getMyCollabs($localStorage.user._id);
      }
    }
  })
  .state('settings', {
    cache: false,
    url: '/settings',
    templateUrl: 'js/settings/settings.template.html',
    controller: 'SettingsCtrl',
    resolve: {
        loggedInUser: function(AuthService){
          return AuthService.getLoggedInUser()
        }
    }
  })
  .state('camera', {
    cache: false,
    url: '/camera/:storyId',
    templateUrl: 'js/camera/camera.template.html',
    controller: 'CameraCtrl',
    resolve: {
      story: function(StoryFactory, $stateParams) {
        return StoryFactory.getStoryById($stateParams.storyId);
      },
      getAddons: function(CameraFactory, $stateParams) {
        // console.log('in get addons')
        return CameraFactory.getFilters()
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
      },
      allUsers: function(UserFactory) {
        return UserFactory.getAllUsers();
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
    cache: false,
    url: '/story/:storyId',
    templateUrl: 'js/story/story.template.html',
    controller: 'StoryCtrl',
    resolve: {
      story: function(StoryFactory, $stateParams, AuthService, UserFactory) {
        return StoryFactory.getStoryById($stateParams.storyId);
      },
      loggedInUser: function (AuthService){
        return AuthService.getLoggedInUser();
      },
      // storySquares: function(){
      //   return 
      // },
      allUsers: function(UserFactory, story, loggedInUser) {
        return UserFactory.getAllUsers()
        .then(function(users) {
              var usersForCollabList = [];

              console.log('loggedInUser: ', loggedInUser._id)

              users.forEach(function(user) {
                // console.log('userId: ', user._id)
                  var present = false;

                  if(story.friends){
                    for (var i = 0; i < story.friends.length; i++) {
                      if (story.friends[i]._id === user._id) present = true;
                      // CURRENTLY NOT FILTERING OUT CURRENTLY LOGGED IN USER
                      if (loggedInUser._id === user._id) present = true;
                    };  
                  }
                  if (!present) usersForCollabList.push(user);
              });

              return usersForCollabList;
        })
      }
    }
  })

  $urlRouterProvider.otherwise('/signup');

})
