<<<<<<< HEAD
core.controller('Topnavbar', function($scope, $rootScope) {
	$scope.save = function() {
		$rootScope.$broadcast('saveImage');
=======

core.controller('Topnavbar', function($scope, $state, $rootScope) {

	$scope.save = function(){
		console.log("save ran")
		$rootScope.$broadcast('saveImage')
>>>>>>> master
	}

});