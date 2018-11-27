/*!
 *
 * Handles basic get routing
 *
 * @Router
 * @author: kitajchuk
 *
 */
(function ( factory ) {

    if ( typeof exports === "object" && typeof module !== "undefined" ) {
        module.exports = factory();

    } else if ( typeof window !== "undefined" ) {
        window.Router = factory();
    }

})(function () {

    var PushState = require( "properjs-pushstate" ),
        MatchRoute = require( "properjs-matchroute" ),
        matchElement = require( "properjs-matchelement" ),
        _initDelay = 200,
        _triggerEl,
        _activeEl;


    /**
     *
     * A simple router Class
     * @constructor Router
     * @requires PushState
     * @requires MatchRoute
     * @requires matchElement
     * @memberof! <global>
     *
     */
    var Router = function () {
        return this.init.apply( this, arguments );
    };

    Router.prototype = {
        constructor: Router,

        /**
         *
         * Expression match http/https
         * @memberof Router
         * @member _rHTTPs
         * @private
         *
         */
        _rHTTPs: /^http[s]?:\/\/.*?\//,

        /**
         *
         * Expression match common file types...
         * @memberof Router
         * @member _rFiles
         * @private
         *
         */
        _rFiles: /\.(jpg|jpeg|png|gif|pdf|csv|txt|md|doc|docx|xls|xlsx|webm|mp4|mp3)$/gi,

        /**
         *
         * Expression match this documents domain
         * @memberof Router
         * @member _rDomain
         * @private
         *
         */
        _rDomain: new RegExp( document.domain ),

        /**
         *
         * Flag routing state
         * @memberof Router
         * @member _isRouting
         * @private
         *
         */
        _isRouting: false,

        /**
         *
         * Router init constructor method
         * @memberof Router
         * @method init
         * @param {object} options Settings for PushState
         * <ul>
         * <li>options.caching</li>
         * <li>options.proxy</li>
         * <li>options.proxy.domain</li>
         * <li>options.handle404</li>
         * <li>options.handle500</li>
         * <li>options.pushStateOptions</li>
         * </ul>
         *
         * @fires preget
         * @fires popget
         * @fires get
         *
         */
        init: function ( options ) {
            /**
             *
             * Router Store user options
             * @memberof Router
             * @member _options
             * @private
             *
             */
            this._options = {
                async: true,
                proxy: false,
                caching: true,
                handle404: true,
                handle500: true,
                pushStateOptions: {}
            };

            // Normalize usage options passed in
            options = (options || {});

            // Merge usage options with defaults
            for ( var i in options ) {
                this._options[ i ] = options[ i ];
            }

            /**
             *
             * Internal MatchRoute instance
             * @memberof Router
             * @member _matcher
             * @private
             *
             */
            this._matcher = new MatchRoute();

            /**
             *
             * Internal PushState instance
             * @memberof Router
             * @member _pusher
             * @private
             *
             */
            this._pusher = new PushState( this._options.pushStateOptions );

            /**
             *
             * Event handling callbacks
             * @memberof Router
             * @member _callbacks
             * @private
             *
             */
            this._callbacks = {};

            /**
             *
             * Stored XHR responses
             * @memberof Router
             * @member _responses
             * @private
             *
             */
            this._responses = {};

            /**
             *
             * Router unique ID
             * @memberof Router
             * @member _uid
             * @private
             *
             */
            this._uid = 0;

            /**
             *
             * Router is READY status ?
             * @memberof Router
             * @member _ready
             * @private
             *
             */
            this._ready = false;
        },

        /**
         *
         * Create PushState instance and add event listener
         * @memberof Router
         * @method bind
         *
         */
        bind: function () {
            var self = this,
                // Ensure this first cache URL is clean as a whistle
                url = window.location.href.replace( window.location.hash, "" );

            // Bind GET requests to links
            document.addEventListener( "click", function ( e ) {
                self._handleClick( this, e );

            }, false );

            // Bind popstate event for history
            this._pusher.on( "popstate", function ( url, state ) {
                self._handlePopstate( url, state );
            });

            // Fire first route
            // Async this in order to allow .get() to work after instantiation
            if ( this._options.async && this._options.handle404 ) {
                this._route( url, function ( response, status ) {
                    self._ready = true;
                });

            // Shim a little and bypass true XHR here if not handling 404s
            } else {
                setTimeout(function () {
                    // https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer
                    var doc = new XMLSerializer().serializeToString( document );
                    var xhr = {
                        status: 200,
                        responseText: doc
                    };

                    self._fire( "get", url, xhr, xhr.status );
                    self._cache( url, xhr );
                    self._ready = true;

                }, _initDelay );
            }
        },

        /**
         *
         * Add an event listener
         * Binding "beforeget" and "afterget" wraps the XHR request
         * @memberof Router
         * @method on
         * @param {string} event The event to bind to
         * @param {function} callback The function to call
         *
         */
        on: function ( event, callback ) {
            this._bind( event, callback );
        },

        /**
         *
         * Remove an event listener
         * @memberof Router
         * @method off
         * @param {string} event The event to unbind
         * @param {function} callback The function to reference
         *
         */
        off: function ( event, callback ) {
            this._unbind( event, callback );
        },

        /**
         *
         * Support router triggers by url
         * @memberof Router
         * @method trigger
         * @param {string} url The url to route to
         *
         */
        trigger: function ( url ) {
            if ( !_triggerEl ) {
                _triggerEl = document.createElement( "a" );
            }

            _triggerEl.href = url;

            this._handleClick( _triggerEl, {
                target: _triggerEl
            });
        },

        /**
         *
         * Bind a GET request route
         * @memberof Router
         * @method get
         * @param {string} route route to match
         * @param {function} callback function to call when route is requested
         *
         */
        get: function ( route, callback ) {
            // Add route to matcher
            this._matcher.config( [route] );

            // Bind the route to the callback
            if ( callback._routerRoutes ) {
                callback._routerRoutes.push( route );

            } else {
                callback._routerRoutes = [route];
            }

            // When binding multiple routes to a single
            // callback, we need to make sure the callbacks
            // routes array is updated above but the callback
            // only gets added to the list once.
            if ( callback._routerRoutes.length === 1 ) {
                this._bind( "get", callback );
            }
        },

        getActiveEl: function () {
            return _activeEl;
        },

        /**
         *
         * Get a sanitized route for a url
         * @memberof Router
         * @method getRouteForUrl
         * @param {string} url The url to use
         * @returns {string}
         *
         */
        getRouteForUrl: function ( url ) {
            return this._matcher._cleanRoute( url );
        },

        /**
         *
         * Get the match data for a url against the routes config
         * @memberof Router
         * @method getRouteDataForUrl
         * @param {string} url The url to use
         * @returns {object}
         *
         */
        getRouteDataForUrl: function ( url ) {
            return this._matcher.parse( url, this._matcher.getRoutes() ).params;
        },

        /**
         *
         * Get a unique ID
         * @memberof Router
         * @method getUID
         * @returns number
         *
         */
        getUID: function () {
            this._uid = (this._uid + 1);

            return this._uid;
        },

        /**
         * Compatible event preventDefault
         * @memberof Router
         * @method _preventDefault
         * @param {object} e The event object
         * @private
         *
         */
        _preventDefault: function ( e ) {
            if ( e.preventDefault ) {
                e.preventDefault();

            } else {
                e.returnValue = false;
            }
        },

        /**
         * GET click event handler
         * @memberof Router
         * @method _handleClick
         * @param {object} el The event context element
         * @param {object} e The event object
         * @private
         *
         * @fires get
         *
         */
        _handleClick: function ( el, e ) {
            var elem = (matchElement( el, "a", true ) || matchElement( e.target, "a", true )),
                isMatched = elem && this._matcher.test( elem.href ),
                isDomain = elem && this._rDomain.test( elem.href ),
                isProxy = elem && this._options.proxy && this._options.proxy.domain,
                isHashed = elem && elem.href.indexOf( "#" ) !== -1,
                isIgnore = elem && elem.className.indexOf( "js-router--ignore" ) !== -1,
                isMetaKey = elem && e.metaKey,
                isBlank = elem && elem.target === "_blank",
                isFile = elem && isDomain && elem.href.match( this._rFiles );

            // 0.1 => Ensure url passes MatchRoute config
            // 0.2 => Ensure url is on the Document's Domain
            // 0.X => Allow proxy domain's to go through this checkpoint
            if ( (isMatched && isDomain) || isProxy ) {
                // 0.3 => Ensure url is not a #hash
                // 0.4 => Ensure the element does not contain a `js-router--ignore` className
                // 0.5 => Ensure the Event.metaKey is not TRUE - Command+click
                // 0.6 => Ensure the element target is not for a new tab
                // 0.7 => Ensure url is not a file link on the same document domain
                if ( !isHashed && !isIgnore && !isMetaKey && !isBlank && !isFile ) {
                    _activeEl = elem;

                    this._preventDefault( e );

                    if ( !this._isRouting ) {
                        this._route( elem.href );
                    }
                }
            }
        },

        /**
         * Handle history popstate event from PushState
         * @memberof Router
         * @method _handlePopstate
         * @param {string} url The url popped to
         * @param {object} state The PushState state object
         * @private
         *
         * @fires get
         *
         */
        _handlePopstate: function ( url, state ) {
            // Hook around browsers firing popstate on pageload
            if ( this._ready ) {
                for ( var i = this._callbacks.get.length; i--; ) {
                    var dat = this._matcher.parse( url, this._callbacks.get[ i ]._routerRoutes );

                    if ( dat.matched ) {
                        break;
                    }
                }

                data = {
                    route: this._matcher._cleanRoute( url ),
                    response: this._responses[ url ],
                    request: dat,
                    status: this._responses[ url ].status
                };

                this._fire( "popget", url, data );

            } else {
                this._ready = true;
            }
        },

        /**
         * Execute the route
         * @memberof Router
         * @method _route
         * @param {string} url The url in question
         * @param {function} callback Optional, fired with done
         * @private
         *
         */
        _route: function ( url, callback ) {
            var self = this,
                urls = {
                    // For XHR
                    request: url,

                    // For pushState and Cache
                    original: url
                };

            this._isRouting = true;

            this._matchUrl( urls.original );

            // Handle proxy first since we modify the request URL
            // Basically, just piece together a URL that swaps this domain with proxy domain
            if ( this._options.proxy && this._options.proxy.domain ) {
                // Use window.location.host so it includes port for localhost
                urls.request = (this._options.proxy.domain + "/" + urls.request.replace( this._rHTTPs, "" ));
            }

            this._getUrl( urls, function ( response, status ) {
                self._isRouting = false;

                // Push the URL to window History
                self._pusher.push( urls.original );

                // Fire event for routing
                self._fire( "get", urls.original, response, status );

                if ( typeof callback === "function" ) {
                    callback( response, status );
                }
            });
        },

        /**
         * Match a URL and fire "preget"
         * @memberof Router
         * @method _matchUrl
         * @param {string} url The url in question
         * @private
         *
         */
        _matchUrl: function ( url ) {
            if ( !this._ready ) {
                return;
            }

            for ( var i = this._callbacks.get.length; i--; ) {
                var data = this._matcher.parse( url, this._callbacks.get[ i ]._routerRoutes );

                if ( data.matched ) {
                    this._fire( "preget", url, data );
                    break;
                }
            }
        },

        /**
         *
         * Request a url with an XMLHttpRequest
         * @memberof Router
         * @method _getUrl
         * @param {object} urls The urls to request / push / cache
         * @param {function} callback The function to call when done
         * @private
         *
         */
        _getUrl: function ( urls, callback ) {
            var handler = function ( res, stat ) {
                    try {
                        // Cache if option enabled
                        self._cache( urls.original, res );

                        if ( typeof callback === "function" ) {
                            callback( res, stat );
                        }

                    } catch ( error ) {}
                },
                xhr = null,
                self = this;

            // Cached response ?
            if ( this._responses[ urls.original ] ) {
                handler( this._responses[ urls.original ], this._responses[ urls.original ].status );

            // Fresh request ?
            } else if ( this._options.async ) {
                xhr = new XMLHttpRequest();

                xhr.open( "GET", urls.request, true );

                xhr.onreadystatechange = function ( e ) {
                    if ( this.readyState === 4 ) {
                        if ( this.status === 200 ) {
                            handler( this, 200 );

                        } else if ( this.status === 404 && self._options.handle404 ) {
                            handler( this, 404 );

                        } else if ( this.status === 500 && self._options.handle500 ) {
                            handler( this, 500 );
                        }
                    }
                };

                xhr.send();

            } else {
                handler( { responseText: "" }, 200 );
            }
        },

        /**
         *
         * Cache an XHR response object
         * @memberof Router
         * @method _cache
         * @param {string} url The url to cache for
         * @param {object} res The XHR object
         * @private
         *
         */
        _cache: function ( url, res ) {
            // Caching is enabled, Not currently cached yet
            if ( this._options.caching && !this._responses[ url ] ) {
                this._responses[ url ] = res;
            }
        },

        /**
         *
         * Bind an event to a callback
         * @memberof Router
         * @method _bind
         * @param {string} event what to bind on
         * @param {function} callback fired on event
         * @private
         *
         */
        _bind: function ( event, callback ) {
            if ( typeof callback === "function" ) {
                if ( !this._callbacks[ event ] ) {
                    this._callbacks[ event ] = [];
                }

                callback._jsRouterID = this.getUID();

                this._callbacks[ event ].push( callback );
            }
        },

        /**
         *
         * Unbind an event to a callback(s)
         * @memberof Router
         * @method _bind
         * @param {string} event what to bind on
         * @param {function} callback fired on event
         * @private
         *
         */
        _unbind: function ( event, callback ) {
            if ( !this._callbacks[ event ] ) {
                return this;
            }

            // Remove a single callback
            if ( callback ) {
                for ( var i = 0, len = this._callbacks[ event ].length; i < len; i++ ) {
                    if ( callback._jsRouterID === this._callbacks[ event ][ i ]._jsRouterID ) {
                        this._callbacks[ event ].splice( i, 1 );

                        break;
                    }
                }

            // Remove all callbacks for event
            } else {
                for ( var j = this._callbacks[ event ].length; j--; ) {
                    this._callbacks[ event ][ j ] = null;
                }

                delete this._callbacks[ event ];
            }
        },

        /**
         *
         * Fire an event to a callback
         * @memberof Router
         * @method _fire
         * @param {string} event what to bind on
         * @param {string} url fired on event
         * @param {string} response html from responseText
         * @param {number} status The request status
         * @private
         *
         */
        _fire: function ( event, url, response, status ) {
            var i;

            // GET events have routes and are special ;-P
            if ( event === "get" ) {
                for ( i = this._callbacks[ event ].length; i--; ) {
                    var data = this._matcher.parse( url, this._callbacks[ event ][ i ]._routerRoutes );

                    if ( data.matched ) {
                        this._callbacks[ event ][ i ].call( this, {
                            route: this._matcher._cleanRoute( url ),
                            response: response,
                            request: data,
                            status: status
                        });
                    }
                }

            // Fires basic timing events "preget", "popget"
            } else if ( this._callbacks[ event ] ) {
                for ( i = this._callbacks[ event ].length; i--; ) {
                    this._callbacks[ event ][ i ].call( this, response );
                }
            }
        }
    };


    return Router;

});
