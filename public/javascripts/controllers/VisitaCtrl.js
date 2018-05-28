app.controller('VisitaCtrl', [
'$http', '$scope', 'auth', 'unit', 'varieties', 'user', 'PouchDB', '$rootScope', 'onlineStatus','localStorageService','socket','mailer',
function ($http, $scope, auth, unit, varieties, user, PouchDB, $rootScope, onlineStatus, localStorageService, socket, mailer) {

    $scope.currentUser = auth.currentUser;
    $scope.searchmode = "Search By Id"
   
    $scope.unitsToShow = [];
    $scope.currentUnit = null;
    $scope.NoUserUnit = false;
    $scope.isSearching = false;

    $scope.searchUnit = function () {

        var searchVal = $("#searchtextbox").val();
        if (searchVal != "") {
            $scope.isSearching = true;
            $scope.CNTMSG = "";

            $scope.unitsToShow = [];
            $scope.NoUserUnit = false;

            var searchObj = {
                searchType: $("input:radio[name ='inlineRadioOptions']:checked").val(),
                ///searchValue: "9876543210"
                searchValue: searchVal
            }

            user.searchUserUnit(searchObj).then(function (response) {

                $scope.isSearching = false;
                console.log(response);
                if (response.errorCODE) {
                    $scope.CNTMSG = "No user find with search criteria";
                }
                else {
                    if (response.units && response.units.length > 0) {
                        $scope.NoUserUnit = false;
                        $scope.CNTMSG = "Resultados";
                        console.log("from api");
                        $scope.unitsToShow = response.units;
                    } else {
                        $scope.NoUserUnit = true;
                    }
                }

            });
        }

    }

   

    $scope.CNTMSG = "Select search parameter and hit search button to search the user unit";
    $scope.AddNewUnit = function () {
        console.log($("input:radio[name ='inlineRadioOptions']:checked").val());
        $scope.modalText = "Nueva Unidad";
        $scope.$broadcast('MANAGEUNIT', { unitId: -1, isRecommendationFieldRequired: true });
        $("#myModal2").modal('show');
    }

    $scope.openUnit = function (unit) {
        $scope.currentUnit = unit;
        $("#myModal").modal('show');
    }


    $scope.$on('UNITADDED', function (e, args) {
        if ($rootScope.IsInternetOnline) {
            PouchDB.SynServerDataAndLocalData().then(function () {
                console.log("sync successfully.");

            }).catch(function (err) {
                console.log("Not able to sync" + error);
                //$scope.ResetNewUnit();
            });
        }
        else {
            //$scope.ResetNewUnit();
        }
    });

       

    $scope.isEmailing = false;
    $scope.sentRecommendation = function () {
        $scope.isEmailing = true;
        console.log($scope.currentUnit.recommendation);
        console.log("sentRecommendation button hit");
        mailer.sendMail({ mailRequest: { TO: $scope.user.email, SUBJECT: "You recieved a recommendation  on unit", TEXT: "", HTML: "<b>You recieved a recommendation on one of the unit, This is dummy test and has to change </b>" } }).then(function (result) {
            $scope.isEmailing = false;
            $("#myModal").modal('hide');
            if (result.data.success)
                swal({
                    title: "",
                    text: "Recommendation sent successfully",
                    type: "success",
                    confirmButtonText: "Cool"
                });
            else
                swal({
                    title: "",
                    text: "Error sending in recommendation",
                    type: "error",
                    confirmButtonText: "Cool"
                }); 
        });
    }

    
    $scope.init = function () {
        // need to delete this line after full implementation
        //$scope.searchUnit();

        PouchDB.GetUserDataFromPouchDB(auth.userId()).then(function (result) {
            if (result.status == 'fail') {
                $scope.error = result.message;
            }
            else if (result.status == 'success') {
                $scope.user = result.data;
                console.log('user mode:', result.data);
            }
        });

        //unit.getUserUnit(auth.userId()).then(function (units) {
        //    console.log("from api");
        //    console.log(units);
        //});
    }

    $scope.init();

}]);