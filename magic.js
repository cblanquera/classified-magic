var classified 	= require('classified'),
	separator	= require('path').sep;

/* Definition
-------------------------------*/
var magic = function() {
	var method = function() {
		return method.load.apply(method, arguments);
	}, 
	
	singleton = false,
	
	instance = null,
	
	definition = classified();
	
	/**
	 * Defines the class
	 *
	 * @param function|object - if function, must return an object
	 * @return this
	 */
	method.define = function(prototype) {
		definition.define(prototype);
		return this;
	};
	
	/**
	 * Returns the full class definition
	 * including the protected and private
	 * properties
	 *
	 * @return object
	 */
	method.definition = function() {
		return definition.definition();
	};
	
	/**
	 * Returns all the parents of this definition
	 *
	 * @return array
	 */
	method.parents = function() {
		return definition.parents();
	};
	
	/**
	 * Adds a parent to be combined with the definition
	 *
	 * @param function|object - if function, will use prototype
	 * @return this
	 */
	method.trait = function(prototype) {
		//if prototype is a string
		if(typeof prototype === 'string') {
			//its a path to a file
			var path = _getCallerPath();
			
			//if we have a path
			if(path) {
				//require it
				prototype = require((path + separator + prototype)
				.replace(separator + separator, separator));
				
				if(typeof prototype.definition === 'function') {
					prototype = prototype.definition();
				}
			}
		}
		
		definition.trait(prototype);
		return this;
	};
	
	/**
	 * Creates a child definition
	 *
	 * @param function|object - if function, must return object
	 * @return function
	 */
	method.extend = function(prototype) {
		this.__isClassified__ = true;
		return magic().define(prototype).trait(this);
	};
	
	/**
	 * Returns the publically accessable
	 * class definition function
	 *
	 * @return function
	 */
	method.get = function() {
		return definition.get();
	};
	
	/**
	 * Returns class defined instantiation
	 *
	 * @return object
	 */
	method.load = function() {
		//if no instance or no singleton
		if(!instance || !singleton) {
			instance = _makeItMagic(this.get().load.apply(null, arguments));
		}
		
		return instance;
	};
	
	/**
	 * Registers this class for extend
	 *
	 * @param string
	 * @return this
	 */
	method.register = function(name) {
		definition.register(name);
		return this;
	};
	
	/**
	 * Sets loader to return a single instance
	 *
	 * @param bool
	 * @return this
	 */
	method.singleton = function(yes) {
		singleton = yes !== false;
		return this;
	};
	
	/* Private Methods
	-------------------------------*/
	var _getCallerPath = function() {
		var prepareStackTrace = Error.prepareStackTrace;
			
		Error.prepareStackTrace = function (_, stack) {
			return stack;
		};

		// Create a new `Error`, which automatically gets `stack`
		var error = new Error();

		// Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
		var stack = error.stack;

		// Restore original `Error.prepareStackTrace`
		Error.prepareStackTrace = prepareStackTrace;
		
		if(typeof stack[3] !== 'object' 
		|| typeof stack[3].receiver !== 'object' 
		|| typeof stack[3].receiver.filename !== 'string' ) {
			return false;
		}
		
		var pathArray = stack[3].receiver.filename.split('/');
		
		pathArray.pop();
		
		return pathArray.join('/');
	};
	
	var _isMagicBinded = function() {
		return arguments.callee.caller.arguments[1] === '__classifiedBinded__'
		|| arguments.callee.caller.caller.toString().indexOf('__classifiedBinded__') !== -1;
	};
	
	var _makeItMagic = function(instance) {
		//if no magic :(
		if(typeof instance.___get !== 'function'
		&& typeof instance.___set !== 'function'
		&& typeof instance.___enum !== 'function'
		&& typeof instance.___has !== 'function'
		&& typeof instance.___delete !== 'function'
		&& typeof instance.___fix !== 'function') {
			return instance;
		}
		
		// check if native Proxy is enabled
		if(typeof Proxy === 'undefined') {
			throw new Error(
				'Must have at least native proxy support by running ' + 
				'`node --harmony` or node -- harmony-proxies, or if ' +
				'using mocha run `mocha --harmony test`');
		}
		
		var magic = {};
		
		magic.getOwnPropertyDescriptor = function(name) {
			if(typeof instance.getOwnPropertyDescriptor === 'function') {
				return instance.getOwnPropertyDescriptor(instance, name);
			}

			var descriptor = Object.getOwnPropertyDescriptor(instance, name);
			
			if(typeof descriptor !== 'undefined') { 
				descriptor.configurable = true; 
			}

			return descriptor;
		};
		
		magic.getOwnPropertyNames = function () {
			return Object.getOwnPropertyNames(instance);
		};

		magic.get = function(receiver, name) {
			//if it exists
			if(typeof instance[name] !== 'undefined' 
			|| _isMagicBinded()
			|| name.indexOf('___') === 0) {
				return instance[name];
			}
			
			if(typeof instance.___get === 'function') {
				return instance.___get.call(instance, name);
			}
		};
		
		magic.set = function(receiver, name, value) {
			//if it exists
			if(typeof instance[name] !== 'undefined' 
			|| _isMagicBinded()
			|| name.indexOf('___') === 0) {
				instance[name] = value;
				return;
			}
			
			if(typeof instance.___set === 'function') {
				instance.___set.call(instance, name, value);
				return;
			}
			
			instance[name] = value;
		};
		
		magic.enumerate = function() {
			//if enum is set
			if(typeof instance.___enum === 'function') {
				return instance.___enum.call(instance);
			}
			
			return Object.keys(instance);
		};
		
		magic.has = function(name) {
			if(name.indexOf('___') === 0) {
				return instance.hasOwnProperty(name);
			}
			
			//if enum is set
			if(typeof instance.___has === 'function') {
				return instance.___has.call(instance, name);
			}
			
			return instance.hasOwnProperty(name);
		};
		
		magic.delete = function(name) {
			if(instance.hasOwnProperty(name) || name.indexOf('___') === 0) {
				delete instance[name];
				return;	
			}
			
			//if enum is set
			if(!_isMagicBinded() && typeof instance.___delete === 'function') {
				instance.___delete.call(instance, name);
			}
		};
		
		// check support for new Proxy
		if(typeof Proxy === 'object') {
			return Proxy.create(magic, instance);
		}
	
		return new Proxy(instance, magic);
	};
	
	return method;
};

/* Adaptor
-------------------------------*/
module.exports = function(definition) {
	definition = definition || {};
	return magic().define(definition);
};