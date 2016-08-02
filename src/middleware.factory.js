// This has to be declared here
// because this is concatinated
// BEFORE the provider, which defines it
var _mappings = {};
var _bypassAll = false;
var _globalMiddleware = {
	middleware: []
};

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
	 * @param   {object} toRoute
	 * @param   {mixed}  toParams
	 * @returns {promise}
	 */
	return function initialize(toRoute, toParams) {
		// Return if we should bypass
		if ( shouldBypass(toRoute) ) {
			return $q.resolve();
		}

		// Store a copy of the route parameters in the request
		request.params = angular.copy(toParams);

		// Store route name in the request
		request.route = toRoute.name;

		// Set the middleware index to 0
		middleware.index = 0;

		// Set the middleware names.
		// Make sure the globals are first, then concat toRoute
		middleware.names = concatMiddlewareNames([_globalMiddleware, toRoute]);

		// Create a deferred promise
		middleware.resolution = $q.defer();

		// Process that first middleware!
		middleware.next();

		// Return the promise
		return middleware.resolution.promise;
	};

	/**
	 * Determine if we should bypass the middleware
	 *
	 * @param   {object} route
	 * @returns {boolean}
	 */
	function shouldBypass(route) {
		// If the bypassAll flag is set,
		// then we should bypass all - duh
		if ( _bypassAll ) {
			return true;
		}

		// We can only bypass at this point
		// if there is no middleware to process
		return !middlewareExists(route);
	}

	/**
	 * Determine if any middleware exists
	 *
	 * @param   {object} route
	 * @returns {boolean}
	 */
	function middlewareExists(route) {
		return hasMiddleware(_globalMiddleware)
			|| hasMiddleware(route);
	}

	/**
	 * Determine if the given route has middleware
	 *
	 * @param   {object} route
	 * @returns {boolean}
	 */
	function hasMiddleware(route) {
		var middleware = getRouteMiddleware(route);
		return !!middleware && !!middleware.length;
	}

	/**
	 * Gets the route middleware property
	 *
	 * @param   {object} route
	 * @returns {array|string}
   */
	function getRouteMiddleware(route) {
		return route.middleware
			|| ((route.data || {}).vars || {}).middleware;
	}

	/**
	 * Concat the middleware names of the given routes
	 *
	 * @param  {array} routes
	 * @return {array}
	 */
	function concatMiddlewareNames(routes) {
		var output = [];

		// Concat each route's middleware names
		for (var i = 0; i < routes.length; i++) {
			output = output.concat(
				getMiddlewareNames(routes[i])
			);
		}

		return output;
	}

	/**
	 * Get the middleware names
	 * from an array or a piped string
	 *
	 * @param   {object} route
	 * @returns {array}
	 */
	function getMiddlewareNames(route) {
		var middleware = getRouteMiddleware(route);

		// If the middleware is an array, just return it
		if ( middleware instanceof Array ) {
			return middleware;
		}

		// If there is no middleware, then return an empty array
		if ( typeof middleware === 'undefined' ) {
			return [];
		}

		// Otherwise, split the pipes & return an array
		return middleware.split('|');
	}

	/**
	 * Attempt to invoke the next middleware
	 *
	 * @returns {void}
	 */
	function nextMiddleware() {
		// Get the next middleware
		var next = _mappings[middleware.names[middleware.index++]];

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
	function redirectTo(route, params, options) {
		middleware.resolution.reject({
			type: "redirectTo",
			route: route,
			params: params,
			options: options
		});
	}
}];
