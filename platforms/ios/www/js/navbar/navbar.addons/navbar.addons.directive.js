core.directive('navbarAddon', function() {
  return {
    restrict: 'E',
    templateUrl: 'js/navbar/navbar.addons/navbar.addons.template.html',
    scope:{
    	test: "&"
    },
    link: function (scope) {
    	scope.test();
    	scope.options = [{image: "http://placehold.it/123x123", title:0}, {image: "http://placehold.it/123x123", title:1}, {image: "http://placehold.it/123x123", title:2}, {image: "http://placehold.it/123x123", title:3}, {image: "http://placehold.it/123x123", title:4}]
    }
  };
})