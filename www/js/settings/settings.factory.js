core.factory('SettingsFactory', function($http) {
	var SettingsFactory = {};

    SettingsFactory.urlToCanvas = function(url, canvasId){
	    var canvas = document.getElementById(canvasId);
	    var context = canvas.getContext('2d');
	    var newImage = new Image();
	    newImage.src = url;
	    // newImage.crossOrigin = '';
	    newImage.onload = function(){
	        context.drawImage(newImage, 0, 0);
	        var dataURL = canvas.toDataURL('image/png');
	    }
    }

    SettingsFactory.updateAvatar = function(avatarURL, userId) {
    	console.log('THIS IS NEW AVATARR FACTORY GOT HERE', userId)
    	
    	return $http.put(base + '/api/members/' + userId + '/avatar', {'avatar': avatarURL})
    	.then(function(updatedAvatar){
    		console.log(updatedAvatar, 'THIS IS NEW AVATARR')
    		return updatedAvatar.data;
    	});
    }

    return SettingsFactory;
	
});