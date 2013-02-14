/**
 * msharp.js
 * v1.0.0 (Thu, 14 Feb 2013 20:56:21 GMT)
 *
 * By Martin Eriksson
 *
 * MIT License.
 */
;(function (global) {
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
		version: '1.0.0',
		/// <field type="String">The description of the framework.</field>
		description: 'yet another javascript framework.',
		/// <field type="String">The author of the framework.</field>
		author: 'Martin Eriksson'
	};

	// Make the core object read-only, if possible. Just for the fun of it.
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
﻿/// <reference path="msharp.core.js" />

(function (msharp) {

	// Create Object
	// -------------

	msharp.Comparer = (function () {

		// Constructor
		// -----------

		function Comparer(type, descending) {
			/// <summary>Factories a compare function based on type.</summary>
			/// <param name="type" type="String">String representation of the types to compare.</param>

			this.getType = function () {
				return type;
			};

			this.compare = Comparer.getComparerByType(type, descending);
		}

		// Public Static Methods
		// ---------------------

		Comparer.booleanComparer = function (a, b) {
			/// <summary>Compares two values of type Boolean.</summary>
			/// <param name="a" type="Boolean">The first value.</param>
			/// <param name="b" type="Boolean">The second value.</param>
			/// <returns type="Number" />

			return (a < b) ? -1 : (a > b) ? 1 : 0;
		};

		Comparer.dateComparer = function (a, b) {
			/// <summary>Compares two values of type Date.</summary>
			/// <param name="a" type="Date">The first value.</param>
			/// <param name="b" type="Date">The second value.</param>
			/// <returns type="Number" />

			return (a - b);
		};

		Comparer.numberComparer = function (a, b) {
			/// <summary>Compares two values of type Number.</summary>
			/// <param name="a" type="Number">The first value.</param>
			/// <param name="b" type="Number">The second value.</param>
			/// <returns type="Number" />

			return (a - b);
		};

		Comparer.stringComparer = function (a, b) {
			/// <summary>Compares two values of type String.</summary>
			/// <param name="a" type="String">The first value.</param>
			/// <param name="b" type="String">The second value.</param>
			/// <returns type="Number" />

			return (a < b) ? -1 : (a > b) ? 1 : 0;
		};

		Comparer.getComparerByType = function (type, descending) {
			/// <summary>Returns a Compare function based on the type provided.</summary>
			/// <param name="type" type="String">A string describing the comparer type. Can be a msharp extended type.</param>
			/// <returns type="Function" />

			var comparer = Comparer[type + 'Comparer'];

			if (typeof comparer !== 'undefined') {

				if (descending === true) {
					return function (a, b) {
						return comparer(b, a);
					}
				}

				return comparer;

			}
		};

		// Debug Code
		// ----------

		if (DEBUG) {

		}

		return Comparer;

	})();

})(msharp);
﻿/// <reference path="msharp.core.js" />

(function (msharp) {

	// Create Object
	// -------------

	msharp.LambdaExpressionParser = (function () {

		// Private Methods
		// ---------------

		function lambdaExpressionParser(expression) {
			/// <summary>Converts a string containing a Lambda expression into a Function.</summary>
			/// <param name="expression" type="String">A string containing a Lambda expression. (Example: 'n => n % 2 == 0')</param>
			/// <returns type="Function" />

			// Authored by Paul Free
			// URL: http://www.paulfree.com/11/javascript-lambda-expressions/

			var fn = expression.match(/\s*\(?\s*(.*)\s*\)?\s*=>\s*(.*)\s*/);
			var p = [];
			var b = '';

			if (fn.length > 0) fn.shift();
			if (fn.length > 0) b = fn.pop();
			if (fn.length > 0) p = fn.pop().replace(/^\s*|\s(?=\s)|\s*$|,/g, '').split(' ');

			// prepend a return if not already there.
			fn = ((!/\s*return\s+/.test(b)) ? "return " : "") + b;

			p.push(fn);

			try {
				return Function.apply({}, p);
			} catch (ex) {
				throw new Error();
			}
		}

		// Constructor
		// -----------

		function LambdaExpressionParser(expression) {
			/// <summary>Parses a Lambda expression string and provides an API for invoking the resulting function.</summary>
			/// <param name="expression" type="String|Function">Either the Lambda expression string that should be parsed or a function that will be invoked.</param>
			/// <returns type="LambdaExpressionParser" />

			// Constructor Logic
			// -----------------

			var method = null,
                expressionType = (typeof expression);

			if (expressionType === 'function') {
				method = expression;
			} else if (expressionType === 'string') {
				try {
					method = lambdaExpressionParser(expression);
				} catch (error) {
					throw error;
				}
			} else {
				throw new msharp.ArgumentError('expression');
			}

			// Getters and Setters
			// -------------------

			this.getFunction = function () {
				return method;
			};
		}

		// Internal Error Objects
		// ----------------------

		function LambdaExpressionParserError(expression) {
			this.message = 'LambdaExpressionParser failed to parse the expression. Expression: \'' + expression + '\'';
		}
		LambdaExpressionParserError.prototype = new Error();
		LambdaExpressionParserError.prototype.name = 'LambdaExpressionParserError';

		LambdaExpressionParser.LambdaExpressionParserError = LambdaExpressionParserError;

		// Public Methods
		// --------------

		LambdaExpressionParser.prototype.apply = function (thisArg, argsArray) {
			/// <summary>Calls the resulting function with a given this value and arguments provided as an array (or an array like object).</summary>
			/// <param name="thisArg" type="Object">The value of this provided for the call to the function. Note that this may not be the actual value seen by the method: if the method is a function in non-strict mode code, null and undefined will be replaced with the global object, and primitive values will be boxed.</param>
			/// <param name="argsArray" type="Array">An array, specifying the arguments with which the function should be called, or null or undefined if no arguments should be provided to the function.</param>
			/// <returns type="Anything" />

			return this.getFunction().apply(thisArg, argsArray);
		}

		// Debug Code
		// ----------

		if (DEBUG) {

		}

		return LambdaExpressionParser;

	})();

})(msharp);﻿/// <reference path="msharp.core.js" />

(function (msharp) {

	// Create Object
	// -------------

	var Enumerator = (function () {

		// Inherit Array
		// -------------

		msharp.inherit(Enumerator, Array);

		// Constructor
		// -----------

		function Enumerator(array) {
			/// <summary>Supports a simple iteration over a nongeneric collection.</summary>
			/// <param name="array" type="Array" optional="true">An array of objects.</param>


			Array.call(this);

			// Copy the array coming in to the constructor by default, 
			// we don't want to use a reference to avoid manipulation from
			// outside the enumerator.
			//
			if (array) {
				var length = array.length,
                	i = 0;

				for (; i < length; i++) {
					this.push(array[i]);
				}
			};

			// Initialization
			//
			this.position = -1;
		};

		// Public Static Methods
		// ---------------------

		Enumerator.isEnumerator = function (object) {
			return object instanceof Enumerator;
		};

		// Public Methods
		// --------------

		Enumerator.prototype.getCurrent = function () {
			/// <summary>Gets the current element in the collection.</summary>
			/// <returns type="Object" />

			try {
				return this[this.position];
			}
			catch (error) {
				throw new Error('The enumerator is positioned before the first element of the collection or after the last element.');
			}
		};

		Enumerator.prototype.moveNext = function () {
			/// <summary>Advances the enumerator to the next element of the collection. Returns true if the enumerator was successfully advanced to the next element; false if the enumerator has passed the end of the collection.</summary>
			/// <returns type="Boolean" />

			this.position++;

			return (this.position < this.length);
		};

		Enumerator.prototype.each = function (callback, thisArg) {
			/// <summary>Executes a provided callback function once per array element.</summary>
			/// <param name="callback" type="Function">Function to execute for each element. callback(Anything item, Number index)</param>
			/// <param name="thisArg" type="Object">Object to use as this when executing callback.</param>
			/// <returns type="Void" />

			return msharp.each(this, callback, thisArg);
		};

		Enumerator.prototype.reset = function (value) {
			/// <summary>Sets the enumerator to its initial position, which is before the first element in the collection.</summary>
			/// <param name="value" type="Anything" optional="true">A value which is returned.</param>
			/// <returns type="Anything" />

			this.position = -1;

			return value;
		};

		Enumerator.prototype.toArray = function () {
			/// <summary>
			/// 	Creates an array from this Enumerator.
			/// </summary>
			/// <returns type="Array" />

			return this.slice();
		};


		// Debug Code
		// ----------

		if (DEBUG) {

		}

		return Enumerator;

	})();


	// JSON Stringify Compatability
	// ----------------------------
	// The normal logic of JSON.stringify() would treat an object 
	// that inherits the Array prototype as a native object and not as
	// an Array object. This code overrides that behaviour and treats
	// Enumerator as an Array object.

	if (JSON) {
		// NOTE: 
		// This is not a polyfill. For use in broswers with JavaScript < 1.7, implement your own polyfill.
		//

		var STRINGIFY = JSON.stringify;

		JSON.stringify = function (value, replacer, space) {
			return STRINGIFY(value, function (key, value) {
				var transformed = value instanceof Enumerator ? value.toArray() : value;
				if (replacer) { return replacer(key, transformed); }
				return transformed;
			}, space);
		};
	}

	// Export Enumerator
	// -----------------

	msharp.Enumerator = Enumerator;

})(msharp);
﻿/// <reference path="msharp.core.js" />
/// <reference path="msharp.module.enumerator.js" />

(function (msharp) {

	// Includes
	// --------

	var Enumerator = msharp.require('msharp.Enumerator'),
    	LambdaExpressionParser = msharp.require('msharp.LambdaExpressionParser');

	// Create Object
	// -------------

	msharp.Enumerable = (function () {

		// Inherit Enumerator
		// ------------------

		msharp.inherit(Enumerable, Enumerator);

		// Constructor
		// -----------

		function Enumerable(array) {
			/// <summary>Creates an Enumerable object that support many LINQ-type queries.</summary>
			/// <param name="array" type="Array">An array of objects.</param>

			Enumerator.call(this, array);
		}

		// Internal Error Objects
		// ----------------------

		function NoMatchError(message) {
			this.name = 'NoMatchError';
			this.message = message || 'No element satisfies the condition in predicate.';
		}
		NoMatchError.prototype = new Error();
		NoMatchError.prototype.contructor = NoMatchError;

		Enumerable.NoMatchError = NoMatchError;

		function NoElementsError(message) {
			this.name = 'NoElementsError';
			this.message = message || 'The source sequence is empty.';
		};
		NoElementsError.prototype = new Error();
		NoElementsError.prototype.constructor = NoElementsError;

		Enumerable.NoElementsError = NoElementsError;

		function MoreThanOneElementError(message) {
			this.name = 'MoreThanOneElementError';
			this.message = message || 'There are more than one element in this Enumerable.';
		}
		MoreThanOneElementError.prototype = new Error();
		MoreThanOneElementError.prototype.constructor = MoreThanOneElementError;

		Enumerable.MoreThanOneElementError = MoreThanOneElementError;

		function IncompatibleElementTypesError(message) {
			this.name = 'IncompatibleElementTypesError';
			this.message = message || 'Element types are not compatible.';
		};
		IncompatibleElementTypesError.prototype = new Error();
		IncompatibleElementTypesError.prototype.constructor = IncompatibleElementTypesError;

		Enumerable.IncompatibleElementTypesError = IncompatibleElementTypesError;


		// Public Static Methods
		// ---------------------

		Enumerable.empty = function () {
			/// <summary>
			/// 	Returns an empty Enumerable.
			/// </summary>
			/// <returns type="Enumerable" />

			return new Enumerable();
		};

		Enumerable.isEnumerable = function (object) {
			/// <summary>
			/// 	Returns true if the object is or inherits from the Enumerable object.
			/// </summary>
			/// <param name="object" type="Object">
			/// 	The object to verify.
			/// </param>
			/// <returns type="Boolean" />

			return object instanceof Enumerable;
		};

		Enumerable.range = function (start, count) {
			/// <summary>
			/// 	Generates a sequence of integral numbers within a specified range.
			/// </summary>
			/// <param name="start" type="Number">
			/// 	The value of the first integer in the sequence.
			/// </param>
			/// <param name="count" type="Number">
			/// 	The number of sequential integers to generate.
			/// </param>
			/// <returns type="Enumerable" />

			if (count < 0) { throw new ArgumentOutOfRangeError('count'); }

			var range = new Enumerable(),
                i = 0;

			for (; i < count; ++i) {
				range.push(start + i);
			}

			return range;
		};

		Enumerable.repeat = function (element, count) {
			/// <summary>
			/// 	Generates a sequence that contains one repeated value.
			/// </summary>
			/// <param name="element" type="Anything">
			/// 	The value to be repeated.
			/// </param>
			/// <param name="count" type="Number">
			/// 	The number of times to repeat the value in the generated sequence.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof element === 'undefined') { throw new ArgumentNullError('element'); }
			if (typeof count === 'undefined') { throw new ArgumentNullError('count'); }
			if (typeof count !== 'number') { throw new ArgumentError('count'); }
			if (count < 0) { throw new ArgumentOutOfRangeError('count'); }

			var repeat = new Enumerable(),
            	i = 0;

			for (; i < count; i++) {
				repeat.push(element);
			}

			return repeat;
		};

		// Public Methods
		// --------------

		Enumerable.prototype.contains = function (value, comparer) {
			/// <summary>
			/// 	Determines whether a sequence contains a specified element.
			/// 	&#10;1 - contains(value)
			/// 	&#10;2 - contains(value, comparer(a, b))
			/// </summary>
			/// <param name="value" type="Anything">
			/// 	The value to locate in the sequence.
			/// </param>
			/// <param name="comparer" type="Function" optional="true">
			/// 	A function that compares two values.
			/// </param>
			/// <returns type="Boolean" />

			if (typeof value === 'undefined') { throw new ArgumentNullError('value'); }

			var equals = comparer || msharp.equals,
            	contains = false;

			this.each(function (item) {
				if (equals(item, value)) {
					contains = true;
					return false;
				}
			});

			return contains;
		};

		Enumerable.prototype.count = function (predicate) {
			/// <summary>
			/// 	Returns a number that represents how many elements in the specified sequence satisfy a condition.
			/// 	&#10;1 - count()
			/// 	&#10;2 - count(predicate(element))
			/// </summary>
			/// <param name="predicate" type="Function|String" optional="true">
			/// 	A function to test each element for a condition. If no function is provided, the total number of elements is returned.
			/// </param>
			/// <returns type="Number" />

			if (typeof predicate === 'undefined') { return this.length; }

			try {
				predicate = new LambdaExpressionParser(predicate);
			} catch (error) {
				throw new ArgumentError('predicate');
			}

			var count = 0;

			this.each(function (item) {
				if (predicate.apply(item, [item])) {
					count++;
				}
			});

			return count;
		};

		Enumerable.prototype.distinct = function (comparer) {
			/// <summary>
			/// 	Returns distinct elements from a sequence by using the default equality comparer to compare values.
			/// 	&#10;1 - distinct()
			/// 	&#10;2 - distinct(comparer(a, b))
			/// </summary>
			/// <param name="comparer" type="Function" optional="true">
			/// 	A function that compares two values.
			/// </param>
			/// <returns type="Enumerable" />

			var distinct = new Enumerable();

			this.each(function (item) {
				if (!distinct.contains(item, comparer)) {
					distinct.push(item);
				}
			});

			return distinct;
		};

		Enumerable.prototype.elementAt = function (index) {
			/// <summary>
			/// 	Returns the element at a specified index in a sequence.
			/// </summary>
			/// <param name="index" type="Number">
			/// 	The zero-based index of the element to retrieve.
			/// </param>
			/// <returns type="Anything" />

			if (typeof index === 'undefined') { throw new ArgumentNullError('index'); }
			if (typeof index !== 'number') { throw new ArgumentError('index'); }
			if (index < 0 || index >= this.length) { throw new ArgumentOutOfRangeError('index'); }

			return this[index];
		};

		Enumerable.prototype.elementAtOrDefault = function (index, defaultValue) {
			/// <summary>
			/// 	Returns the element at a specified index in a sequence or a default value if the index is out of range.
			/// </summary>
			/// <param name="index" type="Number">
			/// 	The zero-based index of the element to retrieve.
			/// </param>
			/// <param name="defaultValue" type="Anything">
			/// 	The value to return if the index is outside the bounds of the source sequence.
			/// </param>
			/// <returns type="Anything" />

			if (typeof defaultValue === 'undefined') { throw new ArgumentNullError('defaultValue'); }

			try {
				return this.elementAt(index);
			} catch (error) {
				if (error instanceof ArgumentOutOfRangeError) {
					return defaultValue;
				}

				throw error;
			}
		};

		Enumerable.prototype.except = function (second) {
			/// <summary>
			/// 	Produces the set difference of two sequences by using the default equality comparer to compare values.
			/// </summary>
			/// <param name="second" type="Array|Enumerable">
			/// 	An Enumerable or an Array whose elements that also occur in the existing sequence will cause those elements to be removed from the returned sequence.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof second === 'undefined') { throw new ArgumentNullError('second'); }
			if (!(second instanceof Array)) { throw new ArgumentError('second'); }
			if (!(second instanceof Enumerable)) { second = new Enumerable(second); }

			var except = new Enumerable();

			this.each(function (item) {
				if (!second.contains(item)) {
					except.push(item);
				}
			});

			return except;
		};

		Enumerable.prototype.first = function (predicate) {
			/// <summary>
			/// 	Returns the first element of a sequence or the the first element in a sequence that satisfies a specified condition.
			/// 	&#10;1 - first()
			/// 	&#10;2 - first(predicate)
			/// 	&#10;3 - first(predicate(element))
			/// </summary>
			/// <param name="predicate" type="Function|String" optional="true">
			/// 	A function to test each element for a condition. (Optional)
			/// </param>
			/// <returns type="Anything" />

			if (this.length === 0) { throw new NoElementsError(); }

			if (predicate) {
				try {
					predicate = new LambdaExpressionParser(predicate);
				} catch (error) {
					throw new ArgumentError('predicate');
				}
			}

			var first;

			this.each(function (item, index) {
				if ((predicate ? predicate.apply(this, [this]) : index === 0)) {
					first = this;
					return false;
				}
			});

			if (typeof first !== 'undefined') {
				return first;
			}

			throw new NoMatchError();
		};

		Enumerable.prototype.firstOrDefault = function () {
			/// <summary>
			/// 	Returns the first element of a sequence, or a default value if the sequence contains no elements.
			/// 	&#10;1 - firstOrDefault()
			/// 	&#10;2 - firstOrDefault(defaultValue)
			/// 	&#10;3 - firstOrDefault(predicate(element), defaultValue)
			/// </summary>
			/// <param name="predicate" type="Function|String" optional="true">
			/// 	A function to test each element for a condition. (Optional)
			/// </param>
			/// <param name="defaultValue" type="Anything">
			/// 	An object that will be returned if the sequence contains no elements.
			/// </param>
			/// <returns type="Anything" />

			var predicate, defaultValue;

			if (arguments.length >= 2) {
				predicate = arguments[0];
				defaultValue = arguments[1];
			} else if (arguments.length === 1) {
				defaultValue = arguments[0];
			} else {
				throw new ArgumentNullError('predicate');
			}

			try {
				return this.first(predicate);
			} catch (error) {
				if (error instanceof NoMatchError || error instanceof NoElementsError) {
					return defaultValue;
				}

				throw error;
			}
		};

		Enumerable.prototype.groupBy = function (keySelector, elementSelector) {
			/// <summary>
			/// 	Groups the elements of a sequence according to a specified key selector function. Returns an Enumerable of Grouping objects.
			/// 	&#10;1 - groupBy(keySelector(element))
			/// 	&#10;2 - groupBy(keySelector(element), elementSelector(element))
			/// </summary>
			/// <param name="keySelector" type="Function|String">
			/// 	A function to extract the key for each element.
			/// </param>
			/// <param name="elementSelector" type="Function|String" optional="true">
			/// 	A function to map each source element to an element in a Grouping object.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof keySelector === 'undefined') { throw new ArgumentNullError('keySelector'); }

			try {
				keySelector = new LambdaExpressionParser(keySelector);
			} catch (error) {
				throw new ArgumentError('keySelector');
			}

			if (elementSelector) {
				try {
					elementSelector = new LambdaExpressionParser(elementSelector);
				} catch (error) {
					throw new ArgumentError('elementSelector');
				}
			}

			var keysEnumerable = new Enumerable(),
            	groupsEnumerable = new Enumerable(),
            	currentKey = null,
            	selectedElement = null,
        		groupIndex = null,
        		groupByResult = new Enumerable();

			this.each(function () {
				currentKey = keySelector.apply(this, [this]);
				selectedElement = elementSelector ? elementSelector.apply(this, [this]) : this;
				groupIndex = keysEnumerable.indexOf(currentKey, function (a, b) { return a == b; });

				if (groupIndex >= 0) {
					groupsEnumerable.elementAt(groupIndex).push(selectedElement);
				} else {
					keysEnumerable.push(currentKey);
					groupsEnumerable.push([selectedElement]);
				}
			});

			while (keysEnumerable.moveNext() && groupsEnumerable.moveNext()) {
				groupByResult.push(new msharp.Grouping(keysEnumerable.getCurrent(), groupsEnumerable.getCurrent()));
			}

			return groupByResult;
		};

		Enumerable.prototype.indexOf = function (value, comparer) {
			/// <summary>
			/// 	Returns the index of a specified element. A negative number is returned if the element is not found in the sequence.
			/// 	&#10;1 - indexOf(value)
			/// 	&#10;2 - indexOf(value, comparer(a, b))
			/// </summary>
			/// <param name="value" type="Anything">
			/// 	The value to locate in the sequence.
			/// </param>
			/// <param name="comparer" type="Function" optional="true">
			/// 	A function that compares two values.
			/// </param>
			/// <returns type="Number" />

			if (typeof value === 'undefined') { throw new ArgumentNullError('value'); }

			var equals = comparer || msharp.equals,
            	indexOf = -1;

			this.each(function (item, index) {
				if (equals(this, value)) {
					indexOf = index;
					return false;
				}
			});

			return indexOf;
		};

		Enumerable.prototype.last = function (predicate) {
			/// <summary>
			/// 	Returns the last element of a sequence or the last element of a sequence that satisfies a specified condition.
			/// 	&#10;1 - last()
			/// 	&#10;2 - last(predicate(element))
			/// </summary>
			/// <param name="predicate" type="Function|String" optional="true">
			/// 	A function to test each element for a condition.
			/// </param>
			/// <returns type="Anything" />

			var lastObjectResult = null,
        		flag = false,
        		count = 0;

			if (predicate) {
				try {
					predicate = new LambdaExpressionParser(predicate);
				} catch (error) {
					throw new ArgumentError('predicate');
				}

				this.each(function (item, index) {
					if (predicate.apply(this, [this])) {
						lastObjectResult = this;
						flag = true;
					}
				});

				if (flag) {
					return lastObjectResult;
				}

				throw new NoMatchError();
			} else {
				count = this.count();

				if (count > 0) {
					return this.elementAt(count - 1);
				}

				throw new NoElementsError();
			}
		};

		Enumerable.prototype.lastOrDefault = function () {
			/// <summary>
			/// 	Returns the last element of a sequence, or a default value if the sequence contains no elements.
			/// 	&#10;1 - lastOrDefault(defaultValue)
			/// 	&#10;2 - lastOrDefault(predicate(element), defaultValue)
			/// </summary>
			/// <param name="predicate" type="Function|String" optional="true">
			/// 	A function to test each element for a condition.
			/// </param>
			/// <param name="defaultValue" type="Anything">
			/// 	An object that will be returned if the sequence contains no elements.
			/// </param>
			/// <returns type="Anything" />

			var predicate, defaultValue;

			if (arguments.length >= 2) {
				predicate = arguments[0];
				defaultValue = arguments[1];
			} else if (arguments.length === 1) {
				defaultValue = arguments[0];
			} else {
				throw new ArgumentNullError('defaultValue');
			}

			try {
				return this.last(predicate);
			} catch (error) {
				if (error instanceof NoMatchError || error instanceof NoElementsError) {
					return defaultValue;
				}
				throw error;
			}
		};

		Enumerable.prototype.max = function (selector) {
			/// <summary>
			/// 	Returns the maximum value in a generic sequence.
			/// 	&#10;1 - max()
			/// 	&#10;2 - max(selector(element))
			/// </summary>
			/// <param name="selector" type="Function|String" optional="true">
			/// 	A transform function to apply to each element.
			/// </param>
			/// <returns type="Number" />

			var that = (typeof selector !== 'undefined') ? this.select(selector) : this,
            	flag = false,
            	max;

			that.each(function (item, index) {
				if (msharp.isNumber(this) === false) { throw new IncompatibleElementTypesError(); }

				if (flag) {
					if (this > max) {
						max = this;
					}
				} else {
					max = this;
					flag = true;
				}
			});

			if (flag) {
				return max;
			} else {
				throw new NoElementsError();
			}
		};

		Enumerable.prototype.min = function (selector) {
			/// <summary>
			/// 	Returns the minimum value in a generic sequence.
			/// 	&#10;1 - min()
			/// 	&#10;2 - min(selector(element))
			/// </summary>
			/// <param name="selector" type="Function|String" optional="true">
			/// 	A transform function to apply to each element.
			/// </param>
			/// <returns type="Number" />

			var that = (typeof selector !== 'undefined') ? this.select(selector) : this,
            	flag = false,
            	min;

			that.each(function () {
				if (msharp.isNumber(this) === false) { throw new IncompatibleElementTypesError(); }

				if (flag) {
					if (this < min) {
						min = this;
					}
				} else {
					min = this;
					flag = true;
				}
			});

			if (flag) {
				return min;
			} else {
				throw new NoElementsError();
			}
		};

		Enumerable.prototype.ofType = function (type) {
			/// <summary>
			/// 	Filters the elements of an Enumerable based on a specified type.
			/// </summary>
			/// <param name="type" type="String|Function">
			/// 	The type to filter the elements of the sequence on.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof type === 'undefined') { throw new ArgumentNullError('type'); }
			if (typeof type !== 'string' && typeof type !== 'function') { throw new ArgumentError('type'); }

			var ofTypeResult = new Enumerable(),
            	typeCompare = null;

			if (typeof type === 'string') {
				typeCompare = function (a, b) {
					return (msharp.type(a) === b.toLowerCase());
					//return (typeof a === b.toLowerCase()); // Only works in strict mode
				}
			} else if (typeof type === 'function') {
				typeCompare = function (a, b) {
					return (a instanceof b);
				};
			}

			this.each(function () {
				if (typeCompare(this, type)) {
					ofTypeResult.push(this);
				}
			});

			return ofTypeResult;
		};

		Enumerable.prototype.orderBy = function (keySelector, comparer) {
			/// <summary>
			/// 	Sorts the elements of a sequence in ascending order according to a key.
			/// 	&#10;1 - orderBy()
			/// 	&#10;2 - orderBy(keySelector(element))
			/// 	&#10;3 - orderBy(keySelector(element), comparer(a, b))
			/// </summary>
			/// <param name="keySelector" type="Function|String" optional="true">
			/// 	A function to extract a key from an element.
			/// </param>
			/// <param name="comparer" type="Function|String" optional="true">
			/// 	A function that defines the sort order.
			/// </param>
			/// <returns type="Enumerable" />

			if (keySelector) {
				try {
					keySelector = new LambdaExpressionParser(keySelector);
				} catch (error) {
					throw new ArgumentError('keySelector');
				}
			}

			if (comparer) {
				try {
					comparer = new LambdaExpressionParser(comparer).getFunction();
				} catch (error) {
					throw new ArgumentError('comparer');
				}
			}

			var keyMap = new Enumerator(),
            	sortedEnumerable = new Enumerable(),
            	currentKey = null,
            	flag = false,
            	extendedType;

			// Start with mapping the Keys and verify that the type of all keys match.
			//
			this.each(function (item, index) {
				currentKey = keySelector ? keySelector.apply(this, [this]) : this;

				if (!comparer) {
					if (flag) {
						if (extendedType !== msharp.type(currentKey)) {
							throw new IncompatibleElementTypesError();
						}
					} else {
						extendedType = msharp.type(currentKey);
						flag = true;
					}
				}

				keyMap.push({ index: index, key: currentKey });
			});

			// Create a Comparer / Use provided Comparer
			//
			if (typeof comparer === 'undefined') {
				comparer = msharp.Comparer.getComparerByType(extendedType);
			}

			// Sort the Map.
			//
			keyMap.sort(comparer && function (a, b) {
				return comparer(a.key, b.key);
			});

			// Add the objects to a new Enumerable positioned according to the map.
			//
			keyMap.each(function (item, index) {
				sortedEnumerable.push(this[keyMap[index].index]);
			}, this);

			return sortedEnumerable;
		};

		Enumerable.prototype.orderByDescending = function (keySelector, comparer) {
			/// <summary>
			/// 	Sorts the elements of a sequence in descending order according to a key.
			/// 	&#10;1 - orderByDescending()
			/// 	&#10;2 - orderByDescending(keySelector(element))
			/// 	&#10;3 - orderByDescending(keySelector(element), comparer(a, b))
			/// </summary>
			/// <param name="keySelector" type="Function|String" optional="true">
			/// 	A function to extract a key from an element.
			/// </param>
			/// <param name="comparer" type="Function|String" optional="true">
			/// 	A function that defines the sort order.
			/// </param>
			/// <returns type="Enumerable" />

			return this.orderBy(keySelector, comparer).reverse();
		};

		Enumerable.prototype.reverse = function () {
			/// <summary>
			/// 	Inverts the order of the elements in a sequence.
			/// </summary>
			/// <returns type="Enumerable" />

			return new Enumerable(this.toArray().reverse());
		};

		Enumerable.prototype.select = function (selector) {
			/// <summary>
			/// 	Projects each element of a sequence into a new form by incorporating the element's index.
			/// 	&#10;1 - select(selector(element, index))
			/// </summary>
			/// <param name="selector" type="Function|String">
			/// 	A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
			/// </param>
			/// <returns type="Anything" />

			if (typeof selector === 'undefined') { throw new ArgumentNullError('selector'); }
			if (typeof selector !== 'function' && typeof selector !== 'string') { throw new ArgumentError('selector'); }

			try {
				selector = new LambdaExpressionParser(selector);
			} catch (error) {
				throw new ArgumentError('selector');
			}

			var select = new Enumerable();

			this.each(function (item, index) {
				select.push(selector.apply(this, [this, index]));
			});

			return select;
		};

		Enumerable.prototype.selectMany = function (selector) {
			/// <summary>
			/// 	Projects each element of a sequence to an Enumerable, and flattens the resulting sequences into one sequence. The index of each source element is used in the projected form of that element.
			/// 	&#10;1 - selectMany(selector(element, index))
			/// </summary>
			/// <param name="selector" type="Function|String">
			/// 	A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof selector === 'undefined') { throw new ArgumentNullError('selector'); }

			try {
				selector = new LambdaExpressionParser(selector);
			} catch (error) {
				throw new ArgumentError('selector');
			}

			var selectMany = new Enumerable(),
            	selectedElement = null;

			this.each(function (item, index) {
				selectedElement = selector.apply(this, [this, index]);

				if (selectedElement instanceof Array) {
					selectedElement = new Enumerator(selectedElement);

					selectedElement.each(function (item, index) {
						selectMany.push(this);
					});
				} else {
					selectMany.push(selectedElement);
				}
			});

			return selectMany;
		};

		Enumerable.prototype.single = function (predicate) {
			/// <summary>
			/// 	Returns the only element of a sequence or the only element of a sequence that satisfies a specified condition, and throws an exception if more than one such element exists.
			/// 	&#10;1 - single()
			/// 	&#10;2 - single(predicate(element))
			/// </summary>
			/// <param name="predicate" type="Function|String" optional="true">
			/// 	A function to test an element for a condition.
			/// </param>
			/// <returns type="Anything" />

			var count = 0,
            	single = null;

			if (predicate) {
				try {
					predicate = new LambdaExpressionParser(predicate);
				} catch (error) {
					throw new ArgumentError('predicate');
				}

				this.each(function (item) {
					if (predicate.apply(item, [item])) {
						if (count++ > 1) {
							return false;
						}

						single = this;
					}
				});
			} else {
				count = this.count();

				if (count === 1) {
					single = this.elementAt(0);
				} else if (count === 0) {
					throw new NoElementsError();
				}
			}

			if (count < 1) {
				throw new NoMatchError();
			} else if (count > 1) {
				throw new MoreThanOneElementError();
			}

			return single;
		};

		Enumerable.prototype.singleOrDefault = function () {
			/// <summary>
			/// 	Returns the only element of a sequence or the only element of a sequence that satisfies a specified condition or a default value if no such element exists; this method throws an exception if more than one element satisfies the condition.
			/// 	&#10;1 - singleOrDefault(defaultValue)
			/// 	&#10;2 - singleOrDefault(predicate(element), defaultValue)
			/// </summary>
			/// <param name="predicate" type="Function|String" optional="true">
			/// 	A function to test an element for a condition.
			/// </param>
			/// <param name="defaultValue" type="Anything">
			/// 	An object that will be returned if the sequence contains no elements.
			/// </param>
			/// <returns type="Anything" />

			var predicate, defaultValue;

			if (arguments.length >= 2) {
				predicate = arguments[0];
				defaultValue = arguments[1];
			} else if (arguments.length === 1) {
				defaultValue = arguments[0];
			} else {
				throw new ArgumentNullError('defaultValue');
			}

			try {
				return this.single(predicate);
			}
			catch (error) {
				if (error instanceof NoElementsError || error instanceof NoMatchError) {
					return defaultValue;
				}

				throw error;
			}
		};

		Enumerable.prototype.skip = function (count) {
			/// <summary>
			/// 	Bypasses a specified number of elements in a sequence and then returns the remaining elements.
			/// </summary>
			/// <param name="count" type="Number">
			/// 	The number of elements to skip before returning the remaining elements.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof count === 'undefined') { throw new ArgumentNullError('count'); }
			if (typeof count !== 'number') { throw new ArgumentError('count'); }

			var skip = new Enumerable();

			this.each(function (item, index) {
				if (index >= count) {
					skip.push(this);
				}
			});

			return skip;
		};

		Enumerable.prototype.skipWhile = function (predicate) {
			/// <summary>
			/// 	Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements. The element's index is used in the logic of the predicate function.
			/// 	&#10;1 - skipWhile(predicate(element, index))
			/// </summary>
			/// <param name="predicate" type="Function|String">
			/// 	A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof predicate === 'undefined') { throw new ArgumentNullError('predicate'); }

			try {
				predicate = new LambdaExpressionParser(predicate);
			} catch (error) {
				throw new ArgumentError('predicate');
			}

			var skipWhile = new Enumerable(),
            	yielding = false;

			this.each(function (item, index) {
				if (!yielding && !predicate.apply(this, [this, index])) {
					yielding = true;
				}

				if (yielding) {
					skipWhile.push(this);
				}
			});

			return skipWhile;
		};

		Enumerable.prototype.sum = function (selector) {
			/// <summary>
			/// 	Computes the sum of the sequence of Number values that are obtained by invoking a transform function on each element of the input sequence.
			/// 	&#10;1 - sum()
			/// 	&#10;2 - sum(selector(element, index))
			/// </summary>
			/// <param name="selector" type="Function|String" optional="true">
			/// 	A transform function to apply to each element.
			/// </param>
			/// <returns type="Number" />

			if (typeof selector !== 'undefined') {
				try {
					selector = new LambdaExpressionParser(selector);
				} catch (error) {
					throw new ArgumentError('selector');
				}
			}

			var addend = 0,
            	sum = 0;

			this.each(function () {
				addend = selector ? selector.apply(this, [this]) : this;

				if (typeof addend !== 'number') {
					if (addend instanceof Number && addend.valueOf) {
						addend = addend.valueOf();
					} else {
						throw new IncompatibleElementTypesError();
					}
				}

				sum += addend;
			});

			return sum;
		};

		Enumerable.prototype.take = function (count) {
			/// <summary>
			/// 	Returns a specified number of contiguous elements from the start of a sequence.
			/// </summary>
			/// <param name="count" type="Number">
			/// 	The number of elements to return.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof count === 'undefined') { throw new ArgumentNullError('count'); }
			if (typeof count !== 'number') { throw new ArgumentError('count'); }

			var take = new Enumerable();

			this.each(function (item, index) {
				take.push(this);

				if (index >= count) {
					return false;
				}
			});

			return take;
		};

		Enumerable.prototype.takeWhile = function (predicate) {
			/// <summary>
			/// 	Returns elements from a sequence as long as a specified condition is true. The element's index is used in the logic of the predicate function.
			/// 	&#10;1 - takeWhile(predicate(element, index))
			/// </summary>
			/// <param name="predicate" type="Function|String">
			/// 	A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof predicate === 'undefined') { throw new ArgumentNullError('predicate'); }

			try {
				predicate = new LambdaExpressionParser(predicate);
			} catch (error) {
				throw new ArgumentError('predicate');
			}

			var takeWhile = new Enumerable();

			this.each(function (item, index) {
				if (predicate.apply(this, [this, index])) {
					takeWhile.push(this);
				} else {
					return false;
				}
			});

			return takeWhile;
		};

		Enumerable.prototype.thenBy = function (keySelector, comparer) {
			/// <summary>
			/// 	Performs a subsequent ordering of the elements in a sequence in ascending order according to a key.
			/// 	&#10;1 - thenBy(keySelector(element, index))
			/// 	&#10;2 - thenBy(keySelector(element, index), comparer(a, b))
			/// </summary>
			/// <param name="keySelector" type="Function|String">
			/// 	A function to extract a key from each element.
			/// </param>
			/// <returns type="Enumerable" />

			throw new NotImplementedError('Enumerable.thenBy()');
		};

		Enumerable.prototype.thenByDescending = function (keySelector) {
			/// <summary>
			/// 	Performs a subsequent ordering of the elements in a sequence in descending order, according to a key.
			/// 	&#10;1 - thenByDescending(keySelector(element, index))
			/// 	&#10;2 - thenByDescending(keySelector(element, index), comparer(a, b))
			/// </summary>
			/// <param name="keySelector" type="Function|String">
			/// 	A function to extract a key from each element.
			/// </param>
			/// <returns type="Enumerable" />

			throw new NotImplementedError('Enumerable.thenByDescending()');
		};

		Enumerable.prototype.union = function (second, comparer) {
			/// <summary>
			/// 	Produces the set union of two sequences by using the default equality comparer.
			/// 	&#10;1 - union(second)
			/// 	&#10;2 - union(second, comparer(a, b))
			/// </summary>
			/// <param name="second" type="Enumerable|Array">
			/// 	An Enumerable or an Array whose distinct elements form the second set for the union.
			/// </param>
			/// <param name="comparer" type="Function" optional="true">
			/// 	A function that compares two values.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof second === 'undefined') { throw new ArgumentNullError('second'); }
			if (!(second instanceof Array)) { throw new ArgumentError('second'); }

			var secondArray = second instanceof Enumerable ? second.toArray() : second,
        		union = new Enumerable(this.toArray().concat(secondArray));

			return union.distinct(comparer);
		};

		Enumerable.prototype.where = function (predicate) {
			/// <summary>
			/// 	Filters a sequence of values based on a predicate. Each element's index is used in the logic of the predicate function.
			/// 	&#10;1 - where(predicate(element, index))
			/// </summary>
			/// <param name="predicate" type="Function|String">
			/// 	A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof predicate === 'undefined') { throw new ArgumentNullError('predicate'); }

			try {
				predicate = new LambdaExpressionParser(predicate);
			} catch (error) {
				throw new ArgumentError('predicate');
			}

			var where = new Enumerable();

			this.each(function (item, index) {
				if (predicate.apply(this, [this, index])) {
					where.push(this);
				}
			});

			return where;
		};

		Enumerable.prototype.zip = function (second, resultSelector) {
			/// <summary>
			/// 	Merges two sequences by using the specified predicate function.
			/// 	&#10;1 - zip(second, resultSelector(firstElement, secondElement))
			/// </summary>
			/// <param name="second" type="Enumerable|Array">
			/// 	The second sequence to merge.
			/// </param>
			/// <param name="resultSelector" type="Function|String">
			/// 	A function that specifies how to merge the elements from the two sequences.
			/// </param>
			/// <returns type="Enumerable" />

			if (typeof second === 'undefined') { throw new ArgumentNullError('second'); }
			if (!(second instanceof Array)) { throw new ArgumentError('second'); }
			if (typeof resultSelector === 'undefined') { throw new ArgumentNullError('resultSelector'); }

			var firstEnumerable = new Enumerable(this),
            	secondEnumerable = new Enumerable(second),
            	zipResult = new Enumerable();

			while (firstEnumerable.moveNext() && secondEnumerable.moveNext()) {
				zipResult.push(resultSelector.apply(firstEnumerable.getCurrent(), [firstEnumerable.getCurrent(), secondEnumerable.getCurrent()]));
			}

			return zipResult;
		};

		// Extensions to the Array Prototype
		// ---------------------------------

		if (typeof Array.prototype.toEnumerable === 'undefined') {
			Array.prototype.toEnumerable = function () {
				/// <summary>
				/// 	Returns an Enumerable object containing the values of the Array.
				/// </summary>
				/// <returns type="Enumerable" />

				return new Enumerable(this);
			}
		}


		// Debug Code
		//

		if (DEBUG) {

		}

		return Enumerable;

	})();

})(msharp);
/// <reference path="msharp.core.js" />
/// <reference path="msharp.module.enumerable.js" />

(function (msharp) {

	var Enumerable = msharp.require('msharp.Enumerable');

	// Create Object
	// -------------

	msharp.Grouping = (function () {

		// Inherit Enumerable
		// -----------------------

		msharp.inherit(Grouping, Enumerable);

		// Constructor
		// -----------

		function Grouping(key, group) {
			/// <summary>Represents a collection of objects that have a common key.</summary>
			/// <param name="key" type="Anything">The key of the Grouping.</param>
			/// <param name="group" type="Array">The values of the Grouping.</param>

			/// <field name="key" type="Anything">The key of the Grouping.</field>
			this.key = key;

			// Call the constructor of the base object.
			//
			Enumerable.call(this, group);
		};

		// Debug Code
		// ----------

		if (DEBUG) {

		}

		return Grouping;

	})();

})(msharp);
/// <reference path="msharp.core.js" />
/// <reference path="msharp.module.enumerable.js" />

(function (msharp) {

	var Enumerable = msharp.require('msharp.Enumerable');

	// Create Object
	// -------------

	var List = (function () {

		// Inherit Enumerable
		// ------------------

		msharp.inherit(List, Enumerable);

		// Constructor
		// -----------

		function List(collection) {
			/// <summary>Represents a list of objects that can be accessed by index. Provides methods to search, sort, and manipulate lists.</summary>
			/// <param name="collection" type="Enumerable|Array" optional="true">The collection whose elements are copied to the new list.</param>

			// Call the constructor of the base object.
			//
			Enumerable.call(this, collection);
		};

		// Public Static Methods
		// ---------------------

		List.isList = function (object) {
			/// <summary>Returns true if the object is or inherits from the List object.</summary>
			/// <param name="object" type="Object">The object to verify.</param>
			/// <returns type="Boolean" />

			return (object instanceof List);
		};

		// Public Methods
		// --------------

		List.prototype.add = function (item) {
			/// <summary>Adds an object to the end of the List.</summary>
			/// <param name="item" type="Object">The object to be added to the end of the List. The value can be null.</param>
			/// <returns type="Void" />

			if (typeof item === 'undefined') { throw new msharp.ArgumentNullError('item'); }

			this.push(item);
		};

		List.prototype.addRange = function (collection) {
			/// <summary>Adds the elements of the specified collection to the end of the List.</summary>
			/// <param name="collection" type="Enumerable|Array">The collection whose elements should be added to the end of the List. The collection itself cannot be null, but it can contain elements that are null.</param>
			/// <returns type="Void" />

			if (typeof collection === 'undefined') { throw new msharp.ArgumentNullError('collection'); }
			if (!(collection instanceof Array)) { throw new msharp.ArgumentError('collection'); }

			if (collection instanceof Array) {
				for (var i = 0; i < collection.length; i++) {
					this.add(collection[i]);
				}
			}
		};

		List.prototype.clear = function () {
			/// <summary>Removes all elements from the List.</summary>
			/// <returns type="Void" />

			this.length = 0;
		};

		List.prototype.remove = function (item, comparer) {
			/// <summary>Removes the first occurrence of a specific object from the List.</summary>
			/// <param name="item" type="Object">The object to remove from the List. The value can be null.</param>
			/// <param name="comparer" type="Function" optional="true">A function that compares two values.</param>
			/// <returns type="Boolean">true if item is successfully removed; otherwise, false. This method also returns false if item was not found in the List.</returns>

			if (typeof item === 'undefined') { throw new msharp.ArgumentNullError('item'); }

			var equals = comparer || msharp.isEqual;

			for (var i = 0; i < this.length; i++) {
				var obj = this[i];

				if (equals.call(obj, obj, item)) {
					this.splice(i, 1);

					return true;
				}
			}

			return false;
		};

		List.prototype.removeAll = function (match) {
			/// <summary>Removes all the elements that match the conditions defined by the specified predicate.</summary>
			/// <param name="match" type="Function">The Function delegate that defines the conditions of the elements to remove.</param>
			/// <returns type="Number">The number of elements removed from the List.</returns>

			if (typeof match === 'undefined') { throw new msharp.ArgumentNullError('match'); }
			if (typeof match !== 'function') { throw new msharp.ArgumentException('match'); }

			var removedCount = 0;
			var i, length = this.length - 1;

			for (i = length; i >= 0; i--) {
				if (!match.call(this[i], this[i])) {
					this.splice(i, 1);
					removedCount++;
				}
			}

			return removedCount;
		};

		List.prototype.removeAt = function (index) {
			/// <summary>Removes the element at the specified index of the List.</summary>
			/// <param name="index" type="Number">The zero-based index of the element to remove.</param>
			/// <returns type="Void" />

			if (typeof index === 'undefined') { throw new msharp.ArgumentNullError('index'); }
			if (typeof index !== 'number') { throw new msharp.ArgumentError('index'); }
			if (index < 0 || index > this.length - 1) { throw new msharp.ArgumentOutOfRangeError('index'); }

			this.splice(index, 1);
		};

		List.prototype.removeRange = function (index, count) {
			/// <summary>Removes the element at the specified index of the List.</summary>
			/// <param name="index" type="Number">The zero-based starting index of the range of elements to remove.</param>
			/// <param name="count" type="Number">The number of elements to remove.</param>
			/// <returns type="Void" />

			if (typeof index === 'undefined') { throw new msharp.ArgumentNullError('index'); }
			if (typeof index !== 'number') { throw new msharp.ArgumentError('index'); }
			if (typeof count === 'undefined') { throw new msharp.ArgumentNullError('count'); }
			if (typeof count !== 'number' || index + count > this.length) { throw new msharp.ArgumentError('count'); }
			if (index < 0 || index > this.length - 1) { throw new msharp.ArgumentOutOfRangeError('index'); }
			if (count < 0) { throw new msharp.ArgumentOutOfRangeError('count'); }

			this.splice(index, count);
		};

		// Extensions to the Array Prototype
		// ---------------------------------

		if (typeof Array.prototype.toList === 'undefined') {
			Array.prototype.toList = function () {
				/// <summary>Returns a List object containing the values of the Array.</summary>
				/// <returns type="List" />

				return new List(this);
			}
		}

		// Debug Code
		// ----------

		if (DEBUG) {

		}

		return List;

	})();

	// Export List
	// -----------

	msharp.List = List;

})(msharp);

} (this));