app.controller('UnitManagerCtrl', ['$http', '$scope', 'auth', 'unit', 'varieties', 'fungicidas', 'user', 'PouchDB', 'localStorageService', '$rootScope', 'onlineStatus','mailer','$state',
function ($http, $scope, auth, unit, varieties, fungicidas, user, PouchDB, localStorageService, $rootScope, onlineStatus, mailer, $state) {

    console.log("Loading UnitManagerCtrl")

    var map;
    //*Ea0707*/
    // $rootScope.IsInternetOnline = false;
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.userId = auth.userId;
    $scope.user_Ided = auth.userId();
    var userO = {};
    $scope.varietysOffline = [];
    $scope.newVarietys = [];
    $scope.variedadLocalesPouchDB = [];
    $scope.fungicidasLocalesPouchDB = [];
    $scope.categoriaSeleccionada = "";
    $scope.fungicidasSeleccionados = {};
    $scope.funVar = {};
    $scope.llaveFungi = [];
    $scope.inputOtros = {};
    $scope.listadoFungicidas = [];

    $scope.oficinaregionallst = [{ id: -1, name: "Select Oficina Regional" },
           { id: 1, name: "Los Santos" },
           { id: 2, name: "Pérez Zeledón" },
           { id: 3, name: "Valle Central" },
           { id: 4, name: "Valle Occidental" },
           { id: 5, name: "Turrialba" },
           { id: 6, name: "Coto Brus" }];
    $scope.oficinaregionalmodel = $scope.oficinaregionallst[0];
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
        closeOnClear: false,
          onOpen: function() {
            $('.picker').css("z-index", 10000);
            console.log('Opened up');
          },
          onClose: function() {
            $('.picker').css("z-index", -1);
            console.log('Closed now');
          },
    }

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
    $scope.toggle = false;


    if ($rootScope.IsInternetOnline) {
        console.log("app online");
        $scope.nuevaVariedad = false;

        // Obteniendo Variedades
        PouchDB.GetVarietiesFromPouchDB().then(function (result) {
            console.log("entramos a PouchDB");
            console.log(result);

            if (result.status == 'fail') {
                $scope.error = result.message;
            }
            else if (result.status == 'success') {
                if (result.data.rows.length > 0) {
                    var variedadesArrayPouchDB = [];
                    var doc = result.data.rows[0].doc;
                    for (var i = 0; i < doc.list.length; i++) {
                        variedadesArrayPouchDB.push(doc.list[i]);

                        // Valido si hay una variedad nueva
                        if (doc.list[i]._id == null) {
                          $scope.nuevaVariedad = true;
                          console.log(doc.list[i]);
                          varieties.create(doc.list[i]).then(function (newVar) {
                              console.log("Entré a actualizar variedades en el servidor");
                              console.log(newVar.data);

                              varieties.getAll().then(function (varids) {
                                console.log("Entré a obtener variedades");
                                  variedades = varids.data;
                                  $scope.variedades = variedades;
                                  //Guardamos con localStorage
                                  localStorageService.set('localVarieties',variedades);

                                  //Guardamos a nivel local
                                  PouchDB.SaveVarietiesToPouchDB(variedades);
                                  console.log("Data --- Variedades Online Actualizadas - Servidor >");
                                  console.log($scope.variedades);
                              });
                          });

                        }else if ($scope.nuevaVariedad == false && i == (doc.list.length - 1)) {
                          // En caso no hayan variedades nuevas
                          varieties.getAll().then(function (varids) {
                              variedades = varids.data;
                              $scope.variedades = variedades;
                              //Guardamos con localStorage
                              localStorageService.set('localVarieties',variedades);

                              //Guardamos a nivel local
                              PouchDB.SaveVarietiesToPouchDB(variedades);
                              console.log("Data --- Variedades Online - Servidor >");
                              console.log($scope.variedades);
                          });

                        }
                    }
                }else{
                    //NO hay variedades en pouch
                    varieties.getAll().then(function (varids) {
                        variedades = varids.data;
                        $scope.variedades = variedades;
                        //Guardamos con localStorage
                        localStorageService.set('localVarieties',variedades);

                        //Guardamos a nivel local
                        PouchDB.SaveVarietiesToPouchDB(variedades);
                        console.log("Data --- Variedades Online - Servidor >");
                        console.log($scope.variedades);
                    });
                }
            }
        }).catch(function(err) {
            console.log("error al obtener datos");
            console.log(err);
        });

         if (localStorageService.get('dataNewFungicidesOffline') != null) {

           console.log("Voy a actualizar fungicidas");
           PouchDB.GetFungicidesFromPouchDB().then(function (result) {
               console.log("Respuesta: ");
               console.log(result);
               console.log("entramos a PouchDB");
               if (result.status == 'fail') {
                   $scope.error = result.message;
               }
               else if (result.status == 'success') {
                   var doc = result.data.rows[0].doc;
                   if (result.data.rows.length > 0) {
                       var fungicidasArray = [];
                       for (var i = 0; i < doc.list.length; i++) {
                           fungicidasArray.push(doc.list[i]);
                           console.log("Kevin Fungicidas: ", doc.list[i]);
                           fungicidas.update(doc.list[i]).then(function (newFungi) {
                              currentFungicidas = newFungi.data;
                              console.log($scope.fungicides);
                          });

                          fungicidas.getAll().then(function (fungi) {
                              fungicides = fungi.data;
                              $scope.fungicides = fungicides;
                              //Guardamos con localStorage
                              localStorageService.set('localFungicidas',fungicides);

                              //Guardamos a nivel local
                              PouchDB.SaveFungicidesToPouchDB(fungicides);
                              console.log("Data --->");
                              console.log($scope.fungicides);
                          });

                       }
                   }
               }
             }).catch(function(err) {
               console.log("error al obtener datos");
               console.log(err);
           });

           localStorageService.remove('dataNewFungicidesOffline')

         }else {
           fungicidas.getAll().then(function (fungi) {
               fungicides = fungi.data;
               $scope.fungicides = fungicides;
               //Guardamos con localStorage
               localStorageService.set('localFungicidas',fungicides);

               //Guardamos a nivel local
               PouchDB.SaveFungicidesToPouchDB(fungicides);
               console.log("Data --->");
               console.log($scope.fungicides);
           });
         }

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

            }
            else if (result.status == 'success') {
                var doc = result.data.rows[0].doc;
                if (result.data.rows.length > 0) {
                    var variedadesArray = [];
                    for (var i = 0; i < doc.list.length; i++) {
                        variedadesArray.push(doc.list[i]);
                    }
                    $scope.variedades = variedadesArray;
                    console.log("Data-- Variedades Offline ");
                    console.log($scope.variedades);

                }
            }
        }).catch(function(err) {
            console.log("error al obtener datos");
            console.log(err);
        });

        PouchDB.GetFungicidesFromPouchDB().then(function (result) {
            console.log("Respuesta: ");
            console.log(result);
            console.log("entramos a PouchDB");
            if (result.status == 'fail') {
                $scope.error = result.message;
            }
            else if (result.status == 'success') {
                var doc = result.data.rows[0].doc;
                if (result.data.rows.length > 0) {
                    var fungicidasArray = [];
                    for (var i = 0; i < doc.list.length; i++) {
                        fungicidasArray.push(doc.list[i]);
                    }
                    $scope.fungicides = fungicidasArray;
                    console.log("Data-- Fungicidas Offline ");
                    console.log($scope.fungicides);

                }
            }
        }).catch(function(err) {
            console.log("error al obtener datos");
            console.log(err);
        });
    }

    $(".date-field").pickadate(spanishDateTimePickerOption);

    muni14.addDepts('departamentos');

    function wait(ms) {
        var start = new Date().getTime();
        var end = start;
        while (end < start + ms) {
            end = new Date().getTime();
        }
    }
    function initialize(index) {
        var myLatlng, myLat, myLng;
        var x;
        var ax = [];
        var infoWindow = new google.maps.InfoWindow({ map: map });
        console.log('function loaded root');
        if (!document.getElementById('latlongid').value) {
            console.log('function loaded 1');

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {

                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    myLat = position.coords.latitude;
                    myLng = position.coords.longitude;

                    // map.setCenter(pos);

                    myLatlng = new google.maps.LatLng(myLat, myLng);

                    var myOptions = {
                        zoom: 13,
                        center: myLatlng,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    }

                    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
                    //map1 = new google.maps.Map(document.getElementById("map-canvas1"), myOptions);



                    var marker = new google.maps.Marker({
                        draggable: true,
                        position: myLatlng,
                        map: map,
                        title: "Your location"
                    });


                    /*var marker1 = new google.maps.Marker({
                        draggable: true,
                        position: myLatlng,
                        map: map1,
                        title: "Your location"
                    });*/




                    google.maps.event.addListener(marker, 'dragend', function (event) {

                        $scope.newUnit.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
                        document.getElementById('latlongid').value = event.latLng.lat() + ',' + event.latLng.lng();
                        console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());

                    });

                    /*google.maps.event.addListener(marker1, 'dragend', function (event) {
                        placeMarker(event.latLng);
                        $scope.editUnit.ubicacion = '(' + event.latLng.lat() + ' , ' + event.latLng.lng() + ')';
                        document.getElementById('latlongid1').value = event.latLng.lat() + ',' + event.latLng.lng();
                        console.log("this is marker info", event.latLng.lat() + ' , ' + event.latLng.lng());
                    });*/



                    if (!isNaN(index)) {



                        var indString = index.toString();
                        var map2 = new google.maps.Map(document.getElementById("map-canvas" + indString), myOptions);

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

                }, function () {
                    //handleLocationError(true, infoWindow, map.getCenter());
                    alert('El dispositivo no soporta geolocalización');
                });
            } else {
                // Browser doesn't support Geolocation
                //handleLocationError(false, infoWindow, map.getCenter()); 0
                alert('El dispositivo no soporta geolocalización');
            }
            //myLatlng = new google.maps.LatLng(42.94033923363181 , -10.37109375);

        }
        else {
            console.log('function loaded 2');
            x = document.getElementById('latlongid').value;
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
                var map2 = new google.maps.Map(document.getElementById("map-canvas" + indString), myOptions);
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
            // double click event
            /*   google.maps.event.addListener(map1, 'dblclick', function(e) {
                 var positionDoubleclick = e.latLng;
                 marker1.setPosition(positionDoubleclick);
                 // if you don't do this, the map will zoom in
               }); */
            google.maps.event.addDomListener(window, 'load', initialize);

        }



    }
    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            draggable: true,
            map: map
        });

        map.setCenter(location);
    }

    $scope.prueba1 = function(){
      console.log($scope.fungicidasSeleccionados);
    }

    $scope.agregarFSeleccion = function (nombre) {

      if ($scope.funVar[nombre] == true) {
        console.log(nombre);
        $scope.fungicidasSeleccionados[nombre]=[];
      }
      else {
        $scope.fungicidasSeleccionados[nombre]=null;
        delete $scope.fungicidasSeleccionados[nombre];
      }
      // var val = $event.currentTarget;



    }

    // Funcion SweetAlert para mensajes Success y Error
    $scope.SweetAlert = function (title, text, type){

      swal({
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Aceptar'
          });
      return
    }


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
            case "Contacto":
                if ($scope.newUnit.fungicidas.contacto == false) {
                    $scope.resetFungicidasSelection(type, true, false, false);
                }
                break;
            case "Sistemico":
                if ($scope.newUnit.fungicidas.sistemico == false) {
                    $scope.resetFungicidasSelection(type, false, false, true);
                }
                break;
            case "Biologico":
                if ($scope.newUnit.fungicidas.biologico == false) {
                    $scope.resetFungicidasSelection(type, false, true, false);
                }
                break;
            default:
                break;
        }
    }
    $scope.yesNoNitrogenoChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.quetipo = '' : $scope.editUnit.quetipo = '';
        (type == "newUnit") ? $scope.newUnit.nitrorealiza = [] : $scope.editUnit.nitrorealiza = []
    }
    $scope.yesNoVerificiaAcquaChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.verificaAguaTipo.ph = false : $scope.editUnit.verificaAguaTipo.ph = false;
        (type == "newUnit") ? $scope.newUnit.verificaAguaTipo.dureza = false : $scope.editUnit.verificaAguaTipo.dureza = false;
    }
    $scope.yesNomanejoTejidoChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.manejoTejidoMes = [] : $scope.editUnit.manejoTejidoMes = []
    }
    $scope.yesNoenmiendasSueloChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.enmiendasSueloMes = [] : $scope.editUnit.enmiendasSueloMes = []
    }
    $scope.yesNofertilizaFollajeChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.fertilizaFollajeMes = [] : $scope.editUnit.fertilizaFollajeMes = []
    }
    $scope.yesNofertilizaSueloChange = function (type) {
        (type == "newUnit") ? $scope.newUnit.fertilizaSueloMes = [] : $scope.editUnit.fertilizaSueloMes = []
    }
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
    // FUNCION PARA INICIALIZAR UN MAPA
    $scope.mapInit = function (index) {
        $('.map').collapse('toggle');
        if($scope.toggle){
            $('#formulariocompleto').css('display','none');
            console.log("Formulario Completo - display none");
        }else{
            $('#formulariocompleto').css('display','block');
            console.log("Formulario Completo - display block");
        }

        if ($rootScope.IsInternetOnline) {
            initialize(index);
            console.log('map online');
            $('#myModal, #myModal2').on('hidden.bs.modal', function (e) {
                $scope.toggle = false;
                $('.map').collapse('hide');
            })

        } else {
            $('#map-canvas > div, #map-canvas > div').remove();
            console.log('map offline');
        }

    }

    $scope.addNewVariety = function (newVariety) {
        console.log(newVariety);
        var currentvarieties = [];
        if ($rootScope.IsInternetOnline) {

            varieties.create(newVariety).then(function (newVar) {
                currentvarieties.push(newVar.data);
                $scope.varieties = currentvarieties;
                $scope.SweetAlert('¡Excelente!', 'Variedad añadida.', 'success');
                console.log($scope.varieties);

                //Busco la variedad Local que acabo de crear
                for (var i = 0; i < $scope.variedades.length; i++) {
                  if ($scope.variedades[i].name == newVariety.name) {
                    console.log("Nueva Variedad: ", $scope.variedades[i]);
                    // La reemplazo por la del servidor
                    $scope.variedades[i] = $scope.varieties[0];
                    console.log($scope.variedades);
                    break;
                  }
                }
            });
        }
        else{
          console.log("Guardamos en PouchDB");
          console.log(newVariety);
          console.log($scope.variedades);
          console.log($scope.variedadLocalesPouchDB);
          PouchDB.GetVarietiesFromPouchDB().then(function (result) {
              console.log("entramos a PouchDB");
              console.log(result);

              if (result.status == 'fail') {
                  $scope.error = result.message;
              }
              else if (result.status == 'success') {
                  var doc = result.data.rows[0].doc;
                  if (result.data.rows.length > 0) {
                      var variedadesArrayPouchDB = [];
                      for (var i = 0; i < doc.list.length; i++) {
                          variedadesArrayPouchDB.push(doc.list[i]);
                      }
                      $scope.variedadLocalesPouchDB = variedadesArrayPouchDB;

                      console.log("Data-- ");
                      console.log($scope.variedadLocalesPouchDB);
                      console.log(newVariety);
                      $scope.variedadLocalesPouchDB.push(newVariety);
                      console.log($scope.variedadLocalesPouchDB);

                      //Mandamos el nuevo arreglo a pouchDB
                      PouchDB.SaveVarietiesToPouchDB($scope.variedadLocalesPouchDB);
                      localStorageService.set('localVarieties', $scope.variedades);
                      // localStorageService.set('dataNewVarietysOffline', $scope.variedadLocalesPouchDB);
                      $scope.SweetAlert('¡Excelente!', 'Variedad añadida.', 'success');
                  }
              }
          }).catch(function(err) {
              console.log("error al obtener datos");
              console.log(err);
          });
        }
    };


    // FUNCION PARA EDITAR UNA UNIDAD
    $scope.saveEditUnitForm = function () {
        console.log("Entré editar unidad");
        console.log($scope.newunitForm.$valid);
        $scope.newUnit.departamento = $("#departamentos option:selected").text();
        $scope.newUnit.municipio = $("#departamentos-munis option:selected").text();
        console.log($scope.newUnit.municipio);
        if ($scope.newunitForm.$valid && $scope.newUnit.departamento!="" && $scope.newUnit.municipio !="") {

            $scope.newUnit.oficinaregional = $scope.oficinaregionalmodel.name;
            $scope.newUnit.lat = $('[name="lat"]').val();
            $scope.newUnit.lng = $('[name="lng"]').val();

            $scope.newUnit.variedad = [];
            // Al ejecutar este código si hay variedades nuevas deben de aparecer
            for (var vcounter = 0; vcounter < $scope.variedades.length; vcounter++) {
                if ($scope.variedades[vcounter].isSelected)
                    $scope.newUnit.variedad.push($scope.variedades[vcounter].name);
            }

            if ($scope.newUnit.newFungicidas) {
              $scope.newUnit.newFungicidas = $scope.fungicidasSeleccionados;
              console.log($scope.newUnit.newFungicidas);
              $scope.fungicidasSeleccionados = {};
              $scope.funVar = {};
              $scope.llaveFungi = [];
            }

            // document.getElementById("");
            if ($scope.isOtherUser)
            {
                var userId = $scope.userId;
                //update unit to server database
                $scope.sucMsg = '¡Unidad Actualizada exitosamente!';
                $scope.SweetAlert("¡Excelente!", "Unidad Actualizada", "success");
                $scope.$emit('UNITEDITED', { unit: $scope.newUnit});
            }
            else {
                PouchDB.EditUnit($scope.newUnit, auth.userId()).then(function (result) {
                    if (result.status == 'fail') {
                        $scope.error = result.message;
                    }
                    else if (result.status == 'success') {
                        //$scope.editUnit = result.data;
                        $scope.SweetAlert("¡Excelente!", "Unidad Actualizada", "success");
                        $scope.sucMsg = '¡Unidad Actualizada exitosamente!';
                        $scope.$emit('UNITEDITED', { unit: result.data });

                        console.log("Volví de Crear Nueva Variedad");
                        $("#departamentos option").removeAttr("selected"); //-- KH - Borra el atributo selected
                        $("#departamentos .optionVacio").remove();
                        $('#myModal2').modal('hide');
                        console.log("Datos Actualizados: ", result.data);
                        // $state.go($state.current, {reload: true});
                    }
                });
            }
            return true;
        }else{
            return false;
        }
    }

    $scope.RecommendationText = "";

    // FUNCION PARA GUARDAR UNA NUEVA UNIDAD
    $scope.saveAddUnitForm = function () {
        console.log($scope.newunitForm.$valid);
        $scope.newUnit.departamento = $("#departamentos option:selected").text();
        $scope.newUnit.municipio = $("#departamentos-munis option:selected").text();
        console.log($scope.newUnit.departamento)
        console.log($scope.newUnit.municipio)
        if ($scope.newunitForm.$valid && $scope.newUnit.departamento !="" && $scope.newUnit.municipio) {
            $('#myModal2').modal('hide');
            // $(".addUnit").attr('disabled', 'disabled');
            // $(".addUnit").removeAttr('disabled', 'disabled');
            /*For sync fied ,as new record will always have sync property false until it is' sync by local db' */

            /*Sync */
            console.log($scope.newUnit);

            $scope.newUnit.departamento = $("#departamentos option:selected").text();
            $scope.newUnit.municipio = $("#departamentos-munis option:selected").text();
            $scope.newUnit.oficinaregional = $scope.oficinaregionalmodel.name;
            $scope.newUnit.lat = $('[name="lat"]').val();
            $scope.newUnit.lng = $('[name="lng"]').val();

            $scope.newUnit.variedad = [];
            for (var vcounter = 0; vcounter < $scope.variedades.length; vcounter++) {
                if ($scope.variedades[vcounter].isSelected)
                    $scope.newUnit.variedad.push($scope.variedades[vcounter].name);
            }

            if ($scope.newUnit.newFungicidas) {
              $scope.newUnit.newFungicidas = $scope.fungicidasSeleccionados;
              console.log($scope.newUnit.newFungicidas);
              console.log($scope.funVar);
              $scope.fungicidasSeleccionados = {};
              $scope.funVar = {};
              $scope.llaveFungi = [];
            }


            // document.getElementById("");
            if ($scope.isOtherUser) {
                var userId = $scope.userId;
                //save unit to server database
                $scope.$emit('UNITADDED', { unit: $scope.newUnit });
            }
            else {
                PouchDB.AddUnit($scope.newUnit, auth.userId()).then(function (result) {
                    if (result.status == 'fail') {
                        $scope.error = result.message;
                    }
                    else if (result.status == 'success') {
                        delete result.data["type"];
                        $scope.$emit('UNITADDED', { unit: result.data });

                        $scope.ResetNewUnit();
                        $scope.SweetAlert("¡Excelente!", "Unidad Añadida", "success");

                    }
                });
            }

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

            return true;
        } else {
            return false;
          $scope.SweetAlert("Error!", "Complete los campos", "error");
        }

    };


    $scope.ResetUnitForm = function () {
        $scope.newunitForm.nombreInput.$setPristine();
        $scope.newunitForm.nombreInput.$setUntouched();
        $scope.newunitForm.$setPristine();
        $scope.newunitForm.$setUntouched();
        //$scope.initializeNewUnit();
        $scope.newunitForm.submit();

    }
    $scope.onFormSubmit = function () {
      console.log("Ejecuté el botón");
        if ($scope.Mode == "ADD")
            return $scope.saveAddUnitForm();
        else if ($scope.Mode == "EDIT")
            return $scope.saveEditUnitForm();
        else
            console.log("Close button clicked");
    }

    $scope.addVariedad = function(){
        $("#lblAdd").hide();
        $("#contenedorNueva").show();
    }

    $scope.addNewvariedad = function(){
      var existeVariedad = false
      if ($("#nuevaVariedad").val() != "") {
        for (var i = 0; i < $scope.variedades.length; i++) {
          if ($("#nuevaVariedad").val() == $scope.variedades[i].name){
            $scope.SweetAlert('¡Error!', 'Ya existe la variedad.', 'error');
            existeVariedad = true;
          }
        }

        if (existeVariedad != true) {
          var nombreVariedad = $("#nuevaVariedad").val();
          $("#nuevaVariedad").val("");
          $scope.variedades.push({ name:  nombreVariedad });
          // $scope.addNewVariety({name: nombreVariedad});
          console.log("************************************************");
          console.log($scope.variedades);

          // Buscar Nuevas Variedades y Añadirlas
          for (var i = 0; i < $scope.variedades.length; i++) {
            if ($scope.variedades[i]._id == null) {
              console.log("Nueva Variedad: ", $scope.variedades[i]);
              $scope.addNewVariety($scope.variedades[i]);
            }
          }

          $("#contenedorNueva").hide();
          $("#lblAdd").show();
        }

      }
      else{
        $scope.SweetAlert('¡Error!', 'Nombre de variedad incorrecta.', 'error');
      }

    }

    $scope.cancelNewvariedad = function(){
      $("#nuevaVariedad").val("");
      $("#contenedorNueva").hide();
      $("#lblAdd").show();
    }

    // Función Aceptar cierre
    $scope.AceptarCierre = function(type){
      if (type == "Lote") {
        console.log("Cerré lote");
      }
      else if (type == "Unidad"){
        console.log("Cerré Unidad");
      }
      return
    }

    //Función SweetAlert para mensajes Warning en Modal 3
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

    $scope.addNewFun = function (newFun, arrFung) {
        console.log(newFun);
        var currentFungicidas = {};
        if ($rootScope.IsInternetOnline) {

            fungicidas.update(newFun).then(function (newFungi) {
                currentFungicidas = newFungi.data;
                // $scope.fungicides = currentFungicidas;
                $scope.SweetAlert('¡Excelente!', 'Fungicida añadido.', 'success');
                console.log($scope.fungicides);
            });
        }
        else {
          console.log("Guardamos fungicidas en PouchDB");
          console.log(newFun);
          console.log($scope.fungicides);
          console.log($scope.fungicidasLocalesPouchDB);
          $scope.fungicidasLocalesPouchDB.push(newFun);
          console.log($scope.fungicidasLocalesPouchDB);
          PouchDB.SaveFungicidesToPouchDB($scope.fungicides);
          localStorageService.set('dataNewFungicidesOffline', $scope.fungicidasLocalesPouchDB);
          localStorageService.set('localFungicidas', $scope.fungicides);
          console.log(localStorageService.get('dataNewFungicidesOffline'));
          $scope.SweetAlert('¡Excelente!', 'Fungicida añadido.', 'success');
        }
      }

    // + Añadir fungicidas
    $scope.addFungicida = function(tipoFungicida){
      var claseHide = '#fcAdd-' + tipoFungicida;
      var claseShow = '#funNuevo-' + tipoFungicida;
      console.log(tipoFungicida, claseHide, claseShow);
      $(claseHide).hide();
      $(claseShow).show();
    }

    // > Añadir Fungicidas
    $scope.addNewFungicida = function(tipoFungicida){
      var claseHide = '#funNuevo-' + tipoFungicida;
      var claseShow = '#fcAdd-' + tipoFungicida;
      var claseInput = '#nuevoFungicida-' + tipoFungicida;
      var newFungicida = $(claseInput).val();


      if ($(claseInput).val() != "") {
        console.log($scope.fungicides, newFungicida);

        for (var i = 0; i < $scope.fungicides.length; i++) {
          if ($scope.fungicides[i].categoria == tipoFungicida) {
            $scope.listadoFungicidas = $scope.fungicides[i].fungicidas;
            console.log($scope.fungicides[i].fungicidas);
          }
        }

        if ($scope.listadoFungicidas != null) {
          for (var i = 0; i < $scope.listadoFungicidas.length; i++) {
            if (newFungicida == ($scope.listadoFungicidas[i].nombre || $scope.listadoFungicidas[i].nombre.toLowerCase())) {
              $scope.SweetAlert('¡Error!', 'Fungicida ya existe.', 'error');
              break;
            }
            else {

              for (var i = 0; i < $scope.fungicides.length; i++) {
                if ($scope.fungicides[i].categoria == tipoFungicida) {
                  $scope.fungicides[i].fungicidas.push({nombre: newFungicida, valor: newFungicida});
                  console.log($scope.fungicides[i].fungicidas);
                  $scope.listadoFungicidas = [];
                  newFungicida = "";
                  $(claseInput).val("");
                  $(claseHide).hide();
                  $(claseShow).show();

                  $scope.addNewFun($scope.fungicides[i], $scope.fungicides);

                  break;
                }
              }

            }
          }
        }

      }
      else{
        $scope.SweetAlert('¡Error!', 'Nombre de fungicida incorrecto.', 'error');
      }
    }

    // x cancelar nuevo fungicida
    $scope.cancelNewFungicida = function(tipoFungicida){

      var claseHide = '#funNuevo-' + tipoFungicida;
      var claseShow = '#fcAdd-' + tipoFungicida;
      var claseInput = '#nuevoFungicida-' + tipoFungicida;

      $(claseInput).val("");
      $(claseHide).hide();
      $(claseShow).show();

    }


    $scope.CancleForm = function ($event) {

        // SweetAlert para confirmar cierre
        $scope.SweetAlertCierre('#myModal2', "Unidad");

        if($scope.valor != "Aceptar"){
            console.log("Close Unit - Aceptar");
            $scope.fungicidasSeleccionados = {};
            $scope.funVar = {};
            $scope.llaveFungi = [];
            $event.stopPropagation();
         }else if ($scope.valor == "Cancelar"){
             console.log("Close Unit - Cancelar");
          }

    }

    $scope.initializeNewUnit = function () {
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
            variedad: {},
            typeOfCoffeProducessOptionSelected: [],
            newFungicidas: {},
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
            rendimientoAnterior: '',
            distanciamientoCalle: '',
            distanciamientoAvenida: '',
            tipoCafe: {
                estrictamenteDuro: true,
                duro: false,
                semiduro: false,
                prime: false,
                extraprime: false
            },
        };
        $scope.initNewUnit = angular.copy($scope.newUnit);
        //$("#departamentos option:selected").text(" "); - linea que limpia el texto del option seleccionado

        // Escondemos los select departamento / municipio
        $("#departamentos-munis").hide();
        $("#departamentos").hide();

        $scope.editUnit = angular.copy($scope.newUnit);
        console.log("here");
        if ($scope.variedades) {
            for (var vcounter = 0; vcounter < $scope.variedades.length; vcounter++) {
                $scope.variedades[vcounter].isSelected = false;
            }
        }
        console.log("here1");
    }


    $scope.initializeEditUnit = function (id) {
        $scope.sucMsg = null;

        PouchDB.GetUnit(id, auth.userId()).then(function (result) {
            if (result.status == 'fail') {
                $scope.error = result.message;
            }
            else if (result.status == 'success') {

                $scope.newUnit = result.data;
                $scope.oficinaregionalmodel.name = $scope.newUnit.oficinaregional;

                // Seccion que muestra los departamentos y municipios
                //$("#departamentos option:selected").text($scope.newUnit.departamento); //-- linea 1 a editar / Estructura por default

                var idDepto = 0;
                // Buscamos en el select el option igual al dato en newUnit.departamento y lo seleccionamos para mostrarlo
                $('#departamentos option').each(function(inx,obj){
                   if($(obj).html()==$scope.newUnit.departamento){
                      $(obj).prop('selected',true);
                      idDepto = $(obj).val();
                    }
                });

                // Mostramos nuevamente el select departamento
                $("#departamentos").show();

                // Seleccion Municipio
                var dindex = muni14.getDeptId($scope.newUnit.departamento); // -- linea 2 a editar
                document.getElementById("departamentos").forcechange(dindex, $scope.newUnit.municipio); // -- linea 3 a editar

                console.log("Datos Actuales: ", $scope.newUnit); // KH - Datos de la Unidad

                $scope.newUnit.oficinaregional = $scope.oficinaregionalmodel.name;

                if ($scope.newUnit.newFungicidas) {
                  $scope.fungicidasSeleccionados = $scope.newUnit.newFungicidas;
                  $scope.llaveFungi = Object.keys($scope.fungicidasSeleccionados)
                  console.log($scope.llaveFungi);
                  // $scope.funVar = $scope.fungicidasSeleccionados;
                  for (var i = 0; i < $scope.llaveFungi.length; i++) {
                    console.log($scope.llaveFungi[i]);
                    $scope.funVar[$scope.llaveFungi[i]] = true;
                    console.log($scope.funVar[$scope.llaveFungi[i]]);
                  }
                }
                else{
                  $scope.fungicidasSeleccionados = {};
                  $scope.funVar = {};
                }
                $('#myModal3').on('shown.bs.modal', function (e) {
                    $('.collapse').collapse('hide');
                });

                $scope.prependItem = function () {
                    var newItem = {
                        nombre: ""
                    }
                    $scope.newUnit.lote.push(newItem);
                };
                //$scope.newUnit.nombre.$setUntouched();
                $scope.newunitForm.nombreInput.$setPristine();
                $scope.newunitForm.nombreInput.$setUntouched();

                if ($scope.variedades && $scope.newUnit.variedad) {
                    for (var vcounter = 0; vcounter < $scope.variedades.length; vcounter++) {
                        var isSelected = false;
                        for (var ecounter = 0; ecounter < $scope.newUnit.variedad.length; ecounter++) {
                            if ($scope.newUnit.variedad[ecounter] == $scope.variedades[vcounter].name) {
                                //$scope.variedades[vcounter].isSelected = $scope.newUnit.variedad[ecounter].isSelected;
                                isSelected = true;
                            }
                        }
                        $scope.variedades[vcounter].isSelected = isSelected;
                    }
                }
            }
        });
    }

    $scope.Mode = "ADD";
    $scope.isRecommendationFieldRequired = false;

    $('#myModal2').on('shown.bs.modal', function (e) {
        $('#newunitForm').validator();
        if($scope.Mode == "EDIT") {
			$('#newunitForm').validator('validate');
		}
        $scope.newunitForm.nombreInput.$setPristine();
        $scope.newunitForm.nombreInput.$setUntouched();
    });

    $scope.$on('CLOSEUNIT', function (e, args) {
        $scope.newunitForm.nombreInput.$setPristine();
        $scope.newunitForm.nombreInput.$setUntouched();
        $scope.newunitForm.$setPristine();
        $scope.newunitForm.$setUntouched();
        $scope.initializeNewUnit();
        // Removemos el atributo selected de los options en select departamento
        $('#departamentos option').removeAttr('selected');

    });

    $scope.$on('MANAGEUNIT', function (e, args) {
        console.log("manage unit called");
        $scope.newunitForm.nombreInput.$setPristine();
        $scope.newunitForm.nombreInput.$setUntouched();
        $scope.isOtherUser = args.isOtherUser;
        if (args.isRecommendationFieldRequired) {
            $scope.isRecommendationFieldRequired = args.isRecommendationFieldRequired;
            $scope.userId = args.obj._id;
        }
        var unitId = args.unitId;
        if (unitId == -1) {
            $scope.fungicidasSeleccionados = {};
            $scope.funVar = {};

            if ($rootScope.IsInternetOnline == false) {

              if ((!$scope.variedades) || ($scope.variedades.length <= 0)) {
                  $scope.variedades = localStorageService.get('localVarieties');
              }

              if ((!$scope.fungicides) || ($scope.fungicides.length <= 0)) {
                $scope.fungicides = localStorageService.get('localFungicidas');
              }
            }
            //$('#myModal2').on('shown.bs.modal', function (e) {
            //    $('#newunitForm').validator();
            //});
            $('#newunitForm').validator();
            $scope.Mode = "ADD";
            $scope.initializeNewUnit();
            // Deseleccionamos la opcion del select departamento
            $('#departamentos option').removeAttr('selected');
            // Mostramos nuevamente el select departamento
            $("#departamentos").show(); // Muestro departamentos en Añadir Unidad

            // limpiamos calendarios
            $('.data-field').datepicker('setDate', null);
            $('.picker__day').removeClass('picker__day--selected');
            $('.picker__day').removeClass('picker__day--highlighted');
            $('.picker__day').removeAttr('aria-selected');
            $('.picker__day').removeAttr('aria-activedescendant');

            $('#menssageLocation').css("display", "inline");
            $('#menssageAltitud').css("display", "inline");
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
    
                                        // Mostrando Altitud y Ubicación en el Formulario unidades
                                        if (myAlt === null) {
                                            $('#altitudId').val("");
                                        }
                                        else {
                                            if(myAlt > 0) {    
                                                altitud = myAlt.toString();
                                                $scope.newUnit.altitud = altitud;
                                                console.log($scope.newUnit);
                                                $('#altitudId').val($scope.newUnit.altitud);
                                            }
                                        }
    
                                        // Mostramos la Geolocalizacion
                                        $scope.newUnit.ubicacion = coordenadas;
                                        console.log($scope.newUnit);
                                        $('#latlongid').val($scope.newUnit.ubicacion);
    
                                        // Ocultando Mensajes
                                        $('#menssageLocation').css("display", "none");
                                        $('#menssageAltitud').css("display", "none");
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
                                    
                                        // Mostrando Altitud y Ubicación en el Formulario unidades
                                        if (myAlt === null) {
                                            $('#altitudId').val("");
                                        }
                                        else {
                                            if (myAlt > 0) {
                                                altitud = myAlt.toString();
                                                $scope.newUnit.altitud = altitud;
                                                console.log($scope.newUnit);
                                                $('#altitudId').val($scope.newUnit.altitud);
                                            }
                                        }
                                
                                        // Mostramos la Geolocalizacion
                                        $scope.newUnit.ubicacion = coordenadas;
                                        console.log($scope.newUnit);
                                        $('#latlongid').val($scope.newUnit.ubicacion);
                                    
                                        // Ocultando Mensajes
                                        $('#menssageLocation').css("display", "none");
                                        $('#menssageAltitud').css("display", "none");
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
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        alt: position.coords.altitude
                    };

                    myLat = position.coords.latitude;
                    myLng = position.coords.longitude;
                    myAlt = position.coords.altitude;
                    // myAlt = 1254.365;

                    console.log(myAlt);
                    // console.log(elevator);

                    coordenadas = '('+ myLat +','+ myLng+')';
                    console.log("Coordenadas", coordenadas);

                    // Mostrando Altitud y Ubicación en el Formulario unidades
                    if (myAlt === null) {
                      $('#altitudId').val("");
                    }
                    else {
                      if ($("#altitudId").val() == "") {
                        altitud = myAlt.toString();
                        $scope.newUnit.altitud = altitud;
                        console.log($scope.newUnit);
                        $('#altitudId').val($scope.newUnit.altitud);
                      }
                    }

                    // Mostramos la Geolocalizacion
                    $scope.newUnit.ubicacion = coordenadas;
                    console.log($scope.newUnit);
                    $('#latlongid').val($scope.newUnit.ubicacion);

                    // Ocultando Mensajes
                    $('#menssageLocation').css("display", "none");
                    $('#menssageAltitud').css("display", "none");
                },function () {
                    $scope.SweetAlert('¡Error!', 'No es posible obtener la ubicación', 'warning');
                });
            } else {
                $scope.SweetAlert('¡Error!', 'El dispositivo no soporta geolocalización', 'warning');
            }



        } else {
            var ariaLabel = "";
            $scope.fungicidasSeleccionados = {};
            $scope.funVar = {};
            if ($rootScope.IsInternetOnline == false) {

              if ((!$scope.variedades) || ($scope.variedades.length <= 0)) {
                  $scope.variedades = localStorageService.get('localVarieties');
              }

              if ((!$scope.fungicides) || ($scope.fungicides.length <= 0)) {
                $scope.fungicides = localStorageService.get('localFungicidas');
              }
            }
            //$scope.newunitForm.$setPristine();
            //$scope.newunitForm.$setUntouched()
            //$scope.newUnit.nombre.$setUntouched();
            //$scope.addChallengeForm.challangeDes.$setUntouched();
            $scope.newunitForm.nombreInput.$setPristine();
            $scope.newunitForm.nombreInput.$setUntouched();
            $scope.Mode = "EDIT";
            $scope.initializeEditUnit(unitId);
        }
    });

    //initlize with the default intial value
    console.log("initialize with default value called");
    $scope.initializeNewUnit();

}]);
