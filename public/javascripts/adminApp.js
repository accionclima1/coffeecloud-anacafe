var app = angular.module('coffeeScriptAdmin', ['btford.socket-io', 'ui.router', 'luegg.directives', 'ui.tinymce', 'ui.bootstrap', 'ngSanitize','ui.grid','ui.grid' , 'ui.grid.exporter']);
app.directive('fileModel', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;

			element.bind('change', function () {
				scope.$apply(function () {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}]);

app.filter('startFrom', function () {
	return function (input, start) {
		if (input) {
			start = +start;
			return input.slice(start);
		}
		return [];
	};
});

// Main controller
app.controller('MainCtrl', ['$scope', 'auth', 'roya', 'chats', 'user', 'widget', 'mainInfo',
	function ($scope, auth, chats, roya, user, widget, mainInfo) {
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.curUserRole = auth.currentUserRole();
		$scope.logOut = auth.logOut;
		$scope.mymap;
		$scope.dataIncidencias;
		$scope.msg = '';
		user.getAll().then(function (users) {
			$scope.userList = users;
		});

		roya.getAll().then(function (tests) {
			$scope.royaTests = tests.data;
		});
		chats.getAll().then(function (chats) {
			$scope.chatsTotal = chats.data;
		});


		if ($scope.isLoggedIn()) {
			$('body').removeClass('loggedOff');
			$('body').addClass('loggedIn');
		} else {
			$('body').removeClass('loggedin');
			$('body').addClass('loggedOff');
		}


		/*$scope.initMapaincidencia = function(){
			console.log("Inicializando mapa incidencias...");

			mainInfo.getData().then(function(data){
				console.log("Llmada");
				$scope.dataIncidencias = data.data;
				//$scope.initMapaincidencia();

				if($scope.mymap == undefined ) $scope.mymap = L.map('incidenciasMapa', {center: [15.8738057,-89.6342852], zoom: 7});

				L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
					maxZoom: 18,
					attribution: 'Anacafé',
					id: 'mapbox.streets'
				}).addTo($scope.mymap);


				var unitsData = $scope.dataIncidencias['units'];
				for ( var i=0; i < unitsData.length; i++) {
					if (unitsData[i].ubicacion != undefined){
					//console.log("Ubicacion: " + );

					var geo = unitsData[i].ubicacion.replace(/[*+?^${}()[ ]|[\]\\]/g, "").split(",");
					console.log(geo);
					L.marker([geo[0],geo[1]]).addTo($scope.mymap)
					.bindPopup('<strong> Unidad: ' + unitsData[i].nombre + '</strong> <p> Esto seria la descripcion.</p>');


					//Lotes
					if (unitsData[i].lote != undefined){

						var lotesData = unitsData[i].lote;

						for ( var j=0; j < lotesData.length; j++) {
							if (lotesData[j].georeferenciacion != undefined){
								var geoRef = lotesData[j].georeferenciacion.replace(/[*+?^${}()[ ]|[\]\\]/g, "").split(",");
								console.log(geoRef);
								L.marker([geoRef[0],geoRef[1]]).addTo($scope.mymap)
								.bindPopup('<strong>' + lotesData[j].nombre + '</strong> <p>' + lotesData[j].variedad +'</p>');

							}
						}

					}



				}

			}



			//WebService
			//http://coffeecloud.centroclima.org/users/59262aee75a18b8e63074100

		});





		}*/



	    // Add new widget
	    $scope.addWidget = function(wid)
	    {
	    	wid.user = auth.currentUserObject()._id;
	    	widget.create(wid).then(function(data){
	    		$scope.wid = {};
	    		$('#myModal').modal('hide');
	    		$scope.msg = 'widget Added successfully.';
	    		widget.getAll().then(function(data)
	    		{
	    			$scope.widget = data;
	    		});
	    	});
	    }

	    widget.getAll().then(function(data)
	    {
	    	$scope.widget = data;
	    });

	    $scope.delwid = function(id)
	    {
	    	widget.remove(id).then(function(data)
	    	{
	    		$scope.widget = data;
	    	});
	    }

	}]);


app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

//get Datas
app.factory('mainInfo', ['$http', function($http) {

	var obj = {};

	obj.getData = function(){

		return $http.get('http://coffeecloud.centroclima.org/users/59262aee75a18b8e63074100').success(function(data) {
			return data;
		});
	}

	return obj;
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
	w.create = function(wid)
	{
		return $http.post('/admin/addwidget', wid).success(function(data){
			return data;
		});
	};
	w.remove = function(id)
	{
		return $http.delete('/admin/widget/'+id).success(function(data) {
			return data;
		});
	}
	return w;
}]);

app.factory('posts', ['$http', 'auth', function ($http, auth) {
	var o = {
		posts: []
	};
	o.getAll = function () {
		return $http.get('/posts').success(function (data) {
			angular.copy(data, o.posts);
		});
	};
	o.update = function (post) {
		return $http.put('/posts/' + post._id, post, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function (data) {
			return data
		});
	};
	o.create = function (post) {
		return $http.post('/posts', post, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function (data) {
			o.posts.push(data);
		});
	};
	o.upvote = function (post) {
		return $http.put('/posts/' + post._id + '/upvote', null, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		})
		.success(function (data) {
			post.upvotes += 1;
		});
	};
	o.get = function (id) {
		return $http.get('/posts/' + id).then(function (res) {
			return res.data;
		});
	};
	o.addComment = function (id, comment) {
		return $http.post('/posts/' + id + '/comments', comment, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		});
	};

	o.upvoteComment = function (post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		})
		.success(function (data) {
			comment.upvotes += 1;
		});
	};

	return o;
}]);

