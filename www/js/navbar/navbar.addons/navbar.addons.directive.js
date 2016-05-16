core.directive('navbarAddon', function($rootScope) {
  return {
    restrict: 'E',
    templateUrl: 'js/navbar/navbar.addons/navbar.addons.template.html',
    scope:{
        test: "&",
        onhammer: "&",
        takepicture: "&",
        openphotolibrary: "&",
        addons: "=",
        sticker: "=",
        bubble: "=",
        border: "=",
        filter: "="
    },
    link: function (scope, element) {

        //Adds proper functions to addons:
        for (var i = 0; i < scope.addons.length; i++) {
            
            scope.addons[i].addonFunction = function(){

                if(this.type === "sticker"){
                    scope.sticker(this.source)
                }
                if(this.type === "bubble"){
                    scope.bubble(this.source)
                }
                if(this.type === "border"){
                    scope.border(this.source)
                }
                if(this.type === "filter"){
                    scope.filter(this.source)
                }
            }

            // console.log(scope.addons[i])
        }

        //Functions from Camera Controller
        scope.changeNav = function(addon){
            //Changes addonType to the current addon Tab
            scope.addonType = addon;
        };
        
        //This Sets Width of Directive Buttons
        scope.myWidth = function(){
            newWidth = Math.floor((100/scope.activeButtons.length))
            return newWidth.toString() + '%'
        }

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
        // {
        //     state: 'TEST',
        //     function: function(){
        //         setButtons('addonStates')
        //     }
        // }
        ]

        //Addons Directive
        scope.addonStates = [
        {
            state: '<---',
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




