/// <reference path="msharp.core.js" />

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

})(msharp);