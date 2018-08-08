app.controller('LocationCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.testLocation = function() {
  	$('body').removeClass('modal-open');
  	$('.modal-backdrop').removeClass('modal-backdrop');
  	$state.go('home');
  }
}]);