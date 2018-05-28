app.controller('WeatherCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.currentUser = auth.currentUser;
}]);