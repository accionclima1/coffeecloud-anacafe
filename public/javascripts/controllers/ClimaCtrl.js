app.controller('ClimaCtrl', ['$http', '$scope', '$stateParams','auth', 'unit', 'varieties', 'user', '$rootScope','localStorageService', 'onlineStatus',
function ($http,$scope, $stateParams,auth, unit, varieties, user, $rootScope, localStorageService, onlineStatus) {
    const urlClima ="https://us-central1-cdcf-898d2.cloudfunctions.net/wxData";

    $scope.posicion = {};
    $scope.statusCargando = "Cargando ubicación GPS";
    $scope.loadData = function(lat,lng){  
        $scope.statusCargando = "Cargando datos de clima";
        $scope.actual = null;
        $scope.pronosticodiario = null;
        $scope.pronosticohorario = null;
        if($rootScope.clima!=undefined){
            console.log("clima");
            console.log($rootScope.clima);
            $scope.actual = $rootScope.clima['current_observation'];
            $scope.almanac = $rootScope.clima['almanac'];
            $scope.pronosticodiario = $rootScope.clima['forecast']['simpleforecast']['forecastday'];
            $scope.pronosticohorario = $rootScope.clima['hourly_forecast'];
        }
        $http({method:'get',url:urlClima+'?lat='+lat+'&lon='+lng}).then(function exitoso(data){
            $scope.statusCargando='';
            var info = data.data;
            $rootScope.clima = info;
            $scope.actual = info['current_observation'];
            $scope.almanac = info['almanac'];
            $scope.pronosticodiario = info['forecast']['simpleforecast']['forecastday'];
            $scope.pronosticohorario = info['hourly_forecast'];
        },function error(err){

        });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.posicion['lat']=position.coords.latitude;
            $scope.posicion['lng']=position.coords.longitude;
            $scope.loadData($scope.posicion['lat'],$scope.posicion['lng']);
        },function error(err){
            $scope.posicion['lat']='14.5867194';
            $scope.posicion['lng']='-90.49877839999999';
            $scope.loadData($scope.posicion['lat'],$scope.posicion['lng']);
        });
    }else{
        $scope.posicion['lat']='14.5867194';
        $scope.posicion['lng']='-90.49877839999999';
        $scope.loadData($scope.posicion['lat'],$scope.posicion['lng']);
    }

}]);