app.factory('royaunits', ['$http', 'auth', function ($http, auth) {
	var o = {

	};
	o.getAll = function () {
		return $http.get('/enfermedad-unit').success(function (data) {
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
		 //console.log(par);
		return $http.post('/enfermedad-unit',parameters).success(function (data) {
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
	$scope.ArrayCircles=[];

	$scope.cantidadMuestreos=0;
	$scope.incidenciaPromedio=0;
	$scope.units=[];
	$scope.numUnits=0;

	$scope.regressionValues=[];


	$('#cntRoya').loadingIndicator({showOnInit:false});
	$("#cntRoya").data("loadingIndicator").show();
	//console.log($scope.incidencesVsDate);
	//console.log(Date.UTC(1970, 1,  6));
	//console.log((new Date("1970-01-06")));

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
					element.ubicacion=element.myunit[0].lote[element.loteIndex].georeferenciacion

				}

				marker.ubicacion=element.ubicacion;
				marker.incidencia=element.incidencia;
				marker.nombreUnidad=element.nombreUnidad;
				marker.nombreLote=element.lote;
				marker.departamento=	element.departamento;
				marker.municipio=element.municipio;


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


			//console.log(incidenceVsDate);




		});
		$scope.allRoya=result.data;

		//Cargar KPIs a interfaz gráfica
		var kpis=$scope.calculateKPIs(result.data);

		$scope.cantidadMuestreos=kpis.cantidadMuestreos;
		$scope.incidenciaPromedio=kpis.incidenciaPromedio;
		$scope.numUnits=kpis.unidadesMuestreadas;

		//console.log($scope.markers);
		$scope.addMarkers($scope.markers);
		$scope.graphicRoyaVsTime($scope.incidencesVsDate);
		$scope.graphCorrelationChart($scope.incidencesVsDate);
		$scope.loadGrid1($scope.allRoya);
		$("#cntRoya").data("loadingIndicator").hide();
	});



	$scope.selectedDepto="";
	$scope.munis=[];

	$scope.changeDepto=function (){

	//console.log($scope.selectedDepto);
		$scope.selectedMuni="Todos";

for (var i = 0; i < $scope.deptos.length; i++) {

//console.log($scope.deptos[i].dept+" es igual a "+$scope.selectedDepto);
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
			text: 'Incidencia de la plaga en el tiempo.'
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
	  text: 'Plaga por Departamentos'
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
		{ field: 'ubicacion' },
		{ field: 'departamento' },
		{ field: 'municipio' },
		{ field: 'nombreUnidad' },
		{ field: 'lote' },
		{ field: 'user' },
		{ field: 'incidencia' },
		{ field: 'createdAt',displayName:"Fecha Muestreo" }

	],
	enableGridMenu: true,
	enableFiltering:true,
	enableSelectAll: true,
	exporterCsvFilename: 'Reporte de Enfermedad.csv',
	exporterPdfDefaultStyle: {fontSize: 9},
	exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
	exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
	exporterPdfHeader: { text: "Reporte de Enfermedad", style: 'headerStyle' },
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
	exporterExcelFilename: 'ReporteEnfermedad.xlsx',
	exporterExcelSheetName: 'Sheet1',
	onRegisterApi: function(gridApi){
		$scope.gridApi = gridApi;
	}
};


$scope.getData=function () {
	$("#cntRoya").data("loadingIndicator").show();
	var parameters={};
	$scope.markers=[];

	parameters.enfermedad=$scope.selectedEnfermedad;
	parameters.departamento=$scope.selectedDepto;
	parameters.municipio = $scope.selectedMuni;
	parameters.startDate=$scope.selectedStart;
	parameters.endDate=$scope.selectedEnd;

	//console.log(parameters);

	if(parameters.endDate!=undefined && parameters.startDate!=undefined){
		royaunits.get(parameters).then(function (result) {
			$scope.allRoya=[];
			$scope.incidencesVsDate=[];
			$scope.regressionValue=[];

			result.data.forEach(element => {
						var marker={};



				if (element.myunit.length!=0) {
					var incidenceVsDate=[Date.parse(element.createdAt),element.incidencia];
					$scope.regressionValue=[element.incidencia,Date.parse(element.createdAt)];
					element.nombreUnidad=element.myunit[0].nombre;
					element.municipio=element.myunit[0].municipio;

					element.departamento=element.myunit[0].departamento;
					element.ubicacion=element.myunit[0].ubicacion;

					if (element.myunit[0].lote[element.loteIndex]!=undefined) {
						element.lote=element.myunit[0].lote[element.loteIndex].nombre;
						element.ubicacion=element.myunit[0].lote[element.loteIndex].georeferenciacion


					}

					marker.ubicacion=element.ubicacion;
					marker.incidencia=element.incidencia;
					marker.unidad=element.lote;
					marker.nombreUnidad=element.nombreUnidad;
					marker.nombreLote=element.lote;
					marker.departamento=	element.departamento;
					marker.municipio=element.municipio;



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
				//	$scope.regressionValues.push($scope.regressionValue);

					$scope.graphCorrelationChart($scope.incidencesVsDate);





				}



			});
			//console.log($scope.markers);
			$scope.addMarkers($scope.markers);
			$scope.graphicRoyaVsTime($scope.incidencesVsDate);
			$scope.graphCorrelationChart($scope.incidencesVsDate);
			$scope.loadGrid1($scope.allRoya);

			//Cargar KPIs a interfaz gráfica
			var kpis=$scope.calculateKPIs(result.data);

			$scope.cantidadMuestreos=kpis.cantidadMuestreos;
			$scope.incidenciaPromedio=kpis.incidenciaPromedio;
			$scope.numUnits=kpis.unidadesMuestreadas;




			$("#cntRoya").data("loadingIndicator").hide();
		});

	}else{
		alert("Debe ingresar fecha de inicio y fecha de fin.");
		$("#cntRoya").data("loadingIndicator").hide();
	}
}

$scope.addMarkers=function (markers) {
if (typeof $scope.layerMarkers!='undefined') {
	mymap.removeLayer($scope.layerMarkers);

	$scope.layerMarkers.remove();
	 $scope.ArrayCircles=[];
}


	markers.forEach(element => {
		console.log("Marker");
		console.log(element);

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

		 $scope.ArrayCircles.push(L.circle([element.latitud,element.longitud],{
			color: colorMarker,
			fillColor: colorMarker,
			fillOpacity: 0.5,
			radius: 50
	}).bindPopup("<strong>Depto: </strong>"+element.departamento+"<br> <Strong>Municipio: </strong>"+element.municipio+"<br><strong>Unidad: </strong>"+element.nombreUnidad+"<br><strong>Lote: </strong>"+element.nombreLote+"<br><strong>Incidencia: </strong>"+element.incidencia.toFixed(3)));
		}



	});

	//Añadiremos el grupo de ArrayCircles
	$scope.layerMarkers=L.layerGroup($scope.ArrayCircles).addTo(mymap);
	//	$scope.layerMarkers.addTo(mymap);


};

//La siguiente funcion calcula KPIs
		$scope.calculateKPIs=function(muestreos){
			var incidenciaPromedio=0;
			var muestreosvalidos=0;

      var kpis={};

			//Las siguientes instrucciones calcularan incidencia promedio y número de muestreos válidos
			for (var i = 0; i < muestreos.length; i++) {

				if (typeof muestreos[i].incidencia!='undefined' && typeof muestreos[i].myunit[0]!='undefined') {
					incidenciaPromedio=muestreos[i].incidencia+incidenciaPromedio;
					muestreosvalidos++;

					//Las siguientes instrucciones servirán para calcular elnúmero de unidades muestreadas
					if($scope.units.indexOf(muestreos[i].myunit[0].nombre)==-1){
						$scope.units.push(muestreos[i].myunit[0].nombre);

					}


				};


		};

		if(muestreosvalidos==0){
				incidenciaPromedio=0;
		}else{
			incidenciaPromedio=(incidenciaPromedio/muestreosvalidos).toFixed(3);
		}



		kpis.cantidadMuestreos=muestreosvalidos;
		kpis.incidenciaPromedio=incidenciaPromedio;
		kpis.unidadesMuestreadas=$scope.units.length;

		return kpis;


		};





	$scope.graphCorrelationChart=function(data){
		// See https://github.com/ecomfe/echarts-stat
		var myChart = echarts.init(document.getElementById('main'));
		var myRegression = ecStat.regression('polynomial', data, 5);

		myRegression.points.sort(function(a, b) {
				return a[0] - b[0];
		});

		option = {

				tooltip: {
						trigger: 'axis',
						axisPointer: {
								type: 'cross'
						}
				},
				title: {
						text: 'Tendencia de la plaga',
						left: 'center',
						top: 16
				},
				xAxis: {
						type: 'time',
						splitLine: {
								lineStyle: {
										type: 'dashed'
								}
						},
						splitNumber: 20
				},
				yAxis: {
						type: 'value'
				},
				grid: {
						top: 90
				},
				series: [{
						name: 'scatter',
						type: 'scatter',
						label: {
								emphasis: {
										show: true,
										position: 'right',
										textStyle: {
												color: 'blue',
												fontSize: 16
										}
								}
						},
						data: data
				}, {
						name: 'line',
						type: 'line',
						smooth: true,
						showSymbol: false,
						data: myRegression.points,
						markPoint: {
								itemStyle: {
										normal: {
												color: 'transparent'
										}
								},
								label: {
										normal: {
												show: true,
												position: 'left',
												formatter: myRegression.expression,
												textStyle: {
														color: '#333',
														fontSize: 14
												}
										}
								},
								data: [{
										coord: myRegression.points[myRegression.points.length - 1]
								}]
						}
				}]
		};

		// use configuration item and data specified to show chart
		myChart.setOption(option);

	};




	}]);
