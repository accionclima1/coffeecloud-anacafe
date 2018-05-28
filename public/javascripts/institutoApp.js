var app = angular.module('coffeeScriptAdmin', ['btford.socket-io','ui.router','luegg.directives','ngSanitize']);

// Main controller 
app.controller('MainCtrl',['$scope', 'auth', '$rootScope', 'widget',
function($scope, auth, $rootScope, widget){
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;
	
	if ($scope.isLoggedIn()) {
		$('body').removeClass('loggedOff');
		$('body').addClass('loggedIn');
	} else {
		$('body').removeClass('loggedin');
		$('body').addClass('loggedOff');
	}
	
  // Get all widget
  widget.getAll().then(function(data)
    {
      $scope.widget = data;
    });

	$rootScope.$on('$viewContentLoaded', function (event) {
		Morris.Area({
        element: 'morris-area-chart',
        data: [{
            period: '2010 Q1',
            iphone: 2666,
            ipad: null,
            itouch: 2647
        }, {
            period: '2010 Q2',
            iphone: 2778,
            ipad: 2294,
            itouch: 2441
        }, {
            period: '2010 Q3',
            iphone: 4912,
            ipad: 1969,
            itouch: 2501
        }, {
            period: '2010 Q4',
            iphone: 3767,
            ipad: 3597,
            itouch: 5689
        }, {
            period: '2011 Q1',
            iphone: 6810,
            ipad: 1914,
            itouch: 2293
        }, {
            period: '2011 Q2',
            iphone: 5670,
            ipad: 4293,
            itouch: 1881
        }, {
            period: '2011 Q3',
            iphone: 4820,
            ipad: 3795,
            itouch: 1588
        }, {
            period: '2011 Q4',
            iphone: 15073,
            ipad: 5967,
            itouch: 5175
        }, {
            period: '2012 Q1',
            iphone: 10687,
            ipad: 4460,
            itouch: 2028
        }, {
            period: '2012 Q2',
            iphone: 8432,
            ipad: 5713,
            itouch: 1791
        }],
        xkey: 'period',
        ykeys: ['iphone', 'ipad', 'itouch'],
        labels: ['iPhone', 'iPad', 'iPod Touch'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });
	
            console.log('lock & loaded')
    })
}]);

// Services for widget
app.factory('widget', ['$http', function($http){
  var w = {};
  w.getAll = function()
  {
    return $http.get('/getWidgets').success(function(data){
      return data;
    });
  };
  return w;
}]);

// Authorize controller
app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('register-profile');
    });
  };

  $scope.registerProfile = function(){
      $state.go('location');
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])

// Socket Factory service
app.factory('socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io.connect('http://localhost:3000')
        });
    }
]);

//authorize service
app.factory('auth', ['$http','$window','$state', function($http, $window, $state){
   var auth = {};

   auth.saveToken = function (token){
	  $window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['flapper-news-token'];
	}

	auth.isLoggedIn = function(){
	  var token = auth.getToken();

	  if(token){
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.exp > Date.now() / 1000;
	  } else {
	    return false;
	  }
	};

	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.username;
	  }
	};

	auth.register = function(user){
	  return $http.post('/register', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logIn = function(user){
	  return $http.post('/login', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};
	auth.logOut = function(){
	  $window.localStorage.removeItem('flapper-news-token');
	  $state.go('login');
	};

  return auth;
}]);

//nav bar controller
app.controller('NavCtrl', [
'$scope',
'auth',
'$location',
function($scope, auth, $location){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
  $scope.isActive = function (viewLocation) {
     var active = (viewLocation === $location.path());
     return active;
	};
}]);

// Support Chat Controller 
app.controller('MessengerCtrl',['$scope','chats','auth', 'socket',
function($scope, chats, auth, socket){
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.chats = chats.chats;
	var f = $('.type-sink');
	var currentInput = $('.type-sink input[name=toId]');
	var currentchat = currentInput.val();
	$scope.currentChat = currentchat;
	
	$scope.sendMessage = function() {
        var msg = f.find('[name=chatMsg]').val();
        var from_id = f.find('[name=fromId]').val();
        var to_id = f.find('[name=toId]').val();
		var data_server={
            message:msg,
            to_user:to_id,
            from_id:from_id
        };
        //console.log(data_server);
        socket.emit('get msg',data_server);
         $('.type-sink .form-control').val("");
	};
	$scope.loadChat = function($event,sender) {
		//$('.chat-item').removeClass('active');
		//var target = $event.currentTarget;
		//$(target).addClass('active');
		$scope.currentChat = sender;
		currentInput.val(sender);
		var data_server = {
		    from_id : sender
	    }
	    //console.log(data_server);
	    socket.emit('load msg',data_server);
	}
	socket.on('set msg',function(data){
        data=JSON.parse(data);
        var usera = data.to_user;
        var userb = data.from_id;
        currentchat = currentInput.val();
        if (usera == currentchat || userb == currentchat) {
	        $scope.chatLog = data.chat.messages;
	        $scope.$apply();
	    }
    });
    socket.on('set msg only',function(data){
        data=JSON.parse(data);
        $scope.chatLog = data.messages;
        $scope.$apply();
    });
    $scope.deleteChat = function(chatid) {
	    var data_server = {
		    chatid : chatid
	    }
	    //console.log(data_server);
	    socket.emit('dlt chat',data_server);
    }
    socket.on('push chats',function(data){
        data=JSON.parse(data);
        //console.log(data);
        $scope.chats = data;
        $scope.$apply();
    });
}]);

//chats service
app.factory('chats', ['$http', 'auth', function($http, auth){
	  var o = {
	  		chats : []
	  };
	  o.getAll = function() {
	    return $http.get('/admin/chats').success(function(data){
	      angular.copy(data, o.chats);
	    });
	  };
		
  return o;
}]);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
	     var curUser = auth.currentUser();
	    if(!auth.isLoggedIn()){
	      $state.go('login');
	    } else if(curUser != 'admin' && curUser != 'administrador') {
		   window.location.href = '/'; 
	    }
	    
	  }]
    })
    .state('login', {
	  url: '/login',
	  templateUrl: '/login.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(auth.isLoggedIn()){
	      $state.go('home');
	    }
	  }]
	})
	.state('register', {
	  url: '/register',
	  templateUrl: '/register.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(auth.isLoggedIn()){
	      $state.go('home');
	    }
	  }]
	})
	.state('messenger', {
	  url: '/messenger',
	  templateUrl: '/messenger.html',
	  controller: 'MessengerCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(!auth.isLoggedIn()){
	      $state.go('login');
	    }
	  }],
	  resolve: {
	    chatPromise: ['chats', function(chats){
	      return chats.getAll();
	    }]
  	   }
	});

  $urlRouterProvider.otherwise('home');
}]);