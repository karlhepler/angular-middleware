angular.module('ngRoute.middleware', []).provider('$middleware', $middleware)

.config(['$routeProvider', '$provide',
function($routeProvider, $provide) {
	// Init resolve:{} to all routes
	$provide.decorator('$route', function($delegate) {
		// Go through each route
		angular.forEach($delegate.routes, function(route) {
			// Skip all redirects
			if ( typeof route.redirectTo !== 'undefined' ) return;

			// If resolve is not yet set, set it!
			if ( typeof route.resolve === 'undefined' ) {
				route.resolve = {};
			}
		});

		// Return the delegate
		return $delegate;
	});
}])

.run(['$rootScope', '$route', '$location', '$middleware',
function($rootScope, $route, $location, $middleware) {
	/**
	 * Handle middleware
	 */
	$rootScope.$on('$routeChangeStart', function(event, next, current) {
		next.resolve.middleware = function() {
			return $middleware(next, next.params);
		};
	});

	/**
	 * Handle redirects from middleware
	 */
	$rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
		var pattern = /redirectTo\:(.*)/; 
		var match;

		// Only proceed if there is a match to the pattern
		if ((match = pattern.exec(rejection)) !== null) {
			// Prevent the route change from working normally
			event.preventDefault();

			// If the redirect route is the same, then just reload
			if ( current.regexp.test(match[1]) ) {
				return $route.reload();
			}

			// The path is new, so go there!
			$location.path(match[1]);
		}
	});
}]);
