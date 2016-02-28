angular.module('ui.router.middleware', []).provider('$middleware', $middleware)

.config(['$stateProvider',
function($stateProvider) {
	// Init resolve:{} to all states
	// https://github.com/angular-ui/ui-router/issues/1165
	$stateProvider.decorator('path', function(state, parentFn) {
		if ( typeof state.self.resolve === 'undefined' ) {
			state.self.resolve = {};
			state.resolve = state.self.resolve;
		}
		return parentFn(state);
	});
}])

.run(['$rootScope', '$state', '$middleware',
function($rootScope, $state, $middleware) {
	/**
	 * Handle middleware
	 */
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
		// Force the state to resolve the middleware before loading
		toState.resolve.middleware = function() {
			return $middleware(toState, toParams);
		};
	});

	/**
	 * Handle redirects from middleware
	 */
	$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
		var pattern = /redirectTo\:(.*)/; 
		var match;

		// Only proceed if there is a match to the pattern
		if ((match = pattern.exec(error)) !== null) {
			// Prevent state change error from working normally
			event.preventDefault();
			
			// Redirect, allowing reloading and preventing url param inheritance
			// https://github.com/angular-ui/ui-router/wiki/Quick-Reference#statetransitiontoto-toparams--options
			return $state.transitionTo(match[1], null, {
				location: true,
				inherit: false,
				relative: $state.$current,
				notify: true,
				reload: true
			});
		}
	});
}]);
