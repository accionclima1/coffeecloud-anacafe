app.controller('MainCtrl',['$scope', '$http', 'posts', 'auth', 'unit', 'varieties', 'fungicidas', 'methods', 'methodsGallo', '$rootScope', 'localStorageService', 'onlineStatus', 'widget', 'PouchDB',
function($scope, $http, posts, auth, unit, varieties,fungicidas, methods, methodsGallo, $rootScope, localStorageService, onlineStatus, widget, PouchDB){

  // Variables de Inicio
  var map;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.userId = auth.userId;
  $scope.nuevoLote = "";
  $scope.onlineStatus = onlineStatus;
  $scope.user_Ided = auth.userId();
  $('.switch').css("color", "#FFF");

  // Get all widget
  widget.getAll().then(function(data)
     {
       $scope.widget = data;

     });

    //Create the pouchDB if not Exist in Local when the app is run.otherwise sync the local data to server;
    PouchDB.CreatePouchDB();

    // Verificando el status del app
    $scope.$watch('onlineStatus.isOnline()', function (online) {
        $scope.online_status_string = online ? 'online' : 'offline';
        onlineStatus = $scope.online_status_string

    });

    // Función para visualizar variedades
    console.log("online: ");
    console.log($rootScope.IsInternetOnline);

    if ($rootScope.IsInternetOnline) {

        console.log("app online...");

        methodsGallo.get().then(function(methodsGallo){
           var methGallo = methodsGallo.data[0];
           localStorageService.set("methodsGallo", methGallo)
        });

        methods.get().then(function(methods){
          var methRoya = methods.data[0];
          localStorageService.set("methodsRoya", methRoya)
        });
    }
    // else {
    //     console.log("app offline");
    //     console.log("Versión prueba de fallos");
    //
    //     PouchDB.GetVarietiesFromPouchDB().then(function (result) {
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
    //                 var variedadesArray = [];
    //                 for (var i = 0; i < doc.list.length; i++) {
    //                     variedadesArray.push(doc.list[i]);
    //                 }
    //                 $scope.variedades = variedadesArray;
    //                 console.log("Data-- ");
    //                 console.log($scope.variedades);
    //
    //             }
    //         }
    //     }).catch(function(err) {
    //         console.log("error al obtener datos");
    //         console.log(err);
    //     });
    // }


    // Opciones de Formulario Nueva Unidad - Fungicidas
    $scope.yesNoSelectionChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.fungicidas.contacto = false : $scope.editUnit.fungicidas.contacto = false;
        (type == "newUnit") ? $scope.newUnit.fungicidas.bourbon = false : $scope.editUnit.fungicidas.bourbon = false;
        (type == "newUnit") ? $scope.newUnit.fungicidas.catuai = false : $scope.editUnit.fungicidas.catuai = false;
        (type == "newUnit") ? $scope.newUnit.fungicidas.sistemico = false : $scope.editUnit.fungicidas.sistemico = false;
        (type == "newUnit") ? $scope.newUnit.fungicidas.biologico = false : $scope.editUnit.fungicidas.biologico = false;
        $scope.resetFungicidasSelection(type, true, true, true);
    }
    $scope.FungicidOptionsChange = function (type, optionType) {
        switch (optionType) {
            case "contacto":
                if ($scope.newUnit.fungicidas.contacto == false) {
                    $scope.resetFungicidasSelection(type, true, false, false);
                }
                break;
            case "sistemico":
                if ($scope.newUnit.fungicidas.sistemico == false) {
                    $scope.resetFungicidasSelection(type, false, false, true);
                }
                break;
            case "biologico":
                if ($scope.newUnit.fungicidas.biologico == false) {
                    $scope.resetFungicidasSelection(type, false, true, false);
                }
                break;
            default:
                break;
        }
    }

    // Opciones de Formulario Nueva Unidad - Nitrogeno
    $scope.yesNoNitrogenoChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.quetipo = '' : $scope.editUnit.quetipo = '';
        (type == "newUnit") ? $scope.newUnit.nitrorealiza = [] : $scope.editUnit.nitrorealiza = []
    }

    // Opciones de Formulario Nueva Unidad - Tipo de Agua
    $scope.yesNoVerificiaAcquaChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.verificaAguaTipo.ph = false : $scope.editUnit.verificaAguaTipo.ph = false;
        (type == "newUnit") ? $scope.newUnit.verificaAguaTipo.dureza = false : $scope.editUnit.verificaAguaTipo.dureza = false;
    }

    // Opciones de Formulario Nueva Unidad - Manejo de Tejido
    $scope.yesNomanejoTejidoChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.manejoTejidoMes = [] : $scope.editUnit.manejoTejidoMes = []
    }

    // Opciones de Formulario Nueva Unidad - Enmiendas de Suelo
    $scope.yesNoenmiendasSueloChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.enmiendasSueloMes = [] : $scope.editUnit.enmiendasSueloMes = []
    }

    // Opciones de Formulario Nueva Unidad - Fertilizar Follaje
    $scope.yesNofertilizaFollajeChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.fertilizaFollajeMes = [] : $scope.editUnit.fertilizaFollajeMes = []
    }

    // Opciones de Formulario Nueva Unidad - Fertilizar Suelo
    $scope.yesNofertilizaSueloChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.fertilizaSueloMes = [] : $scope.editUnit.fertilizaSueloMes = []
    }

    // Opciones de Formulario Nueva Unidad - Muestreo
    $scope.yesNomuestreoChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.muestreoMes = [] : $scope.editUnit.muestreoMes = []
    }

    $scope.CheckboxBasedMonthChange = function (type, optionName) {
        switch (optionName) {
            case 'contactoOptions.caldovicosa':
                (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptionsMonths.caldovicosa = '' : $scope.editUnit.fungicidas.contactoOptionsMonths.caldovicosa = '';
                break;
            case 'contactoOptions.caldobordeles':
                (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptionsMonths.caldobordeles = '' : $scope.editUnit.fungicidas.contactoOptionsMonths.caldobordeles = '';
                break;
            case 'contactoOptions.otrocual':
                (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptionsMonths.otrocual = '' : $scope.editUnit.fungicidas.contactoOptionsMonths.otrocual = '';
                break;
            case 'sistemicoOptions.opus':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.opus = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.opus = '';
                break;
            case 'sistemicoOptions.opera':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.opera = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.opera = '';
                break;
            case 'sistemicoOptions.esferamax':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.esferamax = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.esferamax = '';
                break;
            case 'sistemicoOptions.amistarxtra':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.amistarxtra = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.amistarxtra = '';
                break;
            case 'sistemicoOptions.alto10':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.alto10 = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.alto10 = '';
                break;
            case 'sistemicoOptions.silvacur':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.silvacur = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.silvacur = '';
                break;
            case 'sistemicoOptions.verdadero':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.verdadero = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.verdadero = '';
                break;
            case 'sistemicoOptions.otrocual':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.otrocual = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.otrocual = '';
                break;
            case 'sistemicoOptions.mancuerna':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.mancuerna = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.mancuerna = '';
                break;
            case 'sistemicoOptions.caporal':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.caporal = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.caporal = '';
                break;
            case 'sistemicoOptions.halt':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.halt = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.halt = '';
                break;
            case 'sistemicoOptions.astrostarxtra':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.astrostarxtra = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.astrostarxtra = '';
                break;
            case 'sistemicoOptions.tutela':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.tutela = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.tutela = '';
                break;
            case 'sistemicoOptions.halconextra':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.halconextra = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.halconextra = '';
                break;
            case 'sistemicoOptions.beken':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.beken = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.beken = '';
                break;
            case 'sistemicoOptions.estrobirulina':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.estrobirulina = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.estrobirulina = '';
                break;
            case 'sistemicoOptions.otro':
                (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.otro = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.otro = '';
                break;
            case 'biologicalOptions.verticiliumlecanii':
                (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptionsMonths.verticiliumlecanii = '' : $scope.editUnit.fungicidas.biologicalOptionsMonths.verticiliumlecanii = '';
                break;
            case 'biologicalOptions.bacilussutillis':
                (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptionsMonths.bacilussutillis = '' : $scope.editUnit.fungicidas.biologicalOptionsMonths.bacilussutillis = '';
                break;
            case 'biologicalOptions.otrocual':
                (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptionsMonths.otrocual = '' : $scope.editUnit.fungicidas.biologicalOptionsMonths.otrocual = '';
                break;

            default:
                break;
        }

    }

    // Reseteo de Fungicidas
    $scope.resetFungicidasSelection = function (type, isResetfungicidasContactoOptions, isResetfungicidasBiologicalOptions, isResetSistemicOptions) {
        if (isResetfungicidasContactoOptions) {
            (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptions.caldovicosa = false : $scope.editUnit.fungicidas.contactoOptions.caldovicosa = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptions.caldobordeles = false : $scope.editUnit.fungicidas.contactoOptions.caldobordeles = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptions.otrocual = false : $scope.editUnit.fungicidas.contactoOptions.otrocual = false;

            (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptionsMonths.caldovicosa = '' : $scope.editUnit.fungicidas.contactoOptionsMonths.caldovicosa = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptionsMonths.caldobordeles = '' : $scope.editUnit.fungicidas.contactoOptionsMonths.caldobordeles = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.contactoOptionsMonths.otrocual = '' : $scope.editUnit.fungicidas.contactoOptionsMonths.otrocual = '';

        }
        if (isResetfungicidasBiologicalOptions) {
            (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptions.verticiliumlecanii = false : $scope.editUnit.fungicidas.biologicalOptions.verticiliumlecanii = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptions.bacilussutillis = false : $scope.editUnit.fungicidas.biologicalOptions.bacilussutillis = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptions.otrocual = false : $scope.editUnit.fungicidas.biologicalOptions.otrocual = false;

            (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptionsMonths.verticiliumlecanii = '' : $scope.editUnit.fungicidas.biologicalOptionsMonths.verticiliumlecanii = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptionsMonths.bacilussutillis = '' : $scope.editUnit.fungicidas.biologicalOptionsMonths.bacilussutillis = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.biologicalOptionsMonths.otrocual = '' : $scope.editUnit.fungicidas.biologicalOptionsMonths.otrocual = '';

        }
        if (isResetSistemicOptions) {
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.opus = false : $scope.editUnit.fungicidas.sistemicoOptions.opus = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.opera = false : $scope.editUnit.fungicidas.sistemicoOptions.opera = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.esferamax = false : $scope.editUnit.fungicidas.sistemicoOptions.esferamax = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.amistarxtra = false : $scope.editUnit.fungicidas.sistemicoOptions.amistarxtra = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.alto10 = false : $scope.editUnit.fungicidas.sistemicoOptions.alto10 = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.silvacur = false : $scope.editUnit.fungicidas.sistemicoOptions.silvacur = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.verdadero = false : $scope.editUnit.fungicidas.sistemicoOptions.verdadero = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.otrocual = false : $scope.editUnit.fungicidas.sistemicoOptions.otrocual = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.mancuerna = false : $scope.editUnit.fungicidas.sistemicoOptions.mancuerna = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.caporal = false : $scope.editUnit.fungicidas.sistemicoOptions.caporal = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.halt = false : $scope.editUnit.fungicidas.sistemicoOptions.halt = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.astrostarxtra = false : $scope.editUnit.fungicidas.sistemicoOptions.astrostarxtra = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.tutela = false : $scope.editUnit.fungicidas.sistemicoOptions.tutela = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.halconextra = false : $scope.editUnit.fungicidas.sistemicoOptions.halconextra = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.beken = false : $scope.editUnit.fungicidas.sistemicoOptions.beken = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.estrobirulina = false : $scope.editUnit.fungicidas.sistemicoOptions.estrobirulina = false;
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptions.otro = false : $scope.editUnit.fungicidas.sistemicoOptions.otro = false;

            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.opus = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.opus = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.opera = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.opera = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.esferamax = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.esferamax = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.amistarxtra = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.amistarxtra = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.alto10 = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.alto10 = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.silvacur = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.silvacur = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.verdadero = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.verdadero = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.otrocual = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.otrocual = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.mancuerna = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.mancuerna = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.caporal = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.caporal = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.halt = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.halt = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.astrostarxtra = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.astrostarxtra = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.tutela = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.tutela = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.halconextra = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.halconextra = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.beken = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.beken = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.estrobirulina = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.estrobirulina = '';
            (type == "newUnit") ? $scope.newUnit.fungicidas.sistemicoOptionsMonths.otro = '' : $scope.editUnit.fungicidas.sistemicoOptionsMonths.otro = '';

        }
    }

    if (auth.isLoggedIn()) {


      PouchDB.GetUserDataFromPouchDB(auth.userId()).then(function (result) {
        if (result.status == 'fail') {
          $scope.error = result.message;
          console.log("Error de Main", $scope.error);
        }
        else if (result.status == 'success') {
          $scope.userO7 = result.data;
        }
      });


      // Muestro el listado de unidades en Home
      PouchDB.GetAllUserUnit(auth.userId()).then(function (result) {
          if (result.status == 'fail') {
              $scope.error = result.message;
          }
          else if (result.status == 'success') {
            $rootScope.cantUnidades = result.data.length;
            $scope.units = result.data;
            console.log('local mode:', result.data);
          }
      });
    }

    // Variable Día en español
    var spanishDateTimePickerOption = {
        // Strings and translations
        monthsFull: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
        monthsShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
        weekdaysFull: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
        weekdaysShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
        showMonthsShort: undefined,
        showWeekdaysFull: undefined,

        // Buttons
        today: 'Hoy',
        clear: 'limpiar',
        close: 'Cerrar',

        // Accessibility labels
        labelMonthNext: 'Sig&#x3E;',
        labelMonthPrev: '&#x3C;Ant',
        labelMonthSelect: 'Seleccione un mes',
        labelYearSelect: 'Seleccione un año',
    }


    $(".date-field").pickadate(spanishDateTimePickerOption);


    // Funcion del Mapa
    function wait(ms) {
        var start = new Date().getTime();
        var end = start;
        while (end < start + ms) {
            end = new Date().getTime();
        }
    }

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
                  map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

                  map1 = new google.maps.Map(document.getElementById("map-canvas1"), myOptions);

                  var marker = new google.maps.Marker({
                      draggable: true,
                      position: myLatlng,
                      map: map,
                      title: "Your location"
                  });

                  var marker1 = new google.maps.Marker({
                      draggable: true,
                      position: myLatlng,
                      map: map1,
                      title: "Your location"
                  });


                  google.maps.event.addListener(marker, 'dragend', function (event) {

                      $scope.newUnit.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
                      document.getElementById('latlongid').value = event.latLng.lat() + ',' + event.latLng.lng();
                      console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());

                  });

                  google.maps.event.addListener(marker1, 'dragend', function (event) {

                      placeMarker(event.latLng);
                      $scope.editUnit.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
                      document.getElementById('latlongid1').value = event.latLng.lat() + ',' + event.latLng.lng();
                      console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());

                  });



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
                        $scope.editUnit.lote[index].georeferenciacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
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
          map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

          map1 = new google.maps.Map(document.getElementById("map-canvas1"), myOptions);



          var marker = new google.maps.Marker({
              draggable: true,
              position: myLatlng,
              map: map,
              title: "Your location"
          });

          var marker1 = new google.maps.Marker({
              draggable: true,
              position: myLatlng,
              map: map1,
              title: "Your location"
          });

          google.maps.event.addListener(marker, 'dragend', function (event) {

              $scope.newUnit.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
              document.getElementById('latlongid').value = event.latLng.lat() + ',' + event.latLng.lng();
              console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());

          });

          google.maps.event.addListener(marker1, 'dragend', function (event) {

              placeMarker(event.latLng);
              $scope.editUnit.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
              document.getElementById('latlongid1').value = event.latLng.lat() + ',' + event.latLng.lng();
              console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());

          });

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
            $scope.editUnit.lote[index].georeferenciacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
            document.getElementById('latlongid' + indString).value = event.latLng.lat() + ',' + event.latLng.lng();
            console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());


            });
          }
          google.maps.event.addDomListener(window, 'load', initialize);

      }
    }

    // Función Aceptar cierre
    $scope.AceptarCierre = function(type){
      if (type == "Lote") {
        console.log("Cerré lote");
        $scope.nuevoLote = "";
        $scope.preguntar = 0;
      }
      else if (type == "Unidad"){
        console.log("Cerré Unidad");
        $scope.preguntar = 0;
        $scope.$broadcast('CLOSEUNIT', { unitId: -1 });
      }
      return
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

    // Funcion para eliminar lote
    $scope.eliminarLote = function (index){
      if($scope.editUnit.lote!=undefined){
        $scope.SweetAlert("¡Lote Eliminado!", "Presione Salvar Cambios para eliminar definitivamente.", "warning");
        $scope.editUnit.lote.splice(index,1);
      }
    }

    //Función SweetAlert para mensajes Warning en Modals
    $scope.SweetAlertCierre = function(modal, type){

        swal({
            title: "¿Desea Cerrar?",
            text: "Está seguro que desea salir.",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText:  'Cancelar'
        },
        function(isConfirm) {
          console.log(isConfirm);
          if (isConfirm) {
            $(modal).modal('hide');
            $scope.AceptarCierre(type)
          } else {
            $scope.valor = "Cancelar";
          }
        });
        return

    }

    // Funcion de Confirmación de Cierre para Modal Lotes
    $scope.confirmarcierre = function($event){

      // SweetAlert para confirmar cierre
      $scope.SweetAlertCierre('#myModal3', "Lote");

      if($scope.valor != "Aceptar"){
          $event.stopPropagation();
      }else if ($scope.valor == "Cancelar"){
          console.log("Confirmar Cierre - Cancelar");
          $scope.nuevoLote = "";
          $scope.preguntar = 0;
      }
    }

    // Función para ubicar el marcador según locación
    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            draggable: true,
            map: map
        });

        map.setCenter(location);
    }

    $scope.toggle = false;

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

            $('#myModal, #myModal2').on('hidden.bs.modal', function (e) {
        $scope.toggle = false;
        $(nomclass).collapse('hide');
       });

        } else {
          $('#map-canvas > div, #map-canvas > div').remove();
          console.log('map offline');
        }
    }



    // Funcion para Cerrar Unidad
    $scope.CloseUnit = function ($event) {


      // SweetAlert para confirmar cierre
      $scope.SweetAlertCierre('#myModal2', "Unidad");

      if($scope.valor != "Aceptar"){
          console.log("Close Unit - Aceptar");
          $event.stopPropagation();
      }else if ($scope.valor == "Cancelar"){
        console.log("Close Unit - Cancelar");
        $scope.preguntar = 0;
        $scope.$broadcast('CLOSEUNIT', { unitId: -1 });
      }
      $scope.valor = "";
    }

    // Funcion al cargar la app
    $scope.onLoad = function() {
      console.log("------------------------------");
      console.log("Inicia el Home....");
      console.log("------------------------------");
      $scope.listo = 0;
      document.addEventListener("deviceready", onDeviceReady, false);

      $('#myModal').on('shown.bs.modal', function (e) {
         $scope.preguntar = 1;
         if ($scope.listo == 1){
          document.addEventListener("backbutton", onBackKeyDown, false);
        }
      });
      $('#myModal2').on('shown.bs.modal', function (e) {
        $scope.preguntar = 2;
        if ($scope.listo == 1){
          document.addEventListener("backbutton", onBackKeyDown, false);
        }
      });
      $('#myModal3').on('shown.bs.modal', function (e) {
         $scope.preguntar = 3;
        if ($scope.listo == 1){
          document.addEventListener("backbutton", onBackKeyDown, false);
        }
       });

      $('#myModal').on('hidden.bs.modal', function (e) {
        $scope.preguntar = 0;
      });
      $('#myModal2').on('hidden.bs.modal', function (e) {
        $scope.preguntar = 0;
      });
      $('#myModal3').on('hidden.bs.modal', function (e) {
        $scope.preguntar = 0;
      });
      $('.close').on('click', function (e) {
        $scope.preguntar = 0;
        $scope.nuevoLote = "";
      });
    }

    // device APIs are available
    function onDeviceReady() {
      // Register the event listener
      console.log("--------------------------------inicializado");
      $scope.listo = 1;
      document.addEventListener("backbutton", onBackKeyDown, false);
      document.addEventListener("offline", onOffline, false);
      document.addEventListener("online", onOnline, false);
    }

    function onOffline() {
       $rootScope.IsInternetOnline = false;
    }

    function onOnline() {
        $rootScope.IsInternetOnline = true;
    }

    function onBackKeyDown() {
      if (($scope.preguntar != 0) && ($scope.preguntar != undefined) ){
        var a = confirm("¿Desea cerrar?")
        if(a == true){
          if ($scope.listo == 1){
            document.removeEventListener("backbutton", onBackKeyDown, false);
          }
          if ($scope.preguntar == 1){
             $('#myModal').modal('hide');
          }
          if ($scope.preguntar == 2){
             $('#myModal2').modal('hide');
          }
          if ($scope.preguntar == 3){
             $('#myModal3').modal('hide');
          }
          $scope.preguntar = 0;
        }
      }
    }


    $scope.someSelected = function (object) {
          return Object.keys(object).some(function (key) {
            return object[key];
          });
        }



    // Funcion Editar Unidad
    $scope.EditOldUnit = function (unit) {

        // $('.map').collapse('hide');
        console.log("Edito Unidad: " + unit.nombre);
        $scope.unitopmessage = null
        $scope.modalText = "Editar: " + unit.nombre;
        $scope.$broadcast('MANAGEUNIT', { unitId: unit._id });
        $("#departamentos .optionVacio").remove();
        $("#myModal2").modal('show');
        $('#formulariocompleto').css('display','block');
        $('#menssageLocation').css("display", "none");
        $('#menssageAltitud').css("display", "none");

    }

    //Funcion de peticion Ajax 1
    $scope.ajaxRequest = function (){
      $http.get('http://meteorologia.anacafe.org/clima/api/estaciones/100/ultima').success(function(respuesta){
        console.log("res:", respuesta);
        //vm.paises = respuesta;
      });
    }


    // Metodo Añadir Unidad
    $scope.$on('UNITADDED', function (e, args) {
      console.log($scope.units);
      console.log(args.unit);
        $scope.units.push(args.unit);
        if ($rootScope.IsInternetOnline) {
            PouchDB.SynServerDataAndLocalData().then(function () {
                console.log('Unidad agregada exitosamente!');
                console.log("sync successfully.");
                $scope.unitopmessage = "Unidad agregada exitosamente!";


            }).catch(function (err) {
                console.log("Not able to sync" + error);
                //$scope.ResetNewUnit();
            });
        }
        else {
            //$scope.ResetNewUnit();
        }
    });

    // Metodo Editar Unidad
    $scope.$on('UNITEDITED', function (e, args) {
        for (var i = 0 ; i < $scope.units.length; i++) {
            if ($scope.units[i]._id == args.unit._id) {
                $scope.units[i] = args.unit;
                break;
            }
        }
        if ($rootScope.IsInternetOnline) {
            PouchDB.SynServerDataAndLocalData().then(function () {
                console.log("sync successfully.");
                $scope.unitopmessage = "Unit edited successfully";
            }).catch(function (err) {
                console.log("Not able to sync" + error);
            });
        }
    });

    if ($rootScope.IsInternetOnline) {
        var promesa = PouchDB.SynServerDataAndLocalData();
        if(promesa!=false){
            promesa.then(function () {
                console.log("sync successfully.");
            }).catch(function (err) {
                console.log("Not able to sync" + error);
            });
        }
    }


    // Unit related code an it should be removed from here to have batter code
    var isunitrelatedcode = true;

    // Inicializamos una Nueva Unidad
    if (isunitrelatedcode) {
        $scope.newUnit = {
            PouchDBId: '',
            EntityType: 'Unit',
            LastUpdatedDateTime: '',
            isDeleted: false,
            sombra: false,
            lote: [],
            muestreo: false,
            muestreoMes: [],
            fertilizaSuelo: false,
            fertilizaSueloMes: [],
            fertilizaFollaje: false,
            fertilizaFollajeMes: [],
            enmiendasSuelo: false,
            enmiendasSueloMes: [],
            manejoTejido: false,
            manejoTejidoMes: [],
            fungicidasRoya: false,
            verificaAgua: false,
            nitrogeno: false,
            nitrorealiza: [],
            sacos: '',
            realizapoda: false,
            realizamonth: '',
            quetipo: '',
            enfermedades: false,
            cyprosol: true,
            cyprosoldate: '',
            atemi: true,
            atemidate: '',
            esfera: true,
            esferadate: '',
            opera: true,
            operadate: '',
            opus: true,
            opusdate: '',
            soprano: true,
            sopranodate: '',
            hexalon: true,
            hexalondate: '',
            propicon: true,
            propicondate: '',
            hexil: true,
            hexildate: '',
            otros: true,
            otrosdate: '',
            fungicidasmonth: '',
            produccionhectarea: '',
            distanciamientoCalle:'',
            distanciamientoAvenida:'',
            variedad: {},
            typeOfCoffeProducessOptionSelected: [],
            fungicidas: {
                contacto: false,
                bourbon: false,
                catuai: false,
                biologico: false,
                sistemico: false,
                contactoOptionsMonths: {
                    caldovicosa: '',
                    caldobordeles: '',
                    otrocual: '',
                },
                contactoOptions: {
                    caldovicosa: false,
                    caldobordeles: false,
                    otrocual: false,
                    cual: '',
                },

                biologicalOptionsMonths: {
                    verticiliumlecanii: '',
                    bacilussutillis: '',
                    otrocual: '',

                },
                biologicalOptions: {
                    verticiliumlecanii: false,
                    bacilussutillis: false,
                    otrocual: false,
                    cual: '',
                },
                sistemicoOptionsMonths: {
                    opus: '',
                    opera: '',
                    esferamax: '',
                    amistarxtra: '',
                    alto10: '',
                    silvacur: '',
                    verdadero: '',
                    otrocual: '',
                    mancuerna: '',
                    caporal: '',
                    halt: '',
                    astrostarxtra: '',
                    tutela: '',
                    halconextra: '',
                    beken: '',
                    estrobirulina: '',
                    otro: '',
                },
                sistemicoOptions: {
                    opus: false,
                    opera: false,
                    esferamax: false,
                    amistarxtra: false,
                    alto10: false,
                    silvacur: false,
                    verdadero: false,
                    otrocual: false,
                    mancuerna: false,
                    caporal: false,
                    halt: false,
                    astrostarxtra: false,
                    tutela: false,
                    halconextra: false,
                    beken: false,
                    estrobirulina: false,
                    otro: false,
                    cual: '',
                }

            },
            verificaAguaTipo: {
                ph: false,
                dureza: false
            },
            rendimiento: '',
            rendimientoAnterior:'',
            tipoCafe: {
                estrictamenteDuro: true,
                duro: false,
                semiduro: false,
                prime: false,
                extraprime: false
            },
        };

        $scope.MonthDropDownOptions = [
          { name: 'Enero', displayValue: 'Enero' },
          { name: 'Febrero', displayValue: 'Febrero' },
          { name: 'Marzo', displayValue: 'Marzo' },
          { name: 'Abril', displayValue: 'Abril' },
          { name: 'Mayo', displayValue: 'Mayo' },
          { name: 'Junio', displayValue: 'Junio' },
          { name: 'Julio', displayValue: 'Julio' },
          { name: 'Agosto', displayValue: 'Agosto' },
          { name: 'Septiembre', displayValue: 'Septiembre' },
          { name: 'Octubre', displayValue: 'Octubre' },
          { name: 'Noviembre', displayValue: 'Noviembre' },
          { name: 'Diciembre', displayValue: 'Diciembre' }
        ];

        $scope.initNewUnit = angular.copy($scope.newUnit);

        $scope.editUnit = angular.copy($scope.newUnit);

        $scope.ResetNewUnit = function () {
          $scope.newUnit = angular.copy($scope.initNewUnit);
        }

        $scope.typesOfCoffeSelectionOptions = [
          { name: 'EstrictamenteDuro', displayValue: 'Estrictamente Duro' },
          { name: 'Duro', displayValue: 'Duro' },
          { name: 'Semiduro', displayValue: 'Semiduro' },
          { name: 'Prime', displayValue: 'Prime' },
          { name: 'ExtraPrime', displayValue: 'ExtraPrime' },
          { name: 'Nose', displayValue: 'No Sé' }];


        // Funcion Añadir Nueva Unidad
        $scope.AddNewUnit = function () {
            console.log($scope.newUnit);
            // $("#departamentos option[value=undefined]").attr("selected",true);
            // $("#departamentos").empty().append('');
            // $("#departamentos").css("border", "1px  solid red");
            $scope.unitopmessage = null
            $scope.modalText = "Nueva Unidad";
            $scope.$broadcast('MANAGEUNIT', { unitId: -1 });
            $("#myModal2").modal('show');
            $("#formulariocompleto").css("display", "block");
            $("#departamentos .optionVacio").remove();
        }


       // Funcion para Actualizar Unidad
       $scope.updateUnit = function (e, id) {
         $scope.sucMsg = null;
         //Commented out as we need to update data from pouchDB only,that will be sync to server
         //if ($rootScope.IsInternetOnline) {
         //    unit.get(auth.userId(), id).then(function (unitD) {

         //        $scope.editUnit = unitD;

         //        console.log($scope.editUnit);
         //        $('#myModal3').on('shown.bs.modal', function (e) {
         //            $('.collapse').collapse('hide');
         //        });
         //        $scope.prependItem = function (newItem) {

         //            $scope.editUnit.lote.unshift(newItem);
         //        };

         //        $scope.updateUnitForm = function () {
         //            if ($scope.updateunitForm.$valid) {
         //                unit.update(id, auth.userId(), $scope.editUnit).then(function (unitN) {
         //                    user.get($scope.user_Ided).then(function (user) {
         //                        $scope.userO = user;
         //                        $scope.units = $scope.userO.units;
         //                    });
         //                    $scope.editUnit = {};
         //                    console.log("return  updated data=" + JSON.stringify(unitN.data));
         //                    $scope.editUnit = unitN.data;
         //                    $scope.sucMsg = '¡Unidad Actualizada exitosamente!';
         //                });
         //            }
         //        }
         //    });
         //} else {
         //    //region to get unit from local PouchDB instead of server
         //    PouchDB.GetUnit(id, auth.userId()).then(function (result) {
         //        if (result.status == 'fail') {
         //            $scope.error = result.message;
         //        }
         //        else if (result.status == 'success') {
         //            $scope.editUnit = result.data;
         //            $('#myModal3').on('shown.bs.modal', function (e) {
         //                $('.collapse').collapse('hide');
         //            });


         //            $scope.prependItem = function (newItem) {

         //                $scope.editUnit.lote.push(newItem);

         //            };
         //        }
         //    });
         //}
         PouchDB.GetUnit(id, auth.userId()).then(function (result) {
             if (result.status == 'fail') {
                 $scope.error = result.message;
             }
             else if (result.status == 'success') {
                 $scope.editUnit = result.data;
                 $('#myModal3').on('shown.bs.modal', function (e) {
                    $(".cargandoUbicacionLote").css("display", "none");
                    $(".cargandoAltitudLote").css("display", "none");
                    $('.collapse').collapse('hide');
                 });


                 console.log($scope.editUnit);

                 $scope.mensajeUbicacionLote = "#messageLocationLote";
                 $scope.mensajeAltitudLote = "#messageAltitudLote";

                 // for (var i = 0; i < $scope.editUnit.lote.length; i++) {
                 //   $scope.mensaje = $scope.mensaje + i.toString();
                 //   console.log($scope.mensaje);
                 //   $($scope.mensaje).css("display", "none");
                 //   $scope.mensaje = "#menssageLocationLote";
                 // }

                 $scope.prependItem = function () {

                   $('#nuevoLote').attr("disabled");
                   var coordenadas = "";
                   var altitud = "";
                   var ubicacionLote = ".latLongLoteId" + $scope.editUnit.lote.length.toString();
                   var altitudLote = "#altitudLoteId" + $scope.editUnit.lote.length.toString();
                   $scope.mensajeUbicacionLote = "#messageLocationLote" + $scope.editUnit.lote.length.toString();
                   $scope.mensajeAltitudLote = "#messageAltitudLote" + $scope.editUnit.lote.length.toString();

                     var newItem = {
                         nombre: ""
                     }
                      // $('#menssageLocationLote').css("display", "block");
                     if (navigator.geolocation) {
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
                               $scope.editUnit.lote[$scope.editUnit.lote.length - 1].altitud = altitud;
                               console.log($scope.editUnit.lote);
                               $(altitudLote).val(altitud);
                             }

                             // Mostramos la Geolocalización
                             $scope.editUnit.lote[$scope.editUnit.lote.length - 1].georeferenciacion = coordenadas;
                             console.log($scope.editUnit.lote);
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

                     $scope.editUnit.lote.push(newItem);

                     return true;
                 };
             }
         });
       }


       // Funcion para colapsar el bloque Lote al añadirlo
       $scope.collapseLote = function (index) {
         console.log("Entre a Collapse");
         // Elemento 1
         elemento1='#opLote-';

         // Elemento 2
         elemento2='#collapse-';

         // console.log("Nuevo Lote ", $scope.nuevoLote);

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
       $scope.updateUnitForm = function ($event, index, loteIndex ) {


         var index = loteIndex.length - 1;

         console.log("Entre a la Funcion Lote - Index --> ", index);
         console.log(loteIndex);

         //if (index >= 0) {

             if ($scope.updateunitFormlote.$valid) {

                 console.log("Formulario de Lote Valido");

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
                 console.log(clase);
                 console.log($scope.editUnit);
                 PouchDB.EditUnitLotes($scope.editUnit, auth.userId()).then(function (result) {
                     console.log("Entre a Pouch");
                     console.log(result);
                     if (result.status == 'fail') {
                         $scope.error = result.message;
                     }
                     else if (result.status == 'success') {
                         $scope.editUnit = result.data;
                         var collapseLote = $scope.collapseLote(index, $scope.nuevoLote);
                         if (collapseLote == "Nuevo") {
                           $scope.SweetAlert("¡Excelente!", "Lote Guardado", "success");
                         }else if (collapseLote == "Editado") {
                           $scope.SweetAlert("¡Excelente!", "Lote Actualizado", "success");
                         }
                         $scope.nuevoLote = "";
                         $scope.sucMsg = '¡Unidad Actualizada exitosamente!';
                         for (var i = 0 ; i < $scope.units.length; i++) {
                             console.log('$Scope Units ' + i + ' = ',  $scope.units[i]);
                             if ($scope.units[i]._id == $scope.editUnit._id) {
                                 $scope.units[i] = $scope.editUnit;
                                 break;
                             }
                         }
                         if ($rootScope.IsInternetOnline) {
                             PouchDB.SynServerDataAndLocalData().then(function () {
                                 console.log("sync successfully.");
                             }).catch(function (err) {
                                 console.log("Not able to sync" + error);
                             });
                         }
                         $scope.nuevoLote = "";
                     }
                     //$('#myModal3').modal('hide');
                     //  $('#myModal3').modal('show');
                     // $scope.nuevoLote = "";
                 });
             }
             else {
                 $scope.SweetAlert("Error", "Complete los campos", "error");
             }
         /*}
         else{
           $scope.SweetAlert("Error", "Lote Invalido", "error");
         }*/
     }

     // Funcion Guardar Unidad
     $scope.saveUnit = function () {

       if ($scope.newunitForm.$valid) {
         /*For sync fied ,as new record will always have sync property false until it is' sync by local db' */

         /*Sync */

         $scope.newUnit.departamento = $("#departamentos option:selected").text();
         $scope.newUnit.municipio = $("#departamentos-munis option:selected").text();

         $scope.newUnit.lat = $('[name="lat"]').val();
         $scope.newUnit.lng = $('[name="lng"]').val();

         //Commented out as we need to add unit to pouchDB only,that will be sync to server

         //if ($rootScope.IsInternetOnline) {

         //    unit.create($scope.newUnit, auth.userId()).error(function (error) {
         //        $scope.error = error;
         //    }).then(function (data) {
         //        console.log("mongoDB written data=" + JSON.stringify(data.data));
         //        $scope.userO7.units.push(data.data);
         //        $('#myModal2').modal('hide');
         //        $scope.ResetNewUnit();
         //        if ($rootScope.IsInternetOnline) {
         //            PouchDB.SynServerDataAndLocalData().then(function () {
         //                console.log("sync successfully.");
         //            }).catch(function (err) {
         //                console.log("Not able to sync" + error);
         //            });
         //        }
         //    });
         //} else {
         //    console.log('savelocal');
         //    //region to create unit in local PouchDB instead of server
         //    PouchDB.AddUnit($scope.newUnit, auth.userId()).then(function (result) {
         //        if (result.status == 'fail') {
         //            $scope.error = result.message;
         //        }
         //        else if (result.status == 'success') {
         //            delete result.data["type"];
         //            $scope.units.push(result.data)
         //            $('#myModal2').modal('hide');
         //            $scope.ResetNewUnit();
         //            //PouchDB.CreatePouchDB();

         //            if ($rootScope.IsInternetOnline) {
         //                PouchDB.SynServerDataAndLocalData().then(function () {
         //                    console.log("sync successfully.");
         //                }).catch(function (err) {
         //                    console.log("Not able to sync" + error);
         //                });
         //            }
         //        }
         //    });
         //    //endregion
         //}
         PouchDB.AddUnit($scope.newUnit, auth.userId()).then(function (result) {
             if (result.status == 'fail') {
                 $scope.error = result.message;
             }
             else if (result.status == 'success') {
                 delete result.data["type"];
                 $scope.units.push(result.data);
                 $('#myModal2').modal('hide');
                 if ($rootScope.IsInternetOnline) {
                     PouchDB.SynServerDataAndLocalData().then(function () {
                         console.log("sync successfully.");
                         $scope.ResetNewUnit();
                     }).catch(function (err) {
                         console.log("Not able to sync" + error);
                         $scope.ResetNewUnit();
                     });
                 }
                 else {
                     $scope.ResetNewUnit();
                 }
                 // limpiamos calendarios
                 $('.data-field').datepicker('setDate', null);
                 $('.picker__day').removeClass('picker__day--selected');
                 $('.picker__day').removeClass('picker__day--highlighted');
                 $('.picker__day').removeAttr('aria-selected');
                 $('.picker__day').removeAttr('aria-activedescendant');
             }
         });
       } else {}
     }


     // Funcion para Eliminar Unidad
     $scope.deleteUnit = function (e, id, index) {

       //if ($rootScope.IsInternetOnline) {
       //    unit.deleteUnit(id, auth.userId()).then(function (user) {
       //        $scope.userO.units.splice(index, 1);
       //        $scope.units.splice(index, 1);
       //        if ($rootScope.IsInternetOnline) {
       //            PouchDB.SynServerDataAndLocalData().then(function () {
       //                console.log("sync successfully.");
       //            }).catch(function (err) {
       //                console.log("Not able to sync" + error);
       //            });
       //        }
       //    });
       //} else {
       //    //region to delete units in local PouchDB instead of server
       //    PouchDB.DeleteUnit(id, auth.userId()).then(function (result) {
       //        console.log("\n result deleted=" + JSON.stringify(result));
       //        if (result.status == 'fail') {
       //            $scope.error = result.message;
       //            console.log($scope.error);
       //        }
       //        else if (result.status == 'success') {
       //            $scope.units.splice(index, 1);
       //        }
       //    });
       //    //endregion
       //}

       // SweetAlert para eliminar unidad

       swal({
           title: "Eliminar Unidad",
           text: "¿Esta seguro que desea eliminar esta unidad?",
           type: "warning",
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           cancelButtonColor: '#d33',
           confirmButtonText: 'Aceptar',
           cancelButtonText:  'Cancelar'
       },
       function(isConfirm) {
         if (isConfirm) {
           PouchDB.DeleteUnit(id, auth.userId()).then(function (result) {

               if (result.status == 'fail') {
                   $scope.error = result.message;
                   console.log($scope.error);
               }
               else if (result.status == 'success') {
                   $scope.units.splice(index, 1);
                   if ($rootScope.IsInternetOnline) {
                       PouchDB.SynServerDataAndLocalData().then(function () {
                           console.log("sync successfully.");
                       }).catch(function (err) {
                           console.log("Not able to sync" + error);
                       });
                   }
               }
           });
         }
       })

       /*if (confirm('')) {


           PouchDB.DeleteUnit(id, auth.userId()).then(function (result) {

               if (result.status == 'fail') {
                   $scope.error = result.message;
                   console.log($scope.error);
               }
               else if (result.status == 'success') {
                   $scope.units.splice(index, 1);
                   if ($rootScope.IsInternetOnline) {
                       PouchDB.SynServerDataAndLocalData().then(function () {
                           console.log("sync successfully.");
                       }).catch(function (err) {
                           console.log("Not able to sync" + error);
                       });
                   }
               }
           });


       }*/
     }
   }



}]);
