core.controller('SignupCtrl', function ($scope, AuthService, $state, UserFactory) {

    $scope.signup = {};
    $scope.error = null;

    $scope.sendSignup = function (signupInfo) {
        $scope.error = null;

        UserFactory.signup(signupInfo)
        .then(function(newUser) {
            console.log(newUser)
            return AuthService.login(signupInfo);
        })
        .then(function () {
            $state.go('home');
        })
        .catch(function () {
            $scope.error = 'Invalid signup credentials provided.';
        });

    };

    $scope.style = function() {
        if ($scope.signupForm.email.$invlaid) {
            return {"color": "red"};
        }
    }

});
