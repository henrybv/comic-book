core.controller('CameraCtrl', function(story, $scope, $cordovaCamera, $cordovaFileTransfer, Grafi, $localStorage, CameraFactory) {
	$scope.story = story;
    $scope.currentUser = $localStorage.user._id;
    $scope.currentSquare;
    // $scope.currentDataURL = '../../img/mike.png';
    $scope.currentDataURL;

    var urlToCanvas = function(url, canvasId){
        console.log('in url to canvas');
        var canvas = document.getElementById(canvasId);
        var newImage = new Image();
        newImage.src = url;
        // newImage.crossOrigin = '';
        var context = canvas.getContext('2d');
        newImage.onload = function(){
            context.drawImage(newImage, 0, 0);
        }
        var dataURL = canvas.toDataURL('image/png');
    }

    $scope.applyFilter = function(filter, canvasId){
        console.log('in apply filter')
        var img = new Image();
        img.src = $scope.currentDataURL;
        clearFilter(canvasId, img)
        if (filter === 'grey') greyPosterFilter(canvasId, img);
        if (filter === 'poster') colorPosterFilter(canvasId, img);
        if (filter === 'brown') brownPosterFilter(canvasId, img);
        if (filter === 'black') blackFilter(canvasId, img);
    }

    var clearFilter = function(canvasId, img){
        console.log('in clear filter');
        Caman('#'+canvasId, img, function(){
            this.revert(false);
            this.render();
        })
    }

    var greyPosterFilter = function(canvasId, img){
        // var img = new Image();
        // img.src = $scope.currentDataURL;
        Caman("#"+canvasId, img, function() {
            this.posterize(3);
            this.greyscale();
            this.render()
        });
    }

    var colorPosterFilter = function(canvasId, img){
        // var img = new Image();
        // img.src = $scope.currentDataURL;
        Caman("#"+canvasId, img, function() {
            this.posterize(3);
            this.noise(3);
            this.render()
        });
    }

    var brownPosterFilter = function(canvasId, img){
        // var image = new Image();
        // image.src = $scope.currentDataURL;
        Caman('#'+canvasId, img, function(){
            this.hazyDays(5);
            this.love(5);
            this.grungy(5);
            this.noise(5);
            this.render();
        })
    }

    var blackFilter = function(canvasId, img){
        // var image = new Image();
        // image.src = $scope.currentDataURL;
        Caman('#'+canvasId, img, function() {
            this.brightness(4);
            this.contrast(10);
            this.sinCity(2);
            this.noise(4);
            this.render()
        });
    }



    // urlToCanvas($scope.currentDataURL, 'imageCanvas');

//make the button a grey image
// if ($scope.currentDataURL){
var setFilterThumbnails = function(){
    var canvas1 = document.getElementById('greyImage')
    var context1 = canvas1.getContext('2d')
    var canvas2 = document.getElementById('posterImage')
    var context2 = canvas2.getContext('2d')
    var canvas3 = document.getElementById('brownImage')
    var context3 = canvas3.getContext('2d')
    var canvas4 = document.getElementById('blackImage')
    var context4 = canvas4.getContext('2d')
    var thumbnail = new Image();
    thumbnail.src = $scope.currentDataURL;
    thumbnail.onload = function(){
        context1.drawImage(thumbnail, 0, 0, thumbnail.width, thumbnail.height, 0, 0, canvas1.width, canvas1.height)
        greyPosterFilter('greyImage', thumbnail)
        context2.drawImage(thumbnail, 0, 0, thumbnail.width, thumbnail.height, 0, 0, canvas2.width, canvas2.height)
        colorPosterFilter('posterImage', thumbnail)
        context3.drawImage(thumbnail, 0, 0, thumbnail.width, thumbnail.height, 0, 0, canvas3.width, canvas3.height)
        brownPosterFilter('brownImage', thumbnail)
        context4.drawImage(thumbnail, 0, 0, thumbnail.width, thumbnail.height, 0, 0, canvas4.width, canvas4.height)
        blackFilter('blackImage', thumbnail)
    }    
}

    $scope.takePicture = function() {
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
            // $scope.imgURI = "data:image/jpeg;base64," + imageData;
            $scope.currentDataURL = imageURL;
            urlToCanvas(imageURL, 'imageCanvas');
            setFilterThumbnails();
        });
    }

    $scope.openPhotoLibrary = function() { 
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 375,
            targetHeight: 375,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function(imageURL) {
            $scope.currentDataURL = imageURL;
            urlToCanvas(imageURL, 'imageCanvas');
            setFilterThumbnails();
        });
    }

       $scope.saveImage = function(){
        CameraFactory.createSquare($scope.currentDataURL, $scope.story._id, $scope.currentUser)
        .then(function(square){
            $scope.currentSquare = square;
        })
    }


    // $scope.filterImage = function(filterType, canvasId){
    //     // var canvas = $scope.canvas;
    //     var canvas = document.getElementById(canvasId);
    //     var filterType = filterType || 'sketch';
    //     var context = canvas.getContext('2d');
    //     var imageData = context.getImageData(0,0, canvas.width, canvas.height);
    //     var finalImageData;
    //     if (filterType === 'sketch'){
    //         var a = Grafi.edge(imageData, {level: 20});
    //         var b = Grafi.invert(a)
    //             // for (var i=0; i < a.length; i+=4){
    //             //   a[i]     = 255 - a[i];     // red
    //             //   a[i + 1] = 255 - a[i + 1]; // green
    //             //   a[i + 2] = 255 - a[i + 2]; // blue
    //             // }
    //         var c = Grafi.contrast(a)
    //         // var c = Grafi.brightness(a);
    //         finalImageData = c;
    //     }
    //     if (filterType === 'posterize'){
    //         finalImageData = Grafi.posterize(imageData)
    //     }
    //     context.putImageData(finalImageData, 0, 0);
    //     $scope.currentDataURL = canvas.toDataURL('image/png');
    // }

  

    // $scope.canvas = document.getElementById('imageCanvas');
    // $scope.addons = document.getElementById('addonCanvas');


    // var combineLayers = function(imageCanvasId, addonCanvasId){
    //     var imageCanvas = document.getElementById(imageCanvasId);
    //     canvas.setAttribute('style', 'z-index=1')
    //     var addonCanvas = document.getElementById(addonCanvasId);
    //     canvas.setAttribute('style', 'z-index=2')
    //     var imageContext = imageCanvas.getContext('2d');
    //     var addonsContext = addonCanvas.getContext('2d');
    //     imageContext.drawImage(addonsContext, 0, 0);
    // }

    // var updateCanvas = function(canvasId, changeFunct){
    //     var canvas = document.getElementById(canvasId);
    //     var context = canvas.getContext('2d');
    //     var imageData = context.getImageData(0,0, canvas.width, canvas.height);
    //     var dataURL = canvas.toDataURL('image/png');
    //     var newImageData = changeFunct(dataURL);
    //     context.putImageData(finalImageData, 0, 0);
    // }


    
 



});