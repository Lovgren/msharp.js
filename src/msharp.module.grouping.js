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