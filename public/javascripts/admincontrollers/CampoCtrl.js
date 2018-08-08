app.controller('CampoCtrl', [
	'$scope',
	'auth',
	'$location',
	'campoService',
	'$window',
    'user', 'Excel', '$timeout',
	function ($scope, auth, $location, campo, $window, user, Excel, $timeout) {
	    var currentTest = null;

	    var loadAll = function () {

	        campo.get().then(function (campo) {
	            $scope.testsList = campo.data;
	            $scope.currentPage = 1;
	            $scope.pageSize = 9;
	            $scope.noOfPages = Math.ceil($scope.testsList / $scope.pageSize);
	            $scope.totalItems = $scope.testsList.length;
	        })

	        $scope.saveTable = function () {
	            campo.create($scope.campodata);
	        };

	    };

	    loadAll();
	    $(".date-field").datepicker();

	    $scope.head = {
	        createdAt: "Fecha",
	        bandolas: "Bandolas",
	        chasparria: "Chasparria",
	        frutosnudo5: "Frutos nudo 5",
	        frutosnudo6: "Frutos nudo 6",
	    };


	    $scope.sort = {
	        column: 'createdAt',
	        descending: false
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

	        $('#detailModalCampo').modal('show');

	    }

	    $scope.removeTest = function (id) {

	    }
	    $scope.exportData = function () {
	        var table = document.getElementById('exportable');
	        var html = table.outerHTML;
	        //window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));
	        var exportHref = Excel.tableToExcel("#exportable", 'Reportes de Campo');
	        $timeout(function () { location.href = exportHref; }, 100);
	    };
	    $scope.search = {};
	    //$watch search to update pagination
	    $scope.$watch('search', function (newVal, oldVal) {
	        if ($scope.testsList != undefined) {
	            $scope.filtered = $scope.testsList;
	            var arrayToReturn = [];
	            for (var i = 0; i < $scope.testsList.length; i++) {
	                if (newVal._id != undefined && newVal._id != "") {
	                    if ($scope.testsList[i] == newVal._id) {
	                        arrayToReturn.push($scope.testsList[i]);
	                    }
	                }
	                if (newVal.dateFrom != undefined && newVal.dateFrom != "" && newVal.dateTo != "" && newVal.dateTo != undefined) {
	                    var startDate = parseDate(newVal.dateFrom);
	                    var endDate = parseDate(newVal.dateTo);
	                    var createDate = new Date($scope.testsList[i].createdAt);

	                    if (createDate >= startDate && createDate <= endDate) {
	                        arrayToReturn.push($scope.testsList[i]);
	                    }
	                }
	                if (newVal.dateFrom == undefined && newVal.dateTo == undefined && newVal._id == undefined) {
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


//campocontoller Fact
app.factory('campoService', ['$http', 'auth', function ($http, auth) {
    var o = {
        chats: []
    };
    o.get = function () {
        return $http.get('/admin/campo/').success(function (data) {
            return data;
        });
    };
    o.create = function (method) {
        return $http.post('/admin/campo', method, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    o.update = function (method) {
        return $http.put('/admin/methods', method, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    return o;
}]);
