Router
======

> Handles basic, asynchronous GET routing for the client-side.



## Installation
```shell
npm install properjs-router --save-dev
```


## Usage
```javascript
// Router takes options for PushState
var Router = require( "properjs-router" ),
    router = new Router({
        // Defaults:

        // Use XHR
        async: true,

        // Keeps response caches for requests
        caching: true,

        // Handle 404s and 500s
        handle404: true,
        handle500: true,

        // Run Router as a proxy
        proxy: {
            domain: "http://your.proxy.domain"
        },

        // Pass options to PushState
        // @see: https://github.com/ProperJS/PushState
        pushStateOptions: {}
    });

// Bind router to page
router.bind();

// Some routes to match, same style as MatchRoute
var routes = [
    // Known route
    "some/route",

    // Unknown route
    "another/:slug",

    // Unknown route, enforce Number on last uri
    "also/:slug/:num!num"
];

// If you want to wildcard your whole site, pretty useful
var routes = ["*"]

// Apply the GET listener to routes
for ( var i = routes.length; i--; ) {
    router.get( routes[ i ], [onRouterGETHandler] );
}

// Bind to preget events
router.on( "preget", [onPreGETRequest] );

// Bind to popget events
router.on( "popget", [onPopGETRequest] );
```


### Files
Router will ignore links deemed to be `files`.


### Event metaKey
Router will honor the metaKey property on matched nodes allowing `Command+click`.


### Ignore Links
You can optionally add a `js-router--ignore` className to any link and Router will not pick it up.
