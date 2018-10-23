app.controller('ProfileCtrl', ['$http', '$scope', 'auth', 'unit', 'varieties', 'user', 'PouchDB', '$rootScope','localStorageService', 'onlineStatus',
function ($http, $scope, auth, unit, varieties, user, PouchDB, $rootScope, localStorageService, onlineStatus) {
    var map;
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.userId = auth.userId;
    $scope.user_Ided = auth.userId();
    var userO = {};
    $scope.preguntar = 0;
    $('.switch').css("color", "#FFF");
    //$scope.units = [];
    //PouchDB.CreatePouchDB();

    $scope.onlineStatus = onlineStatus;

    $scope.$watch('onlineStatus.isOnline()', function (online) {
        $scope.online_status_string = online ? 'online' : 'offline';
        onlineStatus = $scope.online_status_string

    });

    /*Ea0707*/
    //$rootScope.IsInternetOnline = false;
    console.log("online: ");
    console.log($rootScope.IsInternetOnline);

    PouchDB.GetUserDataFromPouchDB(auth.userId()).then(function (result) {
        if (result.status == 'fail') {
            $scope.error = result.message;
        }
        else if (result.status == 'success') {
            $scope.userO7 = result.data;
            // console.log($scope.user07);
            console.log(result.data);
            console.log($scope.user07);

        }
    });

    // Función para actualizar contraseña
    $scope.update = function () {
        user.update($scope.userO7).error(function (error) {
            $scope.error = error;
        }).then(function (data) {
            $scope.SweetAlert("¡Error!", "Contraseña Invalida", "error");
            $scope.message = data.data.message;
        });
    };


    // Función para Actualizar datos de Perfil del Usuario
    $scope.updated = function () {
        //auth.userId()
        //PouchDB.SaveUserDataToPouchDB($scope.userO7).then(function (result) {
        //    console.log("User updated");
        //});

        user.update($scope.userO7).error(function (error) {
            $scope.error = error;
        }).then(function (data) {
            $scope.message = data.data.message;
        });

        console.log($scope.userO7);
        PouchDB.SaveUserToPouchDB($scope.userO7, auth.userId()).then(function (result) {
          $scope.SweetAlert("¡Excelente!", "Perfil Actualizado", "success");
          console.log("user updated");
        });

    }


    if ($rootScope.IsInternetOnline) {
        PouchDB.SynServerDataAndLocalData().then(function () {
            console.log("sync successfully.");
        }).catch(function (err) {
            console.log("Not able to sync" + error);
        });
    }


}]);
