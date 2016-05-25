'use strict';

core.factory('EnvironmentFactory', function($http){
	return {
		getEnvironment: function() {
			return $http.get('/api/environment')
			.then(function(res) {
				return res.data;
			});
		}
	};
})