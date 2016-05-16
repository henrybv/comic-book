core.controller('CameraCtrl', function(story, getAddons, $scope, $cordovaCamera, $cordovaFileTransfer, Grafi, $localStorage, CameraFactory, FilterFactory) {
	$scope.story = story;
    $scope.currentUser = $localStorage.user._id;
    $scope.currentSquare;
    //REMOVE LINK WHEN USING URL FROM PHOTO / ALBUM LIBRARY
    $scope.url = '../../img/ben.png';
    // $scope.url;

    var urlToCanvas = function(url, canvasId, x, y){
        console.log('in urlToCanvas with parameters:', url, canvasId, x, y);
        var x = x || 0;
        var y = y || 0;
        var canvas = document.getElementById(canvasId);
        var newImage = new Image();
        newImage.src = url;
        // newImage.crossOrigin = '';
        var context = canvas.getContext('2d');
        newImage.onload = function(){
            context.drawImage(newImage, x, y);
        }
        var dataURL = canvas.toDataURL('image/png');
    }
    //REMOVE WHEN USING URL FROM PHOTO / ALBUM LIBRARY
    urlToCanvas($scope.url, 'imageCanvas');

    $scope.applyfilter = function(filter, canvasId){
        console.log('in apply filter in camera ctrl')
        applyfilter(filter, canvasId);
    }

    var applyfilter = function(filter, canvasId){
        console.log('in applyfilter other function')
        var img = new Image();
        img.src = $scope.url;
        if (canvasId === 'imageCanvas') FilterFactory.clearFilter(canvasId, img)
        if (filter === 'grey') FilterFactory.greyPosterFilter(canvasId, img);
        if (filter === 'poster') FilterFactory.colorPosterFilter(canvasId, img);
        if (filter === 'brown') FilterFactory.brownPosterFilter(canvasId, img);
        if (filter === 'black') FilterFactory.blackFilter(canvasId, img);
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
            $scope.url = imageURL;
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
            $scope.url = imageURL;
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

    var combineLayers = function(imageCanvasId, addonCanvasId, x, y){
        var imageCanvas = document.getElementById(imageCanvasId);
        canvas.setAttribute('style', 'z-index=1')
        var addonCanvas = document.getElementById(addonCanvasId);
        canvas.setAttribute('style', 'z-index=2')
        var imageContext = imageCanvas.getContext('2d');
        var addonsContext = addonCanvas.getContext('2d');
        imageContext.drawImage(addonsContext, x, y);
    }

    $scope.addStickersToCanvas = function(){
        $scope.stickersArray.forEach(function(sticker){
            urlToCanvas(sticker.source, 'imageCanvas', sticker.x, sticker.y)
        })
    }

    // $scope.canvas = document.getElementById('imageCanvas');
    // $scope.addons = document.getElementById('addonCanvas');

    // FOR HTML2CANVASS ////////////
    // FOR GRABBING
    var element1;
    var element2;
    var element3;

    function grabElement() {
        // if we make it so can put on more STICKERS will have to change this
        if (stickercounter === 1) {
            element1 = $("#sticker1");
        } else if (stickercounter === 2) {
            element2 = $("#sticker2");
        } else if (stickercounter === 3) {
            element3 = $("#sticker3");
        }

        console.log('element1: ', element1)
    };
    //////////////////////

        // ORDER OF WORKING THIS:
    //  1. WHEN BUBBLE IS ADDED TO DOM, GRAB IT AND ASSIGN IT TO A VAR 
    //      (this is being done with grabElemnt function above - tested with stickers.  Put this func into $scope.sticker function)
    //  2. THAT VAR NEEDS TO BE PASSED INTO THE html2canvas FUNCTION BELOW 
    //      (currently putting in 'element' which is just a random element to turn from html to canvas obj)
    //  3. FOLLOW COMMENTS IN $scope.previewImage FUNCTION BELOW

    // PRACTICE TURNING DIV INTO CANVAS
    // USE GRABELEMNT FUNCTIONABOVE WITH THIS
    var element = $("#new"); // global variable
    var getCanvas; // global variable
 
    $scope.previewImage = function () {
         // PASS CORRECT BUBBLE IN WHERE 'element' CURRENTLY IS
         html2canvas(element, {
         onrendered: function (canvas) {
                // RENDERS CANVAS BACK ONTO PAGE
                canvas.class = 'newID';
                // PRETTY SURE WE DONT NEED TO APPEND BACK TO DOM TO GET ALL THE DATA FROM IT
                // $("#previewImage").append(canvas);
                // getCanvas = canvas;

                // NOTES:
                // 1. MIGHT HAVE TO SET THE TEXT AREA TO BE CERTAIN H/W CUZ IT RERENDERS WRONG IF THE USER PRESSES ENTER (but they prob wont be pressing enter right?) (STARTS A NEW LINE - ALL COMES OUT AS ONE LINE)
                //      - TO SOLVE THIS MIGHT BE ABLE TO PASS H/W PARAMS WITH THE TEXT BOX
                // 2. WILL HAVE TO PASS COORDOINATES WITH THE DATA URL
                var ctx = canvas.getContext("2d");
                var imgData = ctx.getImageData(0,0, 375, 43);
                var dataURL = canvas.toDataURL();
                console.log('data url', dataURL);
             }
         });
    };



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
        console.log('in sticker function in ctrl!!')
        console.log('STICKER', img)

        //Create image element with unique ID
        if(stickercounter < 4){
            $scope.stickersArray.push({source: img, id: stickercounter, x: 2, y: 28})
            console.log($scope.stickersArray)
            //Grab that element and set it to a variable;
            // w.appendChild(sticker)
            stickercounter++
        } else {
            //Run an Error that tells them they have too many stickers!
            console.log("Too Many Stickers!")
        }
        // $scope.$compile()


        //WORK ON THIS TONIGHT!!!!!
        // $('#sticker'+stickercounter).dblclick(function(){
        //     console.log('in doyble click')
        //     $scope.stickersArray.splice(Number(stickercounter),1);
        // })

    }

    // $(document).on('dbclick', '#sticker1', function(){
    //     console.log('in doyble click')
    //     $scope.stickersArray.splice(0,1);
    // })


    $scope.bubble = function (img){
        console.log('BUBBLE')
    }    
    $scope.border = function (img){
        console.log('BORDER')
    }    
    // $scope.filter = function (img){
    //     console.log('FILTER')
    // }

    $scope.onHammer = function onHammer (event) {

        var currentElem = document.getElementById(event.element[0].id);
        var x = event.center.x - 80,
            y = event.center.y - 130;


        //DEBANSHI'S UPDATES
        var index;
        $scope.stickersArray.forEach(function(sticker, idx){
            if ('sticker'+sticker.id === event.element[0].id) {
                index = idx;
            }
        })
        $scope.stickersArray[index].x = x
        $scope.stickersArray[index].y = y
        //END OF DEBANSHI'S UPDATES

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
    //     $scope.url = canvas.toDataURL('image/png');
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