// Socket Factory service
app.factory('socket', ['socketFactory',
	function (socketFactory) {
		return socketFactory({
			prefix: '',
			ioSocket: io.connect('http://coffeecloud.centroclima.org')
		});
	}
	]);


// parse a date in mm/dd/yyyy format
function parseDate(input) {
	var parts = input.split('/');
    // Note: months are 0-based
    return new Date(parts[2], parts[0] - 1, parts[1]);
}
app.filter("myfilter", function () {
	return function (items, search) {
		var arrayToReturn = [];
		if (items != undefined) {
			for (var i = 0; i < items.length; i++) {
				var createDate = new Date(items[i].createdAt);

				var tyepsrch = (typeof typesearch === "undefined")

				if(tyepsrch === "true"){
					if (typesearch._id != undefined && search._id != "") {
						if (items[i]._id == search._id) {
							arrayToReturn.push(items[i]);
						}
					}
				}
				else{
					if (search._id != "") {
						if (items[i]._id == search._id) {
							arrayToReturn.push(items[i]);
						}
					}
				}


				if (search.dateFrom != undefined && search.dateFrom != "" && search.dateTo != "" && search.dateTo != undefined) {
					var startDate = parseDate(search.dateFrom);
					var endDate = parseDate(search.dateTo);
					if (createDate >= startDate && createDate <= endDate) {
						arrayToReturn.push(items[i]);
					}
				}
				if (search.dateFrom == undefined && search.dateTo == undefined && search._id == undefined) {
					arrayToReturn.push(items[i]);
				}
			}
		}
		return arrayToReturn;
	};

});



//FileUpload service
app.factory('fileupload', ['$http', 'auth', function ($http, auth) {
	var o = {};
	o.upload = function (file) {
		return $http.post('/upload/photo', file, {
			headers: {
				Authorization: 'Bearer ' + auth.getToken(),
				'Content-Type': 'multipart/form-data'
			}
		}).success(function (data) {
			return data
		});
	};

	return o;
}]);

app.factory('methods', ['$http', 'auth', function ($http, auth) {
	var o = {
		chats: []
	};
	o.get = function () {
		return $http.get('/admin/methods/').success(function (data) {
			return data;
		});
	};
	o.create = function (method) {
		return $http.post('/admin/methods', method, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function (data) {
			return data;
		});
	};
	o.update = function (method) {
		return $http.put('/admin/methods', method, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function (data) {
			return data;
		});
	};

	return o;
}]);

app.factory('methodsGallo', ['$http', 'auth', function ($http, auth) {
	var o = {
		chats: []
	};
	o.get = function () {
		return $http.get('/admin/methodsGallo/').success(function (data) {
			return data;
		});
	};
	o.create = function (method) {
		return $http.post('/admin/methodsGallo', method, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function (data) {
			return data;
		});
	};
	o.update = function (method) {
		return $http.put('/admin/methodsGallo', method, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function (data) {
			return data;
		});
	};

	return o;
}]);

