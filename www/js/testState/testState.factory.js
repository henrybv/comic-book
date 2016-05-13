// core.factory('TestFactory', function($http, $localStorage) {

// 	var TestFactory = {};


// 	TestFactory.getFilters = function(){
// 		console.log("Got into the factory")
// 		return $http.get(base + '/api/addons')
// 		.then(function(res) {
// 			console.log("addons", res.data);
// 			return res.data;
// 		})
// 	};

// 	return TestFactory;

// });