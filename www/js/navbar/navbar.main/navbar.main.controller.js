
core.controller('Topnavbar', function($scope, $state, $rootScope) {

	$scope.save = function(){
		// console.log("save ran")
		$rootScope.$broadcast('saveImage')
	}

});