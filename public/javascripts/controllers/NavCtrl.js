app.controller('NavCtrl', [
'$scope',
'auth',
'$location',
function($scope, auth, $location){
  $scope.isLoggedIn = auth.isLoggedIn;
  var currentuser = auth.currentUserObject();
  $scope.currentuserO = currentuser;
  $scope.logOut = auth.logOut;
  $scope.isActive = function (viewLocation) {
     var active = (viewLocation === $location.path());
     return active;
	};
}]);