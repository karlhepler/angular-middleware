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
