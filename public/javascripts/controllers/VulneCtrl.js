app.controller('VulneCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    'auth',
    'localStorageService',
    'socket',
    'vulnerabilidades',
    '$location',
    'PouchDB',
    '$window',
    'user',
    function($scope, $rootScope, $state, $stateParams, auth,localStorageService, socket, vulnerabilidades, $location, PouchDB, $window, user){

      $scope.currentUser=auth.currentUser;

      $scope.listaPreguntas = [];
      $scope.resultado = 0;
      $scope.idEncuesta = 0;
      $scope.completed = false;
      $scope.encuestaHistory = [];
      $scope.resumenDataHistorial = [];

      $scope.unitId = $stateParams.idunidad;
      $scope.unitIndex = $stateParams.indexunidad;
      $scope.encuestasLocalesPouchDB = [];

      console.log($scope.unitId);

      $scope.arrData = [];

      $scope.encuestanueva = true;

      if($window.localStorage.getItem('encuestas')){
        var encuestaLista = JSON.parse($window.localStorage.getItem('encuestas'));
        $scope.listaPreguntas = encuestaLista[0].preguntas;

        $window.localStorage.removeItem('encuestas');
    }



    if ($rootScope.IsInternetOnline) {
        PouchDB.SynLocalDataToServerDbEncuesta().then(function () {
            console.log("sync successfully encuesta.... al entrar a opción");
        }).catch(function (err) {
            console.log("Not able to sync" + error);
        });
    }

    $scope.clearTestVulne = function(option){
			if (option == true) {
				console.log("Reinicar");
				$state.go("vulnerability", {idunidad: $scope.unitId, indexunidad: $scope.unitIndex}, {reload: true});
			}
		}

    $scope.backHistorialVulne = function(){
      $state.go("homeinternal", {idunidad: $scope.unitId, indexunidad: $scope.unitIndex}, {reload: true});
    }

    $scope.soporteVulne = function(){
      $state.go("supportclient", {}, {reload: true});
    }



    $scope.newEncuesta = {
        PouchDBId: '',
        isDeleted: false,
        EntityType: 'Encuesta',
        LastUpdatedDateTime: '',
        preguntas: $scope.listaPreguntas,
        unidad: '',
        resumenVulne: {}
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

    $scope.calculoEncuesta = function (valorData) {
      $scope.newEncuesta.resumenVulne.entrevistado = valorData;
      if((valorData>=20)&&(valorData<=25)){
          $scope.newEncuesta.resumenVulne.rangoMin = 20;
          $scope.newEncuesta.resumenVulne.rangoMax = 25;
          $scope.newEncuesta.resumenVulne.titulo = "bueno";
          $scope.newEncuesta.resumenVulne.textoData = "Vulnerabilidad prácticamente ausente. Excelente capacidad adaptativa.";
        }else if((valorData>=15)&&(valorData<20)){
          $scope.newEncuesta.resumenVulne.rangoMin = 15;
          $scope.newEncuesta.resumenVulne.rangoMax = 19;
          $scope.newEncuesta.resumenVulne.titulo = "bueno";
          $scope.newEncuesta.resumenVulne.textoData = "Vulnerabilidad baja. Alta capacidad adaptativa.";
        }else if((valorData>=8)&&(valorData<15)){
          $scope.newEncuesta.resumenVulne.rangoMin = 8;
          $scope.newEncuesta.resumenVulne.rangoMax = 14;
          $scope.newEncuesta.resumenVulne.titulo = "medioalto";
          $scope.newEncuesta.resumenVulne.textoData = "Vulnerabilidad y capacidad adaptativa moderadas.";
        }else if((valorData>=1)&&(valorData<8)){
          $scope.newEncuesta.resumenVulne.rangoMin = 1;
          $scope.newEncuesta.resumenVulne.rangoMax = 7;
          $scope.newEncuesta.resumenVulne.titulo = "medioalto";
          $scope.newEncuesta.resumenVulne.textoData = "Vulnerabilidad y capacidad adaptativa regulares.";
        }else if((valorData>=-6)&&(valorData<1)){
          $scope.newEncuesta.resumenVulne.rangoMin = -6;
          $scope.newEncuesta.resumenVulne.rangoMax = 0;
          $scope.newEncuesta.resumenVulne.titulo = "mediobajo";
          $scope.newEncuesta.resumenVulne.textoData = "Vulnerabilidad y capacidad adaptativa medianamente críticas.";
        }else if((valorData>=-13)&&(valorData<-6)){
          $scope.newEncuesta.resumenVulne.rangoMin = -13;
          $scope.newEncuesta.resumenVulne.rangoMax = -7;
          $scope.newEncuesta.resumenVulne.titulo = "mediobajo";
          $scope.newEncuesta.resumenVulne.textoData = "Vulnerabilidad y capacidad adaptativa críticas.";
        }else if((valorData>=-20)&&(valorData<-13)){
          $scope.newEncuesta.resumenVulne.rangoMin = -20;
          $scope.newEncuesta.resumenVulne.rangoMax = -14;
          $scope.newEncuesta.resumenVulne.titulo = "malo";
          $scope.newEncuesta.resumenVulne.textoData = "Vulnerabilidad y capacidad adaptativa muy críticas.";
        }else if((valorData>=-25)&&(valorData<-20)){
          $scope.newEncuesta.resumenVulne.rangoMin = -25;
          $scope.newEncuesta.resumenVulne.rangoMax = -21;
          $scope.newEncuesta.resumenVulne.titulo = "malo";
          $scope.newEncuesta.resumenVulne.textoData = "Totalmente vulnerable y sin ninguna capacidad adaptativa.";
        }
        var dateVulne = new Date();
        $scope.newEncuesta.resumenVulne.fecha = dateVulne;
        $scope.newEncuesta.resumenVulne.valor = valorData;
        console.log($scope.newEncuesta);
        return
    }

    $scope.historialVulLaunch = function() {


      if ($rootScope.IsInternetOnline) {
         console.log("Con internet");
         console.log(auth.userId());
         vulnerabilidades.getUser(auth.userId()).then(function(userhistory){
            $scope.encuestaHistory = userhistory.data;
            console.log("Historial de Encuestas: ", userhistory.data);
        });

     }else {
       console.log("No internet");
       PouchDB.GetVulnerabilityFromPouchDB().then(function (result) {
             console.log("entramos a PouchDB");
             console.log(result);

             if (result.status == 'fail') {
                 $scope.error = result.message;
             }
            else if (result.status == 'success') {
                var doc = result.data.rows[0].doc;
                if (result.data.rows.length > 0) {
                    var encuestasArray = [];
                    for (var i = 0; i < doc.list.length; i++) {
                        encuestasArray.push(doc.list[i]);
                    }
                    console.log("Historial de Encuestas - PouchDB: ", encuestasArray);
                }
            }
         }).catch(function(err) {
             console.log("error al obtener datos");
             console.log(err);
         });
       }


    console.log("historial");
    console.log($scope.encuestaHistory);

    $scope.resumenDataHistorial = [];


    for (var i = 0; i < $scope.encuestaHistory.length; i++) {

        var idData = $scope.encuestaHistory[i]._id;
        var entrevistadoData = $scope.buscarValor($scope.encuestaHistory[i].preguntas, 'entrevistado');
        var valorData = $scope.buscarValor($scope.encuestaHistory[i].preguntas, 'puntajeNumData');
        var fechaData = $scope.buscarValor($scope.encuestaHistory[i].preguntas, 'fecha');
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

    console.log($scope.resumenDataHistorial);

    }
    console.log("Inicio historial Resumen--------------------------");
    console.log($scope.resumenDataHistorial);
    console.log("Fin historial Resumen--------------------------");

     console.log("Esot es algo --------------------------");
                console.log($scope.algo);
        console.log("Esot es algo --------------------------");

        //$scope.graficarHitorial();
    }


$scope.buscarValor = function (arrayData, nombre) {
    for (var i = 0; i < arrayData.length; i++) {
        if (arrayData[i].name.localeCompare(nombre) == 0){
            return arrayData[i].value;
        }
    }

    return -1;
}


$scope.graficarHistorial = function () {


    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--)
            if (this[i] == obj)
                return true;
            return false;
        }

        $("#datagUnit").css({display:"block"});

        var data = $scope.resumenDataHistorial;
        var rangos = [];
        var listaValores = [];
        var valores = [];


        for (var i = 0; i < data.length; i++) {

            if (!rangos.contains(data[i].title)){
                rangos.push(data[i].title);
            }
        }

        console.log("Ini rangos-------------------");

        console.log(rangos);
        console.log("Fin rangos-------------------");
        //Inicializar los valores

        for (var k = 0; k < rangos.length; k++) {
            valores[rangos[k]] = 0;
        }

        console.log("Inicia valores rangos-------------------");

        //Generamos el conjunto de valores
        for (var i = 0; i < rangos.length; i++) {

            for (var j = 0; j < data.length; j++) {
                /*ea0707*/
                if (rangos[i].localeCompare(data[j].title) == 0){
                    valores[rangos[i]] += 1;
                }
            }

        }

        //Extraemos solo valores numericos
        for (var m = 0; m < rangos.length; m++) {
            listaValores[m] = valores[rangos[m]];
        }

        console.log(listaValores);

        console.log("-------------------");

        console.log(valores);
        console.log("Todo-------------------");



        var data = {
          labels: rangos,
          series: listaValores
      };

      var options = {
          labelInterpolationFnc: function(value) {
            return value[0]
        }
    };

    var responsiveOptions = [
    ['screen and (min-width: 640px)', {
        chartPadding: 30,
        labelOffset: 100,
        labelDirection: 'explode',
        labelInterpolationFnc: function(value) {
          return value;
      }
  }],
  ['screen and (min-width: 1024px)', {
    labelOffset: 80,
    chartPadding: 20
}]
];

var dataG  = new Chartist.Pie('#datagUnit', data, options, responsiveOptions);


};


$scope.dataImprimir = function(){
   console.log("Si funciona esto -------------------------");
  			//console.log($window.localStorage.getItem('encuestas'));
  			console.log($scope.newEncuesta );
  			console.log($scope.listaPreguntas);
  			console.log(jQuery.parseJSON($window.localStorage.getItem('encuestas')));


             vulnerabilidades.getAll(auth.userId()).then(function (data) {

                console.log("Data que deberia mostrarse");
                console.log(data);
            }).catch(function (err) {
               console.log("Hubo un error al cargar los datos");
               console.log(err);
           });
        }


        function guardarDatosCore(){
            $scope.resultado=0;
            var objPreguntas = jQuery('#frmPreguntas').serializeArray();

            var objEncuesta = {
                "preguntas":objPreguntas
            };

            if($scope.encuestanueva){
                $scope.arrData.push(objEncuesta);
                console.log($scope.arrData);
                $scope.encuestanueva=false;
            }else{
                $scope.arrData[$scope.arrData.length-1]=objEncuesta;
            }
            var info = JSON.stringify($scope.arrData);
            console.log(info);
            localStorage.setItem('encuestas',info);
            $scope.listaPreguntas = info;
        }

        $scope.saveDataEncuesta = function (value) {
            jQuery('#resultados').css('display','block');
            jQuery('#resultados').siblings().css('display','none');
            $window.arrSeccion = [{"label":"Inicio","anchor":"inicio"},{"label":"Preguntas","anchor":"cuestionario"},{"label":"Resultados","anchor":"resultados"}];

            // var a  = confirm('¿Datos Correctos?');

            if(value == true){

                jQuery('.oprespuesta[value="si"]:checked').each(function(value){
                    var numpregunta=jQuery(this).attr('rel');
                    jQuery('#recomienda'+ numpregunta).css('display','block');
                    $scope.resultado = $scope.resultado-1;
                });
                jQuery('#cantrecomienda').html($scope.resultado*-1);
                jQuery('.oprespuesta[value="medio"]:checked').each(function(value){
                    $scope.resultado = $scope.resultado+0.5;
                });
                jQuery('.oprespuesta[value="no"]:checked').each(function(value){
                    $scope.resultado = $scope.resultado+1;
                });
                jQuery('#puntajeNum').html($scope.resultado);
                jQuery('#puntajeNumData').val($scope.resultado);
                jQuery('tr').children('td').addClass('inactivo');
                var clase='';
                if(($scope.resultado>=20)&&($scope.resultado<=25)){
                    clase='rango1';
                }else if(($scope.resultado>=15)&&($scope.resultado<20)){
                    clase='rango2';
                }else if(($scope.resultado>=8)&&($scope.resultado<15)){
                    clase='rango3';
                }else if(($scope.resultado>=1)&&($scope.resultado<8)){
                    clase='rango4';
                }else if(($scope.resultado>=-6)&&($scope.resultado<1)){
                    clase='rango5';
                }else if(($scope.resultado>=-13)&&($scope.resultado<-6)){
                    clase='rango6';
                }else if(($scope.resultado>=-20)&&($scope.resultado<-13)){
                    clase='rango7';
                }else if(($scope.resultado>=-25)&&($scope.resultado<-20)){
                    clase='rango8';
                }
                jQuery('#'+clase).children('td').removeClass('inactivo');
                // $scope.val
                console.log("Puntaje Encuesta", $scope.resultado);
                // alert('Boleta Guardada');
                $scope.SweetAlert("¡Excelente!", "Boleta Guardada", "success");
        			//jQuery('input[type="radio"]').prop('checked',false);
                var objFecha = new Date();
                   /*jQuery('#fechaBoleta').val(objFecha.getDate()+'-'+objFecha.getMonth()+'-'+objFecha.getFullYear()+' '+objFecha.getHours()+':'+objFecha.getMinutes());*/
                   /*jQuery('#Preguntas').css('display','none');
                   jQuery('#resultados').css('display','block');*/
                    //window.location.hash='#resultados';
                $scope.calculoEncuesta($scope.resultado);
                guardarDatosCore();
                $scope.saveEncuesta();
                window.scrollTo(0,0);
            }



        }


        $scope.validateAlert = function (){
            swal({
                title: "¿Datos Correctos?",
                text: "Está seguro que los datos son correctos.",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                cancelButtonText:  'Cancelar',
                closeOnConfirm: false
            },
            function(isConfirm) {
              console.log(isConfirm);
              if (isConfirm == true) {
                // $scope.SweetAlert("¡Excelente!", "Boleta Guardada", "success");
                $scope.saveDataEncuesta(true);
              } else {
                return false;
                // a = false;
              }
          });
        }


            $scope.updateData = function () {
                guardarDatosCore();

                var ListaEncuesta = JSON.parse($window.localStorage.getItem('encuestas'));
                $scope.listaPreguntas = ListaEncuesta[0].preguntas;
                $window.localStorage.removeItem('encuestas');
                $scope.newEncuesta.preguntas = $scope.listaPreguntas;

                console.log('savelocal');
                console.log($scope.newEncuesta);

                if ($scope.completed == false){
                    $scope.completed = true;
                    PouchDB.updateEncuesta($scope.newEncuesta, auth.userId(), $scope.idEncuesta).then(function (result) {
                        if (result.status == 'fail') {
                            $scope.error = result.message;
                        }
                        else if (result.status == 'success') {
                            console.log("------------------------------------------------");
                            console.log("Data guardado de la encuesta....");
                            console.log(result.data);
                            $scope.listaPreguntas.push(result.data);
                            console.log("Fin de encuesta...");
                            console.log("------------------------------------------------");
                            delete result.data["type"];


                            if ($rootScope.IsInternetOnline) {


                                PouchDB.SynLocalDataToServerDbEncuesta().then(function () {
                                    console.log("sync successfully encuesta.");
                                }).catch(function (err) {
                                    console.log("Not able to sync" + error);
                                });
                            }
                        }

                    });

                }


                // alert("Boleta guardada");
                $scope.SweetAlert("¡Excelente!", "Boleta Guardada", "success");

            }

            $scope.saveEncuesta = function () {

                var ListaEncuesta = JSON.parse($window.localStorage.getItem('encuestas'));
                console.log(ListaEncuesta);
                $scope.listaPreguntas = ListaEncuesta[0].preguntas;
                $window.localStorage.removeItem('encuestas');
                $scope.newEncuesta.unidad = $stateParams.idunidad;
                $scope.newEncuesta.preguntas = $scope.listaPreguntas;
                var currentEncuestas = [];

                var dt = new Date();
                var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
                $scope.newEncuesta.user = auth.userId();
                $scope.newEncuesta.PouchDBId = documentId;
                $scope.newEncuesta.LastUpdatedDateTime = Number(dt);

                console.log('savelocal');
                console.log($scope.newEncuesta);

                if ($rootScope.IsInternetOnline) {
                  vulnerabilidades.create($scope.newEncuesta, auth.userId()).then(function (result) {
                    console.log(result.data);

                    console.log("Historial de Encuestas - Servidor: ",$scope.encuestaHistory);
                    $scope.encuestaHistory.push(result.data)
                    console.log("Historial de Encuestas Actualizadas - Servidor: ",$scope.encuestaHistory);
                  });

                }else {
                  PouchDB.GetVulnerabilityFromPouchDB().then(function (result) {
                  			console.log("entramos a PouchDB");
                  			console.log(result);

                  			if (result.status == 'fail') {
                  					$scope.error = result.message;
                  			}
                       else if (result.status == 'success') {
                           var doc = result.data.rows[0].doc;
                           if (result.data.rows.length > 0) {
                               var encuestasArray = [];
                               for (var i = 0; i < doc.list.length; i++) {
                                   encuestasArray.push(doc.list[i]);
                               }

                               $scope.encuestasLocalesPouchDB = encuestasArray;
                               console.log("Historial de Encuestas - PouchDB: ",$scope.encuestasLocalesPouchDB);

                               // Guardamos los muestreos en PouchDB
                               $scope.encuestasLocalesPouchDB.push($scope.newEncuesta)
                               PouchDB.SaveVulnerabilityToPouchDB($scope.encuestasLocalesPouchDB);
                               console.log("Historial de Encuestas Actualizadas - PouchDB: ", $scope.encuestasLocalesPouchDB);
                           }
                       }
                  	}).catch(function(err) {
                  			console.log("error al obtener datos");
                  			console.log(err);
                  	});
                }
            }

        $scope.verResultados = function(){
            $('#Preguntas').css('display','none');
            $('#resultados').css('display','block');
        }

        if ($rootScope.IsInternetOnline) {
           console.log("Con internet");
           console.log(auth.userId());
           vulnerabilidades.getUser(auth.userId()).then(function(userhistory){
              $scope.encuestaHistory = userhistory.data;
              console.log("Historial de Encuestas - Servidor: ", userhistory.data);
          });

       }else {
         console.log("No internet");
         PouchDB.GetVulnerabilityFromPouchDB().then(function (result) {
               console.log("entramos a PouchDB");
               console.log(result);

               if (result.status == 'fail') {
                   $scope.error = result.message;
               }
              else if (result.status == 'success') {
                  var doc = result.data.rows[0].doc;
                  if (result.data.rows.length > 0) {
                      var encuestasArray = [];
                      for (var i = 0; i < doc.list.length; i++) {
                          encuestasArray.push(doc.list[i]);
                      }
                      console.log("Historial de Encuestas - PouchDB: ", encuestasArray);
                  }
              }
           }).catch(function(err) {
               console.log("error al obtener datos");
               console.log(err);
           });
         }

}]);
