core.controller('SettingsCtrl', function($scope, $localStorage, AuthService, $state) {
	$scope.user = $localStorage.user;
	$scope.logout = function () {
       AuthService.logout();
        $state.go('login');
   	};
});