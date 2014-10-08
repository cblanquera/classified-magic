var assert 		= require('assert');
var classified 	= require('../magic');

//Sample Root Class
var Root = classified(function() {
	this.data = {};
	this.SOME_CONSTANT = 'foo';
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
		
		//protected
	this._sampleProperty = 5.5;
	this._sampleDeepProperty = {
		sample1: '_Hello',
		sample2: [8, 9, 0, 1]
	};
		
		//private
	this.__sampleProperty = 6.5;
	this.__sampleDeepProperty = {
		sample1: '__Hello',
		sample2: [12, 13, 14, 15]
	};
	
	this.___construct = function() {
		this.constructCalled = true;
	};
	
	this.sampleMethod = function() {
		return this.SOME_CONSTANT;
	};
	
	this._sampleMethod = function() {
		return '_bar';
	};
	
	this.__sampleMethod = function() {
		return '__zoo';
	};
	
	this.sampleAccessMethod = function() {
		return this.sampleMethod()
		+ this._sampleMethod()
		+ this.__sampleMethod();
	};
	
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

describe('Magic Test Suite', function() {
	describe('Basic Building Tests', function() {
		var root = Root.load();
		
		it('should call construct', function() {
			assert.equal(true, root.constructCalled);
		});
		
		it('should set new properties in data', function() {
			root.foo = 2;
			assert.equal(2, root.data.foo);
		});
		
		it('should retrieve properties in data', function() {
			assert.equal(2, root.foo);
			assert.equal(2, root['foo']);
		});
		
		it('should get defined properties just fine', function() {
			assert.equal(4.5, root.sampleProperty);
			assert.equal('Hello', root.sampleDeepProperty.sample1);
			assert.equal(5, root.sampleDeepProperty.sample2[1]);
			assert.equal(true, root.sampleDeepProperty.sample3.bool);
			assert.equal(true, root.sampleDeepProperty.sample3.regex instanceof RegExp);
			assert.equal(true, root.sampleDeepProperty.sample3.date instanceof Date);
			assert.equal(String, root.sampleDeepProperty.sample3.string);
		});
		
		it('should loop through data', function() {
			for(var key in root) {
				if(root.hasOwnProperty(key)) {
					assert.equal(2, root[key]);
				}
			}
		});
		
		it('should not be able to access protected', function() {
			assert.equal('undefined', typeof root._sampleProperty);
			assert.equal('undefined', typeof root._sampleDeepProperty);
			assert.equal('undefined', typeof root._sampleMethod);
		});
		
		it('should not be able to access private', function() {
			assert.equal('undefined', typeof root.__sampleProperty);
			assert.equal('undefined', typeof root.__sampleDeepProperty);
			assert.equal('undefined', typeof root.__sampleMethod);
		});
		
		it('should be able to access protected and private inside a method', function() {
			assert.equal('foo_bar__zoo', root.sampleAccessMethod());
		});
		
		it('should patrol constants', function() {
			root.SOME_CONSTANT = 'bar';
			assert.equal('foo', root.sampleMethod());
		});
		
		it('should only be one', function() {
			var single = classified({ x: 1 }).singleton();
			var multiple = classified({ x: 1 });
			
			single().x = 2;
			multiple().x = 3;
			
			assert(2, single().x);
			assert(1, multiple().x);
		});
	});
	
	describe('Inheritance Tests', function() {
		var root = Root.load();
		
		it('should set new properties in data', function() {
			var child = classified({ SOME_CONSTANT_2: 44.5 }).trait(Root.definition()).load();
			child.foo = 2;
			assert.equal(2, child.data.foo);
		});
		
		it('should retrieve properties in data', function() {
			var child = classified({ SOME_CONSTANT_2: 44.5 }).trait(Root.definition()).load();
			child.foo = 2;
			assert.equal(2, child.foo);
			assert.equal(2, child['foo']);
		});
		
		it('should loop through data', function() {
			var child = classified({ SOME_CONSTANT_2: 44.5 }).trait(Root.definition()).load();
			child.foo = 2;
			
			for(var key in child) {
				if(child.hasOwnProperty(key)) {
					assert.equal(2, child[key]);
				}
			}
		});
		
		it('should copy constants', function() {
			var child = classified({ SOME_CONSTANT_2: 44.5 }).trait(Root.definition()).load();
			assert.equal('foo', child.SOME_CONSTANT);
		});
		
		it('should call construct', function() {
			var child = Root.extend({}).load();
			assert.equal(true, child.constructCalled);
		});
		
		it('should be the same as root', function() {
			var child = Root.extend({}).load();
			assert.equal(child.sampleProperty, root.sampleProperty);
			assert.equal(child.sampleDeepProperty.sample1, root.sampleDeepProperty.sample1);
			assert.equal(child.sampleDeepProperty.sample2[1], root.sampleDeepProperty.sample2[1]);
			assert.equal(child.sampleDeepProperty.sample3.bool, root.sampleDeepProperty.sample3.bool);
			assert.equal(child.sampleDeepProperty.sample3.regex, root.sampleDeepProperty.sample3.regex);
			assert.equal(child.sampleDeepProperty.sample3.date, root.sampleDeepProperty.sample3.date);
			assert.equal(child.sampleDeepProperty.sample3.string, root.sampleDeepProperty.sample3.string);
		});
		
		it('should not change properties of root', function() {
			var child = classified({}).trait(Root.definition()).load();
			
			child.sampleProperty = 5.5;
			child.sampleDeepProperty.sample1 = 'hi';
			child.sampleDeepProperty.sample3.bool = false;
			
			assert.notEqual(child.sampleProperty, root.sampleProperty);
			assert.notEqual(child.sampleDeepProperty.sample1, root.sampleDeepProperty.sample1);
			assert.notEqual(child.sampleDeepProperty.sample3.bool, root.sampleDeepProperty.sample3.bool);
		});
		
		it('should be able to add properties', function() {
			var child = classified({
				childSample: 4
			}).trait(Root.definition()).load();
			
			child.sampleProperty = 5.5;
			child.sampleDeepProperty.sample1 = 'hi';
			child.sampleDeepProperty.sample3.bool = false;
			
			assert.equal(4, child.childSample);
			assert.equal('undefined', typeof root.childSample);
		});
		
		it('should be able access parent methods', function() {
			var child = classified({
				sampleMethod: function() {
					return this.___parent.sampleMethod()
				}
			}).trait(Root.definition()).load();
			
			assert.equal('foo', child.sampleMethod());
		});
		
		it('should be able access parent protected methods', function() {
			var child = Root.extend({
				sampleMethod: function() {
					return this.___parent._sampleMethod();
				}
			}).load();
			
			assert.equal('_bar', child.sampleMethod());
		});
		
		it('should not be able access parent private methods', function() {
			var child = classified({
				sampleMethod: function() {
					return typeof this.___parent.__sampleMethod;
				}
			}).trait(Root.definition()).load();
			
			assert.equal('undefined', child.sampleMethod());
		});
		
		it('should not be able to register and access root', function() {
			Root.register('rooty');
			
			var child = classified({
				sampleMethod: function() {
					return typeof this.___parent.__sampleMethod;
				}
			}).trait('rooty').load();
			
			assert.equal('undefined', child.sampleMethod());
		});
	});
});