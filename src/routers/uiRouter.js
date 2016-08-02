angular.module('ui.router.middleware', []).provider('$middleware', $middleware)

.config(['$stateProvider', function configureStateProvider($stateProvider) {
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
function handleMiddleware($rootScope, $state, $middleware) {
	/**
	 * Handle middleware
	 */
	$rootScope.$on('$stateChangeStart', function stateChangeStarted(event, toState, toParams) {
		// Force the state to resolve the middleware before loading
		toState.resolve.middleware = function resolveNextMiddleware() {
			return $middleware(toState, toParams);
		};
	});

	/**
	 * Handle redirects from middleware
	 */
	$rootScope.$on('$stateChangeError', function handleMiddlewareRedirects(event, toState, toParams, fromState, fromParams, error) {
		// Only proceed if it is type redirectTo
		if (error.type === "redirectTo") {
			// Prevent state change error from working normally
			event.preventDefault();

			// Use provided transitionTo options or use default
			var options = error.options || {
				location: true,
				inherit: false,
				relative: $state.$current,
				notify: true,
				reload: true
			};

			// Redirect, allowing reloading and preventing url param inheritance
			// https://github.com/angular-ui/ui-router/wiki/Quick-Reference#statetransitiontoto-toparams--options
			return $state.transitionTo(error.route, error.params, options);
		}
	});
}]);
