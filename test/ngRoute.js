var test = angular.module('test', [
	'ngRoute',
	'ngRoute.middleware'
]);

test.config(['$middlewareProvider', function($middlewareProvider) {

	$middlewareProvider.map({
		'test': function() {
			console.log('middleware', this);
			this.next();
		}
	});

	$middlewareProvider.global('test');
}]);

test.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/test', {
		template: '<h1>Test</h1>',
		controller: function() {
			console.log('CONTROLLER');
		}
	})
	.when('/poop', {
		template: '<h1>Poop</h1>',
		controller: function() {
			console.log('POOP');
		}
	})	
	.otherwise('/test');
}]);
