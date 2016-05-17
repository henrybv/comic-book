core.controller('homeCtrl', function($scope, $state, myStories, myCollabs) {

	$scope.name = "Hello";
	$scope.myStories = myStories;
	$scope.myCollabs = myCollabs;
	$scope.showMyStories = false;
	$scope.showMyCollabs = false;
	console.log('stories: ', $scope.myStories)

	$scope.changeState = function(id){
		$state.go('story', {storyId: id})
	};

	$scope.getMyStories = function() {
		$scope.showMyCollabs = false;
		$scope.showMyStories = true;
	};

	$scope.getMyCollabs = function() {
		$scope.showMyStories = false;
		$scope.showMyCollabs = true;
	};


});