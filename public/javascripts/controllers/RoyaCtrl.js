app.controller('RoyaCtrl', [
	'$rootScope',
	'$scope',
	'$state',
	'$stateParams',
	'auth',
	'localStorageService',
	'socket',
	'unit',
	'user',
	'methods',
	'roya',
	'PouchDB',
	'onlineStatus',
	function($rootScope, $scope, $state, $stateParams, auth, localStorageService, socket, unit, user, methods, roya, PouchDB, onlineStatus){
		$scope.currentUser = auth.currentUser;
		console.log($scope.currentUser);
		$scope.currentId = auth.currentUser();
		console.log("Nombre de Usuario: ", $scope.currentId);
		var testInStore = localStorageService.get('localTest');

		$scope.IsErrorInfrmRoyaAddPlanta=false;
		$scope.IsErrorInfrmRoyaAddPlantaLeaf=false;
		$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
		$scope.IsTotalPlantaAdded=false;
		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;

		$scope.modal={};
		$scope.modal.number="";
		$scope.modal.numberSubmitted=false;
		$scope.user_Ided = auth.userId();
		$scope.noBandolas = 0;
		$scope.unitId = $stateParams.idunidad;
		$scope.loteIndex = $stateParams.indexlote;
		$scope.unitIndex = $stateParams.indexunidad;
        $scope.unabandola50=2;
		$scope.arrOffline = [];
		$scope.nombreUnidad = "";
		$scope.nombreLote = "";
		$scope.numeroDeHojas = 0;
		$scope.hojasPorPlanta = [];
		$scope.severidad = {};
		$scope.vistaInicio = true;
		$scope.vistaCalculo = false;
		$scope.vistaResultado = false;
		$scope.royaLocalesPouchDB = [];
		var currentDT=new Date();
		console.log($scope.idUser, $scope.unitId, $scope.loteIndex);


		$scope.onlineStatus = onlineStatus;

		$scope.$watch('onlineStatus.isOnline()', function (online) {
			$scope.online_status_string = online ? 'online' : 'offline';
			onlineStatus = $scope.online_status_string;

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

		$scope.ClearTest = function(option){
			if (option == true) {
				console.log("Reinicar");
				$scope.vistaInicio = true;
				$scope.vistaCalculo = false;
				$scope.vistaResultado = false;
				$scope.IsErrorInfrmRoyaAddPlanta=false;
				$scope.IsErrorInfrmRoyaAddPlantaLeaf=false;
				$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
				$scope.IsTotalPlantaAdded=false;
				$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
				localStorageService.remove('localTest');
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

	// Función Historial de Muestreos Roya
	$scope.backHistorial = function(){
		console.log("Reinicar");
		$scope.vistaInicio = true;
		$scope.vistaCalculo = false;
		$scope.vistaResultado = false;
		$scope.IsErrorInfrmRoyaAddPlanta=false;
		$scope.IsErrorInfrmRoyaAddPlantaLeaf=false;
		$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
		$scope.IsTotalPlantaAdded=false;
		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
		localStorageService.remove('localTest');
		$state.go("homeloteinternal", {idunidad: $scope.unitId, indexunidad: $scope.unitIndex, indexlote: $scope.loteIndex}, {reload: true});
	}

	$scope.soporte = function(){
		console.log("Soporte");
		$scope.vistaInicio = true;
		$scope.vistaCalculo = false;
		$scope.vistaResultado = false;
		$scope.IsErrorInfrmRoyaAddPlanta=false;
		$scope.IsErrorInfrmRoyaAddPlantaLeaf=false;
		$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
		$scope.IsTotalPlantaAdded=false;
		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
		localStorageService.remove('localTest');
		var resutadoRoya= ($scope.test.incidencia).toFixed(2);
		$scope.chat = {
			timestamp:currentDT,
			subject:"Incidencia: "+ resutadoRoya + " ,Plantas: " + $scope.totalPlantis,
			sender:$scope.currentUser,
			receiver:"",
			solved:false
		}
		roya.createsupport($scope.chat).then(function (result){
			$scope.idsuport= result.data._id;
			console.log("new_conversation created", $scope.idsuport);
			$state.go("support_conversation", {'supportID':$scope.idsuport ,'pagina':0}, {reload: true});
		});
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
								console.log($scope.units);

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
				localStorageService.remove('dataOffline');


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
      	idunidad:"",
      	loteIndex:0,
    	incidencia: 0,
    	avgplnt : "",
    	avgplntDmgPct : 0,
    	incidencia : 0,
		date: new Date(),
		createdAt: new Date()
    };

		$scope.test.user = $scope.currentId;
		console.log($scope.test.user);

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
		}


    $scope.$watch('test', function () {
    	localStorageService.set('localTest', $scope.test);
    }, true);


    if(testInStore && Object.keys(testInStore.unidad).length > 1) {
    	$('.roya-wrap').addClass('initiated');
    }

    if(testInStore && testInStore.resolved) {
    	$('.test').hide();
    	$('.results').show();
    }

    $scope.startTest = function(userid,idunidad,loteindex) {
			$scope.vistaInicio = false;
			$scope.vistaCalculo = true;
    	$scope.test.unidad = {"user":auth.userId()};
        $scope.test.idunidad = $scope.unitId;
        $scope.test.loteIndex=$scope.loteIndex;
    	$('.roya-wrap').addClass('initiated');
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
    	$scope.IsErrorInfrmRoyaAddPlanta=false;
    	$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
    	$scope.IsErrorInfrmRoyaAddPlantaLeafAffected=false;
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
    		$scope.IsErrorInfrmRoyaAddPlanta=false;
    		$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
    		$scope.IsHideCloseAndAddPlantaButtonInPopup=false;
    		$scope.addPlant();
    	}
    }

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
        $scope.IsErrorInfrmRoyaAddPlanta=false;
        $scope.IsErrorInfrmRoyaAddPlantaLeaf=false;
        $scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
        $scope.IsHideCloseAndAddPlantaButtonInPopup=false;
        plantEditor($index + 1);
        $scope.leafList = $scope.test.plantas[$index];
    }

    $scope.initLeaf = function(number) {
			console.log(number);
			$scope.numeroDeHojas = number;
    	if(!$scope.frmRoyaAddPlanta.$valid || number==undefined || number<1 || number>99 ){
    		$scope.IsErrorInfrmRoyaAddPlanta=true;
    		return;
    	}
    	else{
    		$scope.IsErrorInfrmRoyaAddPlanta=false;
    		$scope.modal.numberSubmitted=true;
    	}

    	$('.severity-list').addClass('active');
    	$scope.IsHideCloseAndAddPlantaButtonInPopup=true;
    }

		// Cerrar Planta
    $scope.closePlant = function() {
    	$('.plant-editor').removeClass('active');
    }

    $scope.addLeaf = function(severity,isPrefixAddRequired, hojasPorPlanta) {

			console.log(severity);
			console.log(isPrefixAddRequired);
    	if(isPrefixAddRequired)
    	{
    		if(!$scope.frmRoyaAddPlantaAffectedLeaf.$valid){
    			$scope.IsErrorInfrmRoyaAddPlantaLeaf=true;
    			$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
    			return;
    		}
    		else{
    			$scope.IsErrorInfrmRoyaAddPlantaLeaf=false;
    			$scope.modal.numberSubmitted=true;
    		}
    	}
    	var amount = $('[name=amount]').val();
			console.log(amount);
    	if(isPrefixAddRequired)
    	{
    		if(severity>amount){
					console.log("Entre Severidad Mayor a Hojas");
    			$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=true;
    			return;
    		}
    		else{
					console.log("Entre Severidad Modo Básico");
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
					}
    			$scope.IsErrorInfrmRoyaAddPlantaLeafAffectedLeaf=false;
    		}
    		severity='afectadas: ' + severity;
				console.log(severity);

    	}
			else{
				console.log("Entre Severidad Modo Avanzado");
				console.log("Bandolas Seleccionadas: ", $scope.test.bandolas);
				$scope.noBandolas += 1;
				console.log("Bandolas al momento: ", $scope.noBandolas);

				if ($scope.test.bandolas == false && $scope.noBandolas == 1) {
					$("#btnCloseAndAddPlant").removeAttr('disabled', 'disabled');
					console.log("Habilité el botón");
					$scope.noBandolas = 0;
				}
				else if ($scope.test.bandolas == true && $scope.noBandolas == 2) {
					$("#btnCloseAndAddPlant").removeAttr('disabled', 'disabled');
					console.log("Habilité el botón");
					$scope.noBandolas = 0;
				}
			}

			var plantIndex = $scope.plantname - 1;
			$scope.test.plantas[plantIndex].push([amount,severity,hojasPorPlanta]);
			console.log($scope.test.plantas);
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
			// $scope.test.plantas.splice(index, 1);
    };

		// Promedio de Plantas por Hojas según Severidad
		$scope.promedioPlanta = function(){
			$scope.sumaDeHojas = 0;
			$scope.promedio = 0;
			console.log($scope.numeroDeHojas);
			for (var i = 0; i < 7; i++) {
				if ($(".sev"+i).val() == "") {
					$scope.hojasPorPlanta[i] = 0;
 				}
				else {
					$scope.hojasPorPlanta[i] = parseInt($(".sev"+i).val());
					$scope.sumaDeHojas += parseInt($(".sev"+i).val());
				}
				console.log("input", $(".sev"+i).val());
			}

			$scope.severidad.severidad_0 = $scope.hojasPorPlanta[0];
			$scope.severidad.severidad_1 = $scope.hojasPorPlanta[1]
			$scope.severidad.severidad_2 = $scope.hojasPorPlanta[2];
			$scope.severidad.severidad_3 = $scope.hojasPorPlanta[3];
			$scope.severidad.severidad_4 = $scope.hojasPorPlanta[4];
			$scope.severidad.severidad_5 = $scope.hojasPorPlanta[5];
			$scope.severidad.severidad_6 = $scope.hojasPorPlanta[6];

			console.log($scope.sumaDeHojas);
			console.log($scope.hojasPorPlanta);
			if ($scope.sumaDeHojas !== $scope.numeroDeHojas) {
				$scope.SweetAlert('¡Error!', 'Cantidad de hojas incorrectas. La sumatoria debe dar un total de: '+$scope.modal.number+" hojas.", 'error');
			}
			else{
				$scope.promedio = ($scope.hojasPorPlanta[0] * 0) + ($scope.hojasPorPlanta[1] * 1) + ($scope.hojasPorPlanta[2] * 2) + ($scope.hojasPorPlanta[3] * 3) + ($scope.hojasPorPlanta[4] * 4) + ($scope.hojasPorPlanta[5] * 5);
				$scope.promedio = ($scope.promedio + $scope.hojasPorPlanta[6] * 6) / ($scope.numeroDeHojas * 6);
				// $scope.promedio = $scope.promedio.toFixed(2);
				$scope.promedio = ($scope.promedio * 100) / 1;
				$scope.promedio = Math.round($scope.promedio.toFixed(2));
				$scope.promedio = $scope.promedio.toString() + "%";
				console.log("Array", $scope.severidad);
				console.log("Promedio: ", $scope.promedio.toString());


				// Limpiamos los inputs
				for (var i = 0; i < 7; i++) {
					$(".sev"+i).val("");
				}

				$scope.addLeaf($scope.promedio,false, $scope.severidad)
			}

			// console.log();

		}

    $scope.calculateTest = function() {
        console.log("vamos a calcular");

    	if ($scope.test.advMode) {

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
		        $scope.getHelp($scope.currentUser());
		        $('.test').hide();
		        $('.results').show();
						$scope.vistaInicio = false;
 			 		  $scope.vistaCalculo = false;
 			 		  $scope.vistaResultado = true;
					}
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

	//Mandamos el nuevo arreglo a pouchDB
	PouchDB.SaveRoyaToPouchDB($scope.test);
	$scope.SweetAlert("¡Excelente!", "Muestreo Realizado", "success");

	if ($rootScope.IsInternetOnline) {

			roya.create($scope.test).then(function (result) {
					//$scope.SweetAlert("¡Excelente!", "Muestreo Realizado", "success");
					console.log("Muestreo Roya realizado");
					console.log(result);
					console.log(result.data);

					console.log("Historial de Roya - Servidor: ",$scope.royaHistory);
					var promesa = PouchDB.SynServerDataAndLocalData();
					$rootScope.conexionStatus="Sincronizando";
					if(promesa!=false){
						promesa.then(function () {
							$rootScope.conexionStatus="";
						}).catch(function (err) {
							$rootScope.conexionStatus="Error de Sincronización";
							console.log("Not able to sync" + err);
							//$scope.ResetNewUnit();
						});
					}else{
						$rootScope.conexionStatus="";
					}
					//$scope.royaHistory.push(result.data);
					console.log("Historial de Roya Actualizado - Servidor: ",$scope.royaHistory);

					var msg = 'Calculo De Roya Enviado: ID: ' + result.data._id + '-' + result.data.createdAt + '.';
		     	var data_server={
		        message:msg,
		        to_user:'admin',
		        from_id:currentUser
		    	};

			    //socket.emit('get msg',data_server);
			});
	}
}


$scope.graficarHitorial = function () {


    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--)
            if (this[i] == obj)
                return true;
            return false;
        }

        $("#datagUnit").css({display:"block"});

        var data = $scope.royaHistory;
        var fechas = [];
        var puntosIncidencia = [];
        var listaUnidades = [];
        var puntosIncidenciaPorUnidad = [];


        for (var i = 0; i < data.length; i++) {

            if (!fechas.contains(data[i].createdAt)){
                fechas.push(data[i].createdAt);
            }
						console.log(data[i]);
            puntosIncidencia.push({meta: data[i].unidad.user,value: data[i].incidencia});

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


        var dataG = new Chartist.Line('#datagUnit', {
          labels: fechas,
          series: puntosIncidenciaPorUnidad
      }, {
          fullWidth: true,

          chartPadding: {
            right: 40
        },
        plugins: [
            Chartist.plugins.tooltip()
        ]


    });

    }

    var usrid = auth.userId();
    //$scope.user_Ided = "5972883cd33b92bd04007443";


var historialLaunchFunc = function() {

  if ($rootScope.IsInternetOnline) {
        console.log("Con internet");
        console.log($scope.user_Ided);

        roya.getUser($scope.user_Ided).then(function(userhistory){
           $scope.royaHistory = userhistory.data;
					 console.log("Historial de Roya - Servidor: ", userhistory.data);
       });

  }else {
    console.log("No internet");
    console.log($scope.user_Ided);

		PouchDB.GetRoyaFromPouchDB().then(function (result) {
					console.log("entramos a PouchDB");
					console.log(result);

					if (result.status == 'fail') {
							$scope.error = result.message;
					}
				 else if (result.status == 'success') {
						 if (result.data.rows.length > 0) {
						 var doc = result.data.rows[0].doc;
								 var royaArray = [];
								 for (var i = 0; i < doc.list.length; i++) {
										 royaArray.push(doc.list[i]);
								 }
								 console.log("Historial de Roya - PouchDB: ", royaArray);
						 }
				 }
		}).catch(function(err) {
				console.log("error al obtener datos");
				console.log(err);
		});
	}
}
    //historialLaunchFunc();
    $scope.historialLaunch = historialLaunchFunc();

}]);
