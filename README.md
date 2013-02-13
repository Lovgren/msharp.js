# msharp.js

msharp.js is a .NET inspired JavaScript library. It's main feature 
is the Enumerable object, which utilises a JavaScript Array and 
extends it with LINQ like extension methods taking anonymous functions
AND Lambda expressions as parameters.

## Setting it up

Get the .js file from the dist project and include it in your 
project. msharp.js has no dependencies so it's good to go.

Add a script reference right before your closing body tag.

````
<script src="msharp.min.js"></script>
````

## Core Methods

### msharp.each

Iterates an array for array elements or an object for properties.
Executes a provided callback function once per array element or object property.

#### Syntax

````
msharp.each(object, callback, thisArg)
````

#### Parameters

##### object
The object or array to iterate.

##### callback
Function to execute for each element.
````
callback(item: any, index: number)
callback(item: any, propertyName: string)
````

##### thisArg
Object to use as this when executing callback.

### msharp.equals

Compares the values of two objects and decides whether they are equal or not.

####Syntax

````
msharp.equals(object1, object2)
````

#### Parameters

##### object1
An object to be compared.

##### object2
The object to compare against.