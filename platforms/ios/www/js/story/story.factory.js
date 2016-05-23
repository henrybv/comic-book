core.factory('StoryFactory', function($http, $localStorage) {

	var StoryFactory = {};

	StoryFactory.createNewStory = function(storyObj){
		return $http.post(base + '/api/stories', storyObj)
		.then(function(res) {
			console.log('FACT returned out of StoryFactory.createNewStory', res.data)
			return res.data;
		})
	};


	StoryFactory.getStoryById = function(storyId) {
		return $http.get(base + '/api/stories/' + storyId)
		.then(function(story) {
			return story.data;
		});
	};	

	StoryFactory.getSquareById = function(squareId) {
		return $http.get(base + '/api/squares/' + squareId)
		.then(function(square) {
			return square.data;
		});
	};


	StoryFactory.getMyStories = function(userId){
		console.log('in Story Factory - getMyStories with userId', userId)
		return $http.get(base + '/api/stories/user/' + userId)
		.then(function(res) {
			console.log('in factory to get my stories. returned from route: ', res.data)
			return res.data;
		});
	};

	StoryFactory.getMyCollabs = function(userId){
		return $http.get(base + '/api/stories/collaborator/' + userId)
		.then(function(res) {
			return res.data;
		});
	};

	StoryFactory.getStory = function(storyId){
		return $http.get(base + '/api/stories/' + storyId)
		.then(function(res) {
			return res.data;
		});
	};

	StoryFactory.addCollaborators = function(storyId, collabsArray) {
		return $http.put(base + '/api/stories/' + storyId +'/collaborators', {collaborators: collabsArray})
		.then(function(story) {
			return story.data;
		})
	};

	StoryFactory.deleteSquare = function (storyId, squareId) {
		console.log('DELETE SQ IN STORY FACT RAN')
		return $http.put(base + '/api/stories/' + storyId + '/squares/' + squareId)
		.then(function(story) {
			console.log('STORY RECIEVED IN STORY FACT')
			return story.data;
		});
	};


	return StoryFactory;

});