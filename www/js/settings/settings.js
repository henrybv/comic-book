app.controller('MyAccountCtrl', function($scope, loggedInUser) {
	$scope.user = loggedInUser;
});