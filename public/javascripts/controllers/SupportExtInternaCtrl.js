// Support Chat Controller
app.controller('SupportExtInternaCtrl',['$scope','auth', 'socket', 'user','Upload','$base64', 'chats', '$state', '$stateParams',
function ($scope, auth, socket, user,Upload,$base64, chats, $state, $stateParams) {


	$('.switch').css("color", "#FFF");
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.loggedUser = auth.currentUser();
	$scope.userImageList = [];
	$scope.currentUserObj = auth.currentUserObject();
	$scope.adminImage='';
	$scope.adminName='';
	$scope.chatId = $stateParams.idchat;
	$scope.senderUser = $stateParams.senderuser;
	// $scope.chatUserName = "";
	$scope.chatUser = [];
	//$scope.UserName = 'User';
	$scope.UserImage = 'images/ChatUser.png';
	$scope.UserImageBottom = 'images/ChatUser.png';
	// $scope.UserNameDisplay = 'User';
	$scope.IsCall = false;
	console.log($scope.loggedUser);
    $scope.toId = "";
    $scope.cargado = false;

	$scope.data_server = {};
	// $('.chatUser').show();
	// $('.userName').show();
	// $('.sendMesseges').show();

	var data_server = {
		from_id: $scope.senderUser,
        chat_id: $scope.chatId
	}
	socket.emit('load msg', data_server);

	socket.on('set msg only',function(data){
        $scope.cargado = true;
        data=JSON.parse(data);console.log("set msg only", data)
        $scope.toId = data.reciber;
        /*var user = data.sender;
        if (user == $scope.senderUser) {*/
        $scope.setCurrentUserImage(data.messages);
        $scope.$apply();
			//}
    });


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
	    /*for (var i = 0; i < messageList.length; i++) {
	      if (messageList[i].sender_id != undefined) {
	            $scope.getUserImage(messageList[i].sender_id);
	      }
	    }*/
	    $scope.chatLog = messageList;
	}


	// Función del botón enviar mensaje
	$scope.sendMessage = function(attachmentfile) {
		var image;
		console.log(attachmentfile);
		console.log($scope.chatId, $scope.senderUser);

		if(attachmentfile){
			console.log(attachmentfile)
			//console.log(Upload.dataUrl(attachmentfile).then(('base64')))
		 Upload.dataUrl(attachmentfile, true).then(function(dataUrl) {
			image = dataUrl;
			var f = $('.type-sink');
	        var msg = f.find('[name=chatMsg]').val();
	        var from_id = f.find('[name=fromId]').val();
					var toUser = f.find('[name=toId]').val();
	        var from_chatattchment = image;

					console.log("Mensaje: ", msg);
					console.log("from_id: ", from_id);
					console.log("to_user: ", $scope.senderUser);


			var data_server={
          message:msg,
          bodyattachement:from_chatattchment,
          to_user: $scope.senderUser,
          from_id:from_id
      };



					// $scope.chatLog.push(data_server);

	        socket.emit('get msg',data_server);
	        $('.type-sink .form-control').val("");
	        $scope.files = '';
		 })
		 } else {


			var f = $('.type-sink');
	        var msg = f.find('[name=chatMsg]').val();
	        var from_id = f.find('[name=fromId]').val();
	        var from_chatattchment = image;

					console.log("Mensaje: ", msg);
					console.log("from_id: ", from_id);
					console.log("to_user: ", $scope.senderUser);

			var data_server={
	            message:msg,
	            bodyattachement:from_chatattchment,
	            to_user: $scope.toId,
	            from_id: $scope.senderUser,
                chatid:$scope.chatId
	        };

					$scope.chatLog.push(data_server);

	        socket.emit('get msg',data_server);
	        $('.type-sink .form-control').val("");
  }
}

	socket.on('set msg',function(data){
				data=JSON.parse(data);console.log("set msg", data);
				var usera = data.to_user;
				var userb = data.from_id;
				if (usera == $scope.senderUser || userb == $scope.senderUser) {
						$scope.setCurrentUserImage(data.chat.messages);
						$scope.$apply();
				}

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

}]);