app.factory('Excel', function ($window) {
	var uri = 'data:application/vnd.ms-excel;base64,',
	template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
	base64 = function (s) { return $window.btoa(unescape(encodeURIComponent(s))); },
	format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
	return {
		tableToExcel: function (tableId, worksheetName) {
			var table = $(tableId),
			ctx = { worksheet: worksheetName, table: table.html() },
			href = uri + base64(format(template, ctx));
			return href;
		}
	};
})

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function ($stateProvider, $urlRouterProvider) {

		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				} else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista' && curUserRole != 'Tecnico') {

					window.location.href = '/';

				}
			}]
		})
		.state('login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				if (auth.isLoggedIn()) {
					var curUserRole = auth.currentUserRole();
					if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista' && curUserRole != 'Tecnico') {
						window.location.href = '/';
					}
					else {
						$state.go('home');
					}
				}
			}]
		})
		.state('register', {
			url: '/register',
			templateUrl: '/register.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				if (auth.isLoggedIn()) {
					var curUserRole = auth.currentUserRole();
					if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
						window.location.href = '/';
					}
					else {
						$state.go('home');
					}
				}
			}]
		})
		.state('messenger', {
			url: '/messenger',
			templateUrl: '/messenger.html',
			controller: 'MessengerCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}],
			resolve: {
				chatPromise: ['chats', function (chats) {
					return chats.getAll();
				}]
			}
		})
		.state('adaptacion', {
			url: '/adaptacion',
			templateUrl: '/adaptacion.html',
			controller: 'AdaptacionCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}]
		})
		.state('adaptacionGallo', {
			url: '/adaptacionGallo',
			templateUrl: '/adaptacionGallo.html',
			controller: 'AdaptacionGalloCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}]
		})
		.state('users', {
			url: '/users',
			templateUrl: '/users.html',
			controller: 'UsersCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin') {
					window.location.href = '/';
				}
			}]
		})
		.state('noticias', {
			url: '/noticias',
			templateUrl: '/noticias.html',
			controller: 'NewsCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}],
			resolve: {
				postPromise: ['posts', function (posts) {
					return posts.getAll();
				}]
			}
		})
		.state('roya', {
			url: '/roya',
			templateUrl: '/roya2.html',
			controller: 'RoyaCtrl2',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}]
		})
		.state('unidad', {
			url: '/unidad/:id',
			templateUrl: '/unidad2.html',
			controller: 'UnidadCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}]
		})
		.state('vulnerabilidad', {
			url: '/vulnerabilidad',
			templateUrl: '/vulnerabilidad.html',
			controller: 'VulnerabilidadCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}]
		})
		.state('vulnerabilidad2', {
			url: '/vulnerabilidad2',
			templateUrl: '/vulnerabilidad2.html',
			controller: 'VulnerabilidadCtrl2',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}]
		})
		.state('recomendaciontecnica', {
			url: '/technical-recommendation',
			templateUrl: '/tech_recom.html',
			controller: 'TechRecCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();

				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista' && curUserRole != 'Tecnico') {
					window.location.href = '/';
				}
			}]
		})
		.state('campo', {
			url: '/campo',
			templateUrl: '/campo.html',
			controller: 'CampoCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();

				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista' && curUserRole != 'Tecnico') {
					window.location.href = '/';
				}
			}]
		})
		.state('incidenciaroya', {
			url: '/incidenciaroya',
			templateUrl: '/incidenciaroya.html',
			controller: 'IncidenciaRoyaCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();

				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista' && curUserRole != 'Tecnico') {
					window.location.href = '/';
				}
			}]
		})
		.state('reportescampo', {
			url: '/reportesdecampo',
			templateUrl: '/reportesdecampo.html',
			controller: 'CampoCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();

				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista' && curUserRole != 'Tecnico') {
					window.location.href = '/';
				}
			}]
		})
		.state('varieties', {
			url: '/varieties',
			templateUrl: '/varieties.html',
			controller: 'VarietyCtrl',
			onEnter: ['$state', 'auth', function ($state, auth) {
				var curUserRole = auth.currentUserRole();
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else if (curUserRole != 'admin' && curUserRole != 'Admin' && curUserRole != 'Extensionista') {
					window.location.href = '/';
				}
			}]
		});

		$urlRouterProvider.otherwise('home');
	}]);
