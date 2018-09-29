app.controller('NavCtrl', [
'$scope',
'auth',
'$location',
'$state',
'$rootScope',
'PouchDB',
function($scope, auth, $location, $state, $rootScope, PouchDB){
  $scope.isLoggedIn = auth.isLoggedIn;
  var currentuser = auth.currentUserObject();
  $scope.currentuserO = currentuser;
  $scope.logOut = auth.logOut;
  $scope.dataUser = {};
  $scope.isActive = function (viewLocation) {
     var active = (viewLocation === $location.path());
     return active;
	};

  // Funcion SweetAlert para mensajes Success y Error
  $scope.SweetAlert = function (title, text, type){
      swal({
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Aceptar'
          });
  }

  $scope.newsView = function(){
    if ($rootScope.IsInternetOnline) {
      $state.go("news", {}, {reload: true});
    }else {
      $state.go("home", {}, {reload: true});
      setTimeout(function(){
         $scope.SweetAlert("¡Error de Conexión!", "Conéctese a internet para acceder a las notificaciones.", "warning");
       }, 500);
    }

  }

  PouchDB.GetUserDataFromPouchDB(auth.userId()).then(function (result) {
      if (result.status == 'fail') {
          $scope.error = result.message;
      }
      else if (result.status == 'success') {
          $scope.userO7 = result.data;
          $scope.dataUser = result.data;
          // console.log($scope.user07);
          console.log(result.data);
          console.log($scope.dataUser);

      }
  });
}]);
