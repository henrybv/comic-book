core.directive('navbarAddon', function($rootScope) {
  return {
    restrict: 'E',
    templateUrl: 'js/navbar/navbar.addons/navbar.addons.template.html',
    scope:{
    	test: "&",
        addons: "=",
    },
    link: function (scope) {
    	scope.test();
        // scope.change('filter');
        console.log("scope addons", scope.addons)
        scope.addonType = 'filter'
    	// scope.options = [{image: "http://placehold.it/125x125", title:0}, {image: "http://placehold.it/125x125", title:1}, {image: "http://placehold.it/125x125", title:2}, {image: "http://placehold.it/125x125", title:3}, {image: "http://placehold.it/125x125", title:4}]
        
        scope.changeNav = function(addon){
            scope.addonType = addon
            console.log('changedNav', scope.addonType)
        }

        scope.states = [
        {
            state: 'filter',
            addons: []
        }, 
        {
            state: 'border',
            addons: []
        },
        {
            state: 'bubble',
            addons: []
        },
        {
            state: 'sticker',
            addons: []
        }]
    }
  };
})