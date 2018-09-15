app.controller('HomeloteinternalCtrl', ['$http', '$scope', '$stateParams','auth', 'gallo', 'roya', 'methods', 'methodsGallo', 'unit', 'varieties', 'user', 'PouchDB', '$rootScope','localStorageService', 'onlineStatus', '$state',
function ($http,$scope, $stateParams, auth, gallo, roya, methods, methodsGallo, unit, varieties, user, PouchDB, $rootScope, localStorageService, onlineStatus, $state) {
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

        //Ir a los Muestreos
        $scope.irMuestreo = function(option){
          console.log(option);
          if (option == "roya") {
            localStorageService.remove('localTest');
            $state.go("roya", {idunidad: $scope.unitId, indexunidad: $scope.unitIndex, indexlote: $scope.loteIndex}, {reload: true});
          }
          else if (option == "gallo"){
            localStorageService.remove('localTestgallo');
            $state.go("gallo", {idunidad: $scope.unitId, indexunidad: $scope.unitIndex, indexlote: $scope.loteIndex}, {reload: true});
          }

        }

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


        //Gráficas de Muestreos de Roya y Ojo de Gallo
        $scope.graficarHitorial = function (option) {
          var data = [];
          var historyGrafic = [];
          var classData = "";

          Array.prototype.contains = function(obj) {
              var i = this.length;
              while (i--)
                  if (this[i] == obj)
                      return true;
                  return false;
              }

          if (option == 'roya') {
            classData = "#dataUnitRoya"
            historyGrafic = localStorageService.get('royaHistory');

            // Añadimos los muestreos guardados en el servidor
            if (historyGrafic != 0) {
              for (var i = 0; i < historyGrafic.length; i++) {
                if (historyGrafic[i].idunidad == $scope.unitId && historyGrafic[i].loteIndex == $scope.loteIndex) {
                  data.push(historyGrafic[i]);
                }
              }
            }

            // Añadimos muestreos realizados offline si hubiera
            if ($scope.royaHistoryByLoteOffline.length != 0) {
              for (var i = 0; i < $scope.royaHistoryByLoteOffline.length; i++) {
                data.push($scope.royaHistoryByLoteOffline[i]);
              }
            }

            // Graficamos los últimos 12 muestreos si hubieran más
            if (data.length >= 12){
              var records = data;
              var index = data.length - 12;
              data = [];

              for (var i = index; i < records.length; i++) {
                data.push(records[i]);
              }
            }
          }
          else if (option == 'gallo') {
            classData = "#dataUnitGallo"
            historyGrafic = localStorageService.get('galloHistory');

            // Añadimos los muestreos guardados en el servidor
            if (historyGrafic != 0) {
              for (var i = 0; i < historyGrafic.length; i++) {
                if (historyGrafic[i].idunidad == $scope.unitId && historyGrafic[i].loteIndex == $scope.loteIndex) {
                  data.push(historyGrafic[i]);
                }

              }
            }

            // Añadimos muestreos realizados offline si hubiera
            if ($scope.galloHistoryByLoteOffline.length != 0) {
              for (var i = 0; i < $scope.galloHistoryByLoteOffline.length; i++) {
                data.push($scope.galloHistoryByLoteOffline[i]);
              }
            }

            // Graficamos los últimos 12 muestreos si hubieran más
            if (data.length >= 12){
              var records = data;
              var index = data.length - 12;
              data = [];

              for (var i = index; i < records.length; i++) {
                data.push(records[i]);
              }
            }
          }

          var fechas = [];
          var puntosIncidencia = [];
          var listaUnidades = [];
          var puntosIncidenciaPorUnidad = [];


          for (var i = 0; i < data.length; i++) {
            //Extraemos el día y mes para comprimir más la fecha
            var day = "";
            var months = ["Ene","Feb","Mar","Abr","Mayo","Jun","Jul","Ago","Sep","Oct","Nov","Dec"];

            if (data[i].date != undefined) {
              day = new Date(data[i].date);
              day = day.getDate() + '-' +  months[day.getMonth()];
              fechas.push(day);
              puntosIncidencia.push({meta: data[i].unidad.user,value: data[i].incidencia});
            }
            else {
              if (!fechas.contains(data[i].createdAt)){
                day = new Date(data[i].createdAt);
                day = day.getDate() + '-' +  months[day.getMonth()];
                fechas.push(day);
              }
              puntosIncidencia.push({meta: data[i].unidad.user,value: data[i].incidencia});
            }
          }

          //Extraemos el listado de unidades involucradas
          for (var i = 0; i < puntosIncidencia.length; i++) {
  						console.log(puntosIncidencia);
              if (!listaUnidades.contains(puntosIncidencia[i].meta)){
                  listaUnidades.push(puntosIncidencia[i].meta);
              }
          }

          //Regeneramos el array para graficar cada unidad como línea
          for (var i = 0; i < listaUnidades.length; i++) {
             for (var j = 0; j < puntosIncidencia.length; j++) {
              if (listaUnidades[i].localeCompare(puntosIncidencia[j].meta) == 0){
                  if (puntosIncidenciaPorUnidad[i] == undefined){
                      puntosIncidenciaPorUnidad[i] = [];
                      for (var y = 0; y < j; y++) {
                           puntosIncidenciaPorUnidad[i].push(null);
                      }
                  }

                  puntosIncidenciaPorUnidad[i].push(puntosIncidencia[j]);
              }
          }
          }

          console.log("listaUnidades-------------------");
          console.log(listaUnidades);

          console.log(fechas);
          console.log(puntosIncidencia);
          console.log("Todo-------------------");
          console.log(puntosIncidenciaPorUnidad);


          var dataG = new Chartist.Line(classData, {
            labels: fechas,
            series: puntosIncidenciaPorUnidad
        }, {
            fullWidth: true,

            chartPadding: {
              right: 25,
              left: -18,
              top: 50,
              bottom: 50
          },
          plugins: [
              Chartist.plugins.tooltip()
          ]


      });
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

            // Muestreos filtrados por lote
            for (var i = 0; i < $scope.royaHistory.length; i++) {
              if (($scope.royaHistory[i].loteIndex == $scope.loteIndex)&&($scope.royaHistory[i].idunidad==$scope.unitId)) {
                $scope.royaHistoryByLote.push($scope.royaHistory[i]);
              }
            }
            console.log($scope.royaHistoryByLote);
            $scope.graficarHitorial('roya');
          });
          localStorageService.remove('dataOffline');
          } else {
            console.log("No internet Roya");
            console.log($scope.user_Ided);
            $scope.royaHistory = localStorageService.get('royaHistory');
            console.log('Offline-Data Roya: ', $scope.royaHistory);
            $scope.royaHistoryOffline = localStorageService.get('dataOffline');
            console.log($scope.royaHistoryOffline);

            //Muestreos ya guardados cargados Offline filtrados por lote
            if ($scope.royaHistory != null) {
              for (var i = 0; i < $scope.royaHistory.length; i++) {
                if (($scope.royaHistory[i].loteIndex == $scope.loteIndex)&&($scope.royaHistory[i].idunidad==$scope.unitId)) {
                  $scope.royaHistoryByLote.push($scope.royaHistory[i]);
                }
              }
            }

            //Muestreos Realizados Offline filtrados por lote
            if ($scope.royaHistoryOffline !== null) {
              for (var i = 0; i < $scope.royaHistoryOffline.length; i++) {
                if (($scope.royaHistoryOffline[i].loteIndex == $scope.loteIndex)&&($scope.royaHistoryOffline[i].idunidad==$scope.unitId)) {
                  $scope.royaHistoryByLoteOffline.push($scope.royaHistoryOffline[i]);
                }
              }
            }

            $scope.graficarHitorial('roya');
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

              // Muestreos filtrados por lote
              for (var i = 0; i < $scope.galloHistory.length; i++) {
                if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad == $scope.unitId)) {
                        $scope.galloHistoryByLote.push($scope.galloHistory[i]);
                }
              }
              console.log($scope.galloHistoryByLote);
              $scope.graficarHitorial('gallo');
            });


            localStorageService.remove('dataOfflineGallo');
        } else {
            console.log("No internet Gallo");
            console.log($scope.user_Ided);
            $scope.galloHistory = localStorageService.get('galloHistory');
            console.log('Offline-Data Gallo: ', $scope.galloHistory);
            $scope.galloHistoryOffline = localStorageService.get('dataOfflineGallo');
            console.log($scope.galloHistoryOffline);

            //Muestreos ya guardados cargados Offline
            if ($scope.galloHistory != null) {
              for (var i = 0; i < $scope.galloHistory.length; i++) {
                if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad==$scope.unitId)) {
                  $scope.galloHistoryByLote.push($scope.galloHistory[i]);
                }
              }
            }

            //Muestreos Realizados Offline
            if ($scope.galloHistoryOffline !== null) {
              for (var i = 0; i < $scope.galloHistoryOffline.length; i++) {
                if (($scope.galloHistoryOffline[i].loteIndex == $scope.loteIndex)&&($scope.galloHistoryOffline[i].idunidad==$scope.unitId)) {
                  $scope.galloHistoryByLoteOffline.push($scope.galloHistoryOffline[i]);
                }
              }
            }
            $scope.graficarHitorial('gallo');
        }
        console.log("historial");
        console.log($scope.royaHistory);

}]);
