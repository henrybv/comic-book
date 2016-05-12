core.controller('testStateCtrl', function($scope, getAddons) {
	

    $scope.testFunc = function() {
        console.log("This works")
    }

    $scope.allAddons = getAddons
  

    //Resolve for all of these filters and assign them to these variables
    // var filters
    // var bubbles
    // var borders
    // var stickers

    //Run this function with the correct addont to change the navbar

    
});