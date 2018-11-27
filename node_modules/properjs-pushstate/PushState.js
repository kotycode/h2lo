/*!
 *
 * Handles history pushstate/popstate with async option
 * If history is not supported, falls back to hashbang!
 *
 * @PushState
 * @author: kitajchuk
 *
 */
(function ( factory ) {

    if ( typeof exports === "object" && typeof module !== "undefined" ) {
        module.exports = factory();

    } else if ( typeof window !== "undefined" ) {
        window.PushState = factory();
    }

})(function () {

    /**
     *
     * A simple pushState Class
     * @constructor PushState
     * @memberof! <global>
     *
     */
    var PushState = function () {
        return this.init.apply( this, arguments );
    };

    PushState.prototype = {
        constructor: PushState,

        /**
         *
         * Flag whether pushState is enabled
         * @memberof PushState
         * @member _pushable
         * @private
         *
         */
        _pushable: ("history" in window && "pushState" in window.history),

        /**
         *
         * Fallback to hashchange if needed. Support:
         * <ul>
         * <li>Internet Explorer 8</li>
         * <li>Firefox 3.6</li>
         * <li>Chrome 5</li>
         * <li>Safari 5</li>
         * <li>Opera 10.6</li>
         * </ul>
         * @memberof PushState
         * @member _hashable
         * @private
         *
         */
        _hashable: ("onhashchange" in window),

        /**
         *
         * PushState init constructor method
         * @memberof PushState
         * @method PushState.init
         * @param {object} options Settings for PushState
         * <ul>
         * <li>options.forceHash</li>
         * </ul>
         *
         * @fires backstate
         * @fires forwardstate
         * @fires popstate
         *
         */
        init: function ( options ) {
            /**
             *
             * Ensure this first cache URL is clean as a whistle
             * @memberof PushState
             * @member _initUrl
             * @private
             *
             */
            this._initUrl = window.location.href.replace( window.location.hash, "" );

            /**
             *
             * User options for usage
             * @memberof PushState
             * @member _options
             * @private
             *
             */
            this._options = (options || {});

            /**
             *
             * Flag whether state is enabled
             * @memberof PushState
             * @member _enabled
             * @private
             *
             */
            this._enabled = false;

            /**
             *
             * Flag when hash is changed by PushState
             * This allows appropriate replication of popstate
             * @memberof PushState
             * @member _ishashpushed
             * @private
             *
             */
            this._ishashpushed = false;;

            /**
             *
             * Unique ID ticker
             * @memberof PushState
             * @member _uid
             * @private
             *
             */
            this._uid = 0;

            /**
             *
             * Stored state objects
             * @memberof PushState
             * @member _states
             * @private
             *
             */
            this._states = {};

            /**
             *
             * Event callbacks
             * @memberof PushState
             * @member _callbacks
             * @private
             *
             */
            this._callbacks = {};

            // Set initial state
            this._states[ this._initUrl ] = {
                uid: this.getUID()
            };

            // Enable popstate management
            this._stateEnable();
        },

        /**
         *
         * Bind a callback to an event
         * @memberof PushState
         * @method on
         * @param {string} event The event to bind to
         * @param {function} callback The function to call
         *
         */
        on: function ( event, callback ) {
            if ( typeof callback === "function" ) {
                if ( !this._callbacks[ event ] ) {
                    this._callbacks[ event ] = [];
                }

                callback._pushstateID = this.getUID();
                callback._pushstateType = event;

                this._callbacks[ event ].push( callback );
            }
        },

        /**
         *
         * Unbind a callback to an event
         * @memberof PushState
         * @method off
         * @param {string} event The event that was bound
         * @param {function} callback The function to remove
         *
         */
        off: function ( event, callback ) {
            if ( this._callbacks[ event ] ) {
                for ( var i = this._callbacks[ event ].length; i--; ) {
                    if ( this._callbacks[ event ][ i ]._pushstateID === callback._pushstateID ) {
                        this._callbacks[ event ].splice( i, 1 );
                        break;
                    }
                }
            }
        },

        /**
         *
         * Push onto the History state
         * @memberof PushState
         * @method push
         * @param {string} url address to push to history
         *
         */
        push: function ( url ) {
            // Dont push current URL
            if ( url === window.location.href ) {
                return;
            }

            this._push( url );

            this._states[ url ] = {
                uid: this.getUID()
            };
        },

        /**
         *
         * Manually go back in history state
         * @memberof PushState
         * @method goBack
         *
         * @fires backstate
         *
         */
        goBack: function () {
            window.history.back();

            this._fire( "backstate" );
        },

        /**
         *
         * Manually go forward in history state
         * @memberof PushState
         * @method goForward
         *
         * @fires forwardstate
         *
         */
        goForward: function () {
            window.history.forward();

            this._fire( "forwardstate" );
        },

        /**
         *
         * Get a unique ID
         * @memberof PushState
         * @method getUID
         * @returns number
         *
         */
        getUID: function () {
            this._uid = (this._uid + 1);

            return this._uid;
        },

        /**
         *
         * Calls window.history.pushState
         * @memberof PushState
         * @method _push
         * @param {string} url The url to push
         * @private
         *
         */
        _push: function ( url ) {
            if ( this._pushable && !this._options.forceHash ) {
                window.history.pushState( this._states[ url ], "", url );

            } else {
                // This replace ensures we get the following:
                // "/":         root
                // "/foo/bar/": uri path
                var hashUri = url.replace( window.location.origin, "" );

                // Fix for root hash uri.
                // Ensure we dont get the following:
                // "/foo/bar/#/foo/bar/"
                // Rather we would get the following:
                // "/foo/bar/#/"
                if ( hashUri === window.location.pathname ) {
                    hashUri = "/";
                }

                this._ishashpushed = true;

                window.location.hash = hashUri;
            }
        },

        /**
         *
         * Fire an events callbacks
         * @memberof PushState
         * @method _fire
         * @param {string} event The event to fire
         * @param {string} url The current url
         * @private
         *
         */
        _fire: function ( event, url ) {
            if ( this._callbacks[ event ] ) {
                for ( var i = this._callbacks[ event ].length; i--; ) {
                    this._callbacks[ event ][ i ].apply( this, [].slice.call( arguments, 1 ) );
                }
            }
        },

        /**
         *
         * Bind this instances state handler
         * @memberof PushState
         * @method _stateEnabled
         * @private
         *
         * @fires popstate
         *
         */
        _stateEnable: function () {
            if ( this._enabled ) {
                return this;
            }

            var self = this,
                handler = function () {
                    var url = window.location.href,
                        roots = ["#/", "#", ""];

                    // Ensure we clean out the hash for Router
                    // Example:
                    // Start:  http://localhost/foo/#/bar/
                    // Result: http://localhost/foo/bar/
                    if ( self._options.forceHash ) {
                        // Shave the hash from the end of the URL
                        url = url.replace( window.location.hash, "" );

                        // Shave the hash root from the end of the URL
                        url = url.replace( window.location.pathname, "" );

                        // Empty hash means we have gone back to root
                        if ( roots.indexOf( window.location.hash ) !== -1 ) {
                            // Append the hash root to the URL
                            url = (url + window.location.pathname);

                        } else {
                            // Append the applied hash pathname to the URL
                            url = (url + window.location.hash.replace( "#", "" ));
                        }
                    }

                    self._fire( "popstate", url, self._states[ url ] );
                };

            this._enabled = true;

            if ( this._pushable && !this._options.forceHash ) {
                window.addEventListener( "popstate", function ( e ) {
                    handler();

                }, false );

            } else if ( this._hashable ) {
                // For hashstate we should apply initial hash on page load
                this._push( this._initUrl );

                window.addEventListener( "hashchange", function ( e ) {
                    if ( !self._ishashpushed ) {
                        handler();

                    } else {
                        self._ishashpushed = false;
                    }

                }, false );
            }
        }
    };

    return PushState;

});