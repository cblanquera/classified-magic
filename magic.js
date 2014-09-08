(function() {
	var classified = require('classified');
	
	if(typeof Proxy === 'undefined') {
		var Proxy = require('node-proxy');
	}
	
	/* Definition
	-------------------------------*/
	var magic = function() {
		var method = {}, definition = classified();
		
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
		method.extend = function(prototype) {
			//if prototype is a string
			if(typeof prototype === 'string') {
				//its a path to a file
				var path = _getCallerPath();
				
				//if we have a path
				if(path) {
					//require it
					prototype = require((path+'/'+prototype).replace('//', '/'));
				}
			}
			
			definition.extend(prototype);
			return this;
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
			return _makeItMagic(this.get().load.apply(null, arguments));
		};
		
		/* Private Methods
		-------------------------------*/
		var _getCallerPath = function() {
			var prepareStackTrace = Error.prepareStackTrace;
				
			Error.prepareStackTrace = function (_, stack) {
				return stack;
			}

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
			return arguments.callee.caller.caller.toString().indexOf('__classifiedBinded__') !== -1
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
			
			var magic = {};
			
			magic.get = function(receiver, name) {
				//if it exists
				if(typeof instance[name] !== 'undefined' || _isMagicBinded()) {
					return instance[name];
				}
				
				if(typeof instance.___get === 'function') {
					return instance.___get.call(instance, name);
				}
			};
			
			magic.set = function(receiver, name, value) {
				//if it exists
				if(typeof instance[name] !== 'undefined' || _isMagicBinded()) {
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
				//if enum is set
				if(typeof instance.___has === 'function') {
					return instance.___has.call(instance, name);
				}
				
				return Object.keys(instance);
			};
			
			magic.delete = function(name) {
				//if enum is set
				if(!_isMagicBinded() && typeof instance.___delete === 'function') {
					return instance.___delete.call(instance, name);
				}
				
				delete instance[name];
			};
			
			return Proxy.create(magic, instance);
		};
		
		return method;
	};
	
	/* Adaptor
	-------------------------------*/
	//if node
	if(typeof module === 'object' && module.exports) {
		module.exports = function(definition) {
			definition = definition || {};
			return magic().define(definition);
		};
	//if AMD
	} else if(typeof define === 'function') {
		define(function() {
			return function(definition) {
				definition = definition || {};
				return magic().define(definition);
			};
		});
	//how about jQuery?
	} else if(typeof jQuery === 'function' && typeof jQuery.extend === 'function') {
		jQuery.extend({
			magic: function(definition) {
				definition = definition || {};
				return magic().define(definition);
			}
		});
	} else if(typeof window === 'object') {
		window.magic = function(definition) {
			definition = definition || {};
			return magic().define(definition);
		}
	}
})();