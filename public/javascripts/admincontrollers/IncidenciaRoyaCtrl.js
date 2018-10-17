app.factory('royaunits', ['$http', 'auth', function ($http, auth) {
	var o = {

	};
	o.getAll = function () {
		return $http.get('/roya-unit').success(function (data) {
			return data;
		});
	};



	o.get = function (parameters) {

		var par=JSON.stringify(parameters);

		var req = {
			method: 'GET',
			url: '/roya-unit',
			data:{dat:par}
		 };
		 console.log(par);
		return $http.post('/roya-unit',parameters).success(function (data) {
			return data;
		});
	};


	o.create = function (roya) {
		return $http.post('/roya', roya, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function (data) {
			return data;
		});
	};
	o.delete = function (test) {
		return $http.delete('/roya/' + test, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function (data) {
			return data
		});
	};

	return o;
}]);


//Roya controller
app.controller('IncidenciaRoyaCtrl', [
	'$scope',
	'auth',
	'$location',
	'roya',
    '$window',
    'user', 'Excel', '$timeout','royaunits',
	function ($scope, auth, $location, roya, $window, user, Excel, $timeout,royaunits) {
	var mymap=null;
	$scope.deptos=muni14.data;
	$scope.incidencesVsDate=[];
	$scope.allRoya=[];
	$scope.royaGrid1=[];
	$scope.markers=[];
	console.log($scope.incidencesVsDate);
console.log(Date.UTC(1970, 1,  6));
console.log((new Date("1970-01-06")));
	royaunits.getAll().then(function (result) {
		$scope.markers=[];

		//console.log(result.data);


		

		result.data.forEach(element => {
			var marker={};

			var incidenceVsDate=[Date.parse(element.createdAt),element.incidencia];
			if (element.myunit[0]!=undefined) {
				element.nombreUnidad=element.myunit[0].nombre;
				element.municipio=element.myunit[0].municipio;
				element.departamento=element.myunit[0].departamento;
				element.ubicacion=element.myunit[0].ubicacion;
				if (element.myunit[0].lote[element.loteIndex]!=undefined) {
					element.lote=element.myunit[0].lote[element.loteIndex].nombre;
				}

				marker.ubicacion=element.ubicacion;
				marker.incidencia=element.incidencia;
				marker.unidad=element.lote;
				

				if(marker.ubicacion){
					marker.ubicacion = marker.ubicacion.replace("(","");
					marker.ubicacion = marker.ubicacion.replace(")","");
					var arrDatos = marker.ubicacion.split(",");
					if(arrDatos.length==2){
							marker.latitud=arrDatos[0];
							marker.longitud=arrDatos[1];
							marker.color="green";
							$scope.markers.push(marker);
					}
			}

			}
		

			$scope.incidencesVsDate.push(incidenceVsDate);


			console.log(incidenceVsDate);
	


			
		});
		$scope.allRoya=result.data;

	
		$scope.addMarkers($scope.markers);
		$scope.graphicRoyaVsTime($scope.incidencesVsDate);
		$scope.loadGrid1($scope.allRoya);




		
	});



	$scope.selectedDepto="";
	$scope.munis=[];

	$scope.changeDepto=function (){

	console.log($scope.selectedDepto);
		$scope.selectedMuni="Todos";

for (var i = 0; i < $scope.deptos.length; i++) {

console.log($scope.deptos[i].dept+" es igual a "+$scope.selectedDepto);
	if ($scope.deptos[i].dept==$scope.selectedDepto) {
		$scope.munis=$scope.deptos[i].munis;
		break;

	}

}

	}

	$scope.mostrarMapa = function(){

	if(mymap==null){
		mymap = L.map('royamap').setView([14.973642, -90.450439], 8);
	}else{

	}
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiaWFvZ3QiLCJhIjoiY2o0dGN6cjlkMDcwODJ4bGF2dDFndGdvciJ9.ACiNe407LOOTTKtT-7-lLA'
	}).addTo(mymap);




		}

//Se cargará el array roya_units





		$scope.mostrarMapa();




		Highcharts.setOptions({
			lang: {
				months: [
					'Enero', 'Febrero', 'Marzo', 'ABril',
					'Mayo', 'Junio', 'Julio', 'Agosto',
					'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
				],
				weekdays: [
					'Dimanche', 'Lundi', 'Mardi', 'Mercredi',
					'Jeudi', 'Vendredi', 'Samedi'
				]
			}
		});

$scope.royas=[];

var roya={Departamento:"Chiquimula",Municipio:"Chiquimula",Unidad:"La Paz",Lote:"Lote 1",Incidencia:12.5};
$scope.royas.push(roya);
roya={Departamento:"Huehuetenango",Municipio:"Zacapatecas",Unidad:"La Perla",Lote:"Primer Lote",Incidencia:20};
$scope.royas.push(roya);
roya={Departamento:"Alta Verapaz",Municipio:"Chisec",Unidad:"Cataratas",Lote:"Lote 2",Incidencia:12.3};
$scope.royas.push(roya);
roya={Departamento:"Baja Verapaz",Municipio:"Salamá",Unidad:"Finca El Mezón",Lote:"EL Mezón 1",Incidencia:7};
$scope.royas.push(roya);
roya={Departamento:"Quetzaltenango",Municipio:"Xela",Unidad:"EL Mecapán",Lote:"Mecapázn 3",Incidencia:23};
$scope.royas.push(roya);
roya={Departamento:"San Marcos",Municipio:"Chohocol",Unidad:"Finca Sierra Linda",Lote:"Sierra 32",Incidencia:7};
$scope.royas.push(roya);
roya={Departamento:"Alta Verapáz",Municipio:"Cobpan",Unidad:"Finca San Marcos",Lote:"Lote 3",Incidencia:23};
$scope.royas.push(roya);
roya={Departamento:"Suchitepequez",Municipio:"Suchitos",Unidad:"Unidad 1",Lote:"Lote 1",Incidencia:7.8};
$scope.royas.push(roya);


$scope.graphicRoyaVsTime=function (royas) {

	Highcharts.chart('scatterroyachart', {
		chart: {
			type: 'scatter',
			zoomType: 'xy'
		},
		title: {
			text: 'Incidencia de Roya en el tiempo.'
		},
		subtitle: {
			text: 'Source: Coffee Cloud'
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: { // don't display the dummy year
				month: '%e. %b',
			year: '%b',
	
			},
			title: {
				text: 'Date'
			}
		},
		yAxis: {
			title: {
				text: 'Incidencia %'
			}
		},
		legend: {
			layout: 'vertical',
			align: 'left',
			verticalAlign: 'top',
			x: 100,
			y: 70,
			floating: true,
			backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
			borderWidth: 1
		},
		plotOptions: {
			scatter: {
				marker: {
					radius: 5,
					states: {
						hover: {
							enabled: true,
							lineColor: 'rgb(100,100,100)'
						}
					}
				},
				states: {
					hover: {
						marker: {
							enabled: false
						}
					}
				},
				tooltip: {
			headerFormat: '<b>{series.name}</b><br>',
			pointFormat: '{point.x:%e. %b %y}: {point.y:.2f} %'
				}
			}
		},
		series: [{
			name: 'Muestreos',
			color: 'rgba(45, 204, 51, .5)',
			data: royas
	
		}]
	});

	
}

$scope.loadGrid1=function (data) {

	$scope.gridOptions.data=data;
	
}



Highcharts.chart('barsroyachart', {

	title: {
	  text: 'Roya por Departamentos'
	},

	subtitle: {
	  text: 'Source: Coffee Cloud'
	},

	xAxis: {
	  categories: ['Alta Verapaz', 'Zacapa', 'Huehuetenango', 'Baja Verapáz', 'Sololá', 'San Marcos', 'Quetzaltenango', 'Escuintla', 'Petén', 'Retauhleu', 'Sacatepequez', 'Suchitepequez']
	},

	series: [{
	  type: 'column',
	  colorByPoint: true,
	  data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
	  showInLegend: false
	}]

  });

	$scope.gridOptions = {
	columnDefs: [
		{ field: 'departamento' },
		{ field: 'municipio' },
		{ field: 'nombreUnidad' },
		{ field: 'user' },
		{ field: 'lote' },
		{ field: 'incidencia' },
		{ field: 'createdAt' }
		
	],
	enableGridMenu: true,
	enableSelectAll: true,
	exporterCsvFilename: 'myFile.csv',
	exporterPdfDefaultStyle: {fontSize: 9},
	exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
	exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
	exporterPdfHeader: { text: "My Header", style: 'headerStyle' },
	exporterPdfFooter: function ( currentPage, pageCount ) {
		return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
	},
	exporterPdfCustomFormatter: function ( docDefinition ) {
		docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
		docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
		return docDefinition;
	},
	exporterPdfOrientation: 'portrait',
	exporterPdfPageSize: 'LETTER',
	exporterPdfMaxGridWidth: 500,
	exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
	exporterExcelFilename: 'myFile.xlsx',
	exporterExcelSheetName: 'Sheet1',
	onRegisterApi: function(gridApi){
		$scope.gridApi = gridApi;
	}
};


$scope.getData=function () {

	var parameters={};
	$scope.markers=[];

	parameters.enfermedad=$scope.selectedEnfermedad;
	parameters.departamento=$scope.selectedDepto;
	parameters.municipio = $scope.selectedMuni;
	parameters.startDate=$scope.selectedStart;
	parameters.endDate=$scope.selectedEnd;

	console.log(parameters);

	if(parameters.endDate!=undefined && parameters.startDate!=undefined){
		royaunits.get(parameters).then(function (result) {
			$scope.allRoya=[];
			$scope.incidencesVsDate=[];
	
			result.data.forEach(element => {
						var marker={};
				if (element.myunit[0]!=undefined) {
					var incidenceVsDate=[Date.parse(element.createdAt),element.incidencia];
					element.nombreUnidad=element.myunit[0].nombre;
					element.municipio=element.myunit[0].municipio;
					
					element.departamento=element.myunit[0].departamento;
					element.ubicacion=element.myunit[0].ubicacion;

					if (element.myunit[0].lote[element.loteIndex]!=undefined) {
						element.lote=element.myunit[0].lote[element.loteIndex].nombre;
					}

					marker.ubicacion=element.ubicacion;
					marker.incidencia=element.incidencia;
					marker.unidad=element.lote;
					

					if(marker.ubicacion){
						marker.ubicacion = marker.ubicacion.replace("(","");
						marker.ubicacion = marker.ubicacion.replace(")","");
						var arrDatos = marker.ubicacion.split(",");
						if(arrDatos.length==2){
								marker.latitud=arrDatos[0];
								marker.longitud=arrDatos[1];
								marker.color="green";
								$scope.markers.push(marker);
						}
				}

					$scope.allRoya.push(element);
					$scope.incidencesVsDate.push(incidenceVsDate);




					
				}


				
			});
			console.log($scope.markers);
			$scope.addMarkers($scope.markers);
			$scope.graphicRoyaVsTime($scope.incidencesVsDate);
			$scope.loadGrid1($scope.allRoya);
			
		});;

	}else{
		alert("Debe ingresar fecha de inicio y fecha de fin.");

		
	}

	

	
}

$scope.addMarkers=function (markers) {

	markers.forEach(element => {

		var colorMarker="";

		if (element.incidencia<=5) {
			colorMarker="green";
			
		}else if(element.incidencia<=10){
			colorMarker="yellow";

		}
		else if(element.incidencia<=15){
			colorMarker="orange";

		}
		else if(element.incidencia<=20){
			colorMarker="red";

		}else{

			colorMarker="red";
		}

		if ((element.latitud>=0||element.latitud>=0)&&(element.longitud>=0||element.longitud<=0)) {
			
		L.circle([element.latitud,element.longitud],{
			color: colorMarker,
			fillColor: colorMarker,
			fillOpacity: 0.5,
			radius: element.incidencia*50
	}).addTo(mymap);
		}


		
	});
	
}




	}]);
