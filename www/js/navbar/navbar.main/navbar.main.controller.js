core.controller('Topnavbar', function($scope, $state, $rootScope) {

	// $scope.checkState = function(){
	// 	console.log('inside top navbar');
	// 	console.log($state.current.name, 'current state');
	// 	return $state.current.name !== 'home';
	// }

	$scope.save = function() {
		console.log("save function ran in navbar")
		$rootScope.$broadcast('saveImage')
	}
});