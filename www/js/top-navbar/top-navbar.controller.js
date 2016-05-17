core.controller('Topnavbar', function($scope, $state) {
	// $scope.loggedInUser = loggedInUser;
	$scope.checkState = function(){
		console.log('inside top navbar');
		// console.log('rootScope', $rootScope);
		console.log($state.current.name, 'current state');
		if ($state.current.name === 'home') || ($state.current.name === 'story')
		return true;
	}
});