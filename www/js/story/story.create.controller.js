core.controller('StoryCreateCtrl', function($scope, StoryFactory, $state, $localStorage) {

	$scope.story = {};

	$scope.createNewStory = function(){
		if (!$localStorage.user) {
			$state.go('login');
		} else {
			$scope.story.owner = $localStorage.user._id;
			StoryFactory.createNewStory($scope.story)
			.then(function(story) {
				$state.go('camera', {storyId: story._id})
			});	
		}
	}
});