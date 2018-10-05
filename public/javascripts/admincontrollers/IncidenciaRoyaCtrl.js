//Roya controller
app.controller('IncidenciaRoyaCtrl', [
	'$scope',
	'auth',
	'$location',
	'roya',
    '$window',
    'user', 'Excel', '$timeout',
	function ($scope, auth, $location, roya, $window, user, Excel, $timeout) {

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

	}]);






