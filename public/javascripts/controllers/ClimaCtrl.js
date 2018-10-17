app.controller('ClimaCtrl', ['$http', '$scope', '$stateParams','auth', 'unit', 'varieties', 'user', '$rootScope','localStorageService', 'onlineStatus','$state',
function ($http,$scope, $stateParams,auth, unit, varieties, user, $rootScope, localStorageService, onlineStatus,$state) {
    const urlClima ="https://us-central1-cdcf-898d2.cloudfunctions.net/wxData";

    $('.switch').css("color", "#FFF");
    $scope.posicion = {};
    $scope.statusCargando = "Cargando ubicación GPS";
    $scope.loadData = function(lat,lng){
    $scope.statusCargando = "Cargando datos de clima";
    $scope.actual = null;
    $scope.pronosticodiario = null;
    $scope.pronosticohorario = null;
    $scope.error=null;

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
            $scope.error = "Imposible descargar información climática";
        });
    }

    $scope.loadPerspectiva = function(){
        //http://www.insivumeh.gob.gt/?cat=13
        //http://localhost:8090/insivume.html
        $http.get('http://www.insivumeh.gob.gt/?cat=13').then(function(data){
            var html = data.data;
            var pos1 = html.indexOf('<article');
            var pos2 = html.lastIndexOf('/article>');
            var article = html.substr(pos1,((pos2-pos1)+9));
            $scope.htmlPerspectiva = article;
        });
    }

    $scope.loadElninio = function(){
        //http://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc_Sp.shtml
        //http://localhost:8090/enso.html
 $http.get('http://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc_Sp.shtml').then(function(data){
            var html = data.data;
            var pos1 = html.indexOf('<a name="contents"></a>');
            var pos2 = html.indexOf('</table>',pos1);
            var article = html.substr((pos1+23),((pos2-pos1)+8));
            pos1 = article.indexOf('<table');
            pos2 = article.indexOf('>');
            article = article.replace(article.substr(pos1,(pos2-pos1)+1),'<table class="table">');
            pos1 = article.indexOf('<tr>');
            pos2 = article.indexOf('</tr>');
            article = article.replace(article.substr(pos1,(pos2-pos1)+5),'');
            pos1 = article.lastIndexOf('<table');
            pos2 = article.lastIndexOf('</table>');
            article = article.replace(article.substr(pos1,(pos2-pos1)+8),'');
            $scope.htmlElninio = article;
        },function error(){
            $scope.error = "Imposible descargar información climática";
        });
        //
        //http://localhost:8090/enso2.html
$http.get('https://iri.columbia.edu/our-expertise/climate/forecasts/enso/current/?enso_tab=enso-cpc_plume').then(function(data){
            var html = data.data;
            var pos1 = html.indexOf("IRI ENSO Forecast");
            pos1 = html.indexOf("<img",pos1);
            var pos2 = html.indexOf(">",pos1);
            article = html.substr(pos1,(pos2-pos1)+1);
            article = article.replace(">",'class="img-responsive">');
            console.log("article:"+article);
            $scope.imgElninio = article;
        },function error(){
          $scope.error = "Imposible descargar información climática";
        });

    }

    $scope.posDefault=false;
    $scope.online = $rootScope.IsInternetOnline;

    if($state.current.name =='clima'){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.posicion['lat']=position.coords.latitude;
                $scope.posicion['lng']=position.coords.longitude;
                $scope.loadData($scope.posicion['lat'],$scope.posicion['lng']);
            },function error(err){
                $scope.posicion['lat']='14.5867194';
                $scope.posicion['lng']='-90.49877839999999';
                $scope.loadData($scope.posicion['lat'],$scope.posicion['lng']);
                $scope.posDefault=true;
            });
        }else{
            $scope.posicion['lat']='14.5867194';
            $scope.posicion['lng']='-90.49877839999999';
            $scope.loadData($scope.posicion['lat'],$scope.posicion['lng']);
        }
    }
    if($state.current.name=='perspectiva'){
        $scope.loadPerspectiva();
    }
    if($state.current.name=='climaelninio'){
        $scope.loadElninio();
    }

}]);
