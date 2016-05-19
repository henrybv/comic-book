core.controller('SettingsCtrl', function($scope, $localStorage, AuthService, $state, $cordovaCamera, SettingsFactory, StoryFactory, $cordovaContacts) {
	$scope.user = $localStorage.user;
	// $scope.myStories = myStories;
	// console.log(myStories, 'THIS IS MY STORIES')

	$scope.logout = function () {
        AuthService.logout();
 		$state.go('login');
    };

    $scope.url = '../img/default_avatar.jpg';

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

	$scope.getContacts = function() {
		$scope.phoneContacts = [];
	      function onSuccess(contacts) {
	        for (var i = 0; i < contacts.length; i++) {
	          var contact = contacts[i];
	          $scope.phoneContacts.push(contact);
	        }
	      };
	      function onError(contactError) {
	        alert(contactError);
	      };
	      var options = {};
	      options.multiple = true;
	      $cordovaContacts.find(options).then(onSuccess, onError);
	};

});