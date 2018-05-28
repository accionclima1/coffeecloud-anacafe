//Variety controller
app.controller('VarietyCtrl', [
	'$scope',
	'auth',
	'$location',
	'varieties',
    '$window',
    'user',
	function ($scope, auth, $location, varieties, $window, user) {
	    var currentvarieties = [];
	    $scope.isprocessing = false;

	    var loadAll = function () {
	        varieties.getAll().then(function (varieties) {
	            currentvarieties = varieties.data;
	            console.log(currentvarieties);
	            $scope.varieties = currentvarieties;

	            for (var vcnt = 0; vcnt < $scope.varieties.length; vcnt++) {
	                $scope.varieties[vcnt].original = angular.copy($scope.varieties[vcnt].name);
	                $scope.varieties[vcnt].isEditing = false;
	            }

	        });
	    };

	    loadAll();

	    $scope.addNew = function () {
	        if ($scope.newVariety) {
	            newVariety = {}
	            newVariety["name"] = $scope.newVariety;

	            varieties.create(newVariety).then(function (newVar) {
	                currentvarieties.push(newVar.data);
	                $scope.varieties = currentvarieties;
	                $scope.newVariety = "";
	            });
	        }
	    };


	    $scope.deleteVariety = function (varId, index) {

	        varIdObj = {}
	        varIdObj["varId"] = varId;

	        varieties.deleteVariety(varIdObj).then(function (newVar) {
	            currentvarieties.splice(index, 1);
	            $scope.varieties = currentvarieties;
	        });
	    };

	    $scope.updateVariety = function (variety) {
	        $scope.isprocessing = true;
	        varieties.update(variety).then(function (response) {
	            if (response.data.Success) {
	                variety.original = angular.copy(variety.name);
	            } else {
	                variety.name = angular.copy(variety.original);
	            }
	            variety.isEditing = false;
	            $scope.isprocessing = false;
	        });


	    }

	}]);



app.factory('varieties', ['$http', 'auth', '$window', function ($http, auth, $window) {
    var o = {};
    o.getAll = function (id) {
        return $http.get('/varieties').success(function (data) {
            return data;
        });
    };
    o.create = function (varieties) {
        //localhost unit
        return $http.post('/varieties', varieties, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    o.update = function (varieties) {
        return $http.post('/varieties/update', varieties, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    }

    o.deleteVariety = function (Ided) {
        console.log(Ided);
        return $http.delete('/varieties', {
            headers: { Authorization: 'Bearer ' + auth.getToken(), variid: Ided.varId }
        }).success(function (data) {
            return Ided;
        });
    };
    return o;
}]);
