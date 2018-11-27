MatchRoute
==========

> Handles wildcard route matching against urls with !num and !slug condition testing.



## Installation
```shell
npm install properjs-matchroute --save-dev
```


## Usage
```javascript
var MatchRoute = require( "properjs-matchroute" ),
    matchroute = new MatchRoute([
        // Known route
        "some/route",
        
        // Unknown route
        "another/:slug",
        
        // Unknown route, enforce Number on last uri
        "also/:slug/:num!num"
    ]);

// Test url against routes
matchroute.test( url );

// Compare a route against a url
matchroute.compare( route, url );

// Parse a url against routes config
matchroute.parse( url, routes );

// Get params property from .parse()
matchroute.params( url );

// Set routes config
matchroute.config( routes );

// Wildcard any route that is non-external to your domain
var matchroute = new MatchRoute( ["*"] );
```
