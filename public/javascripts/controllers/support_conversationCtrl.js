// Support Chat Controller
app.controller('support_conversationCtrl',['$scope','auth', 'socket', 'user', 'Upload','support_detail','$base64', '$state', '$stateParams',
function ($scope, auth, socket, user, Upload, support_detail ,$base64, $state, $stateParams) {

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
	$scope.attachment="";
	

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

		$scope.detectbase64 =  function(str) {
			if (str ==='' || str.trim() ===''){ return false; }
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
	}
	// Check for the File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
  	document.getElementById('file').addEventListener('change', handleFileSelect, false);
	} else {
  	alert('The File APIs are not fully supported in this browser.');
	}

	function handleFileSelect(evt) {
		var f = evt.target.files[0]; // FileList object
		var reader = new FileReader();
		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			return function(e) {
				var binaryData = e.target.result;
				//Converting Binary Data to base 64
				var base64String = window.btoa(binaryData);
				//showing file converted to base64
				$scope.attachment= base64String;
		//document.getElementById('messagetxt').value = base64String;
				//alert('File converted to base64 successfuly!\nCheck in Textarea');
			};
		})(f);
		// Read in the image file as a data URL.
		reader.readAsBinaryString(f);
	}	

	$scope.sendMessage = function() {
		console.log($scope.idSupport, $scope.senderUser);
		var f = $('.message_write');
		var msg = f.find('[name=messagetxt]').val();
		var from_id = f.find('[name=fromId]').val();
		var imagebin = $scope.attachment;
		var imagex = new Image();
		//Just getting the source from the span. It was messy in JS.
		msg= '<p>'+ msg +'</p>';
		imagex.src =  $scope.attachment;
		if(imagebin.length>3){
			msg= '<img src=\"data:image/png;base64,'+imagebin+'\" width=\"300\"></img>';
		}

		if(msg.length>3){
			console.log("Mensaje: ", msg);
			console.log("from_id: ", from_id);
			console.log("to_user: ", $scope.senderUser);
			console.log("image: " , imagebin);

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
				if(imagebin.length>3){
					$('#chat').append('<ul class=\"list-unstyled\" ng-repeat=\"msg in listChats\" ng-controller=\"support_conversationCtrl\"><li class=\"left clearfix\" ><div class=\"chat-body1 clearfix pull-right\" > <img src=\"data:image/png;base64,' + imagebin + '\" width=\"300\"></img><div class=\"chat_time pull-right\">'+$scope.currentDate+'</div></div></li></ul>');
					$scope.attachment="";
				}else{
					$('#chat').append('<ul class=\"list-unstyled\" ng-repeat=\"msg in listChats\" ng-controller=\"support_conversationCtrl\"><li class=\"left clearfix\" ><div class=\"chat-body1 clearfix pull-right\" >' + msg + '<div class=\"chat_time pull-right\">'+$scope.currentDate+'</div></div></li></ul>');
				}
				$scope.cargarConversacion();
			});
		}
		//socket.emit('get msg',data_server);
}

$scope.formattedDate=function(date) {
	    return new Date(date);
}

$scope.cargarConversacion();
}]);
