core.controller('CameraCtrl', function(story, getAddons, $scope, $cordovaCamera, $cordovaFileTransfer, Grafi, $localStorage, CameraFactory) {
	$scope.story = story;
    $scope.currentUser = $localStorage.user._id;
    $scope.currentSquare;
    // $scope.currentDataURL = '../../img/mike.png';
    $scope.currentDataURL;

    var urlToCanvas = function(url, canvasId){
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
        Caman("#"+canvasId, img, function() {
            this.posterize(3);
            this.greyscale();
            this.render()
        });
    }

    var colorPosterFilter = function(canvasId, img){
        Caman("#"+canvasId, img, function() {
            this.posterize(3);
            this.noise(3);
            this.render()
        });
    }

    var brownPosterFilter = function(canvasId, img){
        Caman('#'+canvasId, img, function(){
            this.hazyDays(5);
            this.love(5);
            this.grungy(5);
            this.noise(5);
            this.render();
        })
    }

    var blackFilter = function(canvasId, img){
        Caman('#'+canvasId, img, function() {
            this.brightness(4);
            this.contrast(10);
            this.sinCity(2);
            this.noise(4);
            this.render()
        });
    }

    // urlToCanvas($scope.currentDataURL, 'imageCanvas');

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
        var canvas = document.getElementById('imageCanvas');
        var finalDataURL = canvas.toDataURL('image/png')
        CameraFactory.createSquare(finalDataURL, $scope.story._id, $scope.currentUser)
        .then(function(square){
            $scope.currentSquare = square;
        })
    }

    // var combineLayers = function(imageCanvasId, addonCanvasId){
    //     var imageCanvas = document.getElementById(imageCanvasId);
    //     canvas.setAttribute('style', 'z-index=1')
    //     var addonCanvas = document.getElementById(addonCanvasId);
    //     canvas.setAttribute('style', 'z-index=2')
    //     var imageContext = imageCanvas.getContext('2d');
    //     var addonsContext = addonCanvas.getContext('2d');
    //     imageContext.drawImage(addonsContext, 0, 0);
    // }

    // $scope.canvas = document.getElementById('imageCanvas');
    // $scope.addons = document.getElementById('addonCanvas');




   


    //--------DIRECTIVE--------//

    $scope.test = function(){
        console.log("HELLO")
    }
    //Filters from Database Resolve
    $scope.allAddons = getAddons
    console.log($scope.allAddons)

    //Create Sticker Div
 
    // var w = document.getElementById('stickerWrapper');

    // w.style.left = '50px';
    // w.style.top = '100px'

    $scope.stickersArray = []
    stickercounter = 1;
    $scope.sticker = function (img){
        console.log('STICKER', img)

        //Create image element with unique ID
        if(stickercounter < 4){
            // var sticker = new Image()
            // sticker.src = img
            // console.log(sticker)

            // sticker.setAttribute("src", img)
            // sticker.setAttribute("hm-panmove", 'onHammer')
            // sticker.setAttribute("ng-click", "test()")
            $scope.stickersArray.push({source: img, id: stickercounter})

            console.log($scope.stickersArray)
            //Grab that element and set it to a variable;
            // w.appendChild(sticker)
            stickercounter++
        } else {
            //Run an Error that tells them they have too many stickers!
            console.log("Too Many Stickers!")
        }
        // $scope.$compile()
    }    
    $scope.bubble = function (img){
        console.log('BUBBLE')
    }    
    $scope.border = function (img){
        console.log('BORDER')
    }    
    $scope.filter = function (img){
        console.log('FILTER')
    }

    $scope.onHammer = function onHammer (event) {

        var currentElem = document.getElementById(event.element[0].id);

        var x = event.center.x - 80,
            y = event.center.y - 130;

        currentElem.style.left = x + 'px';
        currentElem.style.top = y + 'px';
        console.log("hammer ran", currentElem)

      console.log("Coords", x, y);

    };


});



//OLD SKETCH FILTER
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

//FUNCTION TO UPDATE CANVAS
    // var updateCanvas = function(canvasId, changeFunct){
    //     var canvas = document.getElementById(canvasId);
    //     var context = canvas.getContext('2d');
    //     var imageData = context.getImageData(0,0, canvas.width, canvas.height);
    //     var dataURL = canvas.toDataURL('image/png');
    //     var newImageData = changeFunct(dataURL);
    //     context.putImageData(finalImageData, 0, 0);
    // }


