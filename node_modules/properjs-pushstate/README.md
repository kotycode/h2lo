PushState
=========

> Handles history pushstate/popstate.



## Installation

```shell
npm install properjs-pushstate --save-dev
```


## Usage
```javascript
var PushState = require( "properjs-pushstate" ),
    pushstate = new PushState({
        // Defaults:

        // Force Hash state instead ( false by default )
        forceHash: true
    });

pushstate.on( "popstate", function ( url, state ) {
    // Handle pop
    // state.uid
});

// Push state to address bar
pushstate.push( url );

// Go back in history
pushstate.goBack();

// Go forward in history
pushstate.goForward();
```
