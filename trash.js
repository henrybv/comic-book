  
//DELETED STATES
// setup an abstract state for the tabs directive
.state('tab', {
  url: '/tab',
  abstract: true,
  templateUrl: 'templates/tabs.html'
})

// Each tab has its own nav history stack:

.state('tab.dash', {
  url: '/dash',
  views: {
    'tab-dash': {
      templateUrl: 'templates/tab-dash.html',
      controller: 'DashCtrl'
    }
  }
})

.state('tab.chats', {
    url: '/chats',
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-chats.html',
        controller: 'ChatsCtrl'
      }
    }
  })
  .state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })

.state('tab.account', {
  url: '/account',
  views: {
    'tab-account': {
      templateUrl: 'templates/tab-account.html',
      controller: 'AccountCtrl'
    }
  }
});

if none of the above states are matched, use this as the fallback
$urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams, $localStorage) {
  if ($localStorage.user) {
      $state.go('home');
  }