//Encuestas factory
app.factory('encuestaunit', ['$http', 'auth', function ($http, auth) {
    var o = {

    };
		o.getAll = function () {
			return $http.get('/encuesta-unit').success(function (data) {
				return data;
			});
		};

    o.getTestsByFilters = function (parameters) {

      var par=JSON.stringify(parameters);


       console.log(par);
      return $http.post('encuesta-unit',parameters).success(function (data) {
        return data;
      });
    };


		/*

		o.getTestsByFilters = function () {
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
    var mymap=null;
    $scope.deptos=muni14.data;
		$scope.encuestas=[];
		$scope.amountTests=0;
		$scope.averageTests=0;
		$scope.dataGrid=[];
    $scope.markers=[];
    $scope.ArrayCircles=[];
    $scope.numUnidades=0;

		encuestaunit.getAll().then(function (tests){
			console.log(tests);
			$scope.setTests(tests.data);

		});;
    //EL siguiente método acualiza todas la vistas
		$scope.setTests=function(tests){

			$scope.dataGrid=$scope.setDataGrid(tests);

			$scope.gridOptionsEvaluation.data=$scope.dataGrid;


      var kpis=$scope.calculateKPIs(tests);


				//Calcula número de tests
				$scope.amountTests=kpis.total;

				//Calcula la incidencia Promedio
				$scope.averageTests=kpis.promedio;;

        //Calcula el numero de unidades Evaluadas
        $scope.numUnidades=kpis.unidadesEvaluadas;

        //Se realizará gráfica scatterroyachart
        //$scope.graphicScatter();

        //Agregará markadores al mapa
        $scope.addMarkersToMap(tests);

        //Cargar gráfica de Tendencia
        $scope.graphCorrelationChart(tests);


				console.log(tests.length);

		};
//La siguiente funcion calcula el valor promedio de tests
		$scope.calculateKPIs=function(tests){
			var promedio=0;
			var testsvalidos=0;
      var units=[];
      console.log(tests.length);
      var kpis={};

			for (var i = 0; i < tests.length; i++) {

				//console.log(i+ " "+ tests[i].resumenVulne[0]);
				if (tests[i].resumenVulne.length!=0 && tests[i].myunit.length!=0 ) {
				//	console.log("Valor: "+tests[i].resumenVulne[0].valor);

				if (typeof tests[i].resumenVulne[0].valor!='undefined') {
					promedio=promedio+tests[i].resumenVulne[0].valor;
					console.log("Value: "+promedio+tests[i].resumenVulne[0].valor);
					//console.log(promedio);
					testsvalidos++;
					console.log(testsvalidos+ " Valor: "+tests[i].resumenVulne[0].valor);
				}

        //Las siguientes instrucciones servirán para calcular el número de Unidades Evaluadas
        if(units.indexOf(tests[i].myunit[0].nombre)==-1){
          units.push(tests[i].myunit[0].nombre);

        }


				}
			}

			console.log("Promedio: "+promedio);
			console.log("Numero: "+testsvalidos);

      kpis.sumaValor=promedio;
      kpis.total=testsvalidos;

      if (promedio==0 && testsvalidos==0){

        kpis.promedio=0;



        return kpis;
      }
      else{

        kpis.promedio=(promedio/testsvalidos).toFixed(3);
        kpis.unidadesEvaluadas=units.length;
        return kpis;
      }


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
			"exporterExcelFilename": 'ReporteVulnerabilidad.xlsx',
			"exporterExcelSheetName": 'Sheet1',
			"columnDefs":[
				{field:"departamento",displayName:"Departamento"},
				{field:"municipio",displayName:"Municipio"},
				{field:"nombre",displayName:"Nombre"},
				{field:"valor",displayName:"Escala"},
				{field:"fecha",displayName:"Fecha"}
			]
		};




    //Instrucciones para selectedStart

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

    //Terminan instrucciones


    //Instrucciones para obtener datos por medio de parámetros
    $scope.getTestByParameters=function () {
    //	$("#modalMoading").data("loadingIndicator").show();
    	var parameters={};
    	$scope.markers=[];


    	parameters.departamento=$scope.selectedDepto;
    	parameters.municipio = $scope.selectedMuni;
    	parameters.startDate=$scope.selectedStart;
    	parameters.endDate=$scope.selectedEnd;

    	console.log(parameters);

    	if(parameters.endDate!=undefined && parameters.startDate!=undefined){

        //Las siguientes instrucciones harán una peticion al servidor con parámetros y actualizaran la vista
    		encuestaunit.getTestsByFilters(parameters).then(function (result) {
    			$scope.allTests=[];
    			$scope.incidencesVsDate=[];

          //Las siguientes instrucciones actualizarán la visua
          $scope.setTests(result.data);
          //Terminan Instruciones







    		//	$("#modalMoading").data("loadingIndicator").hide();
    		});
        //Terminan instrucciones
    	}else{
    		alert("Debe ingresar fecha de inicio y fecha de fin.");
    	//	$("#modalMoading").data("loadingIndicator").hide();
    	}
    }

    //Terminan Instrucciones


    //Se realizará gráfica scatterroyachart
    //$scope.graphicScatter();

    $scope.graphicScatter=function (){

      var myRegression = echarts.init(document.getElementById('vscatterchart'));

      var data = [
          [new Date(1, 1, 2011), 11.35],
           [new Date(1, 2, 2011), 12.35],
           [new Date(1, 2, 2011), 5.35],

      ];

      // See https://github.com/ecomfe/echarts-stat
      var myRegression = ecStat.regression('polynomial', data, 3);



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
              text: '18 companies net profit and main business income (million)',
              subtext: 'By ecStat.regression',
              sublink: 'https://github.com/ecomfe/echarts-stat',
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
              type: 'value',
              min: -40,
              splitLine: {
                  lineStyle: {
                      type: 'dashed'
                  }
              }
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




    }


//Código de gráfico scatter


//Termina código


//Código para crear mostrarMapa


$scope.crearMapa = function(){

if(mymap==null){
  mymap = L.map('vulnerabilidadmap').setView([14.973642, -90.450439], 8);
}else{

}
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiaWFvZ3QiLCJhIjoiY2o0dGN6cjlkMDcwODJ4bGF2dDFndGdvciJ9.ACiNe407LOOTTKtT-7-lLA'
}).addTo(mymap);







};

$scope.crearMapa();


$scope.addMarkersToMap=function (tests){


  if (typeof $scope.layerMarkers!='undefined') {
  	mymap.removeLayer($scope.layerMarkers);

  	$scope.layerMarkers.remove();
  	 $scope.ArrayCircles=[];
  }



  tests.forEach(element => {

    var marker={};



if (element.myunit.length!=0) {

  element.nombreUnidad=element.myunit[0].nombre;
  element.municipio=element.myunit[0].municipio;

  element.departamento=element.myunit[0].departamento;


  if (typeof element.myunit[0].ubicacion!='undefined') {

    element.ubicacion=element.myunit[0].ubicacion;


  }

  //Obtentremos el valor de la evaluaciónote
  if (element.resumenVulne.length!=0) {
    element.incidencia=element.resumenVulne[0].valor;

  }





  if(element.ubicacion && typeof element.incidencia!='undefined'){
    element.ubicacion =element.ubicacion.replace("(","");
    element.ubicacion = element.ubicacion.replace(")","");
    var arrDatos = element.ubicacion.split(",");
    if(arrDatos.length==2){
        element.latitud=arrDatos[0];
        element.longitud=arrDatos[1];

        //Si se ha llegado hasta aquí se agregará el marcador al crearMapa
        element.colorMarker='';
        if (element.incidencia<=-10) {
          element.colorMarker="red";

        }else if(element.incidencia<=-7){
          element.colorMarker="orange";

        }
        else if(element.incidencia<=-2){
          element.colorMarker="yellow";

        }else if(element.incidencia<=0){
          element.colorMarker="blue";

        }else if(element.incidencia<=2){
          element.colorMarker="green";

        }
        else if(element.incidencia<=7){
          element.colorMarker="green";

        }

        else{

          element.colorMarker="green";
        }

        if ((element.latitud>=0||element.latitud>=0)&&(element.longitud>=0||element.longitud<=0)) {

          console.log("Marcador");
          console.log(element);

         $scope.ArrayCircles.push(L.circle([element.latitud,element.longitud],{
          color: element.colorMarker,
          fillColor: element.colorMarker,
          fillOpacity: 0.5,
          radius: 500
      }).bindPopup("<strong>Depto: </strong>"+element.departamento+"<br> <Strong>Municipio: </strong>"+element.municipio+"<br><strong>Unidad: </strong>"+element.nombreUnidad+"<br><strong>Evaluación: </strong>"+element.incidencia.toFixed(3)));
        }


    }
}






}




  });


  //Añadiremos el grupo de ArrayCircles a la capa de marcadores
	$scope.layerMarkers=L.layerGroup($scope.ArrayCircles).addTo(mymap);


}

$scope.graphCorrelationChart=function(tests){


  var data=$scope.createDataForGraphs(tests);





  // See https://github.com/ecomfe/echarts-stat
  var myChart = echarts.init(document.getElementById('vulGraph'));
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
          text: 'Vulnerabilidad de las fincas',
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


$scope.createDataForGraphs=function(tests){
var encuestas=[];
  angular.forEach(tests, function(value, key){





    if (value.resumenVulne.length!=0 && value.myunit.length!=0) {
    //	console.log("Valor: "+tests[i].resumenVulne[0].valor);

    if (typeof value.resumenVulne[0].valor!='undefined') {

      encuestas.push([Date.parse(value.resumenVulne[0].fecha),value.resumenVulne[0].valor]);



    }

    }






});

return encuestas;

};



	}]);
