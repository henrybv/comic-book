core.factory('UserFactory', function($http) {

    var UserFactory = {};

    // var base = 'http://192.168.1.183:1337/'

    function getData(res) {
        return res.data;
    }

    UserFactory.getAllUsers = function(){
        return $http.get(base +'/api/members/')
        .then(function(users){
            return users.data;
        });
    };

    UserFactory.signup = function(newUser) {
        return $http.post(base + '/api/members/', newUser)
        //Jeff: returned entire res instead of res.data
        .then(function(data) {
            return data
        })
        .then(function(createdUser) {
            return createdUser;
        });
    };

    UserFactory.getUser = function(userId) {
        return $http.get(base + '/api/members/' + userId)
        .then(getData)
        .then(function(user) {
            return user;
        });
    };

    UserFactory.deleteUser = function(userId) {
        return $http.delete(base + '/api/members/' + userId)
        .then(getData)
        .then(function(user) {
            return user;
        });
    };

    UserFactory.updateUser = function(userId, update){
        return $http({
            method: 'PUT',
            url: base + '/api/members/' + userId,
            data: update
        }).then(function(response){
            return response;
        })
    };



    return UserFactory;

});