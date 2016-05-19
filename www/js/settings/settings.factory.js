core.factory('SettingsFactory', function($http) {
	var SettingsFactory = {};

    SettingsFactory.urlToCanvas = function(url, canvasId){
	    var canvas = document.getElementById(canvasId);
	    var context = canvas.getContext('2d');
	    var newImage = new Image();
	    newImage.src = url;
	    // newImage.crossOrigin = '';
	    newImage.onload = function(){
	        context.drawImage(newImage, x, y, canvas.width, canvas.height);
	        var dataURL = canvas.toDataURL('image/png');
	    }
    }

    // SettingsFactory.updateAvatar = function() {
    	
    // }

    return SettingsFactory;
	
});