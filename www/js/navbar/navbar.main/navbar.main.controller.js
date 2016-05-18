core.controller('Topnavbar', function($scope, $rootScope) {
	$scope.save = function() {
		$rootScope.$broadcast('saveImage');
	}
});