var $middleware = function middlewareProvider() {
	/**
	 * Create custom middleware mappings
	 *
	 * @param {object} customMappings
	 * @return {void}
	 */
	this.map = function map(customMappings) {
		// Make sure customMappings is an object
		if ( typeof customMappings !== 'object' ) {
			throw 'Your middleware map must be an object!';
		}

		// Set the mappings
		_mappings = customMappings;
	};

	/**
	 * Determine if we want to bypass all middleware.
	 * This is good for debugging.
	 *
	 * @param {boolean} enableBypass
	 * @return {void}
	 */
	this.bypassAll = function bypassAll(enableBypass) {
		// Make sure enableBypass is boolean
		if ( typeof enableBypass !== 'boolean' ) {
			throw 'You must provide bypassAll with a boolean value!';
		}

		// Set it!
		_bypassAll = enableBypass;
	};

	this.global = function global(customGlobalMiddleware) {
		// Make sure it's a string or an array
		if ( typeof customGlobalMiddleware !== 'string' && !angular.isArray(customGlobalMiddleware) ) {
			throw 'You must provide a string, a string separated by pipes, or an array of middleware names';
		}

		// Set it... and don't forget it.
		_globalMiddleware.middleware = customGlobalMiddleware;
	};

	/** This is the provider's entry point */
	this.$get = $middlewareFactory;
};
