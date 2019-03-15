app.controller('HomeinternalCtrl', ['$http', '$scope', '$stateParams','auth', 'unit', 'varieties', 'user', 'PouchDB', '$rootScope','localStorageService', 'onlineStatus','vulnerabilidades',
function ($http,$scope, $stateParams, auth, unit, varieties, user, PouchDB, $rootScope, localStorageService, onlineStatus, vulnerabilidades) {

        $scope.currentUser = auth.currentUser;
        $scope.currentId = auth.currentUser();
        $scope.unitId = $stateParams.idunidad;
        $scope.unitIndex = $stateParams.indexunidad;
        $scope.encuestaHistory = [];
        $scope.encuestaHistoryOffline = [];
        $scope.resumenDataHistorial = [];

        $scope.encuestaHistoryByUnidad = [];
        $scope.encuestaHistoryByUnidadOffline = [];


        $scope.$on('$viewContentLoaded', function readyToTrick() {
            setTimeout(function(){
            $(".cargandoUbicacionLote").css("display", "none");
            $(".cargandoAltitudLote").css("display", "none");
            $('.collapse').collapse('hide');
            },200);
            // $scope.historialVulLaunch();
        });

        // Actualizo las variedades en Home Internal para poder visualizarlas en Lotes
        if ($rootScope.IsInternetOnline) {
            console.log("app online");

            varieties.getAll().then(function (varids) {
                variedades = varids.data;
                $scope.variedades = variedades;
                console.log($scope.variedades);

                console.log("Data --->");
                console.log($scope.variedades);
            });
        }
        else {
            console.log("app offline **");
            console.log(onlineStatus);
            console.log(PouchDB);

            PouchDB.GetVarietiesFromPouchDB().then(function (result) {
                console.log("Respuesta: ");
                console.log(result);
                console.log("entramos a PouchDB");
                if (result.status == 'fail') {

                    $scope.error = result.message;
                    //$("#txtPrueba").val("error get Var");

                }
                else if (result.status == 'success') {
                    var doc = result.data.rows[0].doc;
                    if (result.data.rows.length > 0) {
                        var variedadesArray = [];
                        for (var i = 0; i < doc.list.length; i++) {
                            variedadesArray.push(doc.list[i]);
                        }
                        //variedadesArray.push({ name: "otro" }, { name: "cual?" });
                        $scope.variedades = variedadesArray;
                        //$("#txtPrueba").val("GetVariedads "  + onlineStatus.onLine);
                        console.log("Data-- ");
                        console.log($scope.variedades);

                    }
                }
            }).catch(function(err) {
                console.log("error al obtener datos");
                console.log(err);
            });
        }

        if ($rootScope.IsInternetOnline) {
           console.log("Con internet");
           console.log(auth.userId());
           $scope.nuevaEncuesta = false;

           // Obteniendo Encuestas de Vulnerabilidad
           PouchDB.GetVulnerabilityFromPouchDB().then(function (result) {
               console.log("entramos a PouchDB");
               console.log(result);

               if (result.status == 'fail') {
                   $scope.error = result.message;
               }
               else if (result.status == 'success') {
                  console.log(result.data.rows[0]);
                   if (result.data.rows.length > 0 && result.data.rows[0] != undefined) {
                       var doc = result.data.rows[0].doc;
                       var encuestasArrayPouchDB = [];
                       for (var i = 0; i < doc.list.length; i++) {
                          encuestasArrayPouchDB.push(doc.list[i]);


                          // Valido si hay una encuesta nueva
                          if (doc.list[i]._id == null) {
                            console.log("Vulnerabilidades Actualización");
                            $scope.nuevaEncuesta = true;
                            console.log(doc.list[i]);
                            vulnerabilidades.create(doc.list[i], auth.userId()).then(function (result) {
                                console.log("Entré a actualizar vulnerabilidades en el servidor");
                                console.log(result.data);
                                $scope.encuestaHistory = encuestasArrayPouchDB;
                                // $scope.encuestaHistory.push(result.data);
                                // PouchDB.SaveVulnerabilityToPouchDB($scope.encuestaHistory);

                                vulnerabilidades.getUser(auth.userId()).then(function(userhistory){
                                   $scope.encuestaHistory = userhistory.data;
                                   if($scope.encuestaHistory.length>0){
                                    $scope.encuestaHistory.sort(function(a,b){
                                        var resta = 0;
                                        if((a.resumenVulne.length>0)&&(b.resumenVulne.length>0)){
                                            resta = new Date(a.resumenVulne[0].fecha) - new Date(b.resumenVulne[0].fecha);
                                        }  
                                        return resta;
                                    });
                                    
                                   }

                                   PouchDB.SaveVulnerabilityToPouchDB($scope.encuestaHistory);
                                   console.log("Data --- Vulnerabilidades Online - Servidor");
                                   console.log($scope.encuestaHistory);
                                   $scope.encuestaHistoryByUnidad = [];

                                   // Encuestas filtradas por Unidad
                                   for (var i = 0; i < $scope.encuestaHistory.length; i++) {
                                     if ($scope.encuestaHistory[i].unidad === $scope.unitId) {
                                       $scope.encuestaHistoryByUnidad.push($scope.encuestaHistory[i]);
                                     }
                                   }

                                   console.log("Data Unidad --- Vulnerabilidades Online - Servidor / Actualización");
                                   console.log($scope.encuestaHistoryByUnidad);
                                   $scope.graficarHitorial($scope.encuestaHistory);
                                 });

                            });

                          }else if ($scope.nuevaEncuesta == false && i == (doc.list.length - 1)) {
                            console.log("Vulnerabilidades Online");
                            // En caso no hayan Encuestas nuevas
                            vulnerabilidades.getUser(auth.userId()).then(function(userhistory){
                               $scope.encuestaHistory = userhistory.data;
                               console.log($scope.encuestaHistory);

                               $scope.encuestaHistory.sort(function(a,b){
                                var resta = 0;
                                if((a.resumenVulne.length>0)&&(b.resumenVulne.length>0)){
                                    resta = new Date(a.resumenVulne[0].fecha) - new Date(b.resumenVulne[0].fecha);
                                }  
                                return resta;
                                });

                               if (userhistory.data.length == 0) {
                                 PouchDB.SaveVulnerabilityToPouchDB([{}]);
                               }
                               else {
                                 PouchDB.SaveVulnerabilityToPouchDB($scope.encuestaHistory);
                               }
                               console.log("Data --- Vulnerabilidades Online - Servidor >");
                               console.log($scope.encuestaHistory);

                               // Encuestas filtradas por Unidad
                               for (var i = 0; i < $scope.encuestaHistory.length; i++) {
                                 if ($scope.encuestaHistory[i].unidad === $scope.unitId) {
                                   $scope.encuestaHistoryByUnidad.push($scope.encuestaHistory[i]);
                                 }
                               }
                               console.log("Data Unidad --- Vulnerabilidades Online - Servidor");
                               console.log($scope.encuestaHistoryByUnidad);
                               $scope.graficarHitorial($scope.encuestaHistory);
                             });
                       }
                     }
                 }else {
                   console.log("Despliegue normal");
                   // En caso no hayan Encuestas nuevas
                   vulnerabilidades.getUser(auth.userId()).then(function(userhistory){
                      $scope.encuestaHistory = userhistory.data;
                      console.log($scope.encuestaHistory);

                      $scope.encuestaHistory.sort(function(a,b){
                        var resta = 0;
                        if((a.resumenVulne.length>0)&&(b.resumenVulne.length>0)){
                            resta = new Date(a.resumenVulne[0].fecha) - new Date(b.resumenVulne[0].fecha);
                        }  
                         return resta;
                       });

                      if (userhistory.data.length == 0) {
                        PouchDB.SaveVulnerabilityToPouchDB([{}]);
                      }
                      else {
                        PouchDB.SaveVulnerabilityToPouchDB($scope.encuestaHistory);
                      }
                      console.log("Data --- Vulnerabilidades Online - Servidor >");
                      console.log($scope.encuestaHistory);

                      // Encuestas filtradas por Unidad
                      for (var i = 0; i < $scope.encuestaHistory.length; i++) {
                        if ($scope.encuestaHistory[i].unidad === $scope.unitId) {
                          $scope.encuestaHistoryByUnidad.push($scope.encuestaHistory[i]);
                        }
                      }
                      console.log("Data Unidad --- Vulnerabilidades Online - Servidor");
                      console.log($scope.encuestaHistoryByUnidad);
                      $scope.graficarHitorial($scope.encuestaHistory);
                    });
                 }
             }
           }).catch(function(err) {
               console.log("error al obtener datos");
               console.log(err);
           });

       } else {
           console.log("No internet");
           console.log(auth.userId());

           // Obteniendo Encuestas de Vulnerabilidad
           PouchDB.GetVulnerabilityFromPouchDB().then(function (result) {
               console.log("entramos a PouchDB");
               console.log(result);

               if (result.status == 'fail') {
                   $scope.error = result.message;
               }
               else if (result.status == 'success') {
                   if(result.data.rows.length>0){
                   var doc = result.data.rows[0].doc;
                   if (result.data.rows.length > 0) {
                       var encuestasArrayPouchDB = [];
                       for (var i = 0; i < doc.list.length; i++) {
                           encuestasArrayPouchDB.push(doc.list[i]);
                       }
                       $scope.encuestaHistory = encuestasArrayPouchDB;
                       $scope.encuestaHistoryOffline = encuestasArrayPouchDB;
                       // Encuestas filtradas por Unidad
                       for (var i = 0; i < $scope.encuestaHistory.length; i++) {
                         if (($scope.encuestaHistory[i].unidad === $scope.unitId) && $scope.encuestaHistory[i]._id != undefined) {
                           $scope.encuestaHistoryByUnidad.push($scope.encuestaHistory[i]);
                         }
                       }

                       console.log("Data --- Vulnerabilidades PouchDB - Servidor Offline");
                       console.log($scope.encuestaHistoryByUnidad);

                       for (var i = 0; i < $scope.encuestaHistoryOffline.length; i++) {
                         if (($scope.encuestaHistoryOffline[i].unidad === $scope.unitId) && $scope.encuestaHistoryOffline[i]._id == undefined) {
                           $scope.encuestaHistoryByUnidadOffline.push($scope.encuestaHistoryOffline[i]);
                         }
                       }

                       console.log("Data --- Vulnerabilidades PouchDB - Offline");
                       console.log($scope.encuestaHistoryByUnidadOffline);

                       $scope.graficarHitorial($scope.encuestaHistory);
                   }
               }
                }
           }).catch(function(err) {
               console.log("error al obtener datos");
               console.log(err);
           });
       }



        var map;


        console.log($stateParams.idunidad);

        PouchDB.GetUnit($scope.unitId,auth.userId()).then(function (result) {
        	if (result.status == 'fail') {
                $scope.error = result.message;
                console.log("error");
        	}
        	else if (result.status == 'success') {
                $scope.unidadseleccionada = result.data;
                $(".panel").ready(function(){
                  $(".cargandoUbicacionLote").css("display", "none");
                  $(".cargandoAltitudLote").css("display", "none");
                  $('.collapse').collapse('hide');
                });
                //INFORMACION DE VARIEDADES DE CAFE DE LA UNIDAD
                console.log($scope.unidadseleccionada.variedad);
                console.log($scope.unidadseleccionada);
                $('.collapse').collapse('hide');
                console.log("Debería collapsar");
        	}
        });


        // Función Initialize para mapInit
        function initialize(index) {
          var myLatlng, myLat, myLng, myAlt;
          var x;
          var ax = [];
          var infoWindow = new google.maps.InfoWindow({ map: map });
          console.log('function loaded root');
          console.log("Inicialize Index - " + index); // KH - Log
          id = 'latlongid';
          if(!isNaN(index)){
              id = id + index;
          }
          console.log(id);
          if (!document.getElementById(id).value) {
            console.log('function loaded 1');

              if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(function (position) {
                      var pos = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                      };

                      myLat = position.coords.latitude;
                      myLng = position.coords.longitude;
                      myLatlng = new google.maps.LatLng(myLat, myLng);
                      myAlt = position.coords.altitude;

                      var myOptions = {
                          zoom: 13,
                          center: myLatlng,
                          mapTypeId: google.maps.MapTypeId.ROADMAP
                      }
                      // map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
                      //
                      // map1 = new google.maps.Map(document.getElementById("map-canvas1"), myOptions);
                      //
                      // var marker = new google.maps.Marker({
                      //     draggable: true,
                      //     position: myLatlng,
                      //     map: map,
                      //     title: "Your location"
                      // });
                      //
                      // var marker1 = new google.maps.Marker({
                      //     draggable: true,
                      //     position: myLatlng,
                      //     map: map1,
                      //     title: "Your location"
                      // });
                      //
                      //
                      // google.maps.event.addListener(marker, 'dragend', function (event) {
                      //
                      //     $scope.unidadseleccionada.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
                      //     document.getElementById('latlongid').value = event.latLng.lat() + ',' + event.latLng.lng();
                      //     console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());
                      //
                      // });
                      //
                      // google.maps.event.addListener(marker1, 'dragend', function (event) {
                      //
                      //     placeMarker(event.latLng);
                      //     $scope.unidadseleccionada.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
                      //     document.getElementById('latlongid1').value = event.latLng.lat() + ',' + event.latLng.lng();
                      //     console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());
                      //
                      // });



                     if (!isNaN(index)) {

                       var indString = index.toString();
                       var map2 = new google.maps.Map(document.getElementById("map-canvas-lote"+indString), myOptions);

                       var marker2 = new google.maps.Marker({
                            draggable: true,
                            position: myLatlng,
                            map: map2,
                            title: "Your location"
                        });
                        google.maps.event.addListener(marker2, 'dragend', function (event) {


                            placeMarker(event.latLng);
                            $scope.unidadseleccionada.lote[index].georeferenciacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
                            document.getElementById('latlongid' + indString).value = event.latLng.lat() + ',' + event.latLng.lng();
                            console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());


                        });
                      }


                      google.maps.event.addDomListener(window, 'load', initialize);
                      console.log("this is positon", myLat);
                      console.log($scope.toggle);
                  }, function () {
                      alert('No es posible obtener la ubicación');
                  });
              } else {
                  alert('El dispositivo no soporta geolocalización');
              }

          }
          else {
            console.log('function loaded 2');
              x = document.getElementById(id).value;
              x = x.replace(/[{()}]/g, '');
              ax = x.split(",");
              myLatlng = new google.maps.LatLng(ax[0], ax[1]);

              var myOptions = {
                  zoom: 13,
                  center: myLatlng,
                  disableDoubleClickZoom: true,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
              }
              // map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
              //
              // map1 = new google.maps.Map(document.getElementById("map-canvas1"), myOptions);
              //
              // var marker = new google.maps.Marker({
              //     draggable: true,
              //     position: myLatlng,
              //     map: map,
              //     title: "Your location"
              // });
              //
              // var marker1 = new google.maps.Marker({
              //     draggable: true,
              //     position: myLatlng,
              //     map: map1,
              //     title: "Your location"
              // });
              //
              // google.maps.event.addListener(marker, 'dragend', function (event) {
              //
              //     $scope.unidadseleccionada.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
              //     document.getElementById('latlongid').value = event.latLng.lat() + ',' + event.latLng.lng();
              //     console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());
              //
              // });
              //
              // google.maps.event.addListener(marker1, 'dragend', function (event) {
              //
              //     placeMarker(event.latLng);
              //     $scope.unidadseleccionada.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
              //     document.getElementById('latlongid1').value = event.latLng.lat() + ',' + event.latLng.lng();
              //     console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());
              //
              // });

              if (!isNaN(index)) {

                var indString = index.toString();
                var map2 = new google.maps.Map(document.getElementById("map-canvas-lote"+indString), myOptions);
                var marker2 = new google.maps.Marker({
                    draggable: true,
                    position: myLatlng,
                    map: map2,
                    title: "Your location"
                });
                google.maps.event.addListener(marker2, 'dragend', function (event) {

                placeMarker(event.latLng);
                $scope.unidadseleccionada.lote[index].georeferenciacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
                document.getElementById('latlongid' + indString).value = event.latLng.lat() + ',' + event.latLng.lng();
                console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());


                });
              }
              google.maps.event.addDomListener(window, 'load', initialize);

          }
        }

        function placeMarker(location) {
            var marker = new google.maps.Marker({
                position: location,
                draggable: true,
                map: map
            });

            // map.setCenter(location);
        }

        // Initialize map
        $scope.mapInit = function (index) {
            console.log("el index:");
            console.log(index);
            nomclass='.map';
            nomclasscuerpo='.cuerpoMapa';
            if(!isNaN(index)){
                nomclass = nomclass + index;
                nomclasscuerpo = nomclasscuerpo + index;
            }
            $(nomclass).collapse('toggle');
            if ($(nomclass).attr("aria-expanded") === 'true'){
                $(nomclasscuerpo).css("display", "none");
            }else{
                $(nomclasscuerpo).css("display", "block");
            }

            if ($rootScope.IsInternetOnline) {
                initialize(index);
                console.log('map online, index:'+index);

                // $('#myModal, #myModal2').on('hidden.bs.modal', function (e) {
                //     $scope.toggle = false;
                //     $(nomclass).collapse('hide');
                // });

            } else {
              $('#map-canvas > div, #map-canvas > div').remove();
              console.log('map offline');
            }
        }

        // Función que añade nuevos lotes
        $scope.prependItem = function () {
          console.log($scope.unidadseleccionada._id);
          $scope.idLote = new Date();
          $scope.idLote = ($scope.idLote.getMilliseconds()).toString();
          console.log($scope.idLote);
          $('#nuevoLote').prop('disabled', true);
           var coordenadas = "";
           var altitud = "";
           var ubicacionLote = ".latLongLoteId" + $scope.unidadseleccionada.lote.length.toString();
           var altitudLote = "#altitudLoteId" + $scope.unidadseleccionada.lote.length.toString();
           $scope.mensajeUbicacionLote = "#messageLocationLote" + $scope.unidadseleccionada.lote.length.toString();
           $scope.mensajeAltitudLote = "#messageAltitudLote" + $scope.unidadseleccionada.lote.length.toString();
           var idetime=(new Date).getTime();
             var newItem = {
                 nombre: "",
                 loteIde: idetime,
                 sombra:false,
                 cobertura:false
             }

              // $('#menssageLocationLote').css("display", "block");
              var cAccuracy = null;
              if(device.platform === 'Android' && AdvancedGeolocation!=null) {
                AdvancedGeolocation.start(function(success){

                  try{
                      var jsonObject = JSON.parse(success);
                      
                      switch(jsonObject.provider){
                          case "gps":
                              if(jsonObject.latitude != "0.0"){
                                  
                                  if(cAccuracy===null) cAccuracy = jsonObject.accuracy;
                                  if(cAccuracy > jsonObject.accuracy) {
                                      cAccuracy = jsonObject.accuracy;
                                      
                                      var pos = {
                                          lat: jsonObject.bufferedLatitude,
                                          lng: jsonObject.bufferedLongitude,
                                          alt: jsonObject.altitude
                                      };
  
                                      myLat = jsonObject.bufferedLatitude;
                                      myLng = jsonObject.bufferedLongitude;
                                      myAlt = jsonObject.altitude;
                                      // myAlt = 1254.365;
  
                                      console.log(myAlt);
                                      // console.log(elevator);
  
                                      coordenadas = '('+ myLat +','+ myLng+')';
                                      console.log("Coordenadas", coordenadas);
  
                                      if (myAlt === null) {
                                        $(altitudLote).val("");
                                      }
                                      else{
                                        if(myAlt > 0) {
                                          altitud = myAlt.toString();
                                          $scope.unidadseleccionada.lote[$scope.unidadseleccionada.lote.length - 1].altitud = altitud;
                                          console.log($scope.unidadseleccionada.lote);
                                          $(altitudLote).val(altitud);
                                        }
                                      }
                 
                                      // Mostramos la Geolocalización
                                      $scope.unidadseleccionada.lote[$scope.unidadseleccionada.lote.length - 1].georeferenciacion = coordenadas;
                                      console.log($scope.unidadseleccionada.lote);
                                      $(ubicacionLote).val(coordenadas);
                                      $($scope.mensajeUbicacionLote).css("display", "none");
                                      $($scope.mensajeAltitudLote).css("display", "none");
                                      console.log($(ubicacionLote).val(), ubicacionLote);
                                      console.log($(altitudLote).val(), altitudLote);
                                  }
                              }
                          break;
          
                          case "network":
                              if(jsonObject.latitude != "0.0"){
                                  if(cAccuracy===null) cAccuracy = jsonObject.accuracy;
                                  if(cAccuracy > jsonObject.accuracy) {
                                      cAccuracy = jsonObject.accuracy;
                                      var pos = {
                                          lat: jsonObject.bufferedLatitude,
                                          lng: jsonObject.bufferedLongitude,
                                          alt: jsonObject.altitude
                                      };
                                  
                                      myLat = jsonObject.bufferedLatitude;
                                      myLng = jsonObject.bufferedLongitude;
                                      myAlt = jsonObject.altitude;
                                      // myAlt = 1254.365;
                              
                                      console.log(myAlt);
                                      // console.log(elevator);
                                  
                                      coordenadas = '('+ myLat +','+ myLng+')';
                                      console.log("Coordenadas", coordenadas);
                                  
                                      if (myAlt === null) {
                                        $(altitudLote).val("");
                                      }
                                      else{
                                        if(myAlt > 0) {
                                          altitud = myAlt.toString();
                                          $scope.unidadseleccionada.lote[$scope.unidadseleccionada.lote.length - 1].altitud = altitud;
                                          console.log($scope.unidadseleccionada.lote);
                                          $(altitudLote).val(altitud);
                                        }
                                      }
                 
                                      // Mostramos la Geolocalización
                                      $scope.unidadseleccionada.lote[$scope.unidadseleccionada.lote.length - 1].georeferenciacion = coordenadas;
                                      console.log($scope.unidadseleccionada.lote);
                                      $(ubicacionLote).val(coordenadas);
                                      $($scope.mensajeUbicacionLote).css("display", "none");
                                      $($scope.mensajeAltitudLote).css("display", "none");
                                      console.log($(ubicacionLote).val(), ubicacionLote);
                                      console.log($(altitudLote).val(), altitudLote);
                                  }
                              }
                          break;
          
                          case "satellite":
                              //TODO
                          break;
                                      
                          case "cell_info":
                              //TODO
                          break;
                                      
                          case "cell_location":
                              //TODO
                          break;  
                                  
                          case "signal_strength":
                              //TODO
                          break;              	
                      }
                  }
                  catch(exc){
                      console.log("Invalid JSON: " + exc);
                  }   
                },
                function(error){
                    console.log("ERROR! " + JSON.stringify(error));
                },
                  ////////////////////////////////////////////
                  //
                  // REQUIRED:
                  // These are required Configuration options!
                  // See API Reference for additional details.
                  //
                  ////////////////////////////////////////////
                {
                        "minTime":500,         // Min time interval between updates (ms)
                        "minDistance":1,       // Min distance between updates (meters)
                        "noWarn":true,         // Native location provider warnings
                        "providers":"all",     // Return GPS, NETWORK and CELL locations
                        "useCache":false,       // Return GPS and NETWORK cached locations
                        "satelliteData":true, // Return of GPS satellite info
                        "buffer":true,        // Buffer location data
                        "bufferSize":10,        // Max elements in buffer
                        "signalStrength":true // Return cell signal strength data
                });
              }
              else if (navigator.geolocation) {
                console.log($scope.mensajeUbicacionLote);
                 navigator.geolocation.getCurrentPosition(function (position) {
                     var pos = {
                         lat: position.coords.latitude,
                         lng: position.coords.longitude,
                         alt: position.coords.altitude
                     };

                     myLat = position.coords.latitude;
                     myLng = position.coords.longitude;
                     myAlt = position.coords.altitude;
                     // myAlt = 1425.365;

                     coordenadas = '('+ myLat +','+ myLng+')';
                     console.log("Coordenadas", coordenadas);
                     console.log("Index Ubicación: - ", ubicacionLote);
                     console.log("Index Altitud: -", altitudLote);

                     // Mostramos la altitud del Lote
                     if (myAlt === null) {
                       $(altitudLote).val("");
                     }
                     else{
                       altitud = myAlt.toString();
                       $scope.unidadseleccionada.lote[$scope.unidadseleccionada.lote.length - 1].altitud = altitud;
                       console.log($scope.unidadseleccionada.lote);
                       $(altitudLote).val(altitud);
                     }

                     // Mostramos la Geolocalización
                     $scope.unidadseleccionada.lote[$scope.unidadseleccionada.lote.length - 1].georeferenciacion = coordenadas;
                     console.log($scope.unidadseleccionada.lote);
                     $(ubicacionLote).val(coordenadas);
                     $($scope.mensajeUbicacionLote).css("display", "none");
                     $($scope.mensajeAltitudLote).css("display", "none");
                     console.log($(ubicacionLote).val(), ubicacionLote);
                     console.log($(altitudLote).val(), altitudLote);
                 },function () {
                     $scope.SweetAlert('¡Error!', 'No es posible obtener la ubicación', 'warning');
                 });
             } else {
                $scope.SweetAlert('¡Error!', 'El dispositivo no soporta geolocalización', 'warinig');
             }
        $scope.sucMsg = '';

        $scope.nuevoLote = "Activado";

        console.log("Estoy Activado " , $scope.nuevoLote);

        $scope.unidadseleccionada.lote.push(newItem);

        setTimeout(function(){
                $($scope.mensajeUbicacionLote).css("display", "inline");
                $($scope.mensajeAltitudLote).css("display", "inline");
        },100);


        return true;

   }

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

   // Funcion para colapsar el bloque Lote al añadirlo
   $scope.collapseLote = function (index) {
     console.log("Entre a Collapse");
     // Elemento 1
     elemento1='#opLote-';

     // Elemento 2
     elemento2='#collapse-';

     //Sombra
     sombra = ".sombraNoId";
     porcentajeInput = ".porcentajeSombraId";

     if(!isNaN(index)){

       if ($scope.nuevoLote == "Activado") {
         console.log("Nuevo Lote");
         elemento1 = elemento1 + index;
         elemento2 = elemento2 + index;
         console.log(elemento1);

         // Cambios Elemento 1
         $(elemento1).attr("aria-expanded", 'false');
         $(elemento1).addClass('collapsed');

         // Cambios Elemento 2
         $(elemento2).attr("aria-expanded",'false');
         $(elemento2).removeClass("in");
         $(elemento2).addClass('panel-collapse collapse');
         $(elemento2).css("height", "0px");

         return "Nuevo";
       }else if ($scope.nuevoLote == "") {

         console.log("Lote Actualizado");
         for (var i = 0; i <= index; i++) {
           elemento1 = elemento1 + i;
           console.log(elemento1);
           if (($(elemento1).attr("aria-expanded") === 'true')) {
             // Modifico elemento 2
             elemento2 = elemento2 + i;
             // sombra = sombra + i;
             porcentajeInput = porcentajeInput + i;
             console.log($(elemento1).attr("aria-expanded"));

             // Cambios Elemento 1
             $(elemento1).attr("aria-expanded", 'false');
             $(elemento1).addClass('collapsed');

             // Cambios Elemento 2
             $(elemento2).attr("aria-expanded",'false');
             $(elemento2).removeClass("in");
             $(elemento2).addClass('panel-collapse collapse');
             $(elemento2).css("height", "0px");

             return "Editado";
           }
           elemento1 = "#opLote-";
         }
       }
     }
   }


     // Función para guardar nuevos Lotes
     $scope.updateUnitForm = function () {

       var index = $scope.unidadseleccionada.lote.length - 1;


       //if (index >= 0) {

       if ($scope.updateunitFormlote.$valid) {

           //Añado el Id del Lote
           if(index>=0){
               if($scope.unidadseleccionada.lote[index]){
            $scope.unidadseleccionada.lote[index].idLote = $scope.unidadseleccionada._id + $scope.idLote;
               }
           }

           //Commented out as we need to update data from pouchDB only,that will be sync to server
           //if ($rootScope.IsInternetOnline) {
           //    unit.update(id, auth.userId(), $scope.editUnit).then(function (unitN) {
           //        user.get($scope.user_Ided).then(function (user) {
           //            $scope.userO = user;
           //            $scope.units = $scope.userO.units;
           //        });
           //        $scope.editUnit = {};
           //        console.log("return  updated data=" + JSON.stringify(unitN.data));
           //        $scope.editUnit = unitN.data;
           //        $scope.sucMsg = '¡Unidad Actualizada exitosamente!';
           //        if ($rootScope.IsInternetOnline) {
           //            PouchDB.SynServerDataAndLocalData().then(function () {
           //                console.log("sync successfully.");
           //            }).catch(function (err) {
           //                console.log("Not able to sync" + error);
           //            });
           //        }
           //    });


           //} else {
           //    //region to update data in local PouchDB instead , that will be sync to server
           //    PouchDB.EditUnit($scope.editUnit, auth.userId()).then(function (result) {
           //        if (result.status == 'fail') {
           //            $scope.error = result.message;
           //        }
           //        else if (result.status == 'success') {
           //            $scope.editUnit = result.data;
           //            $scope.sucMsg = '¡Unidad Actualizada exitosamente!';
           //            console.log(result.data)
           //            for (var i = 0 ; i < $scope.units.length; i++) {
           //                if ($scope.units[i]._id == $scope.editUnit._id) {
           //                    $scope.units[i] = $scope.editUnit;
           //                    break;
           //                }
           //            }
           //        }
           //    });
           //}
           var clase = 'latLangLoteId' + index.toString();
           var areaExpandida = "#opLote-"
           console.log(index);

           if ($scope.nuevoLote == "Activado") {
             //Sombra
             sombra = ".sombraNoId" + index;
             porcentajeInput = ".porcentajeSombraId" + index;

             console.log(index);
             console.log(sombra);

             if($(sombra).is(':checked')) {
                console.log("Está activado");
                $(porcentajeInput).val(0);
                delete $scope.unidadseleccionada.lote[index].porcentajeDeSombra;
                // $scope.unidadseleccionada.lote[i].porcentajeDeSombra = 0;
                console.log($scope.unidadseleccionada.lote);
              }

           }else if ($scope.nuevoLote == "") {
             console.log("entré acá");
             for (var i = 0; i <= index; i++) {
               areaExpandida = areaExpandida + i;
               if (($(areaExpandida).attr("aria-expanded") === 'true')) {
                 //Sombra
                 sombra = ".sombraNoId" + i;
                 porcentajeInput = ".porcentajeSombraId" + i;

                 console.log(i);
                 console.log(sombra);

                 if($(sombra).is(':checked')) {
                    console.log("Está activado");
                    $(porcentajeInput).val(0);
                    delete $scope.unidadseleccionada.lote[i].porcentajeDeSombra;
                    // $scope.unidadseleccionada.lote[i].porcentajeDeSombra = 0;
                    console.log($scope.unidadseleccionada.lote);
                  }
               }
               areaExpandida = "#opLote-";
             }
           }




           PouchDB.EditUnitLotes($scope.unidadseleccionada, auth.userId()).then(function (result) {
               console.log("Entre a Pouch");
               console.log(result);
               if (result.status == 'fail') {
                   $scope.error = result.message;
               }
               else if (result.status == 'success') {
                   $scope.unidadseleccionada = result.data;
                   console.log($scope.unidadseleccionada);

                    if(index>=0){
                       var collapseLote = $scope.collapseLote(index, $scope.nuevoLote);
                       if (collapseLote == "Nuevo") {
                         $scope.SweetAlert("¡Excelente!", "Lote Guardado", "success");
                       }else if (collapseLote == "Editado") {
                         $scope.SweetAlert("¡Excelente!", "Lote Actualizado", "success");
                       }
                    }

                    if ($scope.deleteLote == "Eliminar") {
                      $scope.deleteLote = "";
                      $scope.SweetAlert("¡Excelente!", "Lote Eliminado", "success");

                    }

                   $scope.nuevoLote = "";
                   $scope.sucMsg = '¡Unidad Actualizada exitosamente!';
                   console.log($scope.unidadseleccionada.lote);

                   // for (var i = 0 ; i < $scope.units.length; i++) {
                   //     console.log('$Scope Units ' + i + ' = ',  $scope.units[i]);
                   //     if ($scope.units[i]._id == $scope.editUnit._id) {
                   //         $scope.units[i] = $scope.editUnit;
                   //         break;
                   //     }
                   // }
                   if ($rootScope.IsInternetOnline) {
                       PouchDB.SynServerDataAndLocalData().then(function () {
                           console.log("sync successfully.");
                       }).catch(function (err) {
                           console.log("Not able to sync" + error);
                       });
                   }
                   $scope.nuevoLote = "";
                   $('#nuevoLote').prop('disabled', false);
               }
           });

           if(device.platform === 'Android' && AdvancedGeolocation!=null)
           {
            try {
              AdvancedGeolocation.stop(function(success){
                console.log(success);
              },function(error){
                console.log(error);
              });
            } catch(exc) {
              console.log(exc);
            }
           }
       }
       else {
         $scope.SweetAlert("Error", "Complete los campos", "error");
       }
     }

   // Funcion para eliminar lote
   $scope.eliminarLote = function (index){
         var noLotes = $scope.unidadseleccionada.lote.length - 1;
         console.log(index, " - ", noLotes );
         console.log($scope.nuevoLote);
         $scope.deleteLote = "Eliminar";

      if($scope.unidadseleccionada.lote!=undefined){
            if (index == noLotes && $scope.nuevoLote === "Activado") {
                  console.log("Habilité el botón");
                  $('#nuevoLote').prop('disabled', false);
                  $scope.nuevoLote = "";
                  $scope.unidadseleccionada.lote.splice(index,1);
           }else if (index < noLotes) {
                 $scope.SweetAlert("¡Lote Eliminado!", "Presione Salvar Cambios para eliminar definitivamente.", "warning");
                 $scope.unidadseleccionada.lote.splice(index,1);
           }

      }

   }

   ///PARA VULNERABILIDAD

   // Gráficas de Vulnerabilidad
   $scope.buscarValor = function (arrayData, nombre) {
       for (var i = 0; i < arrayData.length; i++) {
           if (arrayData[i].name.localeCompare(nombre) == 0){
               return arrayData[i].value;
           }
       }

       return -1;
   }

   $scope.graficarHitorial = function (arrayEncuestas) {
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

         classData = "#dataUnitVulne"
         historyGrafic = arrayEncuestas;

         // Añadimos los muestreos guardados en el servidor
         if (historyGrafic != 0) {
           for (var i = 0; i < historyGrafic.length; i++) {
             if (historyGrafic[i].unidad == $scope.unitId && historyGrafic[i].resumenVulne[0] != undefined) {
               data.push(historyGrafic[i]);
             }
           }
         }

         // Añadimos muestreos realizados offline si hubiera
         if ($scope.encuestaHistoryByUnidadOffline.length != 0) {
           for (var i = 0; i < $scope.encuestaHistoryByUnidadOffline.length; i++) {
             if ($scope.encuestaHistoryByUnidadOffline[i].unidad == $scope.unitId && $scope.encuestaHistoryByUnidadOffline[i].resumenVulne != undefined) {
               data.push($scope.encuestaHistoryByUnidadOffline[i]);
             }
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

         var fechas = [];
         var puntosIncidencia = [];
         var listaUnidades = [];
         var puntosIncidenciaPorUnidad = [];


         for (var i = 0; i < data.length; i++) {
             //Extraemos el día y mes para comprimir más la fecha
             var day = "";
             var months = ["Ene","Feb","Mar","Abr","Mayo","Jun","Jul","Ago","Sep","Oct","Nov","Dec"];
             if (data[i].resumenVulne.fecha != undefined) {
               day = new Date(data[i].resumenVulne.fecha);
               day = day.getDate() + '-' +  months[day.getMonth()];
               fechas.push(day);
               puntosIncidencia.push({meta: data[i].unidad,value: data[i].resumenVulne.valor});
             }else {
               if (!fechas.contains(data[i].resumenVulne[0].fecha)){
                   day = new Date(data[i].resumenVulne[0].fecha);
                   day = day.getDate() + '-' + months[day.getMonth()];
                   fechas.push(day);
               }
               puntosIncidencia.push({meta: data[i].unidad,value: data[i].resumenVulne[0].valor});
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
             top: 55,
             bottom: 55
         },
         plugins: [
             Chartist.plugins.tooltip()
         ]


     });
   }

  // $scope.historialVulLaunch = function() {
  //
  //
  //
  //   }

    $scope.resumenDataHistorial = [];


    $scope.chargeData = function (encuestaHistoryData){
            console.log("Entre a Charge Data");
          for (var i = 0; i < encuestaHistoryData.length; i++) {
             var idData = encuestaHistoryData[i]._id;
             var entrevistadoData = $scope.buscarValor(encuestaHistoryData[i].preguntas, 'entrevistado');
             var valorData = $scope.buscarValor(encuestaHistoryData[i].preguntas, 'puntajeNumData');
             var fechaData = $scope.buscarValor(encuestaHistoryData[i].preguntas, 'fecha');
              if(fechaData==-1) fechaData = encuestaHistoryData[i].LastUpdatedDateTime;
             var rangoMin = 0;
             var rangoMax = 0;
             var titulo = "";
             var textoData = "";

             if((valorData>=20)&&(valorData<=25)){
                  rangoMin: 20;
                  rangoMax: 25;
                  titulo = "bueno";
                  textoData = "Vulnerabilidad prácticamente ausente. Excelente capacidad adaptativa.";

             }else if((valorData>=15)&&(valorData<20)){
               rangoMin: 15;
               rangoMax: 19;
               titulo = "bueno";
               textoData = "Vulnerabilidad baja. Alta capacidad adaptativa.";
          }else if((valorData>=8)&&(valorData<15)){
             rangoMin: 8;
             rangoMax: 14;
             titulo = "medioalto";
             textoData = "Vulnerabilidad y capacidad adaptativa moderadas.";
          }else if((valorData>=1)&&(valorData<8)){
             rangoMin: 1;
             rangoMax: 7;
             titulo = "medioalto";
             textoData = "Vulnerabilidad y capacidad adaptativa regulares.";
          }else if((valorData>=-6)&&(valorData<1)){
             rangoMin: -6;
             rangoMax: 0;
             titulo = "mediobajo";
             textoData = "Vulnerabilidad y capacidad adaptativa medianamente críticas.";
          }else if((valorData>=-13)&&(valorData<-6)){
             rangoMin: -13;
             rangoMax: -7;
             titulo = "mediobajo";
             textoData = "Vulnerabilidad y capacidad adaptativa críticas.";
          }else if((valorData>=-20)&&(valorData<-13)){
             rangoMin: -20;
             rangoMax: -14;
             titulo = "malo";
             textoData = "Vulnerabilidad y capacidad adaptativa muy críticas.";
          }else if((valorData>=-25)&&(valorData<-20)){
             rangoMin: -25;
             rangoMax: -21;
             titulo = "malo";
             textoData = "Totalmente vulnerable y sin ninguna capacidad adaptativa.";
          }

          $scope.resumenDataHistorial.push({
             id: idData,
             fecha: fechaData,
             entrevistado: entrevistadoData,
             valor: valorData,
             rangoI: rangoMin,
             rangoM: rangoMax,
             title: titulo,
             texto: textoData
          });

          }
          console.log($scope.resumenDataHistorial);
   }

}]);
