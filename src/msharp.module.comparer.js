/// <reference path="msharp.core.js" />

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