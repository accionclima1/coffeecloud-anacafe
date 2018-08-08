app.controller('CampoCtrl', [
'$rootScope',
'$scope',
'$state',
'auth',
'localStorageService',
'socket',
'unit',
'user',
'methods',
'campoService',
'PouchDB',
function($rootScope, $scope, $state, auth, localStorageService, socket, unit, user, methods, campoService, PouchDB){
  $scope.currentUser = auth.currentUser;
  $scope.resultscampo = false;
  var currentId = auth.currentUser();
  var testInStore = localStorageService.get('localTestCampo');
  $scope.ClearTest = function(){
  	localStorageService.remove('localTestCampo');
  	$state.go($state.current, {}, {reload: true})
  }
  $scope.user_Ided = auth.userId();
  var plantEditorCampo = function(plant) {
	  $scope.plantname = plant;
	  $scope.leafList = $scope.test.plantas[plant - 1];
	  //console.log($scope.leafList);
	  $('#plantModal').modal('show');
  };
    $scope.affect = 1;
    
    
    
    
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
                    //if($scope.userO7.units.length === result.data.length){

                    //	$scope.units = result.data;
                    //	console.log('local mode:',result.data);

                    //} else {
                    //	console.log('server mode:', $scope.userO7.units);
                    //	$scope.units = $scope.userO7.units;
                    //	$scope.remoteMode = true;
                    //}


                }
            });
            //endregion

        });
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


            }
        });
        //endregion
    }

    
    
     $scope.test = testInStore || {
	  	advMode : false,
	  	bandolas : false,
	  	resolved: false,
	  	user : currentId,
	  	plantas: [],
	  	unidad: {},
	  	incidencia: 0,
	  	avgplnt : "",
		avgplntDmgPct : 0,
		incidencia : 0
	  };

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

  
   $scope.$watch('test', function () {
      localStorageService.set('localTestCampo', $scope.test);
    }, true);
 
  
  if(testInStore && Object.keys(testInStore.unidad).length > 1) {
	  $('.roya-wrap').addClass('initiated');
  }
  
  if(testInStore && testInStore.resolved) {
	  $('.test').hide();
	  $('.results').show();
  }
	
  $scope.startTest = function(selectedUnit) {
	  selectedUnit["user"] = userid
	  $scope.test.unidad = selectedUnit;
	  $('.roya-wrap').addClass('initiated');
   }
   $scope.bandolas = function() {
	   if($scope.test.bandolas) {
		  $scope.test.bandolas = false;
	  } else {
		  $scope.test.bandolas = true;
	  }
	}
	$scope.addPlant = function() {
		$scope.test.plantas.push([]);
		var plantName = $scope.test.plantas.length;
		plantEditorCampo(plantName);
		setTimeout(function () { $('[name=amount]').val(''); }, 100);
	};
	
	$scope.editPlant = function($index) {
		plantEditorCampo($index + 1);
		$scope.leafList = $scope.test.plantas[$index];
	}
	
	$scope.initLeaf = function() {
		$('.severity-list').addClass('active');
	}
	
	$scope.closePlant = function() {
		$('.plant-editor').removeClass('active');
	}
	
	$scope.addLeaf = function(severity) {
		var amount = $('[name=amount]').val();
		var plantIndex = $scope.plantname - 1;
		$scope.test.plantas[plantIndex].push([amount,severity]);
		$scope.leafList = $scope.test.plantas[plantIndex];
		$('[name=amount]').val('');
		$scope.affect = 1;
		$('.severity-list').removeClass('active');
	};

    $scope.removePlant = function (index) {
      $scope.test.plantas.splice(index, 1);
    };
    
    $scope.removeLeaf = function (index) {
	  var plantIndex = $scope.plantname - 1;
      $scope.test.plantas[plantIndex].splice(index, 1);
    }; 

    $scope.addPlantMutiple = function(data){
    	var plantIndex = $scope.plantname - 1;
    	$scope.test.plantas[plantIndex].push(data)

    }
    $scope.SaveTestRecord = function() {
    	    testInStore = localStorageService.get('localTestCampo');

  			if(testInStore == null) 
  			{
  				alert("Hubo un error. No se pudo completar la solicitud. Por favor rellene los detalles de las plantas.")
  				return false;
  			}
  			campoService.SaveCampoUnitTest(testInStore).then(function(success){
  				//alert("The test has been saved.")
  				//alert("Se ha guardado la prueba.")
  				if(success.data == 1){
  				 localStorageService.remove('localTestCampo');
  				 $scope.resultscampo = true;

  				 $('.test').hide();
				 $('.results').show();
  				}
  				else{
  					  alert("Hubo un error. No se pudo completar la solicitud. Por favor rellene los detalles de las plantas.")
  				}
  			},function(err){
  				console.log(err)
  				if(err.status == 404){
  				  alert("Hubo un error. No se pudo completar la solicitud.")
  				 // alert("There went an error. Request could not be completed.")
  				}
  				
  			})
    		
    };
    //AKhil
    $scope.getHelp = function(currentUser) { 
	    
	    
	    campoService.create(testInStore).success(function(data){
		    
		    
		    
		     var msg = 'Calculo De Campo Enviado: ID: ' + data._id + '.' ;
		  	 var data_server={
	            message:msg,
	            to_user:'admin',
	            from_id:currentUser
	        };
	        socket.emit('get msg',data_server);

		    
	        localStorageService.remove('localTestCampo');
        });
	    
	           
        
        
    };
    
    var historialLaunchFunc = function() {
	    
	    if ($rootScope.IsInternetOnline) {
		    
			  campoService.getUser($scope.user_Ided).then(function(userhistory){
				  $scope.campoHistory = userhistory.data;
				  localStorageService.set('campoHistory',userhistory.data);
				  console.log($scope.galloHistory);
			  });
			  
		} else {
			$scope.campoHistory = localStorageService.get('campoHistory');	  
		}
    };
    historialLaunchFunc();
    $scope.historialLaunch = historialLaunchFunc();
    
}]);