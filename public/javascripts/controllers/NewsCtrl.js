app.controller('NewsCtrl', [
'$scope',
'auth',
'$filter',
'$sce',
'posts',
function($scope, auth, $filter, $sce, posts){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.currentPage = 0;
  $scope.pageSize = 9;
  $scope.data = posts.posts;
  $scope.q = '';
  $('.switch').css("color", "#FFF");
    console.log("noticias");
  console.log($scope.data);
  $scope.getData = function () {
      return $filter('filter')($scope.data, $scope.q)

    }

    $scope.numberOfPages=function(){
        return Math.ceil($scope.getData().length/$scope.pageSize);
    }


}]);
