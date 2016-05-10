core.controller('StoryCtrl', function($scope, StoryFactory, $state, $localStorage, story) {

	$scope.story = story;
	
	$scope.changeState = function() {
		$state.go('home')
	}

});