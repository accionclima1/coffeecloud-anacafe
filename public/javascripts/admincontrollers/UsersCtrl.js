//Users editor controller
app.controller('UsersCtrl', [
	'$scope',
	'auth',
	'$location',
	'user',
	function ($scope, auth, $location, user) {
	    muni14.addDepts('departamentos');
	    $scope.isLoggedIn = auth.isLoggedIn;
	    $scope.currentUser = auth.currentUser;
	    $scope.logOut = auth.logOut;
	    $scope.isActive = function (viewLocation) {
	        var active = (viewLocation === $location.path());
	        return active;
	    };
	    user.getAll().then(function (users) {
	        $scope.userList = users;
	    });
	    $scope.newUser = {};

	    $scope.createUser = function () {
	        $scope.newUser.departamento = $("#departamentos option:selected").text();
	        $scope.newUser.municipio = $("#departamentos-munis option:selected").text();

	        auth.register($scope.newUser).error(function (error) {
	            $scope.error = error;
	        }).then(function (data) {
	            $('#myModal').modal('hide');
	            user.getAll().then(function (users) {
	                $scope.userList = users;
	            });
	        });



	    }

	    $scope.editUser = function (user) {
	        $scope.message = null;
	        $scope.error = null;
	        $scope.editUserO = user;
	        $('#myModalEdit').modal('show');
	    }

	    $scope.removeUser = function (id, index) {

	        user.delete(id).then(function (user) {
	            $scope.userList.splice(index, 1);
	        });
	    }

	    $scope.saveUser = function () {
	        $scope.message = null;
	        $scope.error = null;
	        user.update($scope.editUserO).error(function (error) {
	            $scope.error = error;
	        }).then(function (data) {
	            $scope.message = data.data.message;
	        });
	    }


	}]);

// User profile service
app.factory('user', ['$http', 'auth', function ($http, auth) {
    var o = {
    };
    /*o.create = function(post) {
		return $http.post('/posts', post, {
	headers: {Authorization: 'Bearer  '+auth.getToken()}
}).success(function(data){
			o.posts.push(data);
		});
	};*/
    o.getAll = function () {
        return $http.get('/users', {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).then(function (res) {
            return res.data;
        });
    };
    o.get = function (id) {
        return $http.get('/users/' + id).then(function (res) {
            return res.data;
        });
    };

    o.update = function (user) {
        return $http.put('/users/' + user._id, user, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data
        });
    };
    o.delete = function (user) {
        return $http.delete('/users/' + user, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data
        });
    };

    return o;
}]);
