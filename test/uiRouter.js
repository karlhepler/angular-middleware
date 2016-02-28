var test = angular.module('test', [
	'ui.router',
	'ui.router.middleware'
]);

test.config(['$middlewareProvider', function($middlewareProvider) {
	$middlewareProvider.map({
		'test': function() {
			console.log('middleware', this);
			this.next();
		}
	});
}]);

test.config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('test', {
		url: '/test',
		template: '<h1>TEST</h1>',
		controller: function() {
			console.log('Test');
		},
		middleware: 'test'
	});
	$urlRouterProvider.otherwise('/test');
}]);
