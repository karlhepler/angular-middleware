# Angular Middleware

> Laravel-like middleware for ngRoute & ui.router



## Installation

1. Get it on your computer
	* Bower `bower install --save angular-middleware`
	* NPM `npm install --save angular-middleware`
	* GitHub `git clone https://github.com/oldtimeguitarguy/angular-middleware`

2. Include `angular-middleware.min.js` in your app, whichever way you choose

3. Include the module that works for you:
	* `ui.router.middleware`
	* `ngRoute.middleware`



## Configuration & Examples

> [ngRoute Example on Plnkr](https://plnkr.co/edit/wRiXSWG66h4DEh4nyysm?p=preview)

> [ui.router Example on Plnkr](https://plnkr.co/edit/tgUkr276hnTiVarrbh1d?p=preview)

```javascript
// An app with ui.router...
var app = angular.module('app', [
	'ui.router',
	'ui.router.middleware'
]);

// An app with ngRoute...
var app = angular.module('app', [
	'ngRoute',
	'ngRoute.middleware'
]);

/////////////////////////////////////////////////////////
// Either way you go, the rest is essentially the same //
/////////////////////////////////////////////////////////

/**
 * First, you need to map your middleware functions.
 * This can be done cleanly with separate files
 * for each middleware function. You can do that
 * a number of different ways. I'll just show you
 * the basics.
 */
app.config(['$middlewareProvider',
function($middlewareProvider)] {

	// If you want middleware,
	// then you need to map some middleware
	// functions to names that you can
	// reference in your routes
	$middlewareProvider.map({

		/** Don't allow anyone through */
		'nobody': function nobodyMiddleware() {
			//
		},

		/** Let everyone through */
		'everyone': function everyoneMiddleware() {
			// In order to resolve the middleware,
			// you MUST call this.next()
			this.next();
		},

		/** Redirect everyone */
		'redirect-all': function redirectAllMiddleware() {
			// If you are using ui.router,
			// then you must choose a state name
			this.redirectTo('another-state-name');

			// If you are using ngRoute,
			// then you must actually put in
			// the new url that you would use in
			// $location.path()
			this.redirectTo('/another-path');

			// An object of parameters can also
			// be provided which will be used to
			// populate the url query parameters
			// ex. /another-path?redirectFrom=current-path
			this.redirectTo('/another-path', {
				redirectFrom: 'current-path'
			});

			// If you are using ui.router,
			// you can also change transitionTo options
			this.redirectTo('another-state-name', null, { reload: false });
		},

		/** Continue, but log the parameters */
		'log': ['$log', function logMiddleware($log) {
			// Notice that we used dependency injection to get $log.
			// You have access to the route parameters with this.params
			$log.debug(this.params);

			// Keep on truckin'
			this.next();
		}],

		/** It will wait for async requests too! */
		'async-auth': ['$http', function asyncAuth($http) {
			// We'll need access to "this" in a deeper context
			var request = this;

			// Grab something from the server
			$http.get('/verify')

			// The server has responded!
			.then(function success(res) {
				if ( res.isVerified ) {
					return request.next();
				}

				request.redirectTo('another-state-or-path');
			},

			function fail(err) {
				request.redirectTo('another-state-or-path');
			});
		}]

	});

});

/**
 * Now you're ready to use your middleware!
 * All you have to do is put them in your routes.
 * Each middleware is processed in the order you list them.
 *
 * The principle is the same for ui.router and ngRoute.
 * I'll show you both to make sure the dead horse is sufficiently beaten.
 */

 /** ui.router */
 app.config(['$stateProvider', function($stateProvider) {
 	$stateProvider

 	// You can have just one middleware,
 	// represented by a string
 	.state('my-state-name', {
 		...
 		middleware: 'a-single-middleware'
 	})

 	// You can have multiple middleware
 	// separated by pipes. aka. |
 	.state('another-state-name', {
 		...
 		middleware: 'one-middleware|another-middleware'
 	})

 	// You can have multiple middleware as an array
 	.state('a-third-state-name', {
 		...
 		middleware: ['one-middleware', 'another-middleware', 'another-nother-middleware']
 	})
 }]);

 /** ngRoute */
 app.config(['$routeProvider', function($routeProvider) {
 	$routeProvider

 	// You can have just one middleware,
 	// represented by a string
 	.when('/my-path', {
 		...
 		middleware: 'a-single-middleware'
 	})

 	// You can have multiple middleware
 	// separated by pipes. aka. |
 	.when('/my-other-path', {
 		...
 		middleware: 'one-middleware|another-middleware'
 	})

 	// You can have multiple middleware as an array
 	.when('/my-third-path', {
 		...
 		middleware: ['one-middleware', 'another-middleware', 'another-nother-middleware']
 	})
 }]);

```


## $middlewareProvider

* `$middlewareProvider.map(<object>)` This is how you define and name your middleware.

* `$middlewareProvider.bypassAll(<boolean>)` This gives you a way to easily bypass all middleware... as if it didn't exist!

* `$middlewareProvider.global(<string|array>)` If you want to apply some middleware to **all** routes, you can easily do it here. The same rules apply to setting up middleware on routes, ie. you can use a string, a string with pipes, or an array of middleware names. **NOTE:** Anything defined here will be called **before** the route middleware is called.


## Things you can do inside your middleware functions
> If you don't know what I'm talking about, look at the example above

* `this.next()` **must be called** to resolve the middleware and either go to the next middleware or resolve the route

* `this.redirectTo(dest [,params [,options]])` can be called to immediately redirect
	* **dest** (required): A path _(ngRoute)_ or state name _(ui.router)_ to redirect to
	* **params** (optional): A params object to be used to populate query parameters _(ngRoute)_ or `$stateParams` _(ui.router)_
	* **options** (optional): An object of  [transitionTo](https://github.com/angular-ui/ui-router/wiki/Quick-Reference#statetransitiontoto-toparams--options) options (only used with ui.router)

* `this.route` is the destination route path

* `this.params` is an object that contains the current route parameters
