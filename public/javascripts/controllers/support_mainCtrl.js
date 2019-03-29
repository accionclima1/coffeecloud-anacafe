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
	var currentDT=new Date();
	var twoDigitMonth = ((currentDT.getMonth().length+1) === 1)? (currentDT.getMonth()+1) : '0' + (currentDT.getMonth()+1);

	$scope.currentDate = currentDT.getDate() + "/" + twoDigitMonth + "/" + currentDT.getFullYear()+" "+ currentDT.getHours()+":"+currentDT.getMinutes();

	$scope.chat = {
		timestamp:currentDT,
		subject:"Solicitud de Soporte "+$scope.currentDate,
		sender:$scope.currentUserObj.username,
		receiver:"",
		solved:false
	}

	$scope.cargarChats = function(){
		console.log($scope.currentUserObj.username);
		//support_head.getAll().then(function (msg) {
		 support_head.getUser($scope.currentUserObj.username, $scope.n).then(function (msg) {
	     $scope.cargado = true;
	     $scope.chatsList =[ {}];
	     $scope.chatsUsers = [];

			 if(msg.data.length<20){
 					$scope.fin=true;
 			}

 			for (var i = 0; i < msg.data.length; i++) {
				var obj = msg.data[i];
				$scope.listChats.push(obj);
 			}

 			console.log($scope.listChats);
 			$scope.n=$scope.n+1;
	    });
		}

	$scope.new_conversation = function(){
		support_head.create($scope.currentUserObj.username, $scope.chat).then(function (result){
			$scope.idsuport= result.data._id;
			console.log("new_conversation created", $scope.idsuport);
			$state.go("support_conversation", {'supportID':$scope.idsuport ,'pagina':0}, {reload: true});
		});
	}

	$scope.cargarChats();

}]);
