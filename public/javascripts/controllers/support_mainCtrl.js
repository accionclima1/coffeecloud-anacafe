// Support Chat Controller
app.controller('support_mainCtrl',['$scope','auth', 'socket', 'user','Upload','$base64', 'support_head', '$state', '$stateParams','$rootScope',
function ($scope, auth, socket, user,Upload,$base64, support_head, $state, $stateParams,$rootScope) {

	$('.switch').css("color", "#FFF");
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.loggedUser = auth.currentUser();
	$scope.currentUserObj = auth.currentUserObject();
	$scope.senderUser = $stateParams.senderuser;
  $scope.data = support_head.support_head;
	$scope.chatUser = [];
	$scope.n = 0;
  // $scope.chatUserName = "";
	$scope.chatUser = [];
	$scope.IsCall = false;
	$scope.listChats=[];
	$scope.fin=false;
	//Load messages
	$scope.cargarChats = function(){
		console.log($scope.currentUserObj.username);
		//support_head.getAll().then(function (msg) {
		 support_head.getUser($scope.currentUserObj.username, $scope.n).then(function (msg) {
	     $scope.cargado = true;
	     $scope.chatsList = {};
	     $scope.chatsUsers = [];

			 if(msg.data.length<20){
 					$scope.fin=true;
 			}

 			for (var i = 0; i < msg.data.length; i++) {
 					var obj = msg.data[i];
 					if($scope.chatsList[obj['msg']]==null){
 							$scope.chatsList[obj['msg']]=obj;
 					}
 			}

 			for(var i in $scope.chatsList){
 					$scope.chatsUsers.push($scope.chatsList[i]);
 			}

 			$scope.listChats = $scope.listChats.concat($scope.chatsUsers);
 			console.log($scope.chatsList);
 			console.log($scope.listChats);
 			$scope.n=$scope.n+1;
	    });
		}

	$scope.new_conversation = function(){
			console.log("new_conversation");
			$scope.classActive = "/support_conversation";
			$state.go("support_conversation", {}, {reload: true});
	}

	$scope.cargarChats();

}]);
