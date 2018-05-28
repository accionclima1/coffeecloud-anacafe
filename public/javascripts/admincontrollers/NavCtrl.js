//nav bar controller
app.controller('NavCtrl', [
	'$scope',
	'auth',
	'$location',
	function ($scope, auth, $location) {
	    $scope.isLoggedIn = auth.isLoggedIn;
	    $scope.currentUser = auth.currentUser;
	    $scope.curUserRole = auth.currentUserRole();
	    $scope.logOut = auth.logOut;
	    $scope.isActive = function (viewLocation) {
	        var active = (viewLocation === $location.path());
	        return active;
	    };
	}]);
