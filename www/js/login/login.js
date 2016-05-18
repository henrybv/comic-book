app.controller('LoginCtrl', function ($scope, AuthService, $state, $localStorage) {

    $scope.login = {};
    $scope.error = null;


    $scope.logout = function () {
        AuthService.logout()
    }

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo)
        .then(function (data) {
            //Data looks like this {user:Object, success:true, Token: ...}
            if(data.user) {
                //Jeff: Local Storage is done here
                //The way this works now is that the user is assigned a new token EVERY time he logs in
                //I think this is what we want, but we may want to prevent an already logged (with persistant local storage data) from logging in
                //again and creating a new token. I do not think this matters for our purposes.
                console.log($localStorage, 'this is $localStorage')
                $state.go('home');
            }
        })
        .catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };


});
