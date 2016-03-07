var test = angular.module('test', [
	'ngRoute',
	'ngRoute.middleware'
]);

test.config(['$middlewareProvider', function($middlewareProvider) {

	$middlewareProvider.map({
		'globalMiddleware': function globalMiddleware() {
			console.log('globalMiddleware', this);
			this.next();
		},
		'routeMiddleware': function routeMiddleware() {
			console.log('routeMiddleware', this);
			setTimeout(function timeout() {
				this.redirectTo('/poop');
			}.bind(this), 1000);
		}
	});

	$middlewareProvider.global('globalMiddleware');
}]);

test.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	
	.when('/test', {
		template: '<h1>Test</h1>',
		controller: function() {
			console.log('CONTROLLER');
		},
		middleware: 'routeMiddleware'
	})

	.when('/poop', {
		template: '<h1>Poop</h1>',
		controller: function() {
			console.log('POOP');
		}
	})	

	.otherwise('/test');
}]);
