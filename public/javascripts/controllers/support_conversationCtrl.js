// Support Chat Controller
app.controller('support_conversationCtrl',['$scope','auth', 'socket', 'user', 'Upload', '$base64', '$state', '$stateParams',
function ($scope, auth, socket, user, Upload, $base64, $state, $stateParams) {

	$('.switch').css("color", "#FFF");
	$scope.currentUser = auth.currentUser;
	$scope.loggedUser = auth.currentUser();
	$scope.senderUser = $stateParams.senderuser;
  $scope.data_server = {};
	$scope.chatLog=[];
	var currentDT=new Date();
	var twoDigitMonth = ((currentDT.getMonth().length+1) === 1)? (currentDT.getMonth()+1) : '0' + (currentDT.getMonth()+1);

	$scope.currentDate = currentDT.getDate() + "/" + twoDigitMonth + "/" + currentDT.getFullYear()+" "+ currentDT.getHours()+":"+currentDT.getMinutes();
	// Función del botón enviar mensaje

	$scope.sendMessage = function() {
		console.log($scope.chatId, $scope.senderUser);
		var f = $('.message_write');
		var msg = f.find('[name=messagetxt]').val();
	  var from_id = f.find('[name=fromId]').val();

					console.log("Mensaje: ", msg);
					console.log("from_id: ", from_id);
					console.log("to_user: ", $scope.senderUser);
		var data_server={
				message:msg,
				to_user: $scope.toId,
				from_id: $scope.senderUser,
				chatid:$scope.chatId
					};

		$scope.chatLog.push(data_server);
		socket.emit('get msg',data_server);
		$('#messagetxt').val("");
}

	$scope.loadMessage=function(){

	}
}]);
