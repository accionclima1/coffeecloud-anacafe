//adaptation controller
app.controller('CicohCtrl', ['$http','$scope','$stateParams','auth','$rootScope','$location','$timeout',
	function ($http, $scope, $stateParams, auth, $rootScope, $location,encuestaunit, $timeout) {
        const urlClima ="http://138.68.55.125:8080/api/v2/cicoh/_table/v_api_lasthour?include_count=true&api_key=74866bf219af9c58496bab86a3360fe071fd6cecd866d3f0721550dfdc69fbe5";
        var mymap=null;
        //$scope.data=data;
        // $scope.encuestas=[];
        // $scope.amountTests=0;
        // $scope.averageTests=0;
        // $scope.dataGrid=[];
        $scope.stations=[];
        $scope.markers=[];
        $scope.ArrayCircles=[];
        $scope.numUnidades=0;

        $http({method:'get',url:urlClima}).then(function exitoso(data){
            //$scope.statusCargando='';
            var info = data.data.resource;
            console.log('ESTA ES LA DATA..........');
             console.log(info);
            console.log('ESTA ES LA DATA..........');
            formatData(info);
            //$rootScope.clima = info;
            // $scope.actual = info['current_observation'];
            // $scope.almanac = info['almanac'];
            // $scope.pronosticodiario = info['forecast']['simpleforecast']['forecastday'];
            // $scope.pronosticohorario = info['hourly_forecast'];
        },function error(err){
            $scope.error = "Imposible descargar información climática";
        });

//Funcion formateo de info

function formatData(data){
    console.log("Ordenado");
    var station_name;
    var latitude;
    var longitude;
    var elevation;
    var element_symbol;
    var symbol;
    var element_name;
    var valor;
    var datetime;
    var orderData = [];
    $.each( data, function( key1, value1 ) {
       /* var station_id = data[key].station_id;
        var element_id = data[key].element_id;
        var element_name = data[key].element_name;
        if(station_id == orderData.id)
        {
            if(element_id == orderData.element_id){
                orderData.push({element_id: element_id})
                alert('iguales');
            }
           
        }else{
            orderData.push({id: station_id, element_id: element_id , element_name: element_name})
        }
      });
      console.log( orderData );*/
     //console.log(data[100].basin_id);

     if ($scope.stations.length==0) {
        var station={};
        station.station_id=value1.station_id;
        station.station_name=value1.station_name;
        station.vars=[];
        var var1={};
        var1.name=value1.element_name;
        var1.symbol=value1.symbol;
        var1.value=value1.valor;

        station.vars.push(var1);

        $scope.stations.push(station);
         
     } else {
        for(var i=0;i<$scope.stations.length;i++) {
          var value2=$scope.stations[i];
            //Si la estacion a existe, agregamos la nueva variable
            console.log(value1.station_id+' == '+value2.station_id);
            console.log();
            if (value1.station_id==value2.station_id) {
                var var1={};
                var1.name=value1.element_name;
                var1.symbol=value1.symbol;
                var1.value=value1.valor;
    
                value2.vars.push(var1);
                console.log('si estamos');
                
    
            //Si la estacion no existe, la creamos y agregamos la nueva variable
            } else {
              var station={};
              station.station_id=value1.station_id;
              station.station_name=value1.station_name;
              station.vars=[];
              var var1={};
              var1.name=value1.element_name;
              var1.symbol=value1.symbol;
              var1.value=value1.valor;
      
              station.vars.push(var1);
      
              $scope.stations.push(station);
              break;
              
    
                
            }

            
             
         };
         
     }



    
})
console.log("Ordenado");
    console.log($scope.stations);

}




//Código para crear mostrarMapa


$scope.crearMapa = function(){

if(mymap==null){
  mymap = L.map('cicohmap').setView([14.978279, -87.057559], 7);
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

        //   console.log("Marcador");
        //   console.log(element);

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



	}]);
