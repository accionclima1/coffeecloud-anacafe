// Support Chat Controller
app.controller('support_conversationCtrl',['$scope','auth', 'socket', 'user', 'Upload','support_detail', '$base64', '$state', '$stateParams',
function ($scope, auth, socket, user, Upload, support_detail, $base64, $state, $stateParams) {

	$('.switch').css("color", "#FFF");
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.idSupport =$stateParams.supportID;
	$scope.loggedUser = auth.currentUser();
	$scope.currentUserObj = auth.currentUserObject();
	$scope.senderUser = $stateParams.senderuser;
	$scope.n=0;
  $scope.data_server = {};
	$scope.listChats=[];
	$scope.chatLog=[];
	var currentDT=new Date();
	var twoDigitMonth = ((currentDT.getMonth().length+1) === 1)? (currentDT.getMonth()+1) : '0' + (currentDT.getMonth()+1);

	$scope.currentDate = currentDT.getDate() + "/" + twoDigitMonth + "/" + currentDT.getFullYear()+" "+ currentDT.getHours()+":"+currentDT.getMinutes();
	// Función del botón enviar mensaje
	$scope.cargarConversacion = function(){
		console.log($scope.currentUserObj.username);
		//support_head.getAll().then(function (msg) {
		 support_detail.getConversation($scope.idSupport, $scope.n).then(function (msg) {
	     $scope.cargado = true;
	     $scope.chatsList =[];
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


	$scope.sendMessage = function() {
		console.log($scope.idSupport, $scope.senderUser);
		var f = $('.message_write');
		var msg = f.find('[name=messagetxt]').val();
	  var from_id = f.find('[name=fromId]').val();

					console.log("Mensaje: ", msg);
					console.log("from_id: ", from_id);
					console.log("to_user: ", $scope.senderUser);
		$scope.chat={
				message:msg,
				receiver: $scope.toId,
				sender: from_id,
				support_head_id:$scope.idSupport,
				timestamp:currentDT
					};

		$scope.chatLog.push($scope.chat);
		support_detail.create($scope.chat).then(function (){
			$('#messagetxt').val("");
			$('#chat').append('<ul class=\"list-unstyled\" ng-repeat=\"msg in listChats\" ng-controller=\"support_conversationCtrl\"><li class=\"left clearfix\" ><div class=\"chat-body1 clearfix pull-right\" ><p>' + msg + '</p><div class=\"chat_time pull-right\">'+$scope.currentDate+'</div></div></li></ul>');
			$scope.cargarConversacion();
		});
		//socket.emit('get msg',data_server);
}

$scope.formattedDate=function(date) {
	    return new Date(date);
}

$scope.cargarConversacion();
}]);
