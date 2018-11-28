app.controller('GalloCtrl', [
'$rootScope',
'$scope',
'$state',
'$stateParams',
'auth',
'localStorageService',
'socket',
'unit',
'user',
'methodsGallo',
'gallo',
'PouchDB',
'onlineStatus',
function($rootScope, $scope, $state, $stateParams, auth, localStorageService, socket, unit, user, methodsGallo, gallo, PouchDB, onlineStatus){
  $scope.currentUser = auth.currentUser;
  $scope.currentId = auth.currentUser();
  console.log("Nombre de Usuario: ", $scope.currentId);
  var testInStore = localStorageService.get('localTestgallo');

	$scope.IsErrorInfrmGalloAddPlanta=false;
	$scope.IsErrorInfrmGalloAddPlantaLeaf=false;
	$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
	$scope.IsTotalPlantaAdded=false;
	$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
	$scope.user_Ided = auth.userId();

	$scope.modal={};
	$scope.modal.number="";
	$scope.modal.numberSubmitted=false;

  $scope.unitId = $stateParams.idunidad;
  $scope.unitIndex = $stateParams.indexunidad;
  $scope.loteIndex = $stateParams.indexlote;


  $scope.unabandola50=50;
  $scope.noBandolas = 0;
  $scope.arrOfflineGallo = [];
  $scope.nombreUnidad = "";
  $scope.nombreLote = "";
  $scope.vistaInicio = true;
  $scope.vistaCalculo = false;
  $scope.vistaResultado = false;
  $scope.galloLocalesPouchDB = [];

	console.log($scope.user_Ided, $scope.unitId, $scope.loteIndex);

	$scope.$watch('onlineStatus.isOnline()', function(online) {
        $scope.online_status_string = online ? 'online' : 'offline';
        onlineStatus = $scope.online_status_string

    });

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

    // Limpiar Test
    $scope.ClearTest = function(option){
			if (option == true) {
				console.log("Reinicar");
        $scope.vistaInicio = true;
				$scope.vistaCalculo = false;
				$scope.vistaResultado = false;
        $scope.IsErrorInfrmGalloAddPlanta=false;
    		$scope.IsErrorInfrmGalloAddPlantaLeaf=false;
    		$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
    		$scope.IsTotalPlantaAdded=false;
    		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
      	localStorageService.remove('localTestgallo');
      	$state.go($state.current, {}, {reload: true});
			}
		}



	// Función para salir al precionar Cancelar
	$scope.exitAlert = function (){
		if ($scope.test.plantas.length != 0) {
			swal({
					title: "¿Desea Salir?",
					text: "Está seguro que desea salir.",
					type: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Aceptar',
					cancelButtonText:  'Cancelar',
			},
			function(isConfirm) {
				console.log(isConfirm);
				if (isConfirm == true) {
					$scope.ClearTest(true);
				} else {
					return false;
				}
		});
	 }
	 else {
		$scope.ClearTest(true);
	 }
  }


  $scope.backView = function(){
		if ($scope.vistaInicio == true) {
			$scope.backHistorial();
		}
		else if ($scope.vistaCalculo == true) {
			$scope.exitAlert();
		}
		else if ($scope.vistaResultado == true) {
			$scope.ClearTest(true);
		}
	}

  // Función Historial de Muestreos Ojo de Gallo
  $scope.backHistorial = function(){
		console.log("Reinicar");
		$scope.vistaInicio = true;
		$scope.vistaCalculo = false;
		$scope.vistaResultado = false;
		$scope.IsErrorInfrmGalloAddPlanta=false;
		$scope.IsErrorInfrmGalloAddPlantaLeaf=false;
		$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
		$scope.IsTotalPlantaAdded=false;
		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
		localStorageService.remove('localTestgallo');
		$state.go("homeloteinternal", {idunidad: $scope.unitId, indexunidad: $scope.unitIndex, indexlote: $scope.loteIndex}, {reload: true});
	}

  $scope.soporte = function(){
    console.log("Soporte");
		$scope.vistaInicio = true;
		$scope.vistaCalculo = false;
		$scope.vistaResultado = false;
		$scope.IsErrorInfrmGalloAddPlanta=false;
		$scope.IsErrorInfrmGalloAddPlantaLeaf=false;
		$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
		$scope.IsTotalPlantaAdded=false;
		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
		localStorageService.remove('localTestgallo');
		$state.go("supportclient", {}, {reload: true});
	}

	var plantEditor = function(plant) {
		$scope.plantname = plant;
		$scope.leafList = $scope.test.plantas[plant - 1];
		$scope.modal.number="";
		$scope.modal.numberSubmitted=false;
		$scope.affect = "";
		$('#plantModal').modal('show');
	};

  $scope.affect = "";


    PouchDB.GetUserDataFromPouchDB(auth.userId()).then(function (result) {
        if (result.status == 'fail') {
            $scope.error = result.message;
        }
        else if (result.status == 'success') {
            $scope.userO7 = result.data;

        }
    });

		//console.log("Is INTERNET AVAILABLE=" + $rootScope.IsInternetOnline);
    if ($rootScope.IsInternetOnline) {

    	console.log('app online');

    	user.get($scope.user_Ided).then(function (user) {
    		$scope.userO7 = user;



            //region to  get user unit from local PouchDB instead of server
            PouchDB.GetAllUserUnit(auth.userId()).then(function (result) {
            	if (result.status == 'fail') {
            		$scope.error = result.message;
            	}
            	else if (result.status == 'success') {

            		$scope.units = result.data;

                for (var i = 0; i < $scope.units.length; i++) {
									if ($scope.units[i]._id == $scope.unitId) {
											$scope.nombreUnidad = $scope.units[i].nombre;
											$scope.nombreLote = $scope.units[i].lote[$scope.loteIndex].nombre;
									}
								}


                    //if($scope.userO7.units.length === result.data.length){

                    //	$scope.units = result.data;
                    //	console.log('local mode:',result.data);

                    //} else {
                    //	console.log('server mode:', $scope.userO7.units);
                    //	$scope.units = $scope.userO7.units;
                    //	$scope.remoteMode = true;
                    //}

                    console.log("Nombre Unidad", $scope.nombreUnidad);
    								console.log("Nombre Lote", $scope.nombreLote);
                }
            });
            //endregion

        });
				localStorageService.remove('dataOfflineGallo');
    } else {

    	console.log('app offline');

        //region to  get user unit from local PouchDB instead of server
        PouchDB.GetAllUserUnit(auth.userId()).then(function (result) {
        	if (result.status == 'fail') {
        		$scope.error = result.message;
        	}
        	else if (result.status == 'success') {


        		$scope.units = result.data;
        		console.log('local mode:', result.data);

            for (var i = 0; i < $scope.units.length; i++) {
              if ($scope.units[i]._id == $scope.unitId) {
                  $scope.nombreUnidad = $scope.units[i].nombre;
                  $scope.nombreLote = $scope.units[i].lote[$scope.loteIndex].nombre;
              }
            }

            console.log("Nombre Unidad", $scope.nombreUnidad);
            console.log("Nombre Lote", $scope.nombreLote);

        	}
        });
        //endregion
    }


     $scope.test = testInStore || {
	  	advMode : false,
	  	bandolas : false,
	  	resolved: false,
	  	user : $scope.currentId,
	  	plantas: [],
	  	unidad: {"user":auth.userId()},
			idunidad: $stateParams.idunidad,
      loteIndex:0,
	  	incidencia: 0,
	  	avgplnt : "",
			avgplntDmgPct : 0,
			incidencia : 0,
      date: new Date()
	  };

		$scope.test.user = $scope.currentId;
		console.log($scope.test.user);


    if ($rootScope.IsInternetOnline) {

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


   $scope.$watch('test', function () {
      localStorageService.set('localTestgallo', $scope.test);
    }, true);


	if(testInStore && Object.keys(testInStore.unidad).length > 1) {
		$('.gallo-wrap').addClass('initiated');
	}

  if(testInStore && testInStore.resolved) {
	  $('.test').hide();
	  $('.results').show();
  }

  // Inicio de muestreo de Ojo de Gallo
  $scope.startTest = function(userid,idunidad,loteindex) {
    $scope.vistaInicio = false;
    $scope.vistaCalculo = true;
		$scope.test.unidad = {"user":auth.userId()};
		$scope.test.idunidad = idunidad;
		$scope.test.loteIndex=loteindex;
		$('.gallo-wrap').addClass('initiated');
   }

	 // Sección de Bandolas
	 $scope.bandolas = function() {
		 if($scope.test.bandolas) {
			 $scope.test.bandolas = false;
		 } else {
			 $scope.test.bandolas = true;
		 }
		 var requiredLength=0;
		 if($scope.test.bandolas==true){
			 requiredLength=29; //KH - Modificación - 29 - 4
		 }
		 else{
			 requiredLength=49; //KH - Modificación - 49 - 4
		 }
		 if($scope.test.plantas.length>requiredLength)
		 {
			 $scope.IsTotalPlantaAdded=true;
		 }
		 else{
			 $scope.IsTotalPlantaAdded=false;
		 }

	 }

	$scope.addPlant = function() {
		$('.severity-list').removeClass('active');
		$("#btnCloseAndAddPlant").attr('disabled', 'disabled'); //KH - Desabilitar boton - Siguiente

		$scope.IsErrorInfrmGalloAddPlanta=false;
		$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
		$scope.IsErrorInfrmGalloAddPlantaLeaf=false;
		$scope.IsErrorInfrmGalloAddPlantaLeafAffected=false;
		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
		var requiredLength=0;
		if($scope.test.bandolas==true){
			console.log("Seleccioné 2 Bandolas");
			$scope.noBandolas = 0;
			requiredLength=29; //KH - Modificación - 29 - 4
			//$scope.noBandolas = 2;

		}
		else{
			console.log("Seleccioné 1 Bandola");
			requiredLength=49; //KH -Modificación - 49 - 4
			//$scope.noBandolas = 1;
		}
		if($scope.test.plantas.length>requiredLength)
		{
			$scope.IsTotalPlantaAdded=true;
			return false;
		}
		else{
			$scope.IsTotalPlantaAdded=false;
		}
		$scope.test.plantas.push([]);
		var plantName = $scope.test.plantas.length;
		console.log($scope.test.plantas.length);
		if($scope.test.bandolas==true){
			if ($scope.test.plantas.length==30){ //KH - Modificación - 30 - 5
				$("#btnCloseAndAddPlant").html('<span class="glyphicon glyphicon-ok-circle"></span> Cerrar');
			}else{
				$("#btnCloseAndAddPlant").html('<span class="glyphicon glyphicon-arrow-right"></span> Siguiente Planta');
			}
		}else{
			console.log("Estoy Acá");
			if ($scope.test.plantas.length==$scope.unabandola50){ //KH - Modificación - 50 - 5
				$("#btnCloseAndAddPlant").html('<span class="glyphicon glyphicon-ok-circle"></span> Cerrar');
			}else{
				$("#btnCloseAndAddPlant").html('<span class="glyphicon glyphicon-arrow-right"></span> Siguiente Planta');
			}
		}
		plantEditor(plantName);
		setTimeout(function () { $('[name=amount]').val(''); }, 100);
	};


	$scope.CloseAndAddPlant=function(){
		console.log($scope.test.plantas.length);
		if(($scope.test.bandolas==true) && ($scope.test.plantas.length>=30)){ //KH - Modificación - 30 - 5
			$scope.closePlant();
			console.log("Cerrramos planta");
			$('#plantModal').modal('hide');
		}else if (($scope.test.bandolas==false) && ($scope.test.plantas.length>=$scope.unabandola50)){ //KH - Modificación - 50 - 5
			$scope.closePlant();
			console.log("Cerrramos planta");
			$('#plantModal').modal('hide');
		}else{
			$scope.IsErrorInfrmGalloAddPlanta=false;
			$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
			$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
			$scope.addPlant();
		}
	}

	// Editar Planta
	$scope.editPlant = function($index) {
		if($scope.test.bandolas==true){
				if ($scope.test.plantas.length==30){ //KH - Modificación - 30 - 5
						$("#btnCloseAndAddPlant").html('<span class="glyphicon glyphicon-ok-circle"></span> Cerrar');
				}else{
						$("#btnCloseAndAddPlant").html('<span class="glyphicon glyphicon-arrow-right"></span> Siguiente Planta');
				}
		}else{
				if ($scope.test.plantas.length==$scope.unabandola50){ //KH - Modificación - 50 - 5
						$("#btnCloseAndAddPlant").html('<span class="glyphicon glyphicon-ok-circle"></span> Cerrar');
				}else{
						$("#btnCloseAndAddPlant").html('<span class="glyphicon glyphicon-arrow-right"></span> Siguiente Planta');
				}
		}
		$('.severity-list').removeClass('active');
		$scope.IsErrorInfrmGalloAddPlanta=false;
		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
		$scope.IsErrorInfrmGalloAddPlantaLeaf=false;
		$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
		plantEditor($index + 1);
		$scope.leafList = $scope.test.plantas[$index];
	}

	// Iniciar Leaf
	$scope.initLeaf = function(number) {
		if(!$scope.frmGalloAddPlanta.$valid || number==undefined || number<1 || number>99 ){
			$scope.IsErrorInfrmGalloAddPlanta=true;
			return;
		}
		else{
				$scope.IsErrorInfrmGalloAddPlanta=false;
				$scope.modal.numberSubmitted=true;
		}
		$('.severity-list').addClass('active');
		$scope.IsHideCloseAndAddPlantaButtonInPopup=true;
	}

	// Cerrar Planta
	$scope.closePlant = function() {
		$('.plant-editor').removeClass('active');
	}

	$scope.addLeaf = function(severity,isPrefixAddRequired) {
		if(isPrefixAddRequired)
		{
			if(!$scope.frmGalloAddPlantaAffectedLeaf.$valid){
					$scope.IsErrorInfrmGalloAddPlantaLeaf=true;
					$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
					return;
				}
				else{
						$scope.IsErrorInfrmGalloAddPlantaLeaf=false;
						$scope.modal.numberSubmitted=true;
				}
		}
		var amount = $('[name=amount]').val();
		if(isPrefixAddRequired)
		{
				if(severity>amount){
					console.log("Entre Severidad Mayor a Hojas");
					$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=true;
					return;
				}
				else{
					console.log("Entre Severidad Correcta");
					console.log("Bandolas Seleccionadas: ", $scope.test.bandolas);
					$scope.noBandolas += 1;
					console.log("Bandolas al momento: ", $scope.noBandolas);


					if ($scope.test.bandolas == false && $scope.noBandolas == 1){
						$("#btnCloseAndAddPlant").removeAttr('disabled', 'disabled');
						console.log("Habilité el botón");
						$scope.noBandolas = 0;
						// $scope.test.plantas.push([]);
					}
					else if ($scope.test.bandolas == true && $scope.noBandolas == 2) {
						$("#btnCloseAndAddPlant").removeAttr('disabled', 'disabled');
						console.log("Habilité el botón");
						$scope.noBandolas = 0;
						// $scope.test.plantas.push([]);
					}
					$scope.IsErrorInfrmGalloAddPlantaLeafAffectedLeaf=false;
				}
				severity='afectadas: ' + severity;
				console.log(severity);
		}else{
			$("#btnCloseAndAddPlant").removeAttr('disabled', 'disabled');
		}

		var plantIndex = $scope.plantname - 1;
		$scope.test.plantas[plantIndex].push([amount,severity]);
		$scope.leafList = $scope.test.plantas[plantIndex];
		$('[name=amount]').val('');
		$scope.affect ="";
		$('.severity-list').removeClass('active');
		$scope.modal.number="";
		$scope.modal.numberSubmitted=false;
		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
	};

		// Remover Planta
    $scope.removePlant = function (index) {
      $scope.test.plantas.splice(index, 1);
    };

		// Remover Leaf
    $scope.removeLeaf = function (index) {
			if ($scope.test.bandolas == false && $scope.noBandolas == 0) {
				$scope.noBandolas = 1;
				$("#btnCloseAndAddPlant").attr('disabled', 'disabled');
				$scope.noBandolas -= 1;
			}
			else if ($scope.test.bandolas == true && $scope.noBandolas == 0) {
				$scope.noBandolas = 2;
				$("#btnCloseAndAddPlant").attr('disabled', 'disabled');
				$scope.noBandolas -= 1;
			}
			else{
				$scope.noBandolas -= 1;
				$("#btnCloseAndAddPlant").attr('disabled', 'disabled');
			}

	  	var plantIndex = $scope.plantname - 1;
      $scope.test.plantas[plantIndex].splice(index, 1);
    };

		$scope.calculateTest = function() {
        console.log("vamos a calcular");

    	if ($scope.test.advMode) {

    		$scope.totalPlants = $scope.test.plantas.length;
				console.log("Total de Plantas - ", $scope.totalPlants); //KH Comentario
    		var totalPlantitas = $scope.totalPlants;
    		var totalLeaf = 0;
    		var totalIncidencePlant = [];
    		var totalDamagePlant = [];
    		var avgInc = 0;
    		var avgPct = 0;

    		for(var i = 0, len = $scope.totalPlants; i < len; i++) {
    			var affected = 0;
    			var avgDmg = 0;
    			var Dmg = [];
    			$.each($scope.test.plantas[i], function( index, value ) {
    				totalLeaf += parseInt(value[0]);
    				// if (value[1] !='0%') {
    					affected += parseInt(value[0]);
    					Dmg.push(parseInt(value[1]));
    				// }
    			});
    			totalIncidencePlant.push(affected);
    			$.each(Dmg, function( index, value ) {

    				avgDmg += parseInt(Dmg[index]);
    			});
    			var curAvgDmg = avgDmg / Dmg.length;
    			totalDamagePlant.push(curAvgDmg);

    		}
    		var incidenceLength = totalIncidencePlant.length;
    		for(var i = 0; i < incidenceLength; i++) {
    			avgInc += totalIncidencePlant[i];
    		}
    		var avg = avgInc / incidenceLength;
    		var damageLength = totalDamagePlant.length;
    		for(var i = 0; i < damageLength; i++) {
    			avgPct += totalDamagePlant[i];
    		}
    		var avgDmgPct = avgPct / damageLength;
    		$scope.avgIncidence = (avgInc/totalLeaf)*100;
    		$scope.test.avgplnt = avg;
    		$scope.test.avgplntDmgPct = avgDmgPct;
    		$scope.test.resolved = true;
    		$scope.test.incidencia = $scope.avgIncidence;
    	    $scope.test.unidad = {"user":auth.userId()};
            $scope.test.idunidad = $scope.unitId;
            $scope.test.loteIndex = $scope.loteIndex;
            $scope.getHelp($scope.totalPlants,$scope.avgplnt,$scope.avgplntDmgPct,$scope.currentUser());
            $('.test').hide();
            $('.results').show();
            $scope.vistaInicio = false;
 			 		  $scope.vistaCalculo = false;
 			 		  $scope.vistaResultado = true;
        } else {

					var contItems = 0;
					if ($scope.test.bandolas == false) {
						for (var i = 0; i < $scope.test.plantas.length; i++) {
							console.log($scope.test.plantas[i]);
							if ($scope.test.plantas[i].length === 0) {
									// alert("Error en Planta: " + (i + 1) +" No se puede calcular");
									$scope.SweetAlert("¡No se puede Calcular!", "Error en Planta: " + (i + 1), "error");
									console.log($scope.test.plantas[i]);
									break;
							}
							else {
								contItems += 1;
							}
						}
					} else if ($scope.test.bandolas == true) {
						console.log($scope.test.plantas);
						for (var i = 0; i < $scope.test.plantas.length; i++) {
							// console.log($scope.test.plantas[i].length);
							for (var j = 0; j < $scope.test.plantas[i].length; j++) {
								console.log($scope.test.plantas[i][j]);
							}
							if ($scope.test.plantas[i].length !== 2) {
									// alert("Error en Planta: " + (i + 1) +" No se puede calcular");
									$scope.SweetAlert("¡No se puede Calcular!", "Error en Planta: " + (i + 1), "error");
									console.log($scope.test.plantas[i]);
									break;
							}
							else {
								contItems += 1;
								console.log(contItems);
							}
						}
					}



					if (contItems === $scope.test.plantas.length ) {
						var plants = $scope.test.plantas,
						totalPlants = plants.length,
						affectedLeaf = [];
						affectedTotal = 0;
						allLeaf = [];
						totalLeaf = 0;
						$scope.totalPlantis = plants.length;

						$.each($scope.test.plantas, function( index, value ) {
						 var count = value[0][1].split(":"),
						 affectedCnt = parseInt(count[1]);
						 affectedLeaf.push(affectedCnt);
						});

						$.each($scope.test.plantas, function( index, value ) {
						 var totalCnt = parseInt(value[0][0]);
						 allLeaf.push(totalCnt);
						});

						for(var i = 0; i < affectedLeaf.length; i++) {
						 affectedTotal += affectedLeaf[i];
						}

					 for(var i = 0; i < allLeaf.length; i++) {

							 totalLeaf += parseInt(allLeaf[i]);
					 }

					 var avgAffected = affectedTotal / affectedLeaf.length,
					 avgLeaf = totalLeaf / totalPlants,
					 percent = (avgAffected/avgLeaf)*100;

					 $scope.test.incidencia = percent;
					 $scope.test.resolved = true;
					 $scope.getHelp($scope.currentUser());


					 $('.test').hide();
					 $('.results').show();
           $scope.vistaInicio = false;
           $scope.vistaCalculo = false;
           $scope.vistaResultado = true;
					}
   }
};


    $scope.getHelp = function(currentUser) {

      console.log($scope.test);
      if ($rootScope.IsInternetOnline) {

    			gallo.create($scope.test).then(function (result) {
    				$scope.SweetAlert("¡Excelente!", "Muestreo Realizado", "success");
    				console.log("Muestreo Gallo realizado");
    				console.log(result);
    				console.log(result.data);

    				console.log("Historial de Gallo - Servidor: ",$scope.galloHistory);
    				$scope.galloHistory.push(result.data);
    				console.log("Historial de Gallo Actualizado - Servidor: ",$scope.galloHistory);

    				var msg = 'Calculo De Gallo Enviado: ID: ' + result.data._id + '.' ;
    	     	var data_server={
    	        message:msg,
    	        to_user:'admin',
    	        from_id:currentUser
    	    	};

    		    socket.emit('get msg',data_server);

    			});
    		}else {
    			PouchDB.GetGalloFromPouchDB().then(function (result) {
    					console.log("entramos a PouchDB");
    					console.log(result);

    					if (result.status == 'fail') {
    							$scope.error = result.message;
    					}
    					else if (result.status == 'success') {
    							var doc = {"list":[]};
    							if (result.data.rows.length > 0) {
                                    doc =result.data.rows[0].doc;
                                }
                                var galloArrayPouchDB = [];
                                for (var i = 0; i < doc.list.length; i++) {
                                        galloArrayPouchDB.push(doc.list[i]);
                                }
                                $scope.galloLocalesPouchDB = galloArrayPouchDB;

                                console.log("Historial de Gallo - PouchDB: ");
                                console.log($scope.galloLocalesPouchDB);
                                console.log($scope.test);
                                $scope.galloLocalesPouchDB.push($scope.test);

                                console.log("Historial de Gallo - PouchDB Actualizado: ");
                                console.log($scope.galloLocalesPouchDB);

                                //Mandamos el nuevo arreglo a pouchDB
                                PouchDB.SaveGalloToPouchDB($scope.galloLocalesPouchDB);
                                $scope.SweetAlert("¡Excelente!", "Muestreo Realizado", "success");
    					}
    			}).catch(function(err) {
    					console.log("error al obtener datos");
    					console.log(err);
    			});
    		}
    }


var historialLaunchFunc = function() {

  if ($rootScope.IsInternetOnline) {
        console.log("Con internet");
        console.log($scope.user_Ided);

        gallo.getUser($scope.user_Ided).then(function(userhistory){
           $scope.galloHistory = userhistory.data;
           console.log("Historial de Gallo - Servidor: ", userhistory.data);
       });

  }else {
    console.log("No internet");
    console.log($scope.user_Ided);

    PouchDB.GetGalloFromPouchDB().then(function (result) {
          console.log("entramos a PouchDB");
          console.log(result);

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
                 console.log("Historial de Gallo - PouchDB: ", galloArray);
             }
         }
    }).catch(function(err) {
        console.log("error al obtener datos");
        console.log(err);
    });
  }

}


// historialLaunchFunc();
$scope.historialLaunch = historialLaunchFunc();



}]);
