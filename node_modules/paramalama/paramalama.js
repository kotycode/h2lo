/*!
 *
 * Parse query string into object literal representation
 *
 * @compat: jQuery, Ender, Zepto
 * @author: @kitajchuk
 *
 *
 */
(function ( factory ) {
    
    if ( typeof exports === "object" && typeof module !== "undefined" ) {
        module.exports = factory();

    } else if ( typeof window !== "undefined" ) {
        window.paramalama = factory();
    }
    
})(function () {
    
    var paramalama = function ( str ) {
        var query = decodeURIComponent( str ).match( /[#|?].*$/g ),
            ret = {};
        
        if ( query ) {
            query = query[ 0 ].replace( /^\?|^#|^\/|\/$|\[|\]/g, "" );
            query = query.split( "&" );
            
            for ( var i = query.length; i--; ) {
                var pair = query[ i ].split( "=" ),
                    key = pair[ 0 ],
                    val = pair[ 1 ];
                
                if ( ret[ key ] ) {
                    // #2 https://github.com/kitajchuk/paramalama/issues/2
                    // This supposedly will work as of ECMA-262
                    // This works since we are not passing objects across frame boundaries
                    // and we are not considering Array-like objects. This WILL be an Array.
                    if ( {}.toString.call( ret[ key ] ) !== "[object Array]" ) {
                        ret[ key ] = [ ret[ key ] ];
                    }
                    
                    ret[ key ].push( val );
                    
                } else {
                    ret[ key ] = val;
                }
            }
        }
        
        return ret;
    };
    
    if ( typeof $ !== "undefined" ) {
        $.paramalama = paramalama;
    }

    return paramalama;
    
});
