angular.module('kjhMiddleware', [])

.config([
'$stateProvider',
function($stateProvider) {
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

.run([
'$rootScope', '$state', 'middleware',
function($rootScope, $state, middleware) {

	/**
	 * Handle middleware
	 */
	$rootScope.$on('$stateChangeStart',
	function(event, toState, toParams, fromState, fromParams) {

		// Force the state to resolve the middleware before loading
		toState.resolve.middleware = function() {
			return middleware._handle(toState, toParams);
		};

	});

	/**
	 * Handle redirects from middleware
	 */
	$rootScope.$on('$stateChangeError',
	function(event, toState, toParams, fromState, fromParams, error) {

		var re = /redirectTo\:(.*)/; 
		var m;

		if ((m = re.exec(error)) !== null) {
		    if (m.index === re.lastIndex) {
		        re.lastIndex++;
		    }
		    
		    event.preventDefault();
		    
		    // Redirect, allowing reloading and preventing url param inheritance
		    return $state.transitionTo(m[1], null, { location: true, inherit: false, relative: $state.$current, notify: true, reload: true });
		}

	});

}])

.provider('middleware',
function middlewareProvider() {

	var map = {};
	var bypass = false;

	/**
	 * Bypass all middleware
	 * 
	 * @param  {boolean} shouldBypass
	 * @return {void}
	 */
	this.bypassAll = function(shouldBypass) {
		bypass = shouldBypass;
	};

	/**
	 * Map the route middleware
	 * 
	 * @param  {object} middlewareMap
	 * @return {void}
	 */
	this.routeMiddleware = function(middlewareMap) {
		map = middlewareMap;
	};

	this.$get = [
	'$injector', '$q',
	function middlewareFactory($injector, $q) {

		var Middleware = function(bypass, map, $injector, $q) {

			var request = this;
			var nextIndex;
			var middlewareNames;
			var deferred;
			var params;

			/**
			 * Check the next middleware
			 * 
			 * @param  {object}   deferred
			 * @return {promise}
			 */
			this.next = function() {
				// If this is the last, then resolve it
				if ( nextIndex == middlewareNames.length )
					deferred.resolve();

				// Check the next middleware
				checkNextMiddleware();
			};

			/**
			 * Initiate a redirect to another state
			 * 
			 * @param  {string} stateName
			 * @return {string}
			 */
			this.redirectTo = function(stateName) {
				// Reject the deferred promise with redirect text
				deferred.reject('redirectTo:' + stateName);
			};

			/**
			 * Get the params
			 * 
			 * @return {object}
			 */
			this.params = function() {
				return params;
			};

			/**
			 * Handle the middleware
			 * 
			 * @param  {object} toState
			 * @param  {mixed}  toParams
			 */
			this._handle = function(toState, toParams) {

				// Grab the params
				params = angular.copy(toParams);

				// Return early if no middleware
				if ( noMiddleware(toState) ) return;

				// Set nextIndex to 0
				nextIndex = 0;

				// Set the middleware names
				setMiddlewareNames(toState);
				
				// Get the deferred promise
				deferred = $q.defer();

				// Just resolve the deferred if bypass
				if ( bypass ) deferred.resolve();
				
				// Otherwise, check the first middleware
				else checkNextMiddleware();

				// Return the promise
				return deferred.promise;
			};

			/////////////////////
			// PRIVATE METHODS //
			/////////////////////

			/**
			 * Determine if there is no middleware
			 * 
			 * @param  {object} toState
			 * @return {boolean}
			 */
			function noMiddleware(toState) {
				return !toState.middleware;
			}

			/**
			 * Get the middleware names from toState
			 * 
			 * @return {array}
			 */
			function setMiddlewareNames(toState) {
				// Middleware can be defined by string w/ pipes or an array
				middlewareNames = toState.middleware instanceof Array ? toState.middleware : toState.middleware.split('|');
			}

			/**
			 * Call the middleware's check function
			 */
			function checkNextMiddleware() {
				// Get the next middleware
				var middleware = getNextMiddleware();

				// If there is a middleware, invoke it
				if ( middleware ) $injector.invoke(middleware, request);
			}

			/**
			 * Get the next middleware
			 */
			function getNextMiddleware(index) {
				return map[middlewareNames[nextIndex++]];
			}
		};

		// Return a new Middleware,
		// passing in the map & injector
		return new Middleware(bypass, map, $injector, $q);
	}];

});
