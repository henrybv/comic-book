core.controller('storyCreateCtrl', function($scope, StoryFactory, loggedInUser, AuthService, $state, $rootScope) {

	$scope.story = {};



	// $scope.story = {
	// 	owner: $scope.currentUser._id		
	// 	// title: title
	// };

	$scope.createNewStory = function(){
		if (!$rootScope.currentUser) $state.go('login');
		$scope.story.owner = $rootScope.currentUser._id;
		StoryFactory.createNewStory($scope.story)
		.then(function(story) {
			console.log('story in ctrl',story)
		});

	}

});