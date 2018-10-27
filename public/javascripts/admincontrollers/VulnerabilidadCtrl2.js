//Encuestas factory
app.factory('encuestaunit', ['$http', 'auth', function ($http, auth) {
    var o = {

    };
		o.getAll = function () {
			return $http.get('/encuesta-unit').success(function (data) {
				return data;
			});
		};


		/*

		o.getByFilters = function () {
				return $http.get('/encuesta-unit').success(function (data) {
						return data;
				});
		};*/




    return o;
}]);


//adaptation controller
app.controller('VulnerabilidadCtrl2', [
	'$scope',
	'auth',
	'$location',
	'encuestaunit',
	'encuesta','Excel', '$timeout',
	function ($scope, auth, $location,encuestaunit, encuesta, Excel, $timeout) {

		$scope.encuestas=[];
		$scope.amountTests=0;
		$scope.averageTests=0;
		$scope.dataGrid=[];

		encuestaunit.getAll().then(function (tests){
			console.log(tests);
			$scope.setTests(tests.data);

		});;

		$scope.setTests=function(tests){

			$scope.dataGrid=$scope.setDataGrid(tests);

			$scope.gridOptionsEvaluation.data=$scope.dataGrid;


				//Calcula número de tests
				$scope.amountTests=tests.length;

				//Calcula la incidencia Promedio
				$scope.averageTests=$scope.calculateaverageTests(tests);


				console.log(tests.length);

		};
//La siguiente funcion calcula el valor promedio de tests
		$scope.calculateaverageTests=function(tests){
			var promedio=0;
			var testsvalidos=0;

			for (var i = 0; i < $scope.amountTests; i++) {

				//console.log(i+ " "+ tests[i].resumenVulne[0]);
				if (tests[i].resumenVulne.length!=0) {
				//	console.log("Valor: "+tests[i].resumenVulne[0].valor);

				if (typeof tests[i].resumenVulne[0].valor!='undefined') {
					promedio=promedio+tests[i].resumenVulne[0].valor;
					console.log("Value: "+promedio+tests[i].resumenVulne[0].valor);
					//console.log(promedio);
					testsvalidos++;
					console.log(testsvalidos+ " Valor: "+tests[i].resumenVulne[0].valor);
				}

				}
			}

			console.log("Promedio: "+promedio);
			console.log("Numero: "+testsvalidos);

			return (promedio/testsvalidos).toFixed(3);
		}


		//El siguiente método cargará los datos para el gridOptions
		$scope.setDataGrid=function(tests){

			var datagrid=[];

			angular.forEach(tests, function(value, key){

				var encuesta={};


				if (value.resumenVulne.length!=0 && value.myunit.length!=0) {
				//	console.log("Valor: "+tests[i].resumenVulne[0].valor);

				if (typeof value.resumenVulne[0].valor!='undefined') {

					encuesta.departamento=value.myunit[0].departamento;
					encuesta.municipio=value.myunit[0].municipio;
					encuesta.municipio=value.myunit[0].municipio;
					encuesta.nombre=value.myunit[0].nombre;
					encuesta.valor=value.resumenVulne[0].valor;
					encuesta.fecha=value.resumenVulne[0].fecha.split('T')[0];

					datagrid.push(encuesta);



				}

				}






	});

	return datagrid;

		};


		$scope.gridOptionsEvaluation = {
			"data":$scope.dataGrid,
			"enableFiltering":true,
			"enableGridMenu": true,
			"enableSelectAll": true,
			"exporterCsvFilename": 'datosencuesta.csv',
			"exporterExcelFilename": 'myFile.xlsx',
			"exporterExcelSheetName": 'Sheet1',
			"columnDefs":[
				{field:"departamento",displayName:"Departamento"},
				{field:"municipio",displayName:"Municipio"},
				{field:"nombre",displayName:"Nombre"},
				{field:"valor",displayName:"Escala"},
				{field:"fecha",displayName:"Fecha"}
			]
		};

	}]);
