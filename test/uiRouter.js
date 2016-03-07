var test = angular.module('test', [
	'ui.router',
	'ui.router.middleware'
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
				this.redirectTo('poop');
			}.bind(this), 1000);
		}
	});

	$middlewareProvider.global('globalMiddleware');
}]);

test.config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
	$stateProvider
	
	.state('test', {
		url: '/test',
		template: '<h1>TEST</h1>',
		controller: function() {
			console.log('Test');
		},
		middleware: 'routeMiddleware'
	})
	
	.state('poop', {
		url: '/poop',
		template: '<h1>POOP</h1>',
		controller: function() {
			console.log('Poop');
		}
	});

	$urlRouterProvider.otherwise('/test');
}]);
