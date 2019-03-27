// Support Chat Controller
app.controller('SupportExtCtrl',['$scope','auth', 'socket', 'user','Upload','$base64', 'chats', '$state', '$stateParams','$rootScope',
function ($scope, auth, socket, user,Upload,$base64, chats, $state, $stateParams,$rootScope) {


	$('.switch').css("color", "#FFF");
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.loggedUser = auth.currentUser();
	$scope.userImageList = [];
	$scope.currentUserObj = auth.currentUserObject();
    $scope.currentRole = auth.currentUserRole();
	$scope.adminImage='';
	$scope.adminName='';
    $scope.n = 0;
	// $scope.chatUserName = "";
	$scope.chatUser = [];
	//$scope.UserName = 'User';
	$scope.UserImage = '/images/ChatUser.png';
	$scope.UserImageBottom = '/images/attach.png';
	// $scope.UserNameDisplay = 'User';
	$scope.IsCall = false;
	console.log($scope.loggedUser);
    $scope.fin=false;

	$scope.data_server = {};
	$('.chatUser').hide();
	$('.userName').hide();
	$('.sendMesseges').hide();
	// $('.listadoChats').hide();
    $scope.listChats=[];
    $scope.cargado = false;

    $scope.unidades = ($rootScope.cantUnidades>0) ? true : false;


	$scope.cargarChats = function(){
        chats.getUser($scope.currentUserObj._id,$scope.n).then(function (chat) {
            $scope.cargado = true;
            $scope.chatsList = {};
            $scope.chatsUsers = [];

            if(chat.data.length<20){
                $scope.fin=true;
            }

            for (var i = 0; i < chat.data.length; i++) {
                var obj = chat.data[i];
                if($scope.chatsList[obj['chat']]==null){
                    $scope.chatsList[obj['chat']]=obj;
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



	//Función para entrar en el chats
	$scope.userChat = function(chatID, chatSender){

		console.log(chatID);
		console.log(chatSender);

		$state.go("supportextinterna", {idchat: chatID, senderuser: chatSender}, {reload: true});

/*		$scope.chatUserName = chatSender;

		$scope.data_server = {
			to_user: chatSender,
		};

		// $('.listadoChats').hide();
		// $('.chatTitle').hide();
		//
		// $('.chatUser').show();
		// $('.userName').show();
		// $('.sendMesseges').show();

		var data_server = {
				from_id: chatSender
		}

		console.log($scope.chatUserName);
		console.log(data_server);
		socket.emit('load msg', data_server);*/


		// socket.on('set msg only',function(data){
		// 			data=JSON.parse(data);console.log("set msg only", data)
		// 			var user = data.sender;
		// 			if (user == chatSender) {
		// 					$scope.setCurrentUserImage(data.messages);
		// 				$scope.$apply();
		// 		}
		// 	});
	}


	// Función Volver a Listado de Chats
	$scope.backChats = function(){
		// $state.go($state.current, {}, {reload: true});
		$('.listadoChats').show();
		$('.chatTitle').show();
		$('.sendMesseges').hide();
		$('.chatUser').hide();
		$('.userName').hide();
	}



	$('#userImage').change(function (e) {
	    var file = e.target.files[0],
            imageType = /image.*/;
	    if (!file.type.match(imageType))
	        return;
	    var reader = new FileReader();
	    reader.onload = $scope.saveImage;
	    reader.readAsDataURL(file);
	});


	$scope.saveImage = function (e) {
	    $scope.UserImage = e.target.result;
	}


	$scope.getUserImage = function (userId) {
	    var result = $.grep($scope.userImageList, function (item) {
	        return item._id == userId;
	    });

	    if (result.length == 0) {
	        $scope.userImageList.push({ _id: userId, nickname: '', image: '' });
	        user.get(userId).then(function (userObj) {
	            if (userObj.nickname == "") {
	                userObj.nickname = null;
	            }
	            if (userObj.image == "") {
	                userObj.image = null;
	            }
	            var nickName = userObj.nickname || userObj.username;
	            var userImage = userObj.image || 'images/ChatUser.png';
	            var res = $.grep($scope.userImageList, function (item) {
	                return item._id == userObj._id;
	            });
	            res[0].nickname = nickName;
	            res[0].image = userImage;
	            $.each($scope.chatLog, function (i, v) {
	                if (userObj._id == v.sender_id) {
	                    v.imageurl = userImage;
						$scope.adminName = nickName;
						if($scope.adminImage == '')
						{
							$scope.adminImage = userImage;
						}
	                    v.sender = nickName;
	                }
	            });
	        });
	    }
	    else {
	        if ($scope.chatLog != undefined) {
							console.log($scope.chatLog);
	            $.each($scope.chatLog, function (i, v) {

	                    v.imageurl = result[0].image;
	                    v.sender = result[0].nickname;

	            });
							console.log($scope.chatLog);
	        }
	    }
	}

	// Función para Cambiar Imagen de Usuario
	$scope.openImagePopup = function () {
	    $('#myModalUserImage').modal('show');
	}


	$scope.setCurrentUserImage = function (messageList) {
			console.log(messageList);
	    for (var i = 0; i < messageList.length; i++) {
	      if (messageList[i].sender_id != undefined) {
	            $scope.getUserImage(messageList[i].sender_id);
	      }
	    }
	    $scope.chatLog = messageList;
	}


	// Función del botón enviar mensaje
	$scope.sendMessage = function(attachmentfile) {
		var image;
		console.log(attachmentfile);
		console.log($scope.chatUserName);

	// 	if(attachmentfile){
	// 		console.log(attachmentfile)
	// 		//console.log(Upload.dataUrl(attachmentfile).then(('base64')))
	// 	 Upload.dataUrl(attachmentfile, true).then(function(dataUrl) {
	// 		image = dataUrl;
	// 		var f = $('.type-sink');
	//         var msg = f.find('[name=chatMsg]').val();
	//         var from_id = f.find('[name=fromId]').val();
	// 				var toUser = f.find('[name=toId]').val();
	//         var from_chatattchment = image;
	//
	// 				console.log("Mensaje: ", msg);
	// 				console.log("from_id: ", from_id);
	// 				console.log("to_user: ", toUser);
	//
	//
	// 		var data_server={
	//             message:msg,
	//             bodyattachement:from_chatattchment,
	//             to_user: toUser,
	//             from_id:from_id
	//         };
	//
	// 				// $scope.chatLog.push(data_server);
	//
	//         socket.emit('get msg',data_server);
	//         $('.type-sink .form-control').val("");
	//         $scope.files = '';
	// 	 })
	// 	 } else {
	//
	//
	// 		var f = $('.type-sink');
	//         var msg = f.find('[name=chatMsg]').val();
	//         var from_id = f.find('[name=fromId]').val();
	// 				var toUser = f.find('[name=toId]').val();
	//         var from_chatattchment = image;
	//
	// 				console.log("Mensaje: ", msg);
	// 				console.log("from_id: ", from_id);
	// 				console.log("to_user: ", toUser);
	//
	// 		var data_server={
	//             message:msg,
	//             bodyattachement:from_chatattchment,
	//             to_user: toUser,
	//             from_id:from_id
	//         };
	//
	//         socket.emit('get msg',data_server);
	//         $('.type-sink .form-control').val("");
  // }
}

	socket.on('set msg',function(data){
				/*data=JSON.parse(data);console.log("set msg", data);
				console.log($scope.chatUserName);
				var usera = data.to_user;
				var userb = data.from_id;
				if (usera == $scope.chatUserName || userb == $scope.chatUserName) {
						$scope.setCurrentUserImage(data.chat.messages);
						$scope.$apply();
				}*/
        var jsonMsg = JSON.parse(data);
        console.log(jsonMsg);
            $state.go('supportExtInterna', {reload: true,idchat:jsonMsg.chat._id,senderuser:$scope.currentUserObj._id});

		});


	if (!$scope.IsCall) {
	    $scope.IsCall = true;

	    user.get($scope.currentUserObj._id).then(function (userObj) {
	        if (userObj.nickname == "") {
	            userObj.nickname = null;
	        }
	        if (userObj.image == "") {
	            userObj.image = null;
	        }
	        //$scope.UserNameDisplay = userObj.nickname || userObj.username;
					if($scope.UserName!='admin')
					{
					    //$scope.UserImage = userObj.image || '../images/ChatUser.png';
					    $scope.UserImageBottom = userObj.image || 'images/ChatUser.png';
						$scope.UserName=userObj.username;
					}
					else
					{
						$scope.UserName = userObj.nickname || userObj.username;
						//$scope.UserImage = userObj.imageurl || '../images/ChatUser.png';
						$scope.UserImageBottom = userObj.image || 'images/ChatUser.png';
					}
	    });
	}

    $scope.crearChat = function(){
        user.getArea($scope.currentUserObj._id).then(function(data){
            if(data.length>0){
                var strData = data.join(",");
                user.getUserInCharge(strData).then(function(data2){
                    if(data2){
                        console.log(data2);
                        var userReceiver = data2[0];
                        var dataMsg = {
                            to_user:userReceiver._id,
                            from_id:$scope.currentUserObj._id,
                            message:"Saludos"
                        }
                        socket.emit('get msg',dataMsg);
                    }
                });
            }else{

            }
        });
    }

	$scope.uploadPhoto = function () {
	    var userObj = auth.currentUserObject();
	    if (userObj != null) {
	        user.get(userObj._id).then(function (userObj) {
	        	console.log($scope.UserImage)
	            if ($scope.UserImage != null) {
	                userObj.image = $scope.UserImage;
	            }
	            //if ($scope.UserName != null) {
	            //    userObj.nickname = $scope.UserName;
	            //}

	            user.update(userObj).error(function (error) {
	                $scope.error = error;
	            }).then(function (data) {
	                $scope.message = data.data.message;
	                location.reload();
	            });
	        });
	    }
	    $('#myModalUserImage').modal('hide');

    }
        $scope.cargarChats();

}]);
