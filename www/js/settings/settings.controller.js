core.controller('SettingsCtrl', function($scope, $localStorage, AuthService, $state, $cordovaCamera, SettingsFactory) {
	$scope.user = $localStorage.user;
	$scope.logout = function () {
        AuthService.logout();
 		$state.go('login');
    };

    $scope.url = '../../img/default_avatar.jpg';



    $scope.takePicture = function() {
    console.log("THE CAMERA RAN ON THE ISOLATE SCOPE")
    var options = { 
        quality : 75, 
        destinationType : Camera.DestinationType.DATA_URL, 
        sourceType : Camera.PictureSourceType.CAMERA, 
        allowEdit : true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 375,
        targetHeight: 375,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
    };
    $cordovaCamera.getPicture(options).then(function(imageURL) {
        $scope.url = "data:image/jpeg;base64," + imageURL;
        SettingsFactory.urlToCanvas($scope.url, 'avatar');
    });
	}

});