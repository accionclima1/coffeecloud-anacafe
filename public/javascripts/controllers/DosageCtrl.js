app.controller('DosageCtrl', [
'$scope',
'$state',
'auth',
'localStorageService',
'socket',
function($scope, $state, auth,localStorageService, socket){
  var tempEstanions;
  $scope.currentUser=auth.currentUser;
  /*if($scope.plantsByHa=='ot'){

  }*/
  $scope.dosage = {resultado: "--"}
  
  
  $scope.typeChange = function() {
	  $scope.dosage.productName = "";
  }
  
  $scope.calculateDosage= function(){
	
    var litrosHa = ($scope.dosage.litersWornOut / $scope.dosage.plantsAtomised) * 5000;
    console.log('litrosHa: ', litrosHa);
    
    var resultado = $scope.dosage.productName / litrosHa;
    
    $scope.dosage.resultado = resultado.toFixed(2);
    
    if($scope.dosage.productType == 'Ojo de gallo' && $scope.dosage.producto2) {
	    	var resultadoS = 2000 / litrosHa;
    
			$scope.dosage.resultadoS = resultadoS.toFixed(2);
    }
    
  }
  
  $scope.clear = function() {
	   $scope.dosage = {resultado: "--"}
  }

}]);