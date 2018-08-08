//adaptation controller
app.controller('AdaptacionCtrl', [
	'$scope',
	'auth',
	'$location',
	'methods',
	function ($scope, auth, $location, methods) {
	    $scope.isLoggedIn = auth.isLoggedIn;
	    $scope.currentUser = auth.currentUser;
	    $scope.logOut = auth.logOut;
	    $scope.isActive = function (viewLocation) {
	        var active = (viewLocation === $location.path());
	        return active;
	    };
	    var tableObject = {};

	    methods.get().then(function (methods) {
	        //console.log(methods.data[0]);
	        tableObject = methods.data[0];
	        $scope.table = tableObject;
	    })



	    $scope.saveTable = function () {
	        methods.update($scope.table);

	    };

	}]);
