/// <reference path="msharp.core.js" />
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