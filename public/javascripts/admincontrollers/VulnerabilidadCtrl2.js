//adaptation controller
app.controller('VulnerabilidadCtrl', [
	'$scope',
	'auth',
	'$location',
	'encuesta','Excel', '$timeout',
	function ($scope, auth, $location, encuesta, Excel, $timeout) {
	    $scope.isLoggedIn = auth.isLoggedIn;
	    $scope.currentUser = auth.currentUser;
	    
	    
	    $scope.logOut = auth.logOut;
	    $scope.isActive = function (viewLocation) {
	        var active = (viewLocation === $location.path());
	        return active;
	    };

	    $scope.buscarValor = function (arrayData, nombre) {
	    	for (var i = 0; i < arrayData.length; i++) {
	    		if (arrayData[i].name.localeCompare(nombre) == 0){
	    			return arrayData[i].value;
	    		}
	    	}

	    	return -1;
	    }





	    var currentTest = null;
	    var cargarTodo = function () {
            console.log("va a cargar la encuestas");
	        encuesta.getAll().then(function (tests) {

                console.log("data:");
                console.log(tests.data);
	            $scope.testsList = tests.data;
	            $scope.currentPage = 1;
	            $scope.pageSize = 9;
	            $scope.noOfPages = Math.ceil($scope.testsList / $scope.pageSize);
	            $scope.totalItems = $scope.testsList.length;

	            console.log($scope.testsList);

	            for (var k in tests.data) {
	                if (tests.data[k].preguntas.length > 0 ) {
	                	$scope.testsList[k].createdAt = tests.data[k].preguntas[0].value;	                    
	                    $scope.testsList[k].departamento = tests.data[k].preguntas[1].value;	              
	                    $scope.testsList[k].comunidad = tests.data[k].preguntas[3].value;	
	                    $scope.testsList[k].calificacion = $scope.buscarValor(tests.data[k].preguntas, 'puntajeNumData');              
	                    /*if ( tests.data[k].preguntas[46].name.localeCompare("puntajeNumData") == 0){
	                    	$scope.testsList[k].calificacion = tests.data[k].preguntas[46].value;              	
	                    }
	                    if ( tests.data[k].preguntas[45].name.localeCompare("puntajeNumData") == 0){
	                    	$scope.testsList[k].calificacion = tests.data[k].preguntas[46].value;              	
	                    }*/

	                    
	                    $scope.testsList[k].productor = tests.data[k].preguntas[6].value;	              
	                    $scope.testsList[k].carneAnacafe = tests.data[k].preguntas[8].value;
	                    $scope.testsList[k].variedades = tests.data[k].preguntas[18].value;	                    
	                }
	            }


	            


	            console.log("Data -------------------");
	            console.log($scope.testsList);
	            console.log("Fin Data -------------------");

	            console.log($scope.head);


	        },function (error){
                console.log("ijole, hubo un error");
            });
	    };

	    cargarTodo();
	    $(".date-field").datepicker();
	    $scope.head = {	        	                       
	        departamento: "Departamento",
	        comunidad: "Comunidad",
	        productor: "Productor",
			carneAnacafe: "Carné ANACAFE",
	        variedades: "Variedades",
	        calificacion: "Calificacion",	        	
	        createdAt: "Fecha",	 	                
	        user: "User"
	    };


	    $scope.sort = {
	        column: 'createdAt',
	        descending: true
	    };

	    $scope.selectedCls = function (column) {
	        return column == $scope.sort.column && 'sort-' + $scope.sort.descending;
	    };

	    $scope.changeSorting = function (column) {
	        var sort = $scope.sort;
	        if (sort.column == column) {
	            sort.descending = !sort.descending;
	        } else {
	            sort.column = column;
	            sort.descending = false;
	        }
	    };

	    $scope.loadTest = function (test) {
	        currentTest = test;
	        $scope.detail = currentTest;

	        //$('#detailModal').modal('show');

	    }

	    $scope.removeTest = function (id) {

	        encuesta.delete(id).then(function (user) {
	            loadAll();
	        });
	    }
        
       
        
	    $scope.exportData = function () {
	        var table = document.getElementById('exportable');
	        var html = table.outerHTML;
	        //window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));
	        var exportHref = Excel.tableToExcel("#exportable", 'Reportes de Encuestas');
	        $timeout(function () { location.href = exportHref; }, 100);
	    };

	    $scope.search = {};
	    //$watch search to update pagination
	    $scope.$watch('search', function (newVal, oldVal) {
	        if ($scope.testsList != undefined) {
	            $scope.filtered = $scope.testsList;
	            var arrayToReturn = [];
	            for (var i = 0; i < $scope.testsList.length; i++) {
	             
	                if (newVal.dateFrom != undefined && newVal.dateFrom != "") {
	                    var startDate = parseDate(newVal.dateFrom);
	                    var createDate = new Date($scope.testsList[i].createdAt);
	                    if (createDate >= startDate) {
	                        arrayToReturn.push($scope.testsList[i]);
	                    }
	                }
	                if (newVal.dateFrom == undefined && newVal._id == undefined) {
	                    arrayToReturn.push($scope.testsList[i]);
	                }
	            }
	            $scope.filtered = arrayToReturn;
	            $scope.totalItems = $scope.filtered == undefined ? 0 : $scope.filtered.length;
	            //$scope.pageSize = 9;
	            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.pageSize);
	            $scope.currentPage = 1;
	        }
	        else {
	            var arrayToReturn = [];
	            $scope.filtered = arrayToReturn;
	            $scope.totalItems = 0;
	            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.pageSize);
	            $scope.currentPage = 1;

	        }
	    }, true);

	   

	}]);


app.factory('encuesta', ['$http', 'auth', function ($http, auth) {
    var o = {

    };
    o.getAll = function () {
        return $http.get('/encuesta').success(function (data) {
            return data;
        });
    };
   
    o.delete = function (test) {
        return $http.delete('/encuesta/' + test, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data
        });
    };

    return o;
}]);
