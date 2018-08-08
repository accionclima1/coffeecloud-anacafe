//Units Controller
app.controller('RegisterCtrl', [
'$rootScope',
'$scope',
'$state',
'unit',
'auth',
'varieties',
'localStorageService',
'onlineStatus','user','PouchDB',
function ($rootScope, $scope, $state, unit, auth, varieties, localStorageService, onlineStatus, user, PouchDB) {


    $scope.$watch('onlineStatus.isOnline()', function (online) {
        $scope.online_status_string = online ? 'online' : 'offline';
        onlineStatus = $scope.online_status_string

    });

    PouchDB.GetUserDataFromPouchDB(auth.userId()).then(function (result) {
        if (result.status == 'fail') {
            $scope.error = result.message;
        }
        else if (result.status == 'success') {
            $scope.userO7 = result.data;

        }
    });


    //console.log("Is INTERNET AVAILABLE=" + $rootScope.IsInternetOnline);
    if ($rootScope.IsInternetOnline) {

        console.log('app online');

        varieties.getAll().then(function (varids) {
            variedades = varids.data;
            variedades.push({ name: "otro" }, { name: "cual?" });
            $scope.variedades = variedades;
            localStorageService.set('localVarieties',variedades);
        });

        console.log('app online');
        user.get(auth.userId()).then(function (user) {
            $scope.userO7 = user;



            //region to  get user unit from local PouchDB instead of server
            PouchDB.GetAllUserUnit(auth.userId()).then(function (result) {
                if (result.status == 'fail') {
                    $scope.error = result.message;
                }
                else if (result.status == 'success') {

                    $scope.units = result.data;
                    //if($scope.userO7.units.length === result.data.length){

                    //	$scope.units = result.data;
                    //	console.log('local mode:',result.data);

                    //} else {
                    //	console.log('server mode:', $scope.userO7.units);
                    //	$scope.units = $scope.userO7.units;
                    //	$scope.remoteMode = true;
                    //}


                }
            });
            //endregion

        });
    } else {

        console.log('app offline');

        $scope.variedades = localStorageService.get('localVarieties');


        //region to  get user unit from local PouchDB instead of server
        PouchDB.GetAllUserUnit(auth.userId()).then(function (result) {
            if (result.status == 'fail') {
                $scope.error = result.message;
            }
            else if (result.status == 'success') {


                $scope.units = result.data;
                console.log('local mode:', result.data);


            }
        });
        //endregion
    }


    $scope.init = function () {
        console.log("Raising event");
        $scope.unitopmessage = null
        //$scope.modalText = "Nueva Unidad";
        $scope.$broadcast('MANAGEUNIT', { unitId: -1 });
        //$("#myModal2").modal('show');
        //$scope.$emit('MANAGEUNIT', { unitId: -1 });
        $('#newunitForm').validator();
    }

    $scope.$on('UNITADDED', function (e, args) {
        //$scope.units.push(result.data)
        $scope.units.push(args.unit);
        if ($rootScope.IsInternetOnline) {
            PouchDB.SynServerDataAndLocalData().then(function () {
                console.log("sync successfully.");
                $scope.unitopmessage = "Unit added successfully";
                $state.go('home');
            }).catch(function (err) {
                console.log("Not able to sync" + error);
                //$scope.ResetNewUnit();
            });
        }
        else {
            $state.go('home');
        }

    });

    $scope.init();

}]);
