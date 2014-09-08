#Classified Magic

  OOP for NodeJS with magic. Inspired by [Classified](https://github.com/cblanquera/classified)

### Installation

```bash
$ npm install classified-magic
```

## Quick Start

```
var classified = require('classified-magic');

//root definition
var RootClass = classified(function() {
	var prototype = {
		//sample constants
		SOME_CONSTANT: 'foo',
		
		//sample public properties
		data: {},
		sampleProperty: 4.5,
		sampleDeepProperty: {
			sample1: 'Hello',
			sample2: [4, 5, 6, 7],
			sample3: {
				bool	: true,
				regex	: /^abc/,
				date	: new Date(),
				string	: String
			}
		},
		
		//sample protected properties
		_sampleProperty: 5.5,
		_sampleDeepProperty: {
			sample1: '_Hello',
			sample2: [8, 9, 0, 1]
		},
		
		//sample private properties
		__sampleProperty: 6.5,
		__sampleDeepProperty: {
			sample1: '__Hello',
			sample2: [12, 13, 14, 15]
		}
	};
	
	//sample constructor
	prototype.___construct = function() {
		this.constructCalled = true;
	};
	
	//sample public method
	prototype.sampleMethod = function() {
		return this.SOME_CONSTANT;
	};
	
	//sample protected method
	prototype._sampleMethod = function() {
		return '_bar';
	};
	
	//sample private method
	prototype.__sampleMethod = function() {
		return '__zoo';
	};
	
	prototype.sampleAccessMethod = function() {
		return this.sampleMethod()
		+ this._sampleMethod()
		+ this.__sampleMethod();
	};
	
	//sample magic methods
	prototype.___get = function(name) {
		return this.data[name];
	};
	
	prototype.___set = function(name, value) {
		this.data[name] = value;
	};
	
	prototype.___enum = function() {
		return Object.keys(this.data);
	};
	
	prototype.___has = function(name, value) {
		return this.data.hasOwnProperty(name);
	};
	
	prototype.___delete = function(name) {
		delete this.data[name];
	};
	
	return prototype;
});

//sample child definition
//you can use object or function as the definition
var ChildClass = classified(function() {
	var prototype = {};
	
	//sample constants
	prototype.SOME_CONSTANT_2 = 'bar';
	
	//sample protected properties
	prototype._sampleProperty = 7.5;
	
	//sample public methods
	prototype.sampleMethod = function() {
		return this._sampleMethod();
	};
	
	//sample protected methods
	prototype._sampleMethod = function() {
		return this.___parent._sampleMethod();
	};
	
	return prototype;
}).extend(RootClass.definition());

//instantiate child
var child = ChildClass.load();

//test it
console.log(child.sampleMethod()); //--> foo7.5

try {
	child._sampleMethod();
} catch(e) {
	console.log('Protected call did not work');
}

//test magic
child.foo = 4;

console.log(child.data.foo);
```

### Features

  * Public, Private, Protected
  * Constants
  * Inheritance
  * Works on server or client
  * Magic methods - get, set and iterators

### Methods

  * define(object|function) - Defines the class
  * extend(object|function) - Adds a parent to be combined with the definition
  * definition() - Returns the entire definition including the protected and private properties
  * parents() - Returns direct parents of this definition
  * get() - Returns the publically accessable class definition function
  * load() - Returns class defined instantiation

### What's up with the underscores?

  * _ - protected properties and methods
  * __ - private properties and methods
  * ___ - Magic placeholder
