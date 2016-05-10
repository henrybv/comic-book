core.factory('StoryFactory', function($http, $localStorage) {

	var StoryFactory = {};

<<<<<<< HEAD
	StoryFactory.createNewStory = function(storyObj){
		console.log(storyObj);
=======
	StoryFactoryObj.createNewStory = function(storyObj){
>>>>>>> master
		return $http.post(base + '/api/stories', storyObj)
		.then(function(res) {
			console.log("story created front end!", res);
			return res.data;
		})
	};

<<<<<<< HEAD
	StoryFactory.getStoryById = function(storyId) {
		return $http.get(base + '/api/stories/' + storyId)
		.then(function(story) {
			return story.data;
		});
	};

=======
	StoryFactoryObj.getAllStories = function(id){
		return $http.get(base + '/api/stories/user/' + id)
		.then(function(res) {
			return res.data;
		})
	};

	StoryFactoryObj.getStory = function(id){
		return $http.get(base + '/api/stories/' + id)
		.then(function(res) {
			return res.data;
		})
	};
>>>>>>> master


	return StoryFactory;

});