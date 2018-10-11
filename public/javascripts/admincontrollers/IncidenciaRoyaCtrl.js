//Roya controller
app.controller('IncidenciaRoyaCtrl', [
	'$scope',
	'auth',
	'$location',
	'roya',
    '$window',
    'user', 'Excel', '$timeout',
	function ($scope, auth, $location, roya, $window, user, Excel, $timeout) {
	var mymap=null;
	$scope.deptos=muni14.data;

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
    data: [      [Date.UTC(1970, 10, 25), 0],
	[Date.UTC(1970, 1,  6), 0.25],
	[Date.UTC(1970, 2, 20), 1.41],
	[Date.UTC(1970, 3, 25), 1.64],
	[Date.UTC(1971, 4,  4), 1.6],
	[Date.UTC(1971, 5, 17), 2.55],
	[Date.UTC(1971, 6, 24), 2.62],
	[Date.UTC(1971, 7,  4), 2.5],
	[Date.UTC(1971, 8, 14), 2.42],
	[Date.UTC(1971, 9,  6), 2.74],
	[Date.UTC(1971, 10, 14), 2.62],
	[Date.UTC(1971, 11, 24), 2.6],
	[Date.UTC(1971, 12,  1), 2.81],
	[Date.UTC(1971, 9, 11), 2.63],
	[Date.UTC(1972, 1, 27), 2.77],
	[Date.UTC(1972, 2,  4), 2.68],
	[Date.UTC(1972, 4,  9), 2.56],
	[Date.UTC(1972, 6, 14), 2.39],
	[Date.UTC(1972, 8, 19), 2.3],
	[Date.UTC(1972, 10,  4), 2],
	[Date.UTC(1972, 12,  9), 1.85],
	[Date.UTC(1972, 5, 14), 1.49],
	[Date.UTC(1973, 2, 19), 1.27],
	[Date.UTC(1973, 4, 24), 0.99],
	[Date.UTC(1973, 6, 29), 0.67],
	[Date.UTC(1973, 8,  3), 0.18],
	[Date.UTC(1973, 10,  4), 0]]

  }]
});

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
		{ field: 'Departamento' },
		{ field: 'Municipio' },
		{ field: 'Unidad' },
		{ field: 'Lote' },
		{ field: 'Incidencia' }
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

$scope.gridOptions.data=$scope.royas;

	}]);
