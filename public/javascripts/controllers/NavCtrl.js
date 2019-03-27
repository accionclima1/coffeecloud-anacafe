app.controller('NavCtrl', [
'$scope',
'auth',
'$location',
'$state',
'$rootScope',
'PouchDB',
'localStorageService',
function($scope, auth, $location, $state, $rootScope, PouchDB, localStorageService){
  $scope.isLoggedIn = auth.isLoggedIn;
  var currentuser = auth.currentUserObject();
  $scope.currentuserO = currentuser;

  $scope.logOut = auth.logOut;
  $scope.classActive = "";

  console.log(currentuser);


  $scope.soportUser = function(){
    $scope.currentRole = auth.currentUserRole();

    if ($scope.currentRole == "client") {
      $scope.classActive = "/supportclient";
      $state.go("supportclient", {}, {reload: true});
    }
    else if ($scope.currentRole == "Extensionista" || $scope.currentRole == "Admin") {
      $scope.classActive = "/support_main";
      $state.go("support_main", {}, {reload: true});
    }
  }

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

}]);
