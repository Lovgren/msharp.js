/// <reference path="msharp.core.js" />

(function (msharp) {

    // Create Object
    // -------------

    var Enumerator = (function () {

        // Inherit Array
        // -------------

        msharp.inherit(Enumerator, Array);
        
        // Constructor
        // -----------
        
        function Enumerator (array) {
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

    // NOTE: This is not a polyfill. For use in broswers with JavaScript <1.7, implement your own polyfill.

    if (JSON) {
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