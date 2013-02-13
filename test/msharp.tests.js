/// <reference path="http://code.jquery.com/qunit/qunit-1.10.0.js" />

(function () {

	// Create a sample array to use for testing
    // ----------------------------------------
	
	var johnWayne = { id: 1, firstName: 'John', lastName: 'Wayne', city: 'Winterset, IA', birthdate: new Date(1907, 4, 26), numbers: [{ type: 'home', number: '111-1234' }, { type: 'cell', number: '111-4321' }] };
	var frankSinatra = { id: 2, firstName: 'Frank', lastName: 'Sinatra', city: 'Hoboken, NJ', birthdate: new Date(1915, 11, 12), numbers: [{ type: 'home', number: '222-1234' }, { type: 'cell', number: '222-4321' }] };
	var katharineHepburn = { id: 3, firstName: 'Katharine', lastName: 'Hepburn', city: 'Hartford, CT', birthdate: new Date(1907, 4, 12), numbers: [{ type: 'work', number: '333-1234' }] };
	var humphreyBogart = { id: 4, firstName: 'Humphrey', lastName: 'Bogart', city: 'New York City, NY', birthdate: new Date(1899, 11, 25), numbers: [{ type: 'home', number: '444-1234' }, { type: 'fax', number: '444-4321' }] };
	var marilynMonroe = { id: 5, firstName: 'Marilyn', lastName: 'Monroe', city: 'Los Angeles, CA', birthdate: new Date(1926, 5, 1), numbers: [{ type: 'home', number: '555-1234' }, { type: 'office', number: '555-4321' }] };
	var samples = [johnWayne, frankSinatra, katharineHepburn, humphreyBogart, marilynMonroe];
	
	// Create an Enumerable from the Sample Array
	// ------------------------------------------
	
	var e = samples.toEnumerable();
	
	// Create references to some of the required namespaces
	// ----------------------------------------------------
	
	var Enumerable = msharp.Enumerable;
	
	// Begin Test Cases
	// ----------------
	
	module('msharp.Enumerable (Static Methods)');
	
	test('empty()', function () {
		ok(Enumerable.empty() instanceof Enumerable, 'empty() returns an object of expected type.');
		equal(Enumerable.empty().count(), 0, 'empty() returns expected result.');
	})
	
	test('isEnumerable(object)', function () {
		equal(Enumerable.isEnumerable(samples), false, 'isEnumerable on a non-enumerable object returns expected value.');
		equal(Enumerable.isEnumerable(e), true, 'isEnumerable on an enumerable object returns expected value.'); 
	});
	
	test('range(start, count)', function () { 
		throws(function () { Enumerable.range(0, -1); }, msharp.ArgumentOutOfRangeError, 'range(start, count) throws when count is a negative number.');
		deepEqual(Enumerable.range(-3, 5).toArray(), [-3, -2, -1, 0, 1], 'range(start, count) returns expected result.');
	});
	
	test('repeat(element, count)', function () {
		throws(function () { Enumerable.repeat(); }, msharp.ArgumentNullError, 'Arguments are required.');
		throws(function () { Enumerable.repeat(undefined, 3); }, msharp.ArgumentNullError, 'Argument element is required.');
		throws(function () { Enumerable.repeat('foo'); }, msharp.ArgumentNullError, 'Argument count is required.');
		throws(function () { Enumerable.repeat('foo', -1); }, msharp.ArgumentOutOfRangeError, 'repeat(element, count) throws when count is a negative number.');
		deepEqual(Enumerable.repeat('hej', 4).toArray(), ['hej', 'hej', 'hej', 'hej'], 'repeat(element, count) returns expected result.'); 
	});
	
	module('msharp.Enumerable (Instance Methods)');
	
	test('contains(value, comparer)', function () {
		throws(function () { e.contains(); }, msharp.ArgumentNullError, 'Argument value is required.');
	    equal(e.contains(marilynMonroe), true, 'contains(value) returns expected result.');
	    equal(e.contains({}), false, 'contains(value) returns expected result.');
	    equal(new Enumerable([0, '', null]).contains(false, function (a, b) { return a == b}), true, 'contains(value, comparer) with non-strict comparer returns expected result.');
	    equal(new Enumerable([0, '', null]).contains(false, function (a, b) { return a === b}), false, 'contains(value, comparer) with strict comparer returns expected result.');
	});
	
	test('count(predicate)', function () {
	    equal(e.count(), 5, 'count() returns expected result.');
	    equal(e.count('x => x.id > 3'), 2, 'count(predicate:string) returns expected result.');
	    equal(e.count(function (obj) { return obj.id > 2; }), 3, 'count(predicate:function(element)) returns expected result.');
	});
	
	test('distinct(comparer)', function () {
		var duplicates = new Enumerable([1, 1, 2, 3, 4, 4, 5]);
		var expected = [1, 2, 3, 4, 5];
		var duplicatesMixed = new Enumerable([1, '1', 2, 3, 4, '4', 5]);
		
		deepEqual(duplicates.distinct().toArray(), expected, 'distinct() returns expected result.');
		deepEqual(duplicates.distinct(function (x, y) { return x === y; }).toArray(), expected, 'distinct(comparer) returns expected result.');
		deepEqual(duplicatesMixed.distinct(function (x, y) { return parseInt(x, 10) == parseInt(y, 10); }).toArray(), expected, 'distinct(comparer) returns expected result.');
	});
	
	test('elementAt(index)', function () {
		throws(function () { e.elementAt(); }, msharp.ArgumentNullError, 'Argument index is required.');
		throws(function () { e.elementAt(-1); }, msharp.ArgumentOutOfRangeError, 'elementAt(index) throws when index is a negative number.');
	    throws(function () { e.elementAt(10); }, msharp.ArgumentOutOfRangeError, 'elementAt(index) throws when index is out of range.');
	    throws(function () { e.elementAt('1'); }, msharp.ArgumentError, 'elementAt(index) throws when index is not a number.');
	    //equal(e.elementAt(new Number(3)), humphreyBogart, 'elementAt(index) returns expected result.');
	    equal(e.elementAt(3), humphreyBogart, 'elementAt(index) returns expected result.');
	});
	
	test('elementAtOrDefault(index, defaultValue)', function () {
		var defaultValue = { foo: 'bar' };
		
		throws(function () { e.elementAtOrDefault(); }, msharp.ArgumentNullError, 'Argument index is required.');
		throws(function () { e.elementAtOrDefault(3); }, msharp.ArgumentNullError, 'Argument defaultValue is required.');
	    equal(e.elementAtOrDefault(3, defaultValue), humphreyBogart, 'elementAtOrDefault(index, defaultValue) returns expected result.');
	    equal(e.elementAtOrDefault(10, defaultValue), defaultValue, 'elementAtOrDefault(index, defaultValue) returns expected result when index is out of range.');
	});
	
	test('except(second)', function () {
	    var array = [johnWayne, frankSinatra, humphreyBogart, marilynMonroe];
	    var enumerable = new Enumerable(array);
	     
	    throws(function () { e.except(); }, msharp.ArgumentNullError, 'Argument second is required.');
	    throws(function () { e.except({}); }, msharp.ArgumentError, 'Argument second of the correct type is required.');
	    deepEqual(e.except(array).toArray(), [katharineHepburn], 'except(second:array) returns expected result.');
	    deepEqual(e.except(enumerable).toArray(), [katharineHepburn], 'except(second:enumerable) returns expected result.');
	});
	
	test('first(predicate)', function () {
		throws(function () { e.first({}); }, msharp.ArgumentError, 'Argument predicate of the correct type is required.');
	    throws(function () { new Enumerable().first(); }, msharp.NoElementsError, 'first(predicate) throws when there are no elements.');
	    throws(function () { e.first('x => false') }, msharp.NoMatchError, 'first(predicate) returns expected result.');
	    equal(e.first(), johnWayne, 'first() returns expected result.');
	    equal(e.first(function (x) { return x.birthdate.getFullYear() >= 1915; }), frankSinatra, 'first(predicate:function(element)) returns expected result.');
	    equal(e.first(function () { return this.birthdate.getFullYear() >= 1915; }), frankSinatra, 'first(predicate:function(this)) returns expected result.');
	    equal(e.first('x => x.birthdate.getFullYear() >= 1915'), frankSinatra, 'first(predicate:string) returns expected result.');
	});
	
	test('firstOrDefault(predicate, defaultValue)', function () {
	    var defaultValue = { test: true };
	    var falsePredicate = function () { return false; };
	    
	    throws(function () { new Enumerable().firstOrDefault(); }, msharp.ArgumentNullError, 'Argument defaultValue is required.');
	    equal(e.firstOrDefault(defaultValue), johnWayne, 'firstOrDefault(defaultValue) returns expected result.');
	    equal(new Enumerable().firstOrDefault(defaultValue), defaultValue, 'firstOrDefault(defaultValue) returns expected result when there are no elements.');
	    equal(e.firstOrDefault('x => x.birthdate.getFullYear() >= 1915', defaultValue), frankSinatra, 'firstOrDefault(predicate:string, defaultValue) returns expected result.');
	    equal(e.firstOrDefault(function (x) { return x.birthdate.getFullYear() >= 1915; }, defaultValue), frankSinatra, 'firstOrDefault(predicate:function(element), defaultValue) returns expected result.');
	    equal(e.firstOrDefault(falsePredicate, defaultValue), defaultValue, 'firstOrDefault(predicate:function(element), defaultValue) returns expected result with a falsy predicate.');
	    equal(new Enumerable().firstOrDefault(falsePredicate), falsePredicate, 'firstOrDefault(defaultValue:function()) returns expected result when defaultValue is a predicate.');
	});
	
	test('groupBy(keySelector, elementSelector)', function () {
		
	    throws(function () { e.groupBy(); }, msharp.ArgumentNullError, 'Argument keySelector is required.');
	    throws(function () { e.groupBy(5); }, msharp.ArgumentException, 'Argument keySelector of the correct type is required.');
	    throws(function () { e.groupBy(function (x) { return x.birthdate.getYear().toString(); }, 5); }, msharp.ArgumentNullException, 'Argument elementSelector of the correct type is required.');
	   
	    ok((function () { 
	    	var result = e.groupBy(function (x) { return x.birthdate.getYear().toString(); });
	    	return result instanceof msharp.Enumerable && result.elementAt(0) instanceof msharp.Grouping; 
		})(), 'groupBy(keySelector:function) returns object of expected type.');
	
	    ok((function () { 
	    	var result = e.groupBy('x => x.birthdate.getYear().toString()');
	    	return result instanceof msharp.Enumerable && result.elementAt(0) instanceof msharp.Grouping; 
		})(), 'groupBy(keySelector:string) returns object of expected type.');
	    
	    ok((function () {
	    	var result = e.groupBy(function (x) { return x.birthdate.getFullYear().toString(); });
	    	
	    	return result.length === 4
	    		&& result.elementAt(0).key === '1907'
				&& result.elementAt(0).length === 2
				&& result.elementAt(0).elementAt(0) === johnWayne
				&& result.elementAt(1).length === 1
				&& result.elementAt(2).length === 1
				&& result.elementAt(3).length === 1;
	    })(), 'groupBy(keySelector:function) returns expected result.');
	
	    ok((function () {
	    	var result = e.groupBy(function (x) { return x.birthdate.getFullYear().toString(); }, function (x) { return x.firstName; });
	    	
	    	return result.length === 4
	    		&& result.elementAt(0).key === '1907'
				&& result.elementAt(0).length === 2
				&& result.elementAt(0).elementAt(0) === johnWayne.firstName
				&& result.elementAt(1).length === 1
				&& result.elementAt(2).length === 1
				&& result.elementAt(3).length === 1;
	    })(), 'groupBy(keySelector:function, elementSelector:function) returns expected result.');
	});
	
	test('indexOf(value, comparer)', function () {
	    throws(function () { e.indexOf(); }, msharp.ArgumentNullError, 'Argument value is required.');
	    equal(e.indexOf({}), -1, 'indexOf(value) returns expected result.');
	    equal(e.indexOf(katharineHepburn), 2, 'indexOf(value) returns expected result.');
	    equal(e.indexOf({}, function (a, b) { return a === b; }), -1, 'indexOf(value, comparer) returns expected result.');
	    equal(e.indexOf(katharineHepburn, function (a, b) { return a === b; }), 2, 'indexOf(value, comparer) returns expected result.');
	});
	
	test('last(predicate)', function () {
	    equal(e.last(), marilynMonroe, 'last() returns expected result.');
	    equal(e.last('x => x.birthdate.getMonth() > 6'), humphreyBogart, 'last(predicate:string) returns expected result.');
	    equal(e.last(function (x) { return x.birthdate.getMonth() > 6; }), humphreyBogart, 'last(predicate:function) returns expected result.');
	    equal(e.last(function () { return this.birthdate.getMonth() > 6; }), humphreyBogart, 'last(predicate:function) returns expected result.');
	});
	
	test('lastOrDefault(predicate, defaultValue)', function () {
	    var defaultValue = { a: 1 };
	
	    throws(function () { e.lastOrDefault(); }, msharp.ArgumentNullException, 'Argument defaultValue is required.');
	    equal(e.lastOrDefault(defaultValue), marilynMonroe, 'lastOrDefault(defaultValue) returns expected result.');
	    equal(e.lastOrDefault('x => false', defaultValue), defaultValue, 'lastOrDefault(predicate:string, defaultValue) returns expected result.');
	    equal(e.lastOrDefault('x => x.birthdate.getFullYear() === 1907', defaultValue), katharineHepburn, 'lastOrDefault(predicate:string, defaultValue) returns expected result.');
	    equal(e.lastOrDefault(function (x) { return false; }, defaultValue), defaultValue, 'lastOrDefault(predicate:function, defaultValue) returns expected result.');
	    equal(e.lastOrDefault(function (x) { return x.birthdate.getFullYear() === 1907; }, defaultValue), katharineHepburn, 'lastOrDefault(predicate:function, defaultValue) returns expected result.');
	    equal([].toEnumerable().lastOrDefault(function (x) { return true; }, defaultValue), defaultValue, 'lastOrDefault(predicate:function, defaultValue) on empty Enumerable returns expected result.');
	});
	
	test('max(selector)', function () {
	    throws(function () { e.max(); }, msharp.Enumerable.IncompatibleElementTypesError, 'max() throws if not all elements are of type Number.');
	    throws(function () { [].toEnumerable().max(); }, msharp.Enumerable.NoElementsError, 'max() throws if there are no elements.');
	    equal(e.max('x => x.birthdate.getFullYear()'), 1926, 'max(selector:string) returns expected result.');
	    equal(e.max(function (x) { return x.birthdate.getFullYear(); }), 1926, 'max(selector:function) returns expected result.');
	});
	
	test('min(selector)', function () { 
	    throws(function () { e.min(); }, msharp.Enumerable.IncompatibleElementTypesError, 'min() throws if not all elements are of type Number.');
	    throws(function () { [].toEnumerable().min(); }, msharp.Enumerable.NoElementsError, 'min() throws if there are no elements.');
	    equal(e.min('x => x.birthdate.getFullYear()'), 1899, 'min(selector:string) returns expected result.');
	    equal(e.min(function (x) { return x.birthdate.getFullYear(); }), 1899, 'min(selector:function) returns expected result.');
	});
	
	test('ofType(type)', function () {
	    function testType(value) {
	        this.value = value;
	    }
	
	    var types = [1, 2, 'a', 'b', new testType(1), new testType(2), new testType(3), true, false, /s/, /s/];
	    var typesEnum = new msharp.Enumerable(types);
	
	    throws(function () { e.ofType(); }, msharp.ArgumentNullError, 'Argument type is required.');
	    throws(function () { e.ofType({}); }, msharp.ArgumentError, 'Argument type of the correct type is required.');
	    equal(typesEnum.ofType('string')[0] + typesEnum.ofType('string')[1], 'ab', 'ofType(type:string) returns expected result.');
	    equal(typesEnum.ofType('testType').length, 3, 'ofType(type:string) returns expected result.');
	    equal(typesEnum.ofType('boolean')[0].toString() + typesEnum.ofType('boolean')[1].toString(), 'truefalse', 'ofType(type:string) returns expected result.');
	    equal(typesEnum.ofType('regexp')[0].toString() + typesEnum.ofType('regexp')[1].toString(), '/s//s/', 'ofType(type:string) returns expected result.');
	    equal(typesEnum.ofType(testType)[0].value + typesEnum.ofType(testType)[1].value, 3, 'ofType(type:function) returns expected result.');
	});
	
	test('orderBy(keySelector, comparer)', function () {
		var differentTypes = new Enumerable([4, 3, '2', '1']);
		var numbers = new Enumerable([0, 4, 2, 8, 6, 1, 3, 5, 7, 9]);
		var strings = new Enumerable(['b', 'a', 'd', 'c', 'f', 'g', 'e']);
		var dates = new Enumerable([new Date(2001, 2, 4), new Date(2000, 4, 2)]);
		var customCompare = function (a, b) {
			return a.numbers.length - b.numbers.length;
		};
		
		throws(function () { differentTypes.orderBy(); }, Error, 'orderBy() throws if not all elements are of same type.');
		ok(function () { differentTypes.orderBy(null, function (a, b) { return 0; }); return true; }, 'orderBy(null, comparer) does not throw when not all elements are of the same type.');
		deepEqual(numbers.orderBy().toArray(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'orderBy() returns expected result.');
		deepEqual(strings.orderBy().toArray(), ['a', 'b', 'c', 'd', 'e', 'f', 'g'], 'orderBy() returns expected result.');
		deepEqual(dates.orderBy().toArray(), [new Date(2000, 4, 2), new Date(2001, 2, 4)], 'orderBy() returns expected result.');
		deepEqual(e.orderBy(function (item) { return item.lastName; }).toArray(), [humphreyBogart, katharineHepburn, marilynMonroe, frankSinatra, johnWayne], 'orderBy(keySelector) returns expected result.');
		deepEqual(e.orderBy(undefined, customCompare).toArray(), [katharineHepburn, johnWayne, frankSinatra, humphreyBogart, marilynMonroe], 'orderBy(keySelector, comparer) returns expected result.');
	});
	
	test('orderByDescending(keySelector, comparer)', function () { 
		var differentTypes = new Enumerable([4, 3, '2', '1']);
		var numbers = new Enumerable([0, 4, 2, 8, 6, 1, 3, 5, 7, 9]);
		var strings = new Enumerable(['b', 'a', 'd', 'c', 'f', 'g', 'e']);
		var dates = new Enumerable([new Date(2001, 2, 4), new Date(2000, 4, 2)]);
		var customCompare = function (a, b) {
			return a.numbers.length - b.numbers.length;
		};
		
		throws(function () { differentTypes.orderByDescending(); }, Error, 'orderByDescending() throws if not all elements are of same type.');
		ok(function () { differentTypes.orderByDescending(null, function (a, b) { return 0; }); return true; }, 'orderByDescending(null, comparer) does not throw when not all elements are of the same type.');
		deepEqual(numbers.orderByDescending().toArray(), [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 'orderByDescending() returns expected result.');
		deepEqual(strings.orderByDescending().toArray(), ['g', 'f', 'e', 'd', 'c', 'b', 'a'], 'orderByDescending() returns expected result.');
		deepEqual(dates.orderByDescending().toArray(), [new Date(2001, 2, 4), new Date(2000, 4, 2)], 'orderByDescending() returns expected result.');
		deepEqual(e.orderByDescending(function (item) { return item.lastName; }).toArray(), [johnWayne, frankSinatra, marilynMonroe, katharineHepburn, humphreyBogart], 'orderByDescending(keySelector) returns expected result.');
		deepEqual(e.orderByDescending(undefined, customCompare).toArray(), [marilynMonroe, humphreyBogart, frankSinatra, johnWayne, katharineHepburn], 'orderByDescending(keySelector, comparer) returns expected result.');
	});
	
	test('reverse()', function () {
		deepEqual(e.reverse().toArray(), [marilynMonroe, humphreyBogart, katharineHepburn, frankSinatra, johnWayne], 'reverse() returns expected result.');
	});
	
	test('select(selector)', function () { 
		throws(function () { e.select(); }, msharp.ArgumentNullError, 'Argument selector is required.');
		throws(function () { e.select(0); }, msharp.ArgumentError, 'Argument selector of the correct type is required.');
		deepEqual(e.select('x => x.id').toArray(), [1, 2, 3, 4, 5], 'select(selector:string) returns expected result.');
		deepEqual(e.select(function () { return this.id; }).toArray(), [1, 2, 3, 4, 5], 'select(selector:function(this)) returns expected result.');
		deepEqual(e.select(function (x) { return x.id; }).toArray(), [1, 2, 3, 4, 5], 'select(selector:function(element, index)) returns expected result.');
	});
	
	test('selectMany(selector)', function () {
		var numbers =  johnWayne.numbers.concat(
							frankSinatra.numbers.concat(
								katharineHepburn.numbers.concat(
										humphreyBogart.numbers.concat(
												marilynMonroe.numbers
						))));
		throws(function () { e.selectMany(); }, msharp.ArgumentNullError, 'Argument selector is required.');
		deepEqual(e.selectMany('x => x.numbers').toArray(), numbers, 'selectMany(selector:string) returns expected result.');
		deepEqual(e.selectMany(function () { return this.numbers; }).toArray(), numbers, 'selectMany(selector:function(this)) returns expected result.');
		deepEqual(e.selectMany(function (x) { return x.numbers; }).toArray(), numbers, 'selectMany(selector:function(element, index)) returns expected result.');
	});
	
	test('single(predicate)', function () {
		var singleTestData = new Enumerable([1, 2, 3, 4]);
		
		// Without predicate
		throws(function () { [].toEnumerable().single(); }, msharp.NoElementsError, 'single() throws when there are no elements.');
		throws(function () { [0, 1].toEnumerable().single(); }, msharp.MoreThanOneElementError, 'single() throws when there are more than one element.');
		deepEqual(['123'].toEnumerable().single(), '123', 'single() returns expected result.');
		
		// With predicate
			// Function Selector
				throws(function () { singleTestData.single(function (x) { return x > 5; }); }, msharp.NoElementsError, 'single(predicate:function(element)) throws when there are no elements.');
				throws(function () { singleTestData.single(function (x) { return x > 1; }); }, msharp.Enumerable.MoreThanOneElementError, 'single(predicate:function(element)) throws when there are more than one element.');
				equal(singleTestData.single(function (x) { return x == 3; }), 3, 'single(predicate:function(element)) returns expected result.');
			// Lambda Selector
				throws(function () { singleTestData.single('x => x > 5'); }, msharp.NoElementsError, 'single(predicate:string) throws when there are no elements.');
				throws(function () { singleTestData.single('x => x > 1'); }, msharp.MoreThanOneElementError, 'single(predicate:string) throws when there are more than one element.');
				equal(singleTestData.single('x => x == 3'), 3, 'single(predicate:string) returns expected result.');
	});
	
	test('singleOrDefault(predicate, defaultValue)', function () {
		var defaultValue = { a: 1 };
		var emptyTestData = new Enumerable();
		var multipleTestData = new Enumerable([1, 2, 3, 4]);
		var singleTestData = new Enumerable([3]);
	
	    throws(function () { e.singleOrDefault(); }, msharp.ArgumentNullError, 'Argument defaultValue is required.');
	    equal(singleTestData.singleOrDefault(defaultValue), 3, 'singleOrDefault(defaultValue) returns expected result.');
	    equal(multipleTestData.singleOrDefault('x => x === 3', defaultValue), 3, 'singleOrDefault(predicate:string, defaultValue) returns expected result.');
	    equal(multipleTestData.singleOrDefault('x => x === 5', defaultValue), defaultValue, 'singleOrDefault(predicate:string, defaultValue) returns expected result.');
	    equal(emptyTestData.singleOrDefault(defaultValue), defaultValue, 'singleOrDefault(defaultValue) returns expected result.');
	    equal(emptyTestData.singleOrDefault('x => x === 4', defaultValue), defaultValue, 'singleOrDefault(predicate:string, defaultValue) returns expected result.');
	});
	
	test('skip(count)', function () {
		var multipleTestData = new Enumerable([1, 2, 3, 4]);
		
		throws(function () { multipleTestData.skip(); }, msharp.ArgumentNullError, 'Argument count is required.');
		throws(function () { multipleTestData.skip('3'); }, msharp.ArgumentError, 'Argument count of the correct type is required.');
		deepEqual(multipleTestData.skip(-3).toArray(), [1, 2, 3, 4], 'skip(count) returns expected result when count is a negative number.');
		deepEqual(multipleTestData.skip(2).toArray(), [3, 4], 'skip(count) returns expected result.');
	});
	
	test('skipWhile(predicate)', function () { 
		var multipleTestData = new Enumerable([1, 2, 3, 4]);
		
		throws(function () { multipleTestData.skipWhile(); }, msharp.ArgumentNullError, 'Argument predicate is required.');
		deepEqual(multipleTestData.skipWhile('x => x < 3').toArray(), [3, 4], 'skipWhile(predicate:string) returns expected result.');
		deepEqual(multipleTestData.skipWhile(function (x, i) { return i < 2; }).toArray(), [3, 4], 'skipWhile(predicate:function(element, index)) returns expected result.');
		deepEqual(multipleTestData.skipWhile(function (x, i) { return x < 2; }).toArray(), [2, 3, 4], 'skipWhile(predicate:function(element, index)) returns expected result.');
		deepEqual(multipleTestData.skipWhile(function () { return this < 2; }).toArray(), [2, 3, 4], 'skipWhile(predicate:function(this)) returns expected result.');
	});
	
	test('sum(selector)', function () {
		var emptyTestData = new Enumerable();
		var multipleTestData = new Enumerable([1, 2, 3, 4]);
		var multipleNumberObjectTestData = new Enumerable([new Number(1), new Number(2), new Number(3), new Number(4)]);
		var mixedTestData = new Enumerable([true, 2, '3', 4]);
		
		throws(function () { mixedTestData.sum(); }, msharp.IncompatibleElementsError, 'sum() throws when not all elements are numbers.');
		throws(function () { mixedTestData.sum('x => x'); }, msharp.IncompatibleElementsError, 'sum(predicate:string) throws when not all elements are numbers.');
		equal(emptyTestData.sum(), 0, 'sum() returns expected result when there are no elements.');
		equal(multipleTestData.sum(), 10, 'sum() returns expected result.');
		equal(multipleNumberObjectTestData.sum(), 10, 'sum() returns expected result.');
		equal(multipleTestData.sum('x => x + 1'), 14, 'sum(selector:string) returns expected result.');
		equal(multipleNumberObjectTestData.sum('x => x + 1'), 14, 'sum(selector:string) returns expected result.');
		equal(multipleTestData.sum(function (x) { return x + 1; }), 14, 'sum(selector:function(element)) returns expected result.');
		equal(multipleNumberObjectTestData.sum(function () { return this + 1; }), 14, 'sum(selector:function(this)) returns expected result.');
	});
	
	test('take(count)', function () {
		var multipleTestData = new Enumerable([1, 2, 3, 4]);
		
		throws(function () { multipleTestData.skip(); }, msharp.ArgumentNullError, 'Argument count is required.');
		throws(function () { multipleTestData.skip('3'); }, msharp.ArgumentError, 'Argument count of the correct type is required.');
		deepEqual(multipleTestData.skip(-3).toArray(), [1, 2, 3, 4], 'skip(count) returns expected result when count is a negative number.');
		deepEqual(multipleTestData.skip(2).toArray(), [3, 4], 'skip(count) returns expected result.');
	});
	test('takeWhile(predicate)', function () {
		var multipleTestData = new Enumerable([1, 2, 3, 4]);
		
		throws(function () { multipleTestData.takeWhile(); }, msharp.ArgumentNullError, 'Argument predicate is required.');
		deepEqual(multipleTestData.takeWhile('x => x < 3').toArray(), [1, 2], 'takeWhile(predicate:string) returns expected result.');
		deepEqual(multipleTestData.takeWhile(function (x, i) { return i < 2; }).toArray(), [1, 2], 'takeWhile(predicate:function(element, index)) returns expected result.');
		deepEqual(multipleTestData.takeWhile(function (x, i) { return x < 2; }).toArray(), [1], 'takeWhile(predicate:function(element, index)) returns expected result.');
		deepEqual(multipleTestData.takeWhile(function () { return this < 2; }).toArray(), [1], 'takeWhile(predicate:function(this)) returns expected result.');
	});
	
	//test('thenBy()', function () { });
	
	//test('thenByDescending()', function () { });
	
	test('toArray()', function () { 
		var multipleTestData = new Enumerable([1, 2, 3, 4]);
		
		// Returns Array
		equal(Object.prototype.toString.call(multipleTestData.toArray()), '[object Array]', 'toArray() returns an object of expected type.');
		deepEqual(multipleTestData.toArray(), [1, 2, 3, 4], 'toArray() returns expected result.');
	});
	
	test('union(second, comparer)', function () {
		var first = new Enumerable([5, 3, 9, 7, 5, 9, 3, 7]);
	    var second = [8, 3, 6, 4, 4, 9, 1, 0];
	    var expected = [5, 3, 9, 7, 8, 6, 4, 1, 0];
	    
	    throws(function () { first.union(); }, msharp.ArgumentNullError, 'Argument second is required.');
	    deepEqual(first.union(new Enumerable(second)).toArray(), expected, 'union(second:enumerable) returns expected result.');
	    deepEqual(first.union(second).toArray(), expected, 'union(second:array) returns expected result.');
	    
	    // TODO: Add tests using the comparer argument.
	});
	
	test('where(predicate)', function () {
		throws(function () { e.where(); }, msharp.ArgumentNullError, 'Argument predicate is required.');
		deepEqual(e.where('x => x.firstName === "John"').toArray(), [johnWayne], 'where(predicate:string) returns expected result.');
		deepEqual(e.where(function (x) { return x.firstName === 'Humphrey'; }).toArray(), [humphreyBogart], 'where(predicate:function(element)) returns expected result.');
		deepEqual(e.where(function (x,i) { return i === 1 || x.firstName === 'Marilyn'; }).toArray(), [frankSinatra, marilynMonroe], 'where(predicate:function(element, index) returns expected result.');
		deepEqual(e.where(function (x) { return this.firstName === 'Marilyn'; }).toArray(), [marilynMonroe], 'where(predicate:function(this)) returns expected result.');
	});
	
	test('zip(second, resultSelector)', function () { 
		var first = new Enumerable([1, 2, 3, 4]);
	    var second = ["one", "two", "three"];
	    var expected = ['1 one', '2 two', '3 three'];
	    
		throws(function () { first.zip(); }, msharp.ArgumentNullError, 'Argument second is required.');
		throws(function () { first.zip(second); }, msharp.ArgumentNullError, 'Argument resultSelector is required.');
		deepEqual(first.zip(second, function (x, y) { return x + ' ' + y; }).toArray(), expected, 'zip(second, resultSelector:function(firstElement, secondElement)) returns expected result.')
	});
	
	module('msharp.Enumerable (Extension Methods)');
	
	test('Array.toEnumerable()', function () {
		var testData = [1, 2, 3, 4];
		
		equal(testData.toEnumerable() instanceof msharp.Enumerable, true, 'toEnumerable() returns object of expected type.');
		deepEqual(testData.toEnumerable(), new Enumerable(testData), 'toEnumerable() returns expected result.');
	});

	module('msharp.Enumerator (Extension Methods)');

	test('JSON.stringify()', function () {
	    var testData = new Enumerable([1, 2, 3, 4]);

        equal(JSON.stringify(testData), '[1,2,3,4]', 'JSON.stringify() returns expected result.')
	});

})();