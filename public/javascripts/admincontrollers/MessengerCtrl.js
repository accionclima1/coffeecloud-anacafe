// Support Chat Controller 
app.controller('MessengerCtrl', ['$scope', 'chats', 'auth', 'socket', 'user','fileupload',
	function ($scope, chats, auth, socket, user, fileupload) {
	    $scope.isLoggedIn = auth.isLoggedIn;
	    $scope.currentUser = auth.currentUser;
	    $scope.chats = chats.chats;
	    var f = $('.type-sink');
	    var currentInput = $('.type-sink input[name=toId]');
	    var currentchat = currentInput.val();
		 if($scope.userList==undefined)
		 {
			user.getAll().then(function (users) {
				$scope.userList = users;
			});
		 }
	    $scope.currentChat = currentchat;
	    $scope.UserName = 'admin';
	    $scope.UserImage = '../images/ChatUser.png';
	    $scope.UserImageBottom = '../images/ChatUser.png';
	    $scope.nickname = 'admin';
	    $scope.myFile = null;
        $scope.clientImage='';
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
	    
	    $scope.getUserImage = function () {
	        var userObj = auth.currentUserObject();
	        user.get(userObj._id).then(function (userObj) {
	            if (userObj.nickname == "") {
	                userObj.nickname = null;
	            }
	            if (userObj.image == "") {
	                userObj.image = null;
	            }
	            $scope.UserName = userObj.nickname || 'admin';
	            $scope.nickname = userObj.nickname || 'admin';
	            $scope.UserImage = userObj.image || '../images/ChatUser.png';
	            $scope.UserImageBottom = userObj.image || '../images/ChatUser.png';
	        });
	    }
	    $scope.getUserImage();

	    $scope.sendMessage = function () {
	        var msg = f.find('[name=chatMsg]').val();
	        var from_id = f.find('[name=fromId]').val();
	        var to_id = f.find('[name=toId]').val();
	        var userObj = auth.currentUserObject();
	        msg = {
	            bodyMsg: msg,
	            sender_id: userObj._id,
	        }
	        var data_server = {
	            message: msg,
	            to_user: to_id,
	            from_id: from_id
	        };
	        socket.emit('get msg', data_server);
	        $('.type-sink .form-control').val("");
	    };
	    $scope.loadChat = function ($event, sender) {
	        $scope.currentChat = sender;
	        currentInput.val(sender);
	        var data_server = {
	            from_id: sender
	        }
	        socket.emit('load msg', data_server);
	    }

	    $scope.openImagePopup = function () {
	        $('#myModalUserImage').modal('show');
	    }

	    $scope.setCurrentUserImage = function (messageList) {

	        for (var i = 0; i < messageList.length; i++) {
	            if (messageList[i].sender == 'admin') {
	                messageList[i].sender = $scope.UserName;
	                messageList[i].imageurl = $scope.UserImage;
	            }
	            else {
	                var cuser = $.grep($scope.userList, function (item) {
	                    return item.username == messageList[i].sender;
	                });
	                if (cuser != null && cuser.length > 0) {
	                    if (cuser[0].image != undefined) {
	                        messageList[i].imageurl = cuser[0].image;
	                    }
	                    else {
	                        messageList[i].imageurl = '../images/ChatUser.png'
	                    }
	                }
	                else {
	                    messageList[i].imageurl = '../images/ChatUser.png'
	                }
	            }
	        }
	        $scope.chatLog = messageList;
	    }

	    $scope.uploadPhoto = function () {
	        var userObj = auth.currentUserObject();
	        if(userObj!=null && userObj!=undefined)
			{
			 if ($scope.UserImage != null) {
	                    userObj.image = $scope.UserImage;
	                }
	                if ($scope.UserName != null) {
	                    userObj.nickname = $scope.UserName;
	                }
			  user.update(userObj).error(function (error) {
	                    $scope.error = error;
	                }).then(function (data) {
						$scope.getUserImage();
	                });
	        $('#myModalUserImage').modal('hide');
			}
	    }

	    socket.on('set msg', function (data) {
	        data = JSON.parse(data);
	        var usera = data.to_user;
	        var userb = data.from_id;
	        currentchat = currentInput.val();
	        if (usera == currentchat || userb == currentchat) {
	            $scope.setCurrentUserImage(data.chat.messages);
	            $scope.$apply();
	        }
	    });

	    socket.on('set msg only', function (data) {
	        data = JSON.parse(data);
	        $scope.setCurrentUserImage(data.messages);
	        $scope.$apply();
	    });
	    socket.on('push chats', function (data) {
	        data = JSON.parse(data);
	        $scope.chats = data;
	        $scope.$apply();
	    });

	    $scope.deleteChat = function (chatid) {
	        var data_server = {
	            chatid: chatid
	        }
	        socket.emit('dlt chat', data_server);
	    }
	}]);



//chats service
app.factory('chats', ['$http', 'auth', function ($http, auth) {
    var o = {
        chats: []
    };
    o.getAll = function () {
        return $http.get('/admin/chats').success(function (data) {
            angular.copy(data, o.chats);
        });
    };

    return o;
}]);