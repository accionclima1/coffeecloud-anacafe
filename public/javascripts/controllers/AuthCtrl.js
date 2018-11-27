//Authorize Controller
app.controller('AuthCtrl', ['$rootScope',
'$scope',
'$state',
'auth',
'$window',
'$timeout', 'PouchDB',
function ($rootScope,$scope, $state, auth, $window, $timeout, PouchDB) {
    $scope.user = {};
    $('.switch').css("color", "#666666");
    
    // Funcion SweetAlert para mensajes Success y Error
    $scope.SweetAlert = function (title, text, type){

      if (type == "success" || type == "error" || type == "warning" ) {
        swal({
              title: title,
              text: text,
              type: type,
              confirmButtonText: 'Aceptar'
            });
      }
      return
    }

    err = null;
    $scope.register = function () {
        auth.register($scope.user).error(function (error) {
            $scope.error = error;
        }).then(function (data) {
            $scope.user._id = auth.userId();
            PouchDB.SaveUserToPouchDB($scope.user, auth.userId()).then(function (result) {
                console.log("user updated");
                $state.go('home', {reload: true});
            });
        });
    };

    $scope.registerProfile = function () {
        $state.go('location');
    };

    $scope.logIn = function () {
        if($rootScope.IsInternetOnline){
        var isServerToLocalSync = false;
        var isLocalToServerSync = false;
        if ($scope.loginForm.$valid) {

       		 $scope.isFormSubmited = true;
        }
        var lastSyncDateTime = PouchDB.GetLastSyncDateTime();
        // var lastSyncDateTime = 0;
        $scope.user.lastSyncDateTime = lastSyncDateTime;
        auth.logIn($scope.user).error(function (error) {
            $scope.error = error;
            $scope.isFormSubmited = false;
        }).then(function (data) {
            //region added code for saving user data to pouchDB, after saving ***Note need to add code for sync all data too, move to home
            PouchDB.SaveUserDataToPouchDB(data).then(function (result) {
                if (result.status == 'fail') {
                    $scope.error = result.message;
                    console.log("user data written to pouch Db")
                    $state.go('home');
                }
                else if (result.status == 'success') {
                    var varitiesData = [];
                    if (data.data != undefined && data.data.varieties != undefined && data.data.varieties.length > 0) {
                        varitiesData = data.data.varieties;
                    }
                    PouchDB.SaveVarietiesToPouchDB(varitiesData).then(function (result) {
                        if (result.status == 'fail') {
                            $scope.error = result.message;
                            console.log("SaveVarietiesToPouchDB Not written to pouch Db")
                            PouchDB.SynServerLoginReturnedDataToLocalDb(data).then(function (serverResult) {
                                console.log("server to local sync result" + JSON.stringify(serverResult));
                                if (serverResult.status == 'success') {
                                    isServerToLocalSync = true;
                                    PouchDB.SynLocalDataToServerDb().then(function (localResult) {
                                        console.log("local to server sync result=" + JSON.stringify(localResult));
                                        if (localResult.status == 'success') {
                                            isLocalToServerSync = true;
                                            if (isLocalToServerSync && isServerToLocalSync) {
                                                PouchDB.SetLastSyncDateTime(Number(new Date()));
                                                $state.go('home');
                                            }
                                            else {
                                                console.log("data not sync")
                                                $state.go('home');
                                            }
                                        }
                                        else {
                                            console.log("data not sync")
                                            $state.go('home');
                                        }
                                    });
                                }
                            })
                        }
                        else {
                            PouchDB.SynServerLoginReturnedDataToLocalDb(data).then(function (serverResult) {
                                console.log("server to local sync result" + JSON.stringify(serverResult));
                                if (serverResult.status == 'success') {
                                    isServerToLocalSync = true;
                                    PouchDB.SynLocalDataToServerDb().then(function (localResult) {
                                        console.log("local to server sync result=" + JSON.stringify(localResult));
                                        if (localResult.status == 'success') {
                                            isLocalToServerSync = true;
                                            if (isLocalToServerSync && isServerToLocalSync) {
                                                PouchDB.SetLastSyncDateTime(Number(new Date()));
                                                $state.go('home');
                                            }
                                            else {
                                                console.log("data not sync")
                                                $state.go('home');
                                            }
                                        }
                                        else {
                                            console.log("data not sync")
                                            $state.go('home');
                                        }
                                    });
                                }
                            })
                        }
                    });
                }
            });
        });
        }else{
            $scope.SweetAlert('¡Error!', 'Necesita internet para iniciar sesión', 'error');
        }
    };




    // Tech - 12 jan
    $scope.GenOtp = function () {
        auth.GenOtp($scope.user).error(function (error) {
            $scope.error = error;
        }).then(function (data) {

            if (data.data.success == false) {

                $scope.success = false
                $scope.error = { "message": "Usuario no encontrado" }
            }
            else if (data.data.success == true) {
                $scope.error = false
                console.log(data.data.data);
                window.localStorage['otp-pasw-token'] = JSON.stringify(data.data.data);
                swal({
                      title: "Restablecer Contraseña",
                      text: "Código OTP enviado.",
                      type: "success",
                      confirmButtonText: 'Aceptar'
                    });
                $state.go('authenticateotp');

                $scope.success = { "message": "Un Otp fue enviado a tu correo electrónico" }
            }
        });
    };
    $scope.VerifyOTP = function () {
        if (!$scope.user.otp) {

            return false;
        }
        var parseLoca = $window.localStorage['otp-pasw-token'] ? JSON.parse($window.localStorage['otp-pasw-token']) : null;
        if (parseLoca == null) {

            $scope.success = false
            $scope.error = true
            $scope.error = { "message": "Inténtalo de nuevo solicitando nueva contraseña" }
            $timeout(function () {
                $state.go('forgotpassword');
            }, 2000);
            return false;
        }
        var data = { otp: $scope.user.otp, support: parseLoca }
        auth.VerifyOtp(data).error(function (error) {
            $scope.error = error;
        }).then(function (data) {
            if (data.data == 1) {
                //window.localStorage.removeItem('otp-pasw-token');
                $scope.success = true
                $scope.error = false
                sessionStorage.removeItem("count_verify");
                $scope.success = { "message": "Verificado. Por favor espera..." }
                $timeout(function () {
                    $state.go('changepassword');
                }, 1000);

            }
            else {
                if (sessionStorage.getItem("count_verify") == null) {
                    counter = sessionStorage.setItem("count_verify", 1);
                    counters = 1;
                } else {
                    counters = parseInt(sessionStorage.getItem("count_verify"));
                    counters++;
                    counter = sessionStorage.setItem("count_verify", counters);
                }
                //window.localStorage.removeItem('otp-pasw-token');
                //$state.go('changepassword');
                $scope.success = false
                $scope.error = true
                var chance = 3 - counters;
                $scope.error = { "message": "No válido o caducado. Faltan " + chance + " oportunidades" }
                if (chance == 0) {
                    sessionStorage.removeItem("count_verify");
                    window.localStorage.removeItem('otp-pasw-token');
                    $timeout(function () {
                        $state.go('login');
                    }, 2000)
                }
            }


        });
    }

    // $scope.navChange = function (){
    //   $('.switch').css("color", "#666666");
    // }

    $scope.ChangePassword = function () {
        if (!$scope.user.password || !$scope.user.cpassword) {
            return false;
        }
        if ($scope.user.password !== $scope.user.cpassword) {
            $scope.error = { "message": "La contraseña no coincide " }
            return false;
        }
        else {
            var parseLoca = $window.localStorage['otp-pasw-token'] ? JSON.parse($window.localStorage['otp-pasw-token']) : null;
            if (parseLoca == null) {
                $scope.error = { "message": "No se puede identificar al usuario. Inténtalo de nuevo" }
                return false
            }
            var info = { pasword: $scope.user, user: parseLoca }
            auth.ChangePassword(info).error(function (error) {
                $scope.error = error;
            }).then(function (data) {

                if (data.data.success) {
                    $scope.success = true
                    $scope.error = false
                    window.localStorage.removeItem('otp-pasw-token');
                    $scope.success = { "message": "Hecho! Contraseña cambiada correctamente. Por favor espera... " }
                    sessionStorage.removeItem("countchpas");
                    $timeout(function () {
                        $state.go('login');
                    }, 3000);
                }
                else {
                    var counter = null;

                    if (sessionStorage.getItem("countchpas") == null) {
                        counter = sessionStorage.setItem("countchpas", 1);
                        counters = 1;
                    } else {
                        counters = parseInt(sessionStorage.getItem("countchpas"));
                        counters++;
                        counter = sessionStorage.setItem("countchpas", counters);
                    }
                    //window.localStorage.removeItem('otp-pasw-token');
                    //$state.go('changepassword');
                    $scope.success = false
                    $scope.error = true

                    var chance = 3 - counters;
                    $scope.error = { "message": "Inválido. Faltan " + chance + " oportunidades" }
                    if (chance == 0) {
                        sessionStorage.removeItem("countchpas");
                        window.localStorage.removeItem('otp-pasw-token');
                        $timeout(function () {
                            $state.go('login');
                        }, 2000)
                    }

                }


            });
        }


    }
}]);
