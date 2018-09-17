//Roya controller
app.controller('RoyaCtrl2', [
	'$scope',
	'auth',
	'$location',
	'roya',
    '$window',
    'user', 'Excel', '$timeout',
	function ($scope, auth, $location, roya, $window, user, Excel, $timeout) {
		var mymap=null;
		$scope.fechainicio=null;
		$scope.fechafin=null;
		$scope.markersLayer = new L.LayerGroup();
		$scope.testsList = [];
		$scope.gridOptions = {
			"data":$scope.testsList,
			"enableFiltering":true,
			"enableGridMenu": true,
			"enableSelectAll": true,
			"exporterCsvFilename": 'datosroya.csv',
			"exporterExcelFilename": 'myFile.xlsx',
			"exporterExcelSheetName": 'Sheet1',
			"columnDefs":[
				{field:"udepartamento",displayName:"Departamento"},
				{field:"umunicipio",displayName:"Municipio"},
				{field:"unombre",displayName:"Nombre"},
				{field:"incidencia",displayName:"Incidencia"}
			]
		};
		
	    $scope.loadAll = function () {
	        roya.getAll($scope.fechainicio,$scope.fechafin).then(function (tests) {
	            //debugger;
	            //var token = auth.getToken();
	            //var result = JSON.parse($window.atob(token.split('.')[1]));
	            //user.get(result._id).then(function (userData) {
	            //    userData.extemDepartamento
	            //});

	            if (auth.currentUserRole() == 'Extensionista') {
	                var department = auth.currentUserDepartamento();
	                tests.data = $.grep(tests.data, function (item) {
	                    return item.unidad.departamento == department;
	                });
	            }
				$scope.testsList = tests.data;
				$scope.currentPage = 1;
				$scope.pageSize = 9;
				$scope.noOfPages = Math.ceil($scope.testsList / $scope.pageSize);
				$scope.totalItems = $scope.testsList.length;

	            for (var k in tests.data) {
	                if (tests.data[k].unidad) {
	                    $scope.testsList[k].nombre = tests.data[k].unidad.nombre;
	                    $scope.testsList[k].departamento = tests.data[k].unidad.departamento;
	                    if (tests.data[k].unidad.tipoCafe) {
	                        var cafeValue = "";
	                        if (tests.data[k].unidad.tipoCafe.duro) {
	                            cafeValue = "duro";
	                        }
	                        if (tests.data[k].unidad.tipoCafe.estrictamenteDuro) {
	                            cafeValue = cafeValue + " estrictamenteDuro";
	                        }
	                        if (tests.data[k].unidad.tipoCafe.extraprime) {
	                            cafeValue = cafeValue + " extraprime";
	                        }
	                        if (tests.data[k].unidad.tipoCafe.prime) {
	                            cafeValue = cafeValue + " prime";
	                        }
	                        if (tests.data[k].unidad.tipoCafe.semiduro) {
	                            cafeValue = cafeValue + " semiduro";
	                        }
	                        if (cafeValue != "")
	                            $scope.testsList[k].tipoCafe = cafeValue;
	                    }
	                }
				}
				console.log($scope.testsList);
				$scope.gridOptions = {
					"data":$scope.testsList,
					"enableFiltering":true,
					"enableGridMenu": true,
					"enableSelectAll": true,
					"exporterCsvFilename": 'datosroya.csv',
					"exporterExcelFilename": 'myFile.xlsx',
					"exporterExcelSheetName": 'Sheet1',
					"columnDefs":[
						{field:"udepartamento",displayName:"Departamento"},
						{field:"umunicipio",displayName:"Municipio"},
						{field:"unombre",displayName:"Nombre"},
						{field:"incidencia",displayName:"Incidencia"}
					]
				}
				$scope.mostrarMapa();


	        },function (error){
                console.log("ijole, hubo un error");
            });
	    };

		$scope.loadAll();
		
		$scope.hola = function(){
			alert('hola');
		}

        $scope.mostrarMapa = function(){
			$('#mapaDatosRoya').css('display','block');
			if(mymap==null){
				mymap = L.map('mapid').setView([14.973642, -90.450439], 7);
			}else{
				$scope.markersLayer.clearLayers();
			}
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox.streets',
				accessToken: 'pk.eyJ1IjoiaWFvZ3QiLCJhIjoiY2o0dGN6cjlkMDcwODJ4bGF2dDFndGdvciJ9.ACiNe407LOOTTKtT-7-lLA'
			}).addTo(mymap);
			
			for (var k in $scope.testsList) {
				if($scope.testsList[k].unidad){
					var ubica = $scope.testsList[k].ubicacion;
					if(ubica){
						ubica = ubica.replace("(","");
						ubica = ubica.replace(")","");
						var arrDatos = ubica.split(",");
						if(arrDatos.length==2){
							var geojsonMarkerOptions = {
								radius: 8,
								fillColor: "#ff7800",
								color: "#000",
								weight: 1,
								opacity: 1,
								fillOpacity: 0.8
							};
							if(($scope.testsList[k].incidencia<=0.3)){
								geojsonMarkerOptions['fillColor'] = 'green';
							}
							if(($scope.testsList[k].incidencia>0.3)&&($scope.testsList[k].incidencia<0.6)){
								geojsonMarkerOptions['fillColor'] = 'yellow';
							}
							if(($scope.testsList[k].incidencia>=0.6)){
								geojsonMarkerOptions['fillColor'] = 'red';
							}
							var lat = parseFloat(arrDatos[0]);
							var lang = parseFloat(arrDatos[1]);
							var marker = L.circleMarker([lat,lang], geojsonMarkerOptions);
							marker.bindPopup('<b>'+$scope.testsList[k].unombre+':</b>'+$scope.testsList[k].incidencia+'<br/><a href="#/unidad/'+$scope.testsList[k]._id+'" ng-click="hola()">Detalles</a>');
							$scope.markersLayer.addLayer(marker);
						}
					}
				}
			}
			$scope.markersLayer.addTo(mymap);
			$scope.lblBtnMapa = 'Tabla';
        }
    }
]);

app.factory('roya', ['$http', 'auth', function ($http, auth) {
    var o = {

    };
    o.getAll = function (fi,ff) {
        return $http.get('/roya',{params:{"fi":fi,"ff":ff}}).success(function (data) {
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