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
