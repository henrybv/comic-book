core.controller('SignupCtrl', function ($scope, AuthService, $state, UserFactory, $localStorage) {

    $scope.signup = {};
    $scope.error = null;

    if($localStorage.user) $state.go('home')



    $scope.sendSignup = function (signupInfo) {
        $scope.error = null;

        UserFactory.signup(signupInfo)
        .then(function(data) {
            return AuthService.login(signupInfo);
        })
        .then(function(data){
            console.log("CreateUser: Final User in $localStorage", $localStorage)
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
