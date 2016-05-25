'use strict';

core.factory('EnvironmentFactory', function($http){
	return {
		getEnvironment: function() {
			return $http.get('/api/environment')
			.then( res => res.data);
		}
	};
})