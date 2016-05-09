app.controller('LoginCtrl', function ($scope, AuthService, $state, $rootScope) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo)
        .then(function (user) {
            $rootScope.currentUser = user;
            if(user.isAdmin) $state.go('admin')
            else $state.go('home');
        })
        .catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

});
