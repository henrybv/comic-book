core.directive('navbarAddonstates', function() {
  return {
    restrict: 'E',
    templateUrl: 'js/navbar/navbar.addons.states/navbar.addons.states.template.html',
    scope:{
    	changeNav: "&"
        // filters:
        // borders
    },
    link: function (scope) {
    	
        scope.changeNav()
    	scope.states = [
        {
            state: 'filters',
            addons: []
        }, 
        {
            state: 'borders',
            addons: []
        },
        {
            state: 'bubbles',
            addons: []
        },
        {
            state: 'stickers',
            addons: []
        }]
    }
  };
})