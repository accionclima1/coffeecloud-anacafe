app.controller('HomeloteinternalCtrl', ['$http', '$scope', '$stateParams','auth', 'roya', 'methods', 'unit', 'varieties', 'user', 'PouchDB', '$rootScope','localStorageService', 'onlineStatus',
function ($http,$scope, $stateParams, auth, roya, methods, unit, varieties, user, PouchDB, $rootScope, localStorageService, onlineStatus) {
        console.log("show time");
        $scope.currentUser = auth.currentUser;
        $scope.currentId = auth.currentUser();
        $scope.unitId = $stateParams.idunidad;
        $scope.unitIndex = $stateParams.indexunidad;
        $scope.loteIndex = $stateParams.indexlote;
        $scope.royaHistoryByLote = [];
        var map;


        $('.collapse').collapse('hide');

        console.log($stateParams.idunidad);
        console.log($stateParams.indexlote);
        console.log($scope.currentId);

        PouchDB.GetUnit($scope.unitId,auth.userId()).then(function (result) {
        	if (result.status == 'fail') {
                $scope.error = result.message;
                console.log("error");
        	}
        	else if (result.status == 'success') {
                $scope.unidadseleccionada = result.data;
                $scope.loteseleccionado = $scope.unidadseleccionada.lote[$scope.loteIndex];
                console.log($scope.unidadseleccionada);
                console.log($scope.loteseleccionado);

        	}
        });


        //Cálculos de ROYA
        if ($rootScope.IsInternetOnline) {
                console.log("Con internet");
                console.log($scope.user_Ided);

                roya.getUser(auth.userId()).then(function(userhistory){
                $scope.royaHistory = userhistory.data;
                localStorageService.set('royaHistory',userhistory.data);
                console.log($scope.royaHistory);
                for (var i = 0; i < userhistory.data.length; i++) {
                        if ((userhistory.data[i].loteIndex == $scope.loteIndex)&&(userhistory.data[i].idunidad==$scope.unitId)) {
                                $scope.royaHistoryByLote.push($scope.royaHistory[i]);
                        }

                }
                });

                } else {
                console.log("No internet");
                console.log($scope.user_Ided);
                $scope.royaHistory = localStorageService.get('royaHistory');
                }


                console.log("historial");
                console.log($scope.royaHistory);

                methods.get().then(function(methods){
                        var meth = methods.data[0];
                        var date = new Date();
                        var currentMonth = date.getMonth();
                        if(currentMonth < 6 ){
                                var methodsAvail = {};
                                methodsAvail.grade1 = meth.caseInidence10.abrilJunio;
                                methodsAvail.grade2 = meth.caseInidence1120.abrilJunio;
                                methodsAvail.grade3 = meth.caseInidence2150.abrilJunio;
                                methodsAvail.grade4 = meth.caseInidence50.abrilJunio;
                                $scope.methodsMonth = methodsAvail;

                        } else if(currentMonth > 5 && currentMonth < 9) {
                                var methodsAvail = {};
                                methodsAvail.grade1 = meth.caseInidence10.julioSetiembre;
                                methodsAvail.grade2 = meth.caseInidence1120.julioSetiembre;
                                methodsAvail.grade3 = meth.caseInidence2150.julioSetiembre;
                                methodsAvail.grade4 = meth.caseInidence50.julioSetiembre;
                                $scope.methodsMonth = methodsAvail;
                        } else if(currentMonth > 8) {
                                var methodsAvail = {};
                                methodsAvail.grade1 = meth.caseInidence10.octubreDiciembre;
                                methodsAvail.grade2 = meth.caseInidence1120.octubreDiciembre;
                                methodsAvail.grade3 = meth.caseInidence2150.octubreDiciembre;
                                methodsAvail.grade4 = meth.caseInidence50.octubreDiciembre;
                                $scope.methodsMonth = methodsAvail;
                        }
                });

}]);
