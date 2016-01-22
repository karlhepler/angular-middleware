# KJH Middleware

Laravel-like middleware for Angular

## Installation / Setup

1. `bower install kjh-middleware --save` or `npm install kjh-middleware --save`
2. Include 'kjhMiddleware' in your main module
3. Install & import uiRouter

## Usage

1. Add the following config to your app:

		.config(['middlewareProvider', function(middlewareProvider) {
			middlewareProvider.routeMiddlware({
				'label': ['anything', function(anything) {
					// Go to next middleware
					this.next();

					// Redirect to a different state
					this.redirectTo('state-name');

					// Get the route parameters
					var params = this.params();
				}]
			});
		})

2. Reference the middleware in your routes, either as a string separated by pipes OR an array

		$stateProvider
			.state('state1', {
				...
				'middleware': 'middleware1|middleware2|middleware3' OR ['middleware1', 'middleware2', 'middleware3']
			})

## TODO

* Make this compatible with ngRouter