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
	//sample constants
	this.SOME_CONSTANT = 'foo';
	
	//sample public properties
	this.data = {};
	
	this.sampleProperty = 4.5;
	
	this.sampleDeepProperty = {
		sample1: 'Hello',
		sample2: [4, 5, 6, 7],
		sample3: {
			bool	: true,
			regex	: /^abc/,
			date	: new Date(),
			string	: String
		}
	};
	
	//sample protected properties
	this._sampleProperty = 5.5;
	
	this._sampleDeepProperty = {
		sample1: '_Hello',
		sample2: [8, 9, 0, 1]
	};
	
	//sample private properties
	this.__sampleProperty = 6.5;
	
	this.__sampleDeepProperty = {
		sample1: '__Hello',
		sample2: [12, 13, 14, 15]
	};
	
	//sample constructor
	this.___construct = function() {
		this.constructCalled = true;
	};
	
	//sample public method
	this.sampleMethod = function() {
		return this._sampleMethod();
	};
	
	//sample protected method
	this._sampleMethod = function() {
		return this.__sampleMethod();
	};
	
	//sample private method
	this.__sampleMethod = function() {
		return this.SOME_CONSTANT + this._sampleProperty;
	};
	
	this.sampleAccessMethod = function() {
		return this.sampleMethod()
		+ this._sampleMethod()
		+ this.__sampleMethod();
	};
	
	//sample magic methods
	this.___get = function(name) {
		return this.data[name];
	};
	
	this.___set = function(name, value) {
		this.data[name] = value;
	};
	
	this.___enum = function() {
		return Object.keys(this.data);
	};
	
	this.___has = function(name, value) {
		return this.data.hasOwnProperty(name);
	};
	
	this.___delete = function(name) {
		delete this.data[name];
	};
});

//sample child definition
//you can use object or function as the definition
var ChildClass = RootClass.extend(function() {
	//sample constants
	this.SOME_CONSTANT_2 = 'bar';
	
	//sample protected properties
	this._sampleProperty = 7.5;
	
	//sample public methods
	this.sampleMethod = function() {
		return this._sampleMethod();
	};
	
	//sample protected methods
	this._sampleMethod = function() {
		return this.___parent._sampleMethod();
	};
});

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
  * register(string) - saves a state of the definition which can be recalled in trait
  * trait(string|function|object) - will setup the provided as a parent, if string will recall from registry

### What's up with the underscores?

  * _ - protected properties and methods
  * __ - private properties and methods
  * ___ - Magic placeholder
