core.controller('SignupCtrl', function ($scope, AuthService, $state, UserFactory, $localStorage, StoryFactory) {

    $scope.signup = {};
    $scope.error = null;

    if($localStorage.user) $state.go('home')

    $scope.sendSignup = function (signupInfo) {
        $scope.error = null;

        UserFactory.signup(signupInfo)
        .then(function(data) {
            return AuthService.login(signupInfo);
        })
        // .then(function(userInfo) {
            // USE FOR HIRING DAY - UNCOMMENT STORYFACTORY LINE (SHOULD FULLY FUNCTION)
            // adds everyone who signs up as a collaborator to given story Id (login with email like COMIC-POW-WOW@... (cuz will show as creator) and call story FULLSTACK STORY)
            // replace storyId with FULLSTACK STORY's ID (as string) after it has been created
            // return StoryFactory.addCollaborators(storyId, [userInfo.user._id]);
        // })
        .then(function(story){
            console.log("CreateUser: Final User in $localStorage", $localStorage)
            $state.go('settings');
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
