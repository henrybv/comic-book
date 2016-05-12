core.controller('homeCtrl', function($scope, $state, allStories) {

	$scope.name = "Hello"
	$scope.stories = allStories

	$scope.changeState = function(id){
		$state.go('story', {storyId: id})
	}


});