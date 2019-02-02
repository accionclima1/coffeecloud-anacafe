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
        $scope.cargandoData=true;
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
        $scope.graficarHitorial = function (option, optionList) {
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
            historyGrafic = optionList;

            // Añadimos los muestreos guardados en el servidor
            if (historyGrafic != 0) {
              for (var i = 0; i < historyGrafic.length; i++) {
                if ((historyGrafic[i].idunidad == $scope.unitId) && (historyGrafic[i].loteIndex == $scope.loteIndex) && (historyGrafic[i]._id != undefined)) {
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
            historyGrafic = optionList;

            // Añadimos los muestreos guardados en el servidor
            if (historyGrafic != 0) {
              for (var i = 0; i < historyGrafic.length; i++) {
                if ((historyGrafic[i].idunidad == $scope.unitId) && (historyGrafic[i].loteIndex == $scope.loteIndex) && (historyGrafic[i]._id != undefined)) {
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
          $scope.nuevoMuestreoRoya = false;

          // Obteniendo Muestreos de Roya
          PouchDB.GetRoyaFromPouchDB().then(function (result) {
              console.log("entramos a PouchDB");
              console.log(result);

              if (result.status == 'fail') {
                  $scope.error = result.message;
                  $scope.cargandoData=false;
              }
              else if (result.status == 'success') {
                  if (result.data.rows.length > 0 && result.data.rows[0] != undefined) {
                      var tmpArrayRoyaData = [];
                      for (var i = 0; i < result.data.rows.length; i++) {
                        var ob = result.data.rows[i].doc;
                        if ((ob.loteIndex == $scope.loteIndex)&&(ob.idunidad==$scope.unitId)) {
                          tmpArrayRoyaData.push(ob);
                        }
                      }

                      var len = tmpArrayRoyaData.length;
    
                      for (var i = 0; i < len ; i++) {
                        for(var j = 0 ; j < len - i - 1; j++){ // this was missing
                          var _tmpA= tmpArrayRoyaData[j];
                          var _tmpB = tmpArrayRoyaData[j + 1];
                          var f1 = new Date(_tmpA.createdAt);
                          var f2 = new Date(_tmpB.createdAt);
                        if (  f1 > f2) {
                          // swap
                          var temp = tmpArrayRoyaData[j];
                          tmpArrayRoyaData[j] = tmpArrayRoyaData[j+1];
                          tmpArrayRoyaData[j + 1] = temp;
                        }
                       }
                      }

                      $scope.royaHistoryByLote =tmpArrayRoyaData;
                      console.log("viene el array de roya");
                      $scope.cargandoData=false;
                      $scope.graficarHitorial('roya', $scope.royaHistoryByLote);
                  }else {
                    roya.getUser(auth.userId()).then(function(userhistory){
                      $scope.royaHistory = userhistory.data;

                      // Ordenamos el Array por fecha
                      $scope.royaHistory.sort(function(a,b){
                         return new Date(a.createdAt) - new Date(b.createdAt);
                       });

                       if (userhistory.data.length == 0) {
                         PouchDB.SaveRoyaToPouchDB([{}]);
                       }
                       else {
                         PouchDB.SaveRoyaToPouchDB($scope.royaHistory);
                       }

                       console.log("Data --- Roya Online - Servidor");
                       console.log($scope.royaHistory);
                       $scope.royaHistoryByLote = [];

                      // Muestreos filtrados por lote
                      for (var i = 0; i < $scope.royaHistory.length; i++) {
                        if (($scope.royaHistory[i].loteIndex == $scope.loteIndex)&&($scope.royaHistory[i].idunidad==$scope.unitId)) {
                          $scope.royaHistoryByLote.push($scope.royaHistory[i]);
                        }
                      }

                      console.log("Data Lote --- Roya Online - Servidor");
                      console.log($scope.royaHistoryByLote);
                      $scope.cargandoData=false;
                      $scope.graficarHitorial('roya', $scope.royaHistory);
                    });
                  }
            }
          }).catch(function(err) {
              console.log("error al obtener datos");
              console.log(err);
          });

          } else {
            console.log("No internet Roya");
            console.log($scope.user_Ided);
            PouchDB.GetRoyaFromPouchDB().then(function (result) {
                console.log("Respuesta: ");
                console.log(result);
                console.log("entramos a PouchDB");
                $scope.cargandoData=false;
                if (result.status == 'fail') {

                    $scope.error = result.message;

                }
                else if (result.status == 'success') {
                    if (result.data.rows.length > 0) {
                        var royaArray = [];
                        for(var xj=0;xj<result.data.rows.length;xj++){
                          royaArray.push(result.data.rows[xj].doc);
                        }
                        $scope.royaHistory = royaArray;
                        console.log("Data -- Roya Offline - PouchDB ");
                        console.log($scope.royaHistory);

                        $scope.royaHistoryOffline = royaArray;
                        console.log('Offline-Data Roya: ', $scope.royaHistory);
                        console.log($scope.royaHistoryOffline);

                        //Muestreos ya guardados cargados Offline filtrados por lote
                        if ($scope.royaHistory != null) {
                          for (var i = 0; i < $scope.royaHistory.length; i++) {
                            if (($scope.royaHistory[i].loteIndex == $scope.loteIndex)&&($scope.royaHistory[i].idunidad==$scope.unitId) && ($scope.royaHistory[i]._id != undefined)) {
                              $scope.royaHistoryByLote.push($scope.royaHistory[i]);
                            }
                          }
                        }

                        console.log("Data --- Roya PouchDB - Servidor Offline");
                        console.log($scope.royaHistoryByLote);

                        //Muestreos Realizados Offline filtrados por lote
                        if ($scope.royaHistoryOffline !== null) {
                          for (var i = 0; i < $scope.royaHistoryOffline.length; i++) {
                            if (($scope.royaHistoryOffline[i].loteIndex == $scope.loteIndex)&&($scope.royaHistoryOffline[i].idunidad==$scope.unitId) && ($scope.royaHistoryOffline[i]._id == undefined)) {
                              $scope.royaHistoryByLoteOffline.push($scope.royaHistoryOffline[i]);
                            }
                          }
                        }

                        console.log("Data --- Roya PouchDB - Offline");
                        console.log($scope.royaHistoryByLoteOffline);
                        $scope.graficarHitorial('roya', royaArray);
                    }
                }
            }).catch(function(err) {
                console.log("error al obtener datos");
                console.log(err);
                $scope.cargandoData=false;
            });

          }



          //Cálculos de Gallo
          if ($rootScope.IsInternetOnline) {
            console.log("Con internet Gallo");
            console.log($scope.user_Ided);
            $scope.nuevoMuestreoGallo = false;

            // Obteniendo Encuestas de Vulnerabilidad
            PouchDB.GetGalloFromPouchDB().then(function (result) {
                console.log("entramos a PouchDB");
                console.log(result);

                if (result.status == 'fail') {
                    $scope.error = result.message;
                }
                else if (result.status == 'success') {
                    if (result.data.rows.length > 0 && result.data.rows[0] != undefined) {
                        var doc = result.data.rows[0].doc;
                        var gallosArrayPouchDB = [];
                        for (var i = 0; i < doc.list.length; i++) {
                           gallosArrayPouchDB.push(doc.list[i]);


                           // Valido si hay un nuevo muestreo de gallo
                           if (doc.list[i]._id == null && doc.list[i].user != null) {
                             console.log("Gallo Actualización");
                             $scope.nuevoMuestreoGallo = true;
                             console.log(doc.list[i]);

                             gallo.create(doc.list[i]).then(function (result) {
                               console.log("Entré a actualizar gallo en el servidor");
                               console.log(result.data);
                               $scope.galloHistory = gallosArrayPouchDB;

                               gallo.getUser(auth.userId()).then(function(userhistory){
                                 console.log("Entré Datos Gallo");
                                 $scope.galloHistory = userhistory.data;

                                 // Ordenamos el Array por fecha
                                 // $scope.galloHistory.sort(function(a,b){
                                 //    return new Date(a.createdAt) - new Date(b.createdAt);
                                 //  });

                                  PouchDB.SaveGalloToPouchDB($scope.galloHistory);
                                  console.log("Data --- Gallo Online - Servidor");
                                  console.log($scope.galloHistory);
                                  $scope.galloHistoryByLote = [];


                                 // Muestreos filtrados por lote
                                 for (var i = 0; i < $scope.galloHistory.length; i++) {
                                   if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad==$scope.unitId)) {
                                     $scope.galloHistoryByLote.push($scope.galloHistory[i]);
                                   }
                                 }

                                 console.log("Data Lote --- Gallo Online - Servidor / Actualización");
                                 console.log($scope.galloHistoryByLote);
                                 $scope.graficarHitorial('gallo', $scope.galloHistory);
                               });
                       			});

                          }else if ($scope.nuevoMuestreoGallo == false && i == (doc.list.length - 1)) {
                             console.log("Gallo Online");

                             gallo.getUser(auth.userId()).then(function(userhistory){
                               $scope.galloHistory = userhistory.data;

                               // Ordenamos el Array por fecha
                               $scope.galloHistory.sort(function(a,b){
                                  return new Date(a.createdAt) - new Date(b.createdAt);
                                });

                                if (userhistory.data.length == 0) {
                                  PouchDB.SaveGalloToPouchDB([{}]);
                                }
                                else {
                                  PouchDB.SaveGalloToPouchDB($scope.galloHistory);
                                }

                                console.log("Data --- Gallo Online - Servidor");
                                console.log($scope.galloHistory);
                                $scope.galloHistoryByLote = [];

                               // Muestreos filtrados por lote
                               for (var i = 0; i < $scope.galloHistory.length; i++) {
                                 if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad==$scope.unitId)) {
                                   $scope.galloHistoryByLote.push($scope.galloHistory[i]);
                                 }
                               }

                               console.log("Data Lote --- Gallo Online - Servidor");
                               console.log($scope.galloHistoryByLote);
                               $scope.graficarHitorial('gallo', $scope.galloHistory);
                             });
                           }
                        }
                    }else {
                      gallo.getUser(auth.userId()).then(function(userhistory){
                        $scope.galloHistory = userhistory.data;

                        // Ordenamos el Array por fecha
                        $scope.galloHistory.sort(function(a,b){
                           return new Date(a.createdAt) - new Date(b.createdAt);
                         });

                         if (userhistory.data.length == 0) {
                           PouchDB.SaveGalloToPouchDB([{}]);
                         }
                         else {
                           PouchDB.SaveGalloToPouchDB($scope.galloHistory);
                         }

                         console.log("Data --- Gallo Online - Servidor");
                         console.log($scope.galloHistory);
                         $scope.galloHistoryByLote = [];

                        // Muestreos filtrados por lote
                        for (var i = 0; i < $scope.galloHistory.length; i++) {
                          if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad==$scope.unitId)) {
                            $scope.galloHistoryByLote.push($scope.galloHistory[i]);
                          }
                        }

                        console.log("Data Lote --- Gallo Online - Servidor");
                        console.log($scope.galloHistoryByLote);
                        $scope.graficarHitorial('gallo', $scope.galloHistory);
                      });
                    }
              }
            }).catch(function(err) {
                console.log("error al obtener datos");
                console.log(err);
            });

            } else {
              console.log("No internet Gallo");
              console.log($scope.user_Ided);
              PouchDB.GetGalloFromPouchDB().then(function (result) {
                  console.log("Respuesta: ");
                  console.log(result);
                  console.log("entramos a PouchDB");
                  if (result.status == 'fail') {

                      $scope.error = result.message;

                  }
                  else if (result.status == 'success') {
                      if (result.data.rows.length > 0) {
                          var doc = result.data.rows[0].doc;
                          var galloArray = [];
                          for (var i = 0; i < doc.list.length; i++) {
                              galloArray.push(doc.list[i]);
                          }
                          $scope.galloHistory = galloArray;
                          console.log("Data -- Gallo Offline - PouchDB ");
                          console.log($scope.galloHistory);

                          $scope.galloHistoryOffline = galloArray;
                          console.log('Offline-Data Gallo:');
                          console.log($scope.galloHistoryOffline);

                          //Muestreos ya guardados cargados Offline filtrados por lote
                          if ($scope.galloHistory != null) {
                            for (var i = 0; i < $scope.galloHistory.length; i++) {
                              if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad==$scope.unitId) && ($scope.galloHistory[i]._id != undefined)) {
                                $scope.galloHistoryByLote.push($scope.galloHistory[i]);
                              }
                            }
                          }

                          console.log("Data --- Gallo PouchDB - Servidor Offline");
                          console.log($scope.galloHistoryByLote);

                          //Muestreos Realizados Offline filtrados por lote
                          if ($scope.galloHistoryOffline !== null) {
                            for (var i = 0; i < $scope.galloHistoryOffline.length; i++) {
                              if (($scope.galloHistoryOffline[i].loteIndex == $scope.loteIndex)&&($scope.galloHistoryOffline[i].idunidad==$scope.unitId) && ($scope.galloHistoryOffline[i]._id == undefined)) {
                                $scope.galloHistoryByLoteOffline.push($scope.galloHistoryOffline[i]);
                              }
                            }
                          }

                          console.log("Data --- Gallo PouchDB - Offline");
                          console.log($scope.galloHistoryByLoteOffline);
                          $scope.graficarHitorial('gallo', galloArray);
                      }
                  }
              }).catch(function(err) {
                  console.log("error al obtener datos");
                  console.log(err);
              });

            }



        //Cálculos de Ojo de Gallo
        // if ($rootScope.IsInternetOnline) {
        //     console.log("Con internet Gallo");
        //     console.log($scope.user_Ided);
        //
        //     // Reporte de Ojo de Gallo
        //     gallo.getUser(auth.userId()).then(function(userhistory){
        //       console.log('Entré Data Gallo');
        //       $scope.galloHistory = userhistory.data;
        //
        //       // Guardamos los muestreos en PouchDB
        //       if (userhistory.data.length == 0) {
        //         PouchDB.SaveGalloToPouchDB([{}]);
        //       }
        //       else {
        //         PouchDB.SaveGalloToPouchDB($scope.galloHistory);
        //       }
        //
        //       console.log("Historial Ojo de Gallo");
        //       console.log($scope.galloHistory);
        //
        //       // Muestreos filtrados por lote
        //       for (var i = 0; i < $scope.galloHistory.length; i++) {
        //         if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad == $scope.unitId)) {
        //                 $scope.galloHistoryByLote.push($scope.galloHistory[i]);
        //         }
        //       }
        //       console.log("Muestreos Gallo Servidor");
        //       console.log($scope.galloHistoryByLote);
        //       $scope.graficarHitorial('gallo', userhistory.data);
        //     });
        //
        // } else {
        //     console.log("No internet Gallo");
        //     console.log($scope.user_Ided);
        //     PouchDB.GetGalloFromPouchDB().then(function (result) {
        //         console.log("Respuesta: ");
        //         console.log(result);
        //         console.log("entramos a PouchDB");
        //         if (result.status == 'fail') {
        //
        //             $scope.error = result.message;
        //
        //         }
        //         else if (result.status == 'success') {
        //             var doc = result.data.rows[0].doc;
        //             if (result.data.rows.length > 0) {
        //                 var galloArray = [];
        //                 for (var i = 0; i < doc.list.length; i++) {
        //                     galloArray.push(doc.list[i]);
        //                 }
        //                 $scope.galloHistory = galloArray;
        //                 console.log("Data -- Gallo Offline - PouchDB ");
        //                 console.log($scope.galloHistory);
        //
        //                 console.log('Offline-Data Roya: ', $scope.galloHistory);
        //                 $scope.galloHistoryOffline = galloArray;
        //                 console.log($scope.galloHistoryOffline);
        //
        //                 //Muestreos ya guardados cargados Offline
        //                 if ($scope.galloHistory != null) {
        //                   for (var i = 0; i < $scope.galloHistory.length; i++) {
        //                     if (($scope.galloHistory[i].loteIndex == $scope.loteIndex)&&($scope.galloHistory[i].idunidad==$scope.unitId) && ($scope.galloHistoryOffline[i]._id != undefined)) {
        //                       $scope.galloHistoryByLote.push($scope.galloHistory[i]);
        //                     }
        //                   }
        //                 }
        //
        //                 console.log("Muestreos Gallo Servidor - Cargados Offline");
        //                 console.log($scope.galloHistoryByLote);
        //
        //                 //Muestreos Realizados Offline
        //                 if ($scope.galloHistoryOffline !== null) {
        //                   for (var i = 0; i < $scope.galloHistoryOffline.length; i++) {
        //                     if (($scope.galloHistoryOffline[i].loteIndex == $scope.loteIndex)&&($scope.galloHistoryOffline[i].idunidad==$scope.unitId) && ($scope.galloHistoryOffline[i]._id == undefined)) {
        //                       $scope.galloHistoryByLoteOffline.push($scope.galloHistoryOffline[i]);
        //                     }
        //                   }
        //                 }
        //                 console.log("Muestreos Gallo Offline");
        //                 console.log($scope.galloHistoryByLoteOffline);
        //                 $scope.graficarHitorial('gallo', galloArray);
        //             }
        //         }
        //     }).catch(function(err) {
        //         console.log("error al obtener datos");
        //         console.log(err);
        //     });
        // }

}]);
