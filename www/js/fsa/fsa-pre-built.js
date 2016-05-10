(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.
    if (!window.angular) throw new Error('I can\'t find Angular!');
    var app = angular.module('fsaPreBuilt', []);
    // var base = 'http://192.168.1.183:1337/'

    app.factory('Socket', function () {
        if (!window.io) throw new Error('socket.io not found!');
        return window.io(window.location.origin);
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function (response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response)
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function ($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q, $localStorage) {

        function onSuccessfulLogin(response) {
            var data = response.data;
            // Jeff: Session Info Delete
            // Session.create(data.id, data.user);
            $localStorage.token = data.token;
            $localStorage.user = data.user
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            //Jeff: Changed return to 'return data' instead of data.user so that token info is revealed
            return data;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        //Jeff: changed session to localStorage
        this.isAuthenticated = function () {
            // return !!Session.user;
            return !!$localStorage.user;
        };

        //Added a function that resolves for the user from the
        //localStorage Token
        this.getUserFromToken = function(){
            if($localStorage.user) return $q.when($localStorage.user)
        }

        this.getLoggedInUser = function (fromServer) {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.

            // Optionally, if true is given as the fromServer parameter,
            // then this cached value will not be used.

            // Jeff: Instead of returning a promise with the Session.user, 
            // we want to return the user stored in localStorage
            if (this.isAuthenticated() && fromServer !== true) {
                console.log("got into that wierd section of getLoggedInUser", $localStorage.user)
                // return $q.when(Session.user);
                return $q.when($localStorage.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            // Jeff: to Verify Token, maybe we want to verify the token in this '/session' get request
            // We can do this by passing the $localStorage object whith this get request
            return $http.get(base + '/session').then(onSuccessfulLogin).catch(function () {
                return null;
            });

        };

        this.login = function (credentials) {
            return $http.post(base + '/login', credentials)
                .then(onSuccessfulLogin)
                .catch(function () {
                    return $q.reject({ message: 'Invalid login credentials.' });
                });
        };

         //Jeff: delete localStorage upon Logout
         //I also removed the get request to logout, which just ran a logout() function
        this.logout = function () {
            return $http.get(base + '/logout').then(function () {
                // Session.destroy();
                delete $localStorage.token;
                delete $localStorage.user;
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };

    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };

    });

})();
