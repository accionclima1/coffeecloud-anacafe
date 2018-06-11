app.controller('HomeloteinternalCtrl', ['$http', '$scope', '$stateParams','auth', 'gallo', 'roya', 'methods', 'methodsGallo', 'unit', 'varieties', 'user', 'PouchDB', '$rootScope','localStorageService', 'onlineStatus',
function ($http,$scope, $stateParams, auth, gallo, roya, methods, methodsGallo, unit, varieties, user, PouchDB, $rootScope, localStorageService, onlineStatus) {
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

        if ($rootScope.IsInternetOnline) {

          // Metodos Roya - Recomendaciones Roya
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
                    $scope.methodsMonthRoya = methodsAvail;

            } else if(currentMonth > 5 && currentMonth < 9) {
                    var methodsAvail = {};
                    methodsAvail.grade1 = meth.caseInidence10.julioSetiembre;
                    methodsAvail.grade2 = meth.caseInidence1120.julioSetiembre;
                    methodsAvail.grade3 = meth.caseInidence2150.julioSetiembre;
                    methodsAvail.grade4 = meth.caseInidence50.julioSetiembre;
                    $scope.methodsMonthRoya = methodsAvail;
            } else if(currentMonth > 8) {
                    var methodsAvail = {};
                    methodsAvail.grade1 = meth.caseInidence10.octubreDiciembre;
                    methodsAvail.grade2 = meth.caseInidence1120.octubreDiciembre;
                    methodsAvail.grade3 = meth.caseInidence2150.octubreDiciembre;
                    methodsAvail.grade4 = meth.caseInidence50.octubreDiciembre;
                    $scope.methodsMonthRoya = methodsAvail;
            }
          });

          // Metodos Gallo - Recomendaciones Gallo
          methodsGallo.get().then(function(methodsGallo){
             var meth = methodsGallo.data[0];
             var date = new Date();
             var currentMonth = date.getMonth();
            if(currentMonth < 6 ){
               var methodsAvail = {};
               methodsAvail.grade1 = meth.caseInidence10.abrilJunio;
               methodsAvail.grade2 = meth.caseInidence1120.abrilJunio;
               methodsAvail.grade3 = meth.caseInidence2150.abrilJunio;
               methodsAvail.grade4 = meth.caseInidence50.abrilJunio;
               $scope.methodsMonthGallo = methodsAvail;
               console.log($scope.methodsMonth);

            } else if(currentMonth > 5 && currentMonth < 9) {
               var methodsAvail = {};
               methodsAvail.grade1 = meth.caseInidence10.julioSetiembre;
               methodsAvail.grade2 = meth.caseInidence1120.julioSetiembre;
               methodsAvail.grade3 = meth.caseInidence2150.julioSetiembre;
               methodsAvail.grade4 = meth.caseInidence50.julioSetiembre;
               $scope.methodsMonthGallo = methodsAvail;
               console.log($scope.methodsMonth);
            } else if(currentMonth > 8) {
               var methodsAvail = {};
               methodsAvail.grade1 = meth.caseInidence10.octubreDiciembre;
               methodsAvail.grade2 = meth.caseInidence1120.octubreDiciembre;
               methodsAvail.grade3 = meth.caseInidence2150.octubreDiciembre;
               methodsAvail.grade4 = meth.caseInidence50.octubreDiciembre;
               $scope.methodsMonthGallo = methodsAvail;
               console.log($scope.methodsMonthGallo);
            }
            });

        }
        else{
          // Metodos Roya - Recomendación Roya Offline
          var methRoya = localStorageService.get("methodsRoya");
          var date = new Date();
          var currentMonth = date.getMonth();
          if(currentMonth < 6 ){
                  var methodsAvail = {};
                  methodsAvail.grade1 = methRoya.caseInidence10.abrilJunio;
                  methodsAvail.grade2 = methRoya.caseInidence1120.abrilJunio;
                  methodsAvail.grade3 = methRoya.caseInidence2150.abrilJunio;
                  methodsAvail.grade4 = methRoya.caseInidence50.abrilJunio;
                  $scope.methodsMonthRoya = methodsAvail;

          } else if(currentMonth > 5 && currentMonth < 9) {
                  var methodsAvail = {};
                  methodsAvail.grade1 = methRoya.caseInidence10.julioSetiembre;
                  methodsAvail.grade2 = methRoya.caseInidence1120.julioSetiembre;
                  methodsAvail.grade3 = methRoya.caseInidence2150.julioSetiembre;
                  methodsAvail.grade4 = methRoya.caseInidence50.julioSetiembre;
                  $scope.methodsMonthRoya = methodsAvail;
          } else if(currentMonth > 8) {
                  var methodsAvail = {};
                  methodsAvail.grade1 = methRoya.caseInidence10.octubreDiciembre;
                  methodsAvail.grade2 = methRoya.caseInidence1120.octubreDiciembre;
                  methodsAvail.grade3 = methRoya.caseInidence2150.octubreDiciembre;
                  methodsAvail.grade4 = methRoya.caseInidence50.octubreDiciembre;
                  $scope.methodsMonthRoya = methodsAvail;
          }


          // Metodos Gallo - Recomendación Gallo Offline
          var methGallo = localStorageService.get("methodsGallo");
          var date = new Date();
          var currentMonth = date.getMonth();
          if(currentMonth < 6 ){
                  var methodsAvail = {};
                  methodsAvail.grade1 = methGallo.caseInidence10.abrilJunio;
                  methodsAvail.grade2 = methGallo.caseInidence1120.abrilJunio;
                  methodsAvail.grade3 = methGallo.caseInidence2150.abrilJunio;
                  methodsAvail.grade4 = methGallo.caseInidence50.abrilJunio;
                  $scope.methodsMonthGallo = methodsAvail;

          } else if(currentMonth > 5 && currentMonth < 9) {
                  var methodsAvail = {};
                  methodsAvail.grade1 = methGallo.caseInidence10.julioSetiembre;
                  methodsAvail.grade2 = methGallo.caseInidence1120.julioSetiembre;
                  methodsAvail.grade3 = methGallo.caseInidence2150.julioSetiembre;
                  methodsAvail.grade4 = methGallo.caseInidence50.julioSetiembre;
                  $scope.methodsMonthGallo = methodsAvail;
          } else if(currentMonth > 8) {
                  var methodsAvail = {};
                  methodsAvail.grade1 = methGallo.caseInidence10.octubreDiciembre;
                  methodsAvail.grade2 = methGallo.caseInidence1120.octubreDiciembre;
                  methodsAvail.grade3 = methGallo.caseInidence2150.octubreDiciembre;
                  methodsAvail.grade4 = methGallo.caseInidence50.octubreDiciembre;
                  $scope.methodsMonthGallo = methodsAvail;
          }
        }



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
            for (var i = 0; i < $scope.royaHistory.length; i++) {
                    if (($scope.royaHistory[i].loteIndex == $scope.loteIndex)&&($scope.royaHistory[i].idunidad==$scope.unitId)) {
                            $scope.royaHistoryByLote.push($scope.royaHistory[i]);
                    }
            }
            console.log($scope.royaHistoryByLote);

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

                          for (var i = 0; i < $scope.galloHistory.length; i++) {
                            if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad == $scope.unitId)) {
                                    $scope.galloHistoryByLote.push($scope.galloHistory[i]);
                            }
                          }
                          console.log($scope.galloHistoryByLote);
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

}]);
