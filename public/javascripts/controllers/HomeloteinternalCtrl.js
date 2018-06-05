app.controller('HomeloteinternalCtrl', ['$http', '$scope', '$stateParams','auth', 'gallo', 'roya', 'methods', 'unit', 'varieties', 'user', 'PouchDB', '$rootScope','localStorageService', 'onlineStatus',
function ($http,$scope, $stateParams, auth, gallo, roya, methods, unit, varieties, user, PouchDB, $rootScope, localStorageService, onlineStatus) {
        console.log("show time");
        $scope.currentUser = auth.currentUser;
        $scope.currentId = auth.currentUser();
        $scope.user_Ided = auth.userId();
        $scope.unitId = $stateParams.idunidad;
        $scope.unitIndex = $stateParams.indexunidad;
        $scope.loteIndex = $stateParams.indexlote;
        $scope.royaHistoryByLote = [];
        $scope.royaHistoryByLoteOffline = [];
        $scope.galloHistoryByLote = [];
        $scope.galloHistoryByLoteOffline = [];
        var map;


        $('.collapse').collapse('hide');

        console.log($stateParams.idunidad);
        console.log($stateParams.indexlote);
        console.log($scope.currentId);

        PouchDB.GetUnit($scope.unitId,auth.userId()).then(function (result) {
        	if (result.status == 'fail') {
                $scope.error = result.message;
                console.log("error");
        	}
        	else if (result.status == 'success') {
                $scope.unidadseleccionada = result.data;
                $scope.loteseleccionado = $scope.unidadseleccionada.lote[$scope.loteIndex];
                console.log($scope.unidadseleccionada);
                console.log($scope.loteseleccionado);

        	}
        });


        //Cálculos de ROYA
        if ($rootScope.IsInternetOnline) {
          console.log("Con internet Roya");
          console.log($scope.user_Ided);

          // Reporte de Roya
          roya.getUser(auth.userId()).then(function(userhistory){
            console.log("Entré Datos Roya");
            $scope.royaHistory = userhistory.data;
            $scope.royaHistoryOffline = localStorageService.get('dataOffline');
            localStorageService.set('royaHistory',userhistory.data);
            console.log("Historial Roya");
            console.log($scope.royaHistory);
            for (var i = 0; i < userhistory.data.length; i++) {
                    if ((userhistory.data[i].loteIndex == $scope.loteIndex)&&(userhistory.data[i].idunidad==$scope.unitId)) {
                            $scope.royaHistoryByLote.push($scope.royaHistory[i]);
                    }
            }

          });
          localStorageService.remove('dataOffline');
          } else {
            console.log("No internet Roya");
            console.log($scope.user_Ided);
            $scope.royaHistory = localStorageService.get('royaHistory');
            console.log('Offline-Data Roya: ', $scope.royaHistory);
            $scope.royaHistoryOffline = localStorageService.get('dataOffline');
            console.log($scope.royaHistoryOffline);

            for (var i = 0; i < $scope.royaHistory.length; i++) {
              if (($scope.royaHistory[i].loteIndex == $scope.loteIndex)&&($scope.royaHistory[i].idunidad==$scope.unitId)) {
                $scope.royaHistoryByLote.push($scope.royaHistory[i]);
              }
            }

            if ($scope.royaHistoryOffline !== null) {
              for (var i = 0; i < $scope.royaHistoryOffline.length; i++) {
                if (($scope.royaHistoryOffline[i].loteIndex == $scope.loteIndex)&&($scope.royaHistoryOffline[i].idunidad==$scope.unitId)) {
                  $scope.royaHistoryByLoteOffline.push($scope.royaHistoryOffline[i]);
                }
              }
            }

          }



                //Cálculos de Ojo de Gallo
                if ($rootScope.IsInternetOnline) {
                        console.log("Con internet Gallo");
                        console.log($scope.user_Ided);

                        // Reporte de Ojo de Gallo
                        gallo.getUser(auth.userId()).then(function(userhistory){
                          console.log('Entré Data Gallo');
                          $scope.galloHistory = userhistory.data;
                          localStorageService.set('galloHistory',userhistory.data);
                          console.log("Historial Ojo de Gallo");
                          console.log($scope.galloHistory);

                          for (var i = 0; i < userhistory.data.length; i++) {
                                  if ((userhistory.data[i].loteIndex == $scope.loteIndex)&&(userhistory.data[i].idunidad==$scope.unitId)) {
                                          $scope.galloHistoryByLote.push($scope.royaHistory[i]);
                                  }
                          }
                        });


                        localStorageService.remove('dataOfflineGallo');
                        } else {
                        console.log("No internet Gallo");
                        console.log($scope.user_Ided);
                        $scope.galloHistory = localStorageService.get('galloHistory');
                        console.log('Offline-Data Gallo: ', $scope.galloHistory);
                        $scope.galloHistoryOffline = localStorageService.get('dataOfflineGallo');
                        console.log($scope.galloHistoryOffline);

                        for (var i = 0; i < $scope.galloHistory.length; i++) {
                                if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad==$scope.unitId)) {
                                        $scope.galloHistoryByLote.push($scope.galloHistory[i]);
                                }

                        }
                        if ($scope.galloHistoryOffline !== null) {
                                for (var i = 0; i < $scope.galloHistoryOffline.length; i++) {
                                        if (($scope.galloHistoryOffline[i].loteIndex == $scope.loteIndex)&&($scope.galloHistoryOffline[i].idunidad==$scope.unitId)) {
                                                $scope.galloHistoryByLoteOffline.push($scope.galloHistoryOffline[i]);
                                        }

                                }
                        }
                        }


                console.log("historial");
                console.log($scope.royaHistory);

                methods.get().then(function(methods){
                        var meth = methods.data[0];
                        var date = new Date();
                        var currentMonth = date.getMonth();
                        if(currentMonth < 6 ){
                                var methodsAvail = {};
                                methodsAvail.grade1 = meth.caseInidence10.abrilJunio;
                                methodsAvail.grade2 = meth.caseInidence1120.abrilJunio;
                                methodsAvail.grade3 = meth.caseInidence2150.abrilJunio;
                                methodsAvail.grade4 = meth.caseInidence50.abrilJunio;
                                $scope.methodsMonth = methodsAvail;

                        } else if(currentMonth > 5 && currentMonth < 9) {
                                var methodsAvail = {};
                                methodsAvail.grade1 = meth.caseInidence10.julioSetiembre;
                                methodsAvail.grade2 = meth.caseInidence1120.julioSetiembre;
                                methodsAvail.grade3 = meth.caseInidence2150.julioSetiembre;
                                methodsAvail.grade4 = meth.caseInidence50.julioSetiembre;
                                $scope.methodsMonth = methodsAvail;
                        } else if(currentMonth > 8) {
                                var methodsAvail = {};
                                methodsAvail.grade1 = meth.caseInidence10.octubreDiciembre;
                                methodsAvail.grade2 = meth.caseInidence1120.octubreDiciembre;
                                methodsAvail.grade3 = meth.caseInidence2150.octubreDiciembre;
                                methodsAvail.grade4 = meth.caseInidence50.octubreDiciembre;
                                $scope.methodsMonth = methodsAvail;
                        }
                });

}]);
