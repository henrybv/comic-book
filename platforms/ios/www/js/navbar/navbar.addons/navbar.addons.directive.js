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
        url: "="
    },
    link: function (scope, element, attrs) {
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
            
<<<<<<< HEAD
            console.log(scope.addons[i])
=======
            // console.log(scope.addons[i])
>>>>>>> master
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
            }
        },
        {
            state: "LIBRARY",
            function: function() {
                scope.openphotolibrary()
                scope.setButtons('addonStates')
            }
        },
        {
            state: "COMIFY",
            function: function() {
                scope.setButtons('addonStates')
            }
        }
        ]

        //Functions from Camera Controller
        //Changes the addonStates below to the addonType clicked
        scope.changeNav = function(addon){
            scope.addonType = addon;
            // //Changes addonType to the current addon Tab
            // if (scope.addonType === 'filter') {
            //     setFilterThumbnails();
            // }
        };

        //Addons Directive
        scope.addonStates = [
        {
            state: 'Back',
            function: function(){
                scope.setButtons('pictureFunctions')
            }
        },
        {
            state: 'Filter',
            function: function(){
                scope.changeNav('filter')
            }
        }, 
        {
            state: 'Border',
            function: function(){
                scope.changeNav('border')
            }
        },
        {
            state: 'Bubble',
            function: function(){
                scope.changeNav('bubble')
            }
        },
        {
            state: 'Sticker',
            function: function(){
                console.log('in here')
                scope.changeNav('sticker')
            }
        },
        ]

        

        //Starting Set of Buttons and Filters
        scope.addonType = 'filter';
        window.onload = scope.setButtons('pictureFunctions');

    }
  };
})




