core.directive('navbarAddon', function($rootScope) {
  return {
    restrict: 'E',
    templateUrl: 'js/navbar/navbar.addons/navbar.addons.template.html',
    scope:{
        test: "&",
        onhammer: "&",
        takepicture: "&",
        openphotolibrary: "&",
        applyfilter: "=",
        addons: "=",
        sticker: "=", 
        bubble: "=", 
        border: "=",
        filter: "=",
        url: "=",
        story: "=",
        picuretakenfalse: "="
    },
    link: function (scope, $scope, element, attrs) {
    
    //------LIVE FEED BEGIN-----//
    //// LIVE FEED - GETTING IMAGES FROM FIREBASE EVERY TIME ONE IS ADDED
    // var urlToNewCanvas = function(url, canvasId){
    //     var canvas = document.createElement('canvas');
    //     canvas.id = canvasId;
    //     canvas.width = canvas.height = 300;
    //     var context = canvas.getContext('2d');
    //     var newImage = new Image();
    //     var elem = document.getElementById('here')
    //     elem.appendChild(canvas);
    //     newImage.src = url;
    //     newImage.onload = function(){
    //         context.drawImage(newImage, 0, 0, newImage.width, newImage.height, 0, 0, canvas.width, canvas.height);
    //     }
    // }
    
    // var ref = new Firebase('https://torrid-inferno-1552.firebaseio.com/' + $scope.story._id);
    // ref.on('value', function(snapshot){
    //     var obj = snapshot.val();
    //     var arr = [];
    //     for (var squareId in obj){
    //         var dataURL = obj[squareId].url
    //         arr.push(dataURL);
    //     }

    //     //Array of DATAURLS
    //     $scope.squaresArray = arr;


    // });

    //------LIVE FEED END-----//


        // scope.showBottomNav = true;
        //scope.addons is set above from the state resolve
                //Sets Filters
        var setFilterThumbnails = function(){
            var filtersarr = ['grey', 'poster', 'brown', 'black'];
            filtersarr.forEach(function(filter){
                var canvas = document.getElementById(filter);
                var context = canvas.getContext('2d');
                var thumbnail = new Image();
                thumbnail.src = scope.url;
                thumbnail.crossOrigin = '';
                thumbnail.onload = function(){
                    context.drawImage(thumbnail, 0, 0, thumbnail.width, thumbnail.height, 0, 0, canvas.width, canvas.height)
                    scope.applyfilter(filter,filter);
                }
            })
        }
        
        setFilterThumbnails();

        //This Sets Width of Directive Buttons
        scope.myWidth = function(){
            newWidth = Math.floor((100/scope.activeButtons.length))
            return newWidth.toString() + '%'
        }
        
        //Adds proper functions to addons:
        //These will call the proper scope functions that then add the proper sticker/bubble/border images to the canvas for editing
        for (var i = 0; i < scope.addons.length; i++) {
            

            scope.addons[i].addonFunction = function(){

                if(this.type === "sticker"){
                    scope.sticker(this.source)
                }
                if(this.type === "bubble"){
                    scope.bubble(this.name)
                }
                if(this.type === "border"){
                    console.log("THIS", this)
                    scope.border(this.source)
                }
                if(this.type === "filter"){
                    scope.filter(this.source)
                }
            }
        }



        //Switches between Picture buttons and AddonButtons
        scope.setButtons = function(buttonType){
            // var divElem = document.getElementsByClassName("button buttonsToGrab")
            if (buttonType === 'addonStates') {
                scope.activeButtons = scope.addonStates;
            }
            if (buttonType === 'pictureFunctions') {                
                scope.activeButtons = scope.pictureFunctions;
            }
        };


        //Take Picture Directive
        //These Tabs are an ng-repeat that will show when
        scope.pictureFunctions = [
        {
            state: "CAMERA",
            function: function(){
                scope.takepicture()
                scope.setButtons('addonStates')
            },
            style: {
                'color': 'green',
                'font-weight': 'bold',
                border: 'solid 1px black'
            }
        },
        {
            state: "LIBRARY",
            function: function() {
                scope.openphotolibrary()
                scope.setButtons('addonStates')
            },
            style: {
                'color': 'green',
            }
        },
        {
            state: "COMIFY",
            function: function() {
                scope.setButtons('addonStates')
                scope.picuretakenfalse()
            },
            style: {
                'font-weight': 'bold',
                'color': 'orange'
            }
        }
        ]

        //Functions from Camera Controller
        //Changes the addonStates below to the addonType clicked
        scope.changeNav = function(addon){
            scope.addonType = addon;
            // //Changes addonType to the current addon Tab
            if (scope.addonType === 'filter') {
                setFilterThumbnails();
            }
        };

        //Addons Directive
        scope.addonStates = [
        {
            state: 'Back',
            function: function(){
                scope.setButtons('pictureFunctions')
            },
            style: {
                'font-weight': 'bold',
                'color': 'blue',
            }
        },
        {
            state: 'Filter',
            function: function(){
                scope.changeNav('filter')
            },
            style: {
                'color': 'purple',
            }
        }, 
        {
            state: 'Border',
            function: function(){
                scope.changeNav('border')
            },
            style: {
                'color': 'orange',
            }
        },
        {
            state: 'Bubble',
            function: function(){
                scope.changeNav('bubble')
            },
            style: {
                'color': 'yellow',
            }
        },
        {
            state: 'Sticker',
            function: function(){
                console.log('in here')
                scope.changeNav('sticker')
            },
            style: {
                'color': 'pink',
            }
        },
        ]


        //Starting Set of Buttons and Filters
        scope.addonType = 'filter';
        // scope.activeButtons = scope.pictureFunctions
        window.onload = scope.setButtons('pictureFunctions');

    }
  };
})




