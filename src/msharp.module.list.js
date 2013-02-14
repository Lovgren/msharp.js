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
