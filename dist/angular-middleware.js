;(function(angular) {
"use strict";

// This has to be declared here
// because this is concatinated
// BEFORE the provider, which defines it
var mappings = {};

var $middlewareFactory = [
'$injector', '$q',
function middlewareFactory($injector, $q) {
	
	/**
	 * This object is used to group
	 * private middleware properties
	 * that are used throughout this
	 */
	var middleware = {
		next: nextMiddleware
	};

	/**
	 * This object is passed
	 * to the invoked middleware
	 * and is used as the main API
	 */
	var request = {
		next: nextRequest,
		redirectTo: redirectTo
	};

	/**
	 * Initialize $middleware
	 *
	 * @param {object} toRoute
	 * @param {mixed} toParams
	 * @returns {promise}
	 */
	return function initialize(toRoute, toParams) {
		// Return early if the toRoute doesn't have middleware
		if ( !hasMiddleware(toRoute) ) return;

		// Store a copy of the route parameters in the request
		request.params = angular.copy(toParams);

		// Set the middleware index to 0
		middleware.index = 0;

		// Set the middleware names
		middleware.names = getMiddlewareNames(toRoute);
		
		// Create a deferred promise
		middleware.resolution = $q.defer();

		// Process the first middleware
		middleware.next();

		// Return the promise
		return middleware.resolution.promise;
	};

	/**
	 * Determine if the given route has middleware
	 *
	 * @param {object} toRoute
	 * @returns {boolean}
	 */
	function hasMiddleware(route) {
		return !!route.middleware;
	}

	/**
	 * Get the middleware names
	 * from an array or a piped string
	 *
	 * @param {object} route
	 * @returns {array}
	 */
	function getMiddlewareNames(route) {
		return route.middleware instanceof Array
			? route.middleware
			: route.middleware.split('|');
	}

	/**
	 * Attempt to invoke the next middleware
	 *
	 * @returns {void}
	 */
	function nextMiddleware() {
		// Get the next middleware
		var next = mappings[middleware.names[middleware.index++]];

		// If there is middleware, then invoke it, binding request
		if ( next ) $injector.invoke(next, request);
	}

	/**
	 * Go to the next request.
	 * If there are more middleware,
	 * then go to the next middleware.
	 * Otherwise, resolve the middleware resolution.
	 *
	 * @returns {void}
	 */
	function nextRequest() {
		// If there are no more middleware,
		// then resolve the middleware resolution
		if ( middleware.index == middleware.names.length ) {
			middleware.resolution.resolve();
		}

		// Attempt to invoke the next middleware
		middleware.next();
	}

	/**
	 * Redirect to another route
	 *
	 * @returns {void}
	 */
	function redirectTo(route) {
		middleware.resolution.reject('redirectTo:' + route);
	}
}];

var $middleware = function middlewareProvider() {
	/**
	 * Create custom middleware mappings
	 *
	 * ex:
	 *
	 * $middlewareProvider.map({
	 *		'auth': ['$log', '$http',
	 *		function redirectIfNotAuthenticated($log, $http) {
	 *			var self = this;
	 *			
	 *			// Make a get request
	 *			$http.get('/is-authenticated')
	 *
	 *			// The get request succeeded
	 *			.then(function success() {
	 *				self.next();
	 *			},
	 *
	 *			// The get request failed
	 *			function fail(err) {
	 *				$log.error(err);
	 *				self.redirectTo('/');
	 *			});
	 *		}]
	 * });
	 */
	this.map = function map(customMappings) {
		// Make sure customMappings is an object
		if ( typeof customMappings !== 'object' ) {
			throw 'Your middleware map must be an object!';
		}

		// Set the mappings
		mappings = customMappings;
	};

	// $get the middleware factory
	this.$get = $middlewareFactory;
};

angular.module('ngRoute.middleware', []).provider('$middleware', $middleware)

// @todo: implement ngRoute.middleware!

angular.module('ui.router.middleware', []).provider('$middleware', $middleware)

.config(['$stateProvider', function($stateProvider) {
	// Init resolve:{} to all states
	// https://github.com/angular-ui/ui-router/issues/1165
	$stateProvider.decorator('path', function(state, parentFn) {
		if (state.self.resolve === undefined) {
			state.self.resolve = {};
			state.resolve = state.self.resolve;
		}
		return parentFn(state);
	});
}])

.run(['$rootScope', '$state', '$middleware', function($rootScope, $state, $middleware) {
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
			return $state.transitionTo(match[1], null, { location: true, inherit: false, relative: $state.$current, notify: true, reload: true });
		}
	});
}])
}(angular));
