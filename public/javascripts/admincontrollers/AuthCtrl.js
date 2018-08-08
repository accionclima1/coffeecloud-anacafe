// Authorize controller
app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function ($scope, $state, auth) {
	    $scope.user = {};

	    $scope.register = function () {
	        auth.register($scope.user).error(function (error) {
	            $scope.error = error;
	        }).then(function () {
	            $state.go('register-profile');
	        });
	    };

	    $scope.registerProfile = function () {
	        $state.go('location');
	    };

	    $scope.logIn = function () {
	        auth.logIn($scope.user).error(function (error) {
	            $scope.error = error;
	        }).then(function () {
	            $state.go('home');
	            $state.reload();
	        });
	    };
	}]);



//authorize service
app.factory('auth', ['$http', '$state', '$window', function ($http, $state, $window) {
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['flapper-news-token'] = token;
    };

    auth.getToken = function () {
        return $window.localStorage['flapper-news-token'];
    }

    auth.isLoggedIn = function () {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    auth.currentUserObject = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            return JSON.parse($window.atob(token.split('.')[1]));
        }
        else {
            return null;
        }
    }

    auth.currentUserRole = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.role;
        }
    };

    auth.currentUserDepartamento = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.extemDepartamento;
        }
    };


    auth.register = function (user) {
        return $http.post('/register', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logIn = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };
    auth.logOut = function () {
        $window.localStorage.removeItem('flapper-news-token');
        $state.go('home');
    };

    return auth;
}]);
