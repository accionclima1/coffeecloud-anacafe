//NewsCtrl editor controller
app.controller('NewsCtrl', [
	'$scope',
	'auth',
	'$location',
	'user',
	'posts',
	function ($scope, auth, $location, user, posts) {
	    $scope.isLoggedIn = auth.isLoggedIn;
	    $scope.currentUser = auth.currentUser;
	    $scope.tinymceOptions = {
	        plugins: 'link image code',
	        toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code | image'
	    };
	    $scope.newPost = {
	        title: "",
	        content: ""
	    };
	    $scope.posts = posts.posts;
	    console.log(posts.posts);
	    $scope.publish = function () {
	        posts.create($scope.newPost)
	        $scope.newPost = {
	            title: "",
	            content: ""
	        };
	    }
	    $scope.editPost = function (post) {
	        $scope.message = null;
	        $scope.error = null;
	        $scope.editPostO = post;
	        $('#myModalPostEdit').modal('show');
	    }

	    $scope.savePost = function () {
	        $scope.message = null;
	        $scope.error = null;
	        posts.update($scope.editPostO).error(function (error) {
	            $scope.error = error;
	        }).then(function (data) {
	            $scope.message = data.data.message;
	        });
	    }

	}]);
