    if (typeof DEBUG === 'undefined') {
        DEBUG = true;
    }

    "use strict";


    // LIBRARY-GLOBAL CONSTANTS
    // ------------------------
    // These constants are exposed to all library modules.

    // GLOBAL is a reference to the global Object.
    //
    var Fn = Function, GLOBAL = Fn('return this')();


    // LIBRARY-GLOBAL METHODS
    // ----------------------
    // The methods here are exposed to all library modules.  Because all of the
    // source files are wrapped within a closure at build time, they are not
    // exposed globally in the distributable binaries.

    // A no-op function. Useful for passing around as a default callback.
    //
    function noop() { }


    // LIBRARY-GLOBAL ERROR OBJECTS
    // ----------------------------

    function ArgumentError(paramName) {
        /// <summary>The exception that is thrown when one of the arguments provided to a method is not valid.</summary>
        /// <param name="paramName" type="String">The name of the parameter that caused the current exception.</param>
        this.message += paramName;
    }
    ArgumentError.prototype = new Error();
    ArgumentError.prototype.name = 'ArgumentError';
    ArgumentError.prototype.message = 'Value provided for the following parameter is invalid: ';

    function ArgumentOutOfRangeError(paramName) {
        this.message = paramName + this.message;
    };
    ArgumentOutOfRangeError.prototype = new ArgumentError();
    ArgumentOutOfRangeError.prototype.name = 'ArgumentOutOfRangeError';
    ArgumentOutOfRangeError.prototype.message = ' is out of range.';

    function ArgumentNullError(paramName) {
        this.message = paramName + this.message;
    }
    ArgumentNullError.prototype = new ArgumentError();
    ArgumentNullError.prototype.name = 'ArgumentNullError';
    ArgumentNullError.prototype.message = ' is null.';

    function NotImplementedError(methodName) {
        this.message = methodName + this.message;
    }
    NotImplementedError.prototype = new Error();
    NotImplementedError.prototype.name = 'NotImplementedError';
    NotImplementedError.prototype.message = ' is not implemented.';

    function ModuleNotFoundError(module) {
        this.message = module + this.message;
    }
    ModuleNotFoundError.prototype = new Error();
    ModuleNotFoundError.prototype.name = 'ModuleNotFoundError';
    ModuleNotFoundError.prototype.message = ' is not defined. Please make sure the required script is referenced before this module.';


    // LIBRARY CORE
    // --------------------------
    
    var msharp = GLOBAL.msharp = {
        /// <field type="String">The name of the framework.</field>
        name: 'msharp.js',
        /// <field type="String">The version of the framework.</field>
        version: '{{version}}',
        /// <field type="String">The description of the framework.</field>
        description: 'yet another javascript framework.',
        /// <field type="String">The author of the framework.</field>
        author: 'Martin Eriksson'
    };

    // Make the core object read-only, if possible.
    //
    if (Object.defineProperties) {
        Object.defineProperties(msharp, {
            name: { value: msharp.name, writable: false },
            version: { value: msharp.version, writable: false },
            description: { value: msharp.description, writable: false },
            author: { value: msharp.author, writable: false }
        });
    }


    // LIBRARY STATIC API
    // ------------------

    msharp.each = function (object, callback, thisArg) {
        /// <summary>
        /// 	Executes a provided callback function once per array element or object property.
        ///		&#10;1 - each(object, callback(element, index))
        ///		&#10;2 - each(object, callback(element, index), thisArg)
        /// </summary>
        /// <param name="object" type="Object|Array">
        /// 	The object or array to iterate.
        /// </param>
        /// <param name="callback" type="Function">
        /// 	Function to execute for each element. callback(Anything item, Number index)
        /// </param>
        /// <param name="thisArg" type="Object" optional="true">
        /// 	Object to use as this when executing callback.
        /// </param>
        /// <returns type="Object|Array" />

        if (typeof object !== 'object') { throw new InvalidParameterError('object'); }
        if (typeof callback !== 'function') { throw new TypeError('callback'); }
    	
        var length = object.length,
            item = null,
            i = 0;

        if (typeof length === 'undefined') {
            for (i in object) {
        	    item = object[i];
        		
        	    if (callback.apply(thisArg || item, [item, i]) === false) {
                    break;
                }
            }
        } else {
            for (; i < length; i++) {
                item = object[i];
                
                if (callback.apply(thisArg || item, [item, i]) === false) {
                    break;
                }
            }
        }

        return object;
    };

    msharp.equals = function (a, b) {
        /// <summary>Compares the values of both objects and decides whether they are equal or not.</summary>
        /// <param name="a" type="Object">An object to be compared.</param>
        /// <param name="b" type="Object">The object to compare against.</param>
        /// <returns type="Boolean">Returns true if the objects are equal.</returns>

        if (a === b) {
            return true;
        }
    	
        if (typeof a !== typeof b) {
            return false;
        }
        
        return JSON.stringify(a) === JSON.stringify(b);
    };

    msharp.inherit = function (object, base) {
        /// <summary>
        /// 	Sets base as the objects prototype, which means object 'inherits' from base. The constructor of the base object will be reached through object.base.
        /// </summary>
        /// <param name="object" type="Object">
        /// 	The object which will inherit base.
        /// </param>
        /// <param name="base" type="Object">
        /// 	The object that will be set as the prototype for object.
        /// </param>
        /// <returns type="Object" />

        function __() { this.constructor = object; }
        __.prototype = base.prototype;
        object.prototype = new __();

        return object;
    };

    msharp.isArray = function (object) {
        /// <summary>Checks an object and returns true if it is a native JavaScript Array.</summary>
        /// <param name="object" type="Object">The object to check.</param>
        /// <returns type="Boolean" />

        return object instanceof Array || Object.prototype.toString.call(object) === '[object Array]';
    };

    msharp.isNumber = function (object) {
        /// <summary>Checks an object and returns true if it is a native JavaScript number.</summary>
        /// <param name="object" type="Object">The object to check.</param>
        /// <returns type="Boolean" />

        return msharp.type(object) === 'number';
    };

    msharp.isStrict = function () {
        /// <summary>Returns true if the environment is run in strict mode.</summary>
        /// <returns type="Boolean" />

        try {
            var o = { p: 1, p: 2 };
        } catch (error) {
            return true;
        }

        return false;
    };

    msharp.mix = function (object) {
        /// <summary>
        /// 	Returns a new object, created by mixing all properties of the given objects.
        /// </summary>
        /// <param name="objects" type="Object" parameterArray="true">
        /// 	Any number of objects.
        /// </param>
        /// <returns type="Object" />

        var prop = null,
            obj = {};

        msharp.each(arguments, function () {
            for (prop in this) {
                if (this.hasOwnProperty(prop)) {
                    obj[prop] = this[prop];
                }
            }
        });

        return obj;
    };

    msharp.namespace = function (namespace) {
        /// <summary>Creates a chain of objects to replicate namespaces. Only objects that don't already exists will me created.</summary>
        /// <param name="namespace" type="String">A string representation of the namespace.</param>
        /// <returns type="Object">Returns the last object of the chain.</returns>

        if (typeof namespace !== 'string') { throw new InvalidParameterError('namespace'); }

        var tokens = namespace.split('.'),
 	        parent = GLOBAL;

        msharp.each(tokens, function () {
            if (typeof parent[this] === 'undefined') {
                parent[this] = {};
            }

            parent = parent[this];
        });

        return parent;
    };

    msharp.require = function (namespace) {
        /// <summary>
        ///     Throws an error if any object in the given namespace chain is undefined. 
        ///     If all objects are defined, the last object of the chain is returned.
        /// </summary>
        /// <param name="namespace" type="String>The namespace to verify.</param>
        /// <returns type="Object" />

        if (typeof namespace !== 'string') { throw new TypeError('namespace'); }

        var tokens = namespace.split('.'),
            parent = GLOBAL;
        
        msharp.each(tokens, function () {
            if (typeof parent[this] === 'undefined') {
        	    throw new Error(namespace + ' is not defined. Please make sure the required script is referenced before this module.');
            }
        	
            parent = parent[this];
        });

        return parent;
    };
    
    msharp.trim = function (value) {
        /// <summary>
        ///     Removes whitespace from both ends of the string.
        /// </summary>
        /// <param name="value" type="String">
        ///     The value which will be trimmed.
        /// </param>
        /// <returns type="String" />

        return value.replace(/^\s+|\s+$/g, '');
    };

    msharp.type = function (object) {
        /// <summary>Returns the type of an object with better precision than the JavaScript typeof operator.</summary>
        /// <param name="object" type="Anything">The object which type should be returned.</param>
        /// <returns type="String" />

        var typeMatch = Object.prototype.toString.call(object).match(/\[object (.+?)\]/i);

        if (!typeMatch) { return (typeof object); }

        if (typeMatch[1] === 'Object' && object.constructor && object.constructor.name) {
            return object.constructor.name.toLowerCase();
        } else if (typeMatch[1] === 'Object' && object.constructor) {
            var constructorMatch = object.constructor.toString().match(/^function(.+?)\(/i);

            if (constructorMatch && constructorMatch[1].trim()) {
                return constructorMatch[1].toLowerCase().trim();
            }
        }
        
        return typeMatch[1].toLowerCase();
    };


    // Polyfills
    // ---------

    String.prototype.trim = String.prototype.trim || function () { return msharp.trim(this); }
    GLOBAL.console = GLOBAL.console || { log: noop, dir: noop };