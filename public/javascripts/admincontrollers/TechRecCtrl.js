
//TechRecCtrl controller
app.controller('TechRecCtrl', [
	'$scope',
	'auth',
	'$location',
	'techRecService',
	'socket',
    '$window',
    'user', 'Excel', '$timeout',
	function ($scope, auth, $location, techRecService, socket, $window, user, Excel, $timeout) {
	    var currentTest = null;
	    var loadAll = function () {
	        techRecService.getAll().then(function (tests) {
	            $scope.testsList = tests.data;
	            $scope.currentPage = 1;
	            $scope.pageSize = 9;
	            $scope.noOfPages = Math.ceil($scope.testsList / $scope.pageSize);
	            $scope.totalItems = $scope.testsList.length;
	        });
	    };

	    loadAll();
	    $(".date-field").datepicker();

	    $scope.head = {
	        createdAt: "Fecha",
	        departamento: "Departamento",
	        municipio: "Municipio",
	        ubicacion: "Ubicacion",
	        recomendaciontecnica: "Recomendaciontecnica",
	        user: "User"
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
	        console.log(currentTest);
	        $('#detailModal').modal('show');
	        user.get($scope.detail.user).then(function (obj) {
	            $scope.reciverDetail = obj;
	        });
	    }

	    // Send message to user with unit detail
	    $scope.msgsend = function () {
	        $scope.loguser = auth.currentUserObject();
	        var str = 'Unit Name : ' + $scope.detail.departamento;
	        str += ' Id : ' + $scope.detail._id;
	        str += ' Message : ' + $scope.msgcontent;
	        msg = {
	            bodyMsg: str,
	            sender_id: $scope.loguser._id,
	        }
	        var data_server = {
	            message: msg,
	            to_user: $scope.reciverDetail.username,
	            from_id: $scope.loguser.username
	        };
	        socket.emit('get msg', data_server);
	        $scope.msgcontent = '';
	        $scope.msg = 'Message sent successfully.';
	    }

	    $scope.removeTest = function (id) {

	        roya.delete(id).then(function (user) {
	            loadAll();
	        });
	    }
	    $scope.exportData = function () {
	        var table = document.getElementById('exportable');
	        var html = table.outerHTML;
	        //window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));
	        var exportHref = Excel.tableToExcel("#exportable", 'Recomendación Técnica');
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


//TechRecCtrl
app.factory('techRecService', ['$http', 'auth', function ($http, auth) {
    var o = {

    };
    o.getAll = function () {
        return $http.get('/technico/units').success(function (data) {
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




