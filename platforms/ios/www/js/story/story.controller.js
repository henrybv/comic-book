<<<<<<< HEAD
core.controller('storyCreateCtrl', function($scope, StoryFactory, loggedInUser, AuthService, $state, $rootScope, StoryFactory) {

	$scope.story = {};

	$scope.createNewStory = function(){
		if (!$rootScope.currentUser) $state.go('login');
		$scope.story.owner = $rootScope.currentUser._id;
		StoryFactory.createNewStory($scope.story)
		.then(function(story) {
			$state.go('story', { storyId: story._id })
		});
=======
core.controller('StoryCtrl', function($scope, StoryFactory, $state, $localStorage, story) {
>>>>>>> master

	$scope.story = story;
	
	$scope.changeState = function() {
		$state.go('home')
	}

});



core.controller('StoryCtrl', function($scope, story, $state) {
	$scope.story = story;
	$scope.goToCamera = function(){
		$state.go('camera', {storyId: $scope.story._id})
	}
});