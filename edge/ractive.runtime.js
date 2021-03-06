/*
	Ractive.js v0.8.0-edge
	Thu Nov 05 2015 21:07:36 GMT+0000 (UTC) - commit 6a1ed1b2e4b5b67f483d4a0564a0fd28235bfa86

	http://ractivejs.org
	http://twitter.com/RactiveJS

	Released under the MIT License.
*/


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.Ractive = factory();
}(this, function () { 'use strict';

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

  /*global console, navigator */

  var win = typeof window !== 'undefined' ? window : null;
  var doc = win ? document : null;

  var isClient = !!doc;
  var isJsdom = typeof navigator !== 'undefined' && /jsDom/.test(navigator.appName);
  var hasConsole = typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function';

  var magicSupported = undefined;
  try {
  	Object.defineProperty({}, 'test', { value: 0 });
  	magicSupported = true;
  } catch (e) {
  	magicSupported = false;
  }

  var svg = doc ? doc.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1') : false;

  var vendors = ['o', 'ms', 'moz', 'webkit'];

  var defaults = {
  	// render placement:
  	el: void 0,
  	append: false,

  	// template:
  	template: null,

  	// parse:
  	preserveWhitespace: false,
  	sanitize: false,
  	stripComments: true,
  	delimiters: ['{{', '}}'],
  	tripleDelimiters: ['{{{', '}}}'],
  	staticDelimiters: ['[[', ']]'],
  	staticTripleDelimiters: ['[[[', ']]]'],
  	interpolate: false,

  	// data & binding:
  	data: {},
  	computed: {},
  	magic: false,
  	modifyArrays: true,
  	adapt: [],
  	isolated: false,
  	twoway: true,
  	lazy: false,

  	// transitions:
  	noIntro: false,
  	transitionsEnabled: true,
  	complete: void 0,

  	// css:
  	css: null,
  	noCssTransform: false
  };

  var refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
  var splitPattern = /([^\\](?:\\\\)*)\./;
  var escapeKeyPattern = /\\|\./g;
  var unescapeKeyPattern = /((?:\\)+)\1|\\(\.)/g;

  function escapeKey(key) {
  	if (typeof key === 'string') {
  		return key.replace(escapeKeyPattern, '\\$&');
  	}

  	return key;
  }

  function normalise(ref) {
  	return ref ? ref.replace(refPattern, '.$1') : '';
  }

  function splitKeypath(keypath) {
  	var parts = normalise(keypath).split(splitPattern),
  	    result = [];

  	for (var i = 0; i < parts.length; i += 2) {
  		result.push(parts[i] + (parts[i + 1] || ''));
  	}

  	return result;
  }

  function unescapeKey(key) {
  	if (typeof key === 'string') {
  		return key.replace(unescapeKeyPattern, '$1$2');
  	}

  	return key;
  }

  function noop () {}

  var alreadyWarned = {};
  var log;
  var printWarning;
  var welcome;
  if (hasConsole) {
  	(function () {
  		var welcomeIntro = ['%cRactive.js %c0.8.0-edge %cin debug mode, %cmore...', 'color: rgb(114, 157, 52); font-weight: normal;', 'color: rgb(85, 85, 85); font-weight: normal;', 'color: rgb(85, 85, 85); font-weight: normal;', 'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;'];
  		var welcomeMessage = 'You\'re running Ractive 0.8.0-edge in debug mode - messages will be printed to the console to help you fix problems and optimise your application.\n\nTo disable debug mode, add this line at the start of your app:\n  Ractive.DEBUG = false;\n\nTo disable debug mode when your app is minified, add this snippet:\n  Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});\n\nGet help and support:\n  http://docs.ractivejs.org\n  http://stackoverflow.com/questions/tagged/ractivejs\n  http://groups.google.com/forum/#!forum/ractive-js\n  http://twitter.com/ractivejs\n\nFound a bug? Raise an issue:\n  https://github.com/ractivejs/ractive/issues\n\n';

  		welcome = function () {
  			var hasGroup = !!console.groupCollapsed;
  			console[hasGroup ? 'groupCollapsed' : 'log'].apply(console, welcomeIntro);
  			console.log(welcomeMessage);
  			if (hasGroup) {
  				console.groupEnd(welcomeIntro);
  			}

  			welcome = noop;
  		};

  		printWarning = function (message, args) {
  			welcome();

  			// extract information about the instance this message pertains to, if applicable
  			if (typeof args[args.length - 1] === 'object') {
  				var options = args.pop();
  				var ractive = options ? options.ractive : null;

  				if (ractive) {
  					// if this is an instance of a component that we know the name of, add
  					// it to the message
  					var _name = undefined;
  					if (ractive.component && (_name = ractive.component.name)) {
  						message = '<' + _name + '> ' + message;
  					}

  					var node = undefined;
  					if (node = options.node || ractive.fragment && ractive.fragment.rendered && ractive.find('*')) {
  						args.push(node);
  					}
  				}
  			}

  			console.warn.apply(console, ['%cRactive.js: %c' + message, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);'].concat(args));
  		};

  		log = function () {
  			console.log.apply(console, arguments);
  		};
  	})();
  } else {
  	printWarning = log = welcome = noop;
  }

  function format(message, args) {
  	return message.replace(/%s/g, function () {
  		return args.shift();
  	});
  }

  function fatal(message) {
  	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
  		args[_key - 1] = arguments[_key];
  	}

  	message = format(message, args);
  	throw new Error(message);
  }

  function logIfDebug() {
  	if (Ractive.DEBUG) {
  		log.apply(null, arguments);
  	}
  }

  function warn(message) {
  	for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
  		args[_key2 - 1] = arguments[_key2];
  	}

  	message = format(message, args);
  	printWarning(message, args);
  }

  function warnOnce(message) {
  	for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
  		args[_key3 - 1] = arguments[_key3];
  	}

  	message = format(message, args);

  	if (alreadyWarned[message]) {
  		return;
  	}

  	alreadyWarned[message] = true;
  	printWarning(message, args);
  }

  function warnIfDebug() {
  	if (Ractive.DEBUG) {
  		warn.apply(null, arguments);
  	}
  }

  function warnOnceIfDebug() {
  	if (Ractive.DEBUG) {
  		warnOnce.apply(null, arguments);
  	}
  }

  // TODO: deprecate in future release
  var deprecations = {
  	construct: {
  		deprecated: 'beforeInit',
  		replacement: 'onconstruct'
  	},
  	render: {
  		deprecated: 'init',
  		message: 'The "init" method has been deprecated ' + 'and will likely be removed in a future release. ' + 'You can either use the "oninit" method which will fire ' + 'only once prior to, and regardless of, any eventual ractive ' + 'instance being rendered, or if you need to access the ' + 'rendered DOM, use "onrender" instead. ' + 'See http://docs.ractivejs.org/latest/migrating for more information.'
  	},
  	complete: {
  		deprecated: 'complete',
  		replacement: 'oncomplete'
  	}
  };

  var Hook = (function () {
  	function Hook(event) {
  		classCallCheck(this, Hook);

  		this.event = event;
  		this.method = 'on' + event;
  		this.deprecate = deprecations[event];
  	}

  	Hook.prototype.call = function call(method, ractive, arg) {
  		if (ractive[method]) {
  			arg ? ractive[method](arg) : ractive[method]();
  			return true;
  		}
  	};

  	Hook.prototype.fire = function fire(ractive, arg) {
  		this.call(this.method, ractive, arg);

  		// handle deprecations
  		if (!ractive[this.method] && this.deprecate && this.call(this.deprecate.deprecated, ractive, arg)) {
  			if (this.deprecate.message) {
  				warnIfDebug(this.deprecate.message);
  			} else {
  				warnIfDebug('The method "%s" has been deprecated in favor of "%s" and will likely be removed in a future release. See http://docs.ractivejs.org/latest/migrating for more information.', this.deprecate.deprecated, this.deprecate.replacement);
  			}
  		}

  		// TODO should probably use internal method, in case ractive.fire was overwritten
  		arg ? ractive.fire(this.event, arg) : ractive.fire(this.event);
  	};

  	return Hook;
  })();

  var toString = Object.prototype.toString;
  // thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/

  function isArray(thing) {
  	return toString.call(thing) === '[object Array]';
  }

  function isEqual(a, b) {
  	if (a === null && b === null) {
  		return true;
  	}

  	if (typeof a === 'object' || typeof b === 'object') {
  		return false;
  	}

  	return a === b;
  }

  // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric

  function isNumeric(thing) {
  	return !isNaN(parseFloat(thing)) && isFinite(thing);
  }

  function isObject(thing) {
  	return thing && toString.call(thing) === '[object Object]';
  }

  function addToArray(array, value) {
  	var index = array.indexOf(value);

  	if (index === -1) {
  		array.push(value);
  	}
  }

  function arrayContains(array, value) {
  	for (var i = 0, c = array.length; i < c; i++) {
  		if (array[i] == value) {
  			return true;
  		}
  	}

  	return false;
  }

  function arrayContentsMatch(a, b) {
  	var i;

  	if (!isArray(a) || !isArray(b)) {
  		return false;
  	}

  	if (a.length !== b.length) {
  		return false;
  	}

  	i = a.length;
  	while (i--) {
  		if (a[i] !== b[i]) {
  			return false;
  		}
  	}

  	return true;
  }

  function ensureArray(x) {
  	if (typeof x === 'string') {
  		return [x];
  	}

  	if (x === undefined) {
  		return [];
  	}

  	return x;
  }

  function lastItem(array) {
  	return array[array.length - 1];
  }

  function removeFromArray(array, member) {
  	if (!array) {
  		return;
  	}

  	var index = array.indexOf(member);

  	if (index !== -1) {
  		array.splice(index, 1);
  	}
  }

  function toArray(arrayLike) {
  	var array = [],
  	    i = arrayLike.length;
  	while (i--) {
  		array[i] = arrayLike[i];
  	}

  	return array;
  }

  var _Promise;
  var PENDING = {};
  var FULFILLED = {};
  var REJECTED = {};
  if (typeof Promise === 'function') {
  	// use native Promise
  	_Promise = Promise;
  } else {
  	_Promise = function (callback) {
  		var fulfilledHandlers = [],
  		    rejectedHandlers = [],
  		    state = PENDING,
  		    result,
  		    dispatchHandlers,
  		    makeResolver,
  		    fulfil,
  		    reject,
  		    promise;

  		makeResolver = function (newState) {
  			return function (value) {
  				if (state !== PENDING) {
  					return;
  				}

  				result = value;
  				state = newState;

  				dispatchHandlers = makeDispatcher(state === FULFILLED ? fulfilledHandlers : rejectedHandlers, result);

  				// dispatch onFulfilled and onRejected handlers asynchronously
  				wait(dispatchHandlers);
  			};
  		};

  		fulfil = makeResolver(FULFILLED);
  		reject = makeResolver(REJECTED);

  		try {
  			callback(fulfil, reject);
  		} catch (err) {
  			reject(err);
  		}

  		promise = {
  			// `then()` returns a Promise - 2.2.7
  			then: function (onFulfilled, onRejected) {
  				var promise2 = new _Promise(function (fulfil, reject) {

  					var processResolutionHandler = function (handler, handlers, forward) {

  						// 2.2.1.1
  						if (typeof handler === 'function') {
  							handlers.push(function (p1result) {
  								var x;

  								try {
  									x = handler(p1result);
  									resolve(promise2, x, fulfil, reject);
  								} catch (err) {
  									reject(err);
  								}
  							});
  						} else {
  							// Forward the result of promise1 to promise2, if resolution handlers
  							// are not given
  							handlers.push(forward);
  						}
  					};

  					// 2.2
  					processResolutionHandler(onFulfilled, fulfilledHandlers, fulfil);
  					processResolutionHandler(onRejected, rejectedHandlers, reject);

  					if (state !== PENDING) {
  						// If the promise has resolved already, dispatch the appropriate handlers asynchronously
  						wait(dispatchHandlers);
  					}
  				});

  				return promise2;
  			}
  		};

  		promise['catch'] = function (onRejected) {
  			return this.then(null, onRejected);
  		};

  		return promise;
  	};

  	_Promise.all = function (promises) {
  		return new _Promise(function (fulfil, reject) {
  			var result = [],
  			    pending,
  			    i,
  			    processPromise;

  			if (!promises.length) {
  				fulfil(result);
  				return;
  			}

  			processPromise = function (promise, i) {
  				if (promise && typeof promise.then === 'function') {
  					promise.then(function (value) {
  						result[i] = value;
  						--pending || fulfil(result);
  					}, reject);
  				} else {
  					result[i] = promise;
  					--pending || fulfil(result);
  				}
  			};

  			pending = i = promises.length;
  			while (i--) {
  				processPromise(promises[i], i);
  			}
  		});
  	};

  	_Promise.resolve = function (value) {
  		return new _Promise(function (fulfil) {
  			fulfil(value);
  		});
  	};

  	_Promise.reject = function (reason) {
  		return new _Promise(function (fulfil, reject) {
  			reject(reason);
  		});
  	};
  }

  var Promise$1 = _Promise;

  // TODO use MutationObservers or something to simulate setImmediate
  function wait(callback) {
  	setTimeout(callback, 0);
  }

  function makeDispatcher(handlers, result) {
  	return function () {
  		var handler;

  		while (handler = handlers.shift()) {
  			handler(result);
  		}
  	};
  }

  function resolve(promise, x, fulfil, reject) {
  	// Promise Resolution Procedure
  	var then;

  	// 2.3.1
  	if (x === promise) {
  		throw new TypeError('A promise\'s fulfillment handler cannot return the same promise');
  	}

  	// 2.3.2
  	if (x instanceof _Promise) {
  		x.then(fulfil, reject);
  	}

  	// 2.3.3
  	else if (x && (typeof x === 'object' || typeof x === 'function')) {
  			try {
  				then = x.then; // 2.3.3.1
  			} catch (e) {
  				reject(e); // 2.3.3.2
  				return;
  			}

  			// 2.3.3.3
  			if (typeof then === 'function') {
  				var called, resolvePromise, rejectPromise;

  				resolvePromise = function (y) {
  					if (called) {
  						return;
  					}
  					called = true;
  					resolve(promise, y, fulfil, reject);
  				};

  				rejectPromise = function (r) {
  					if (called) {
  						return;
  					}
  					called = true;
  					reject(r);
  				};

  				try {
  					then.call(x, resolvePromise, rejectPromise);
  				} catch (e) {
  					if (!called) {
  						// 2.3.3.3.4.1
  						reject(e); // 2.3.3.3.4.2
  						called = true;
  						return;
  					}
  				}
  			} else {
  				fulfil(x);
  			}
  		} else {
  			fulfil(x);
  		}
  }

  var TransitionManager = (function () {
  	function TransitionManager(callback, parent) {
  		classCallCheck(this, TransitionManager);

  		this.callback = callback;
  		this.parent = parent;

  		this.intros = [];
  		this.outros = [];

  		this.children = [];
  		this.totalChildren = this.outroChildren = 0;

  		this.detachQueue = [];
  		this.outrosComplete = false;

  		if (parent) {
  			parent.addChild(this);
  		}
  	}

  	TransitionManager.prototype.add = function add(transition) {
  		var list = transition.isIntro ? this.intros : this.outros;
  		list.push(transition);
  	};

  	TransitionManager.prototype.addChild = function addChild(child) {
  		this.children.push(child);

  		this.totalChildren += 1;
  		this.outroChildren += 1;
  	};

  	TransitionManager.prototype.decrementOutros = function decrementOutros() {
  		this.outroChildren -= 1;
  		check(this);
  	};

  	TransitionManager.prototype.decrementTotal = function decrementTotal() {
  		this.totalChildren -= 1;
  		check(this);
  	};

  	TransitionManager.prototype.detachNodes = function detachNodes() {
  		this.detachQueue.forEach(detach);
  		this.children.forEach(_detachNodes);
  	};

  	TransitionManager.prototype.remove = function remove(transition) {
  		var list = transition.isIntro ? this.intros : this.outros;
  		removeFromArray(list, transition);
  		check(this);
  	};

  	TransitionManager.prototype.start = function start() {
  		this.intros.concat(this.outros).forEach(function (t) {
  			return t.start();
  		});
  		this.ready = true;
  		check(this);
  	};

  	return TransitionManager;
  })();

  function detach(element) {
  	element.detach();
  }

  function _detachNodes(tm) {
  	// _ to avoid transpiler quirk
  	tm.detachNodes();
  }

  function check(tm) {
  	if (!tm.ready || tm.outros.length || tm.outroChildren) return;

  	// If all outros are complete, and we haven't already done this,
  	// we notify the parent if there is one, otherwise
  	// start detaching nodes
  	if (!tm.outrosComplete) {
  		if (tm.parent) {
  			tm.parent.decrementOutros(tm);
  		} else {
  			tm.detachNodes();
  		}

  		tm.outrosComplete = true;
  	}

  	// Once everything is done, we can notify parent transition
  	// manager and call the callback
  	if (!tm.intros.length && !tm.totalChildren) {
  		if (typeof tm.callback === 'function') {
  			tm.callback();
  		}

  		if (tm.parent) {
  			tm.parent.decrementTotal();
  		}
  	}
  }

  var changeHook = new Hook('change');

  var batch = undefined;

  var runloop = {
  	start: function (instance, returnPromise) {
  		var promise, fulfilPromise;

  		if (returnPromise) {
  			promise = new Promise$1(function (f) {
  				return fulfilPromise = f;
  			});
  		}

  		batch = {
  			previousBatch: batch,
  			transitionManager: new TransitionManager(fulfilPromise, batch && batch.transitionManager),
  			fragments: [],
  			tasks: [],
  			immediateObservers: [],
  			deferredObservers: [],
  			instance: instance
  		};

  		return promise;
  	},

  	end: function () {
  		flushChanges();
  		batch = batch.previousBatch;
  	},

  	addFragment: function (fragment) {
  		addToArray(batch.fragments, fragment);
  	},

  	addObserver: function (observer, defer) {
  		addToArray(defer ? batch.deferredObservers : batch.immediateObservers, observer);
  	},

  	registerTransition: function (transition) {
  		transition._manager = batch.transitionManager;
  		batch.transitionManager.add(transition);
  	},

  	// synchronise node detachments with transition ends
  	detachWhenReady: function (thing) {
  		batch.transitionManager.detachQueue.push(thing);
  	},

  	scheduleTask: function (task, postRender) {
  		var _batch;

  		if (!batch) {
  			task();
  		} else {
  			_batch = batch;
  			while (postRender && _batch.previousBatch) {
  				// this can't happen until the DOM has been fully updated
  				// otherwise in some situations (with components inside elements)
  				// transitions and decorators will initialise prematurely
  				_batch = _batch.previousBatch;
  			}

  			_batch.tasks.push(task);
  		}
  	}
  };

  function dispatch(observer) {
  	observer.dispatch();
  }

  function flushChanges() {
  	batch.immediateObservers.forEach(dispatch);

  	// Now that changes have been fully propagated, we can update the DOM
  	// and complete other tasks
  	var i = batch.fragments.length;
  	var fragment = undefined;

  	while (i--) {
  		fragment = batch.fragments[i];

  		// TODO deprecate this. It's annoying and serves no useful function
  		var ractive = fragment.ractive;
  		changeHook.fire(ractive, ractive.viewmodel.changes);
  		ractive.viewmodel.changes = {};

  		fragment.update();
  	}
  	batch.fragments.length = 0;

  	batch.transitionManager.start();

  	batch.deferredObservers.forEach(dispatch);

  	var tasks = batch.tasks;
  	batch.tasks = [];

  	for (i = 0; i < tasks.length; i += 1) {
  		tasks[i]();
  	}

  	// If updating the view caused some model blowback - e.g. a triple
  	// containing <option> elements caused the binding on the <select>
  	// to update - then we start over
  	if (batch.fragments.length) return flushChanges();
  }

  function Ractive$updateModel(keypath, cascade) {
  	var promise = runloop.start(this, true);

  	if (!keypath) {
  		this.viewmodel.updateFromBindings(true);
  	} else {
  		this.viewmodel.joinAll(splitKeypath(keypath)).updateFromBindings(cascade !== false);
  	}

  	runloop.end();

  	return promise;
  }

  var updateHook = new Hook('update');
  function Ractive$update(keypath) {
  	var model = keypath ? this.viewmodel.joinAll(splitKeypath(keypath)) : this.viewmodel;

  	var promise = runloop.start(this, true);
  	model.mark();
  	runloop.end();

  	updateHook.fire(this, model);

  	return promise;
  }

  // This function takes an array, the name of a mutator method, and the
  // arguments to call that mutator method with, and returns an array that
  // maps the old indices to their new indices.

  // So if you had something like this...
  //
  //     array = [ 'a', 'b', 'c', 'd' ];
  //     array.push( 'e' );
  //
  // ...you'd get `[ 0, 1, 2, 3 ]` - in other words, none of the old indices
  // have changed. If you then did this...
  //
  //     array.unshift( 'z' );
  //
  // ...the indices would be `[ 1, 2, 3, 4, 5 ]` - every item has been moved
  // one higher to make room for the 'z'. If you removed an item, the new index
  // would be -1...
  //
  //     array.splice( 2, 2 );
  //
  // ...this would result in [ 0, 1, -1, -1, 2, 3 ].
  //
  // This information is used to enable fast, non-destructive shuffling of list
  // sections when you do e.g. `ractive.splice( 'items', 2, 2 );

  function getNewIndices(length, methodName, args) {
  	var spliceArguments,
  	    newIndices = [],
  	    removeStart,
  	    removeEnd,
  	    balance,
  	    i;

  	spliceArguments = getSpliceEquivalent(length, methodName, args);

  	if (!spliceArguments) {
  		return null; // TODO support reverse and sort?
  	}

  	balance = spliceArguments.length - 2 - spliceArguments[1];

  	removeStart = Math.min(length, spliceArguments[0]);
  	removeEnd = removeStart + spliceArguments[1];

  	for (i = 0; i < removeStart; i += 1) {
  		newIndices.push(i);
  	}

  	for (; i < removeEnd; i += 1) {
  		newIndices.push(-1);
  	}

  	for (; i < length; i += 1) {
  		newIndices.push(i + balance);
  	}

  	// there is a net shift for the rest of the array starting with index + balance
  	if (balance !== 0) {
  		newIndices.touchedFrom = spliceArguments[0];
  	} else {
  		newIndices.touchedFrom = length;
  	}

  	return newIndices;
  }

  // The pop, push, shift an unshift methods can all be represented
  // as an equivalent splice
  function getSpliceEquivalent(length, methodName, args) {
  	switch (methodName) {
  		case 'splice':
  			if (args[0] !== undefined && args[0] < 0) {
  				args[0] = length + Math.max(args[0], -length);
  			}

  			while (args.length < 2) {
  				args.push(length - args[0]);
  			}

  			// ensure we only remove elements that exist
  			args[1] = Math.min(args[1], length - args[0]);

  			return args;

  		case 'sort':
  		case 'reverse':
  			return null;

  		case 'pop':
  			if (length) {
  				return [length - 1, 1];
  			}
  			return [0, 0];

  		case 'push':
  			return [length, 0].concat(args);

  		case 'shift':
  			return [0, length ? 1 : 0];

  		case 'unshift':
  			return [0, 0].concat(args);
  	}
  }

  var arrayProto = Array.prototype;

  function makeArrayMethod (methodName) {
  	return function (keypath) {
  		var model = this.viewmodel.joinAll(splitKeypath(keypath));
  		var array = model.get();

  		if (!isArray(array)) {
  			throw new Error('shuffle array method ' + methodName + ' called on non-array at ' + model.getKeypath());
  		}

  		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
  			args[_key - 1] = arguments[_key];
  		}

  		var newIndices = getNewIndices(array.length, methodName, args);
  		var result = arrayProto[methodName].apply(array, args);

  		var promise = runloop.start(this, true).then(function () {
  			return result;
  		});

  		if (newIndices) {
  			model.shuffle(newIndices);
  		} else {
  			model.set(result);
  		}

  		runloop.end();

  		return promise;
  	};
  }

  var unshift = makeArrayMethod('unshift');

  var unrenderHook$1 = new Hook('unrender');
  function Ractive$unrender() {
  	if (!this.fragment.rendered) {
  		warnIfDebug('ractive.unrender() was called on a Ractive instance that was not rendered');
  		return Promise$1.resolve();
  	}

  	var promise = runloop.start(this, true);

  	// If this is a component, and the component isn't marked for destruction,
  	// don't detach nodes from the DOM unnecessarily
  	var shouldDestroy = !this.component || this.component.shouldDestroy || this.shouldDestroy;
  	this.fragment.unrender(shouldDestroy);

  	removeFromArray(this.el.__ractive_instances__, this);

  	unrenderHook$1.fire(this);

  	runloop.end();
  	return promise;
  }

  function Ractive$toHTML() {
  	return this.fragment.toString(true);
  }

  // Error messages that are used (or could be) in multiple places
  var badArguments = 'Bad arguments';
  var noRegistryFunctionReturn = 'A function was specified for "%s" %s, but no %s was returned';
  var missingPlugin = function (name, type) {
    return 'Missing "' + name + '" ' + type + ' plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#' + type + 's';
  };

  function Ractive$toggle(keypath) {
  	if (typeof keypath !== 'string') {
  		throw new TypeError(badArguments);
  	}

  	var changes = undefined;

  	if (/\*/.test(keypath)) {
  		changes = {};

  		this.viewmodel.findMatches(splitKeypath(keypath)).forEach(function (model) {
  			changes[model.getKeypath()] = !model.get();
  		});

  		return this.set(changes);
  	}

  	return this.set(keypath, !this.get(keypath));
  }

  function _bind(x) {
    x.bind();
  }

  function cancel(x) {
    x.cancel();
  }

  function _handleChange(x) {
    x.handleChange();
  }

  function _mark(x) {
    x.mark();
  }

  function _render(x) {
    x.render();
  }

  function _rebind(x) {
    x.rebind();
  }

  function _teardown(x) {
    x.teardown();
  }

  function _unbind(x) {
    x.unbind();
  }

  function _unrender(x) {
    x.unrender();
  }

  function unrenderAndDestroy$1(x) {
    x.unrender(true);
  }

  function _update(x) {
    x.update();
  }

  function _toString(x) {
    return x.toString();
  }

  function toEscapedString(x) {
    return x.toString(true);
  }

  var teardownHook = new Hook('teardown');

  // Teardown. This goes through the root fragment and all its children, removing observers
  // and generally cleaning up after itself

  function Ractive$teardown() {
  	this.fragment.unbind();
  	this.viewmodel.teardown();

  	this._observers.forEach(cancel);

  	if (this.fragment.rendered && this.el.__ractive_instances__) {
  		removeFromArray(this.el.__ractive_instances__, this);
  	}

  	this.shouldDestroy = true;
  	var promise = this.fragment.rendered ? this.unrender() : Promise$1.resolve();

  	teardownHook.fire(this);

  	return promise;
  }

  var errorMessage$1 = 'Cannot add to a non-numeric value';
  function add(ractive, keypath, d) {
  	if (typeof keypath !== 'string' || !isNumeric(d)) {
  		throw new Error('Bad arguments');
  	}

  	var changes = undefined;

  	if (/\*/.test(keypath)) {
  		changes = {};

  		ractive.viewmodel.findMatches(splitKeypath(keypath)).forEach(function (model) {
  			var value = model.get();

  			if (!isNumeric(value)) throw new Error(errorMessage$1);

  			changes[model.getKeypath()] = value + d;
  		});

  		return ractive.set(changes);
  	}

  	var value = ractive.get(keypath);

  	if (!isNumeric(value)) {
  		throw new Error(errorMessage$1);
  	}

  	return ractive.set(keypath, +value + d);
  }

  function Ractive$subtract(keypath, d) {
  	return add(this, keypath, d === undefined ? -1 : -d);
  }

  var splice = makeArrayMethod('splice');

  var sort = makeArrayMethod('sort');

  var shift = makeArrayMethod('shift');

  function bind(fn, context) {
  	if (!/this/.test(fn.toString())) return fn;

  	var bound = fn.bind(context);
  	for (var prop in fn) {
  		bound[prop] = fn[prop];
  	}return bound;
  }

  function Ractive$set(keypath, value) {
  	var promise = runloop.start(this, true);

  	// Set multiple keypaths in one go
  	if (isObject(keypath)) {
  		var map = keypath;

  		for (keypath in map) {
  			if (map.hasOwnProperty(keypath)) {
  				set(this, keypath, map[keypath]);
  			}
  		}
  	}
  	// Set a single keypath
  	else {
  			set(this, keypath, value);
  		}

  	runloop.end();

  	return promise;
  }

  function set(ractive, keypath, value) {
  	if (typeof value === 'function') value = bind(value, ractive);

  	if (/\*/.test(keypath)) {
  		ractive.viewmodel.findMatches(splitKeypath(keypath)).forEach(function (model) {
  			model.set(value);
  		});
  	} else {
  		var model = ractive.viewmodel.joinAll(splitKeypath(keypath));
  		model.set(value);
  	}
  }

  var reverse = makeArrayMethod('reverse');

  var TEMPLATE_VERSION = 3;

  var html = 'http://www.w3.org/1999/xhtml';
  var mathml = 'http://www.w3.org/1998/Math/MathML';
  var svg$1 = 'http://www.w3.org/2000/svg';
  var xlink = 'http://www.w3.org/1999/xlink';
  var xml = 'http://www.w3.org/XML/1998/namespace';
  var xmlns = 'http://www.w3.org/2000/xmlns/';


  var namespaces = {
  	html: html,
  	mathml: mathml,
  	svg: svg$1,
  	xlink: xlink,
  	xml: xml,
  	xmlns: xmlns
  };

  var createElement;
  var matches;
  var div;
  var methodNames;
  var unprefixed;
  var prefixed;
  var i$1;
  var j$1;
  var makeFunction;
  // Test for SVG support
  if (!svg) {
  	createElement = function (type, ns, extend) {
  		if (ns && ns !== html) {
  			throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you\'re trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information';
  		}

  		return extend ? doc.createElement(type, extend) : doc.createElement(type);
  	};
  } else {
  	createElement = function (type, ns, extend) {
  		if (!ns || ns === html) {
  			return extend ? doc.createElement(type, extend) : doc.createElement(type);
  		}

  		return extend ? doc.createElementNS(ns, type, extend) : doc.createElementNS(ns, type);
  	};
  }

  function createDocumentFragment() {
  	return doc.createDocumentFragment();
  }

  function getElement(input) {
  	var output;

  	if (!input || typeof input === 'boolean') {
  		return;
  	}

  	if (!win || !doc || !input) {
  		return null;
  	}

  	// We already have a DOM node - no work to do. (Duck typing alert!)
  	if (input.nodeType) {
  		return input;
  	}

  	// Get node from string
  	if (typeof input === 'string') {
  		// try ID first
  		output = doc.getElementById(input);

  		// then as selector, if possible
  		if (!output && doc.querySelector) {
  			output = doc.querySelector(input);
  		}

  		// did it work?
  		if (output && output.nodeType) {
  			return output;
  		}
  	}

  	// If we've been given a collection (jQuery, Zepto etc), extract the first item
  	if (input[0] && input[0].nodeType) {
  		return input[0];
  	}

  	return null;
  }

  if (!isClient) {
  	matches = null;
  } else {
  	div = createElement('div');
  	methodNames = ['matches', 'matchesSelector'];

  	makeFunction = function (methodName) {
  		return function (node, selector) {
  			return node[methodName](selector);
  		};
  	};

  	i$1 = methodNames.length;

  	while (i$1-- && !matches) {
  		unprefixed = methodNames[i$1];

  		if (div[unprefixed]) {
  			matches = makeFunction(unprefixed);
  		} else {
  			j$1 = vendors.length;
  			while (j$1--) {
  				prefixed = vendors[i$1] + unprefixed.substr(0, 1).toUpperCase() + unprefixed.substring(1);

  				if (div[prefixed]) {
  					matches = makeFunction(prefixed);
  					break;
  				}
  			}
  		}
  	}

  	// IE8...
  	if (!matches) {
  		matches = function (node, selector) {
  			var nodes, parentNode, i$1;

  			parentNode = node.parentNode;

  			if (!parentNode) {
  				// empty dummy <div>
  				div.innerHTML = '';

  				parentNode = div;
  				node = node.cloneNode();

  				div.appendChild(node);
  			}

  			nodes = parentNode.querySelectorAll(selector);

  			i$1 = nodes.length;
  			while (i$1--) {
  				if (nodes[i$1] === node) {
  					return true;
  				}
  			}

  			return false;
  		};
  	}
  }

  function detachNode(node) {
  	if (node && typeof node.parentNode !== 'unknown' && node.parentNode) {
  		node.parentNode.removeChild(node);
  	}

  	return node;
  }

  function safeToStringValue(value) {
  	return value == null || !value.toString ? '' : '' + value;
  }

  var legacy = null;

  var create;
  var defineProperty;
  var defineProperties;
  try {
  	Object.defineProperty({}, 'test', { value: 0 });

  	if (doc) {
  		Object.defineProperty(createElement('div'), 'test', { value: 0 });
  	}

  	defineProperty = Object.defineProperty;
  } catch (err) {
  	// Object.defineProperty doesn't exist, or we're in IE8 where you can
  	// only use it with DOM objects (what were you smoking, MSFT?)
  	defineProperty = function (obj, prop, desc) {
  		obj[prop] = desc.value;
  	};
  }

  try {
  	try {
  		Object.defineProperties({}, { test: { value: 0 } });
  	} catch (err) {
  		// TODO how do we account for this? noMagic = true;
  		throw err;
  	}

  	if (doc) {
  		Object.defineProperties(createElement('div'), { test: { value: 0 } });
  	}

  	defineProperties = Object.defineProperties;
  } catch (err) {
  	defineProperties = function (obj, props) {
  		var prop;

  		for (prop in props) {
  			if (props.hasOwnProperty(prop)) {
  				defineProperty(obj, prop, props[prop]);
  			}
  		}
  	};
  }

  try {
  	Object.create(null);

  	create = Object.create;
  } catch (err) {
  	// sigh
  	create = (function () {
  		var F = function () {};

  		return function (proto, props) {
  			var obj;

  			if (proto === null) {
  				return {};
  			}

  			F.prototype = proto;
  			obj = new F();

  			if (props) {
  				Object.defineProperties(obj, props);
  			}

  			return obj;
  		};
  	})();
  }

  function extend(target) {
  	var prop, source;

  	for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
  		sources[_key - 1] = arguments[_key];
  	}

  	while (source = sources.shift()) {
  		for (prop in source) {
  			if (hasOwn.call(source, prop)) {
  				target[prop] = source[prop];
  			}
  		}
  	}

  	return target;
  }

  var hasOwn = Object.prototype.hasOwnProperty;

  var parse = null;

  var parseOptions = ['preserveWhitespace', 'sanitize', 'stripComments', 'delimiters', 'tripleDelimiters', 'staticDelimiters', 'staticTripleDelimiters', 'interpolate'];

  var parser = {
  	fromId: fromId, isHashedId: isHashedId, isParsed: isParsed, getParseOptions: getParseOptions, createHelper: createHelper$1,
  	parse: doParse
  };

  function createHelper$1(parseOptions) {
  	var helper = create(parser);
  	helper.parse = function (template, options) {
  		return doParse(template, options || parseOptions);
  	};
  	return helper;
  }

  function doParse(template, parseOptions) {
  	if (!parse) {
  		throw new Error('Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser');
  	}

  	return parse(template, parseOptions || this.options);
  }

  function fromId(id, options) {
  	if (!doc) {
  		if (options && options.noThrow) {
  			return;
  		}
  		throw new Error('Cannot retrieve template #' + id + ' as Ractive is not running in a browser.');
  	}

  	if (isHashedId(id)) id = id.substring(1);

  	var template = undefined;

  	if (!(template = doc.getElementById(id))) {
  		if (options && options.noThrow) {
  			return;
  		}
  		throw new Error('Could not find template element with id #' + id);
  	}

  	if (template.tagName.toUpperCase() !== 'SCRIPT') {
  		if (options && options.noThrow) {
  			return;
  		}
  		throw new Error('Template element with id #' + id + ', must be a <script> element');
  	}

  	return 'textContent' in template ? template.textContent : template.innerHTML;
  }

  function isHashedId(id) {
  	return id && id[0] === '#';
  }

  function isParsed(template) {
  	return !(typeof template === 'string');
  }

  function getParseOptions(ractive) {
  	// Could be Ractive or a Component
  	if (ractive.defaults) {
  		ractive = ractive.defaults;
  	}

  	return parseOptions.reduce(function (val, key) {
  		val[key] = ractive[key];
  		return val;
  	}, {});
  }

  var templateConfigurator = {
  	name: 'template',

  	extend: function (Parent, proto, options) {
  		// only assign if exists
  		if ('template' in options) {
  			var template = options.template;

  			if (typeof template === 'function') {
  				proto.template = template;
  			} else {
  				proto.template = parseIfString(template, proto);
  			}
  		}
  	},

  	init: function (Parent, ractive, options) {
  		// TODO because of prototypal inheritance, we might just be able to use
  		// ractive.template, and not bother passing through the Parent object.
  		// At present that breaks the test mocks' expectations
  		var template = 'template' in options ? options.template : Parent.prototype.template;
  		template = template || { v: TEMPLATE_VERSION, t: [] };

  		if (typeof template === 'function') {
  			var fn = template;
  			template = getDynamicTemplate(ractive, fn);

  			ractive._config.template = {
  				fn: fn,
  				result: template
  			};
  		}

  		template = parseIfString(template, ractive);

  		// TODO the naming of this is confusing - ractive.template refers to [...],
  		// but Component.prototype.template refers to {v:1,t:[],p:[]}...
  		// it's unnecessary, because the developer never needs to access
  		// ractive.template
  		ractive.template = template.t;

  		if (template.p) {
  			extendPartials(ractive.partials, template.p);
  		}
  	},

  	reset: function (ractive) {
  		var result = resetValue(ractive);

  		if (result) {
  			var parsed = parseIfString(result, ractive);

  			ractive.template = parsed.t;
  			extendPartials(ractive.partials, parsed.p, true);

  			return true;
  		}
  	}
  };

  function resetValue(ractive) {
  	var initial = ractive._config.template;

  	// If this isn't a dynamic template, there's nothing to do
  	if (!initial || !initial.fn) {
  		return;
  	}

  	var result = getDynamicTemplate(ractive, initial.fn);

  	// TODO deep equality check to prevent unnecessary re-rendering
  	// in the case of already-parsed templates
  	if (result !== initial.result) {
  		initial.result = result;
  		result = parseIfString(result, ractive);
  		return result;
  	}
  }

  function getDynamicTemplate(ractive, fn) {
  	var helper = createHelper(parser.getParseOptions(ractive));
  	return fn.call(ractive, helper);
  }

  function createHelper(parseOptions) {
  	var helper = create(parser);
  	helper.parse = function (template, options) {
  		return parser.parse(template, options || parseOptions);
  	};
  	return helper;
  }

  function parseIfString(template, ractive) {
  	if (typeof template === 'string') {
  		// ID of an element containing the template?
  		if (template[0] === '#') {
  			template = parser.fromId(template);
  		}

  		template = parse(template, parser.getParseOptions(ractive));
  	}

  	// Check that the template even exists
  	else if (template == undefined) {
  			throw new Error('The template cannot be ' + template + '.');
  		}

  		// Check the parsed template has a version at all
  		else if (typeof template.v !== 'number') {
  				throw new Error('The template parser was passed a non-string template, but the template doesn\'t have a version.  Make sure you\'re passing in the template you think you are.');
  			}

  			// Check we're using the correct version
  			else if (template.v !== TEMPLATE_VERSION) {
  					throw new Error('Mismatched template version (expected ' + TEMPLATE_VERSION + ', got ' + template.v + ') Please ensure you are using the latest version of Ractive.js in your build process as well as in your app');
  				}

  	return template;
  }

  function extendPartials(existingPartials, newPartials, overwrite) {
  	if (!newPartials) return;

  	// TODO there's an ambiguity here - we need to overwrite in the `reset()`
  	// case, but not initially...

  	for (var key in newPartials) {
  		if (overwrite || !existingPartials.hasOwnProperty(key)) {
  			existingPartials[key] = newPartials[key];
  		}
  	}
  }

  var TEXT = 1;
  var INTERPOLATOR = 2;
  var TRIPLE = 3;
  var SECTION = 4;
  var ELEMENT = 7;
  var PARTIAL = 8;
  var COMPONENT = 15;
  var YIELDER = 16;
  var DOCTYPE = 18;
  var ALIAS = 19;

  var NUMBER_LITERAL = 20;
  var STRING_LITERAL = 21;
  var REFERENCE = 30;
  var SECTION_IF = 50;
  var SECTION_UNLESS = 51;
  var SECTION_EACH = 52;
  var SECTION_WITH = 53;
  var SECTION_IF_WITH = 54;

  var Item = (function () {
  	function Item(options) {
  		classCallCheck(this, Item);

  		this.parentFragment = options.parentFragment;
  		this.ractive = options.parentFragment.ractive;

  		this.template = options.template;
  		this.index = options.index;
  		this.type = options.template.t;

  		this.dirty = false;
  	}

  	Item.prototype.bubble = function bubble() {
  		if (!this.dirty) {
  			this.dirty = true;
  			this.parentFragment.bubble();
  		}
  	};

  	Item.prototype.find = function find() {
  		return null;
  	};

  	Item.prototype.findAll = function findAll() {
  		// noop
  	};

  	Item.prototype.findComponent = function findComponent() {
  		return null;
  	};

  	Item.prototype.findAllComponents = function findAllComponents() {
  		// noop;
  	};

  	Item.prototype.findNextNode = function findNextNode() {
  		return this.parentFragment.findNextNode(this);
  	};

  	return Item;
  })();

  function badReference(key) {
  	throw new Error('An index or key reference (' + key + ') cannot have child properties');
  }
  function resolveAmbiguousReference(fragment, ref) {
  	var localViewmodel = fragment.findContext().root;
  	var keys = splitKeypath(ref);
  	var key = keys[0];

  	var hasContextChain = undefined;
  	var crossedComponentBoundary = undefined;
  	var aliases = undefined;

  	while (fragment) {
  		// repeated fragments
  		if (fragment.isIteration) {
  			if (key === fragment.parent.keyRef) {
  				if (keys.length > 1) badReference(key);
  				return fragment.context.getKeyModel();
  			}

  			if (key === fragment.parent.indexRef) {
  				if (keys.length > 1) badReference(key);
  				return fragment.context.getIndexModel(fragment.index);
  			}
  		}

  		// alias node or iteration
  		if (((aliases = fragment.owner.aliases) || (aliases = fragment.aliases)) && aliases.hasOwnProperty(key)) {
  			var model = aliases[key];

  			if (keys.length === 1) return model;else if (typeof model.joinAll === 'function') {
  				return model.joinAll(keys.slice(1));
  			}
  		}

  		if (fragment.context) {
  			// TODO better encapsulate the component check
  			if (!fragment.isRoot || fragment.ractive.component) hasContextChain = true;

  			if (fragment.context.has(key)) {
  				if (crossedComponentBoundary) {
  					localViewmodel.map(key, fragment.context.joinKey(key));
  				}

  				return fragment.context.joinAll(keys);
  			}
  		}

  		if (fragment.componentParent && !fragment.ractive.isolated) {
  			// ascend through component boundary
  			fragment = fragment.componentParent;
  			crossedComponentBoundary = true;
  		} else {
  			fragment = fragment.parent;
  		}
  	}

  	if (!hasContextChain) {
  		return localViewmodel.joinAll(keys);
  	}
  }

  function resolveReference(fragment, ref) {
  	var context = fragment.findContext();

  	// special references
  	// TODO does `this` become `.` at parse time?
  	if (ref === '.' || ref === 'this') return context;
  	if (ref === '@keypath') return context.getKeypathModel();
  	if (ref === '@index') {
  		var repeater = fragment.findRepeatingFragment();
  		// make sure the found fragment is actually an iteration
  		if (!repeater.isIteration) return;
  		return repeater.context.getIndexModel(repeater.index);
  	}
  	if (ref === '@key') return fragment.findRepeatingFragment().context.getKeyModel();

  	// ancestor references
  	if (ref[0] === '~') return context.root.joinAll(splitKeypath(ref.slice(2)));
  	if (ref[0] === '.') {
  		var parts = ref.split('/');

  		while (parts[0] === '.' || parts[0] === '..') {
  			var part = parts.shift();

  			if (part === '..') {
  				context = context.parent;
  			}
  		}

  		ref = parts.join('/');

  		// special case - `{{.foo}}` means the same as `{{./foo}}`
  		if (ref[0] === '.') ref = ref.slice(1);
  		return context.joinAll(splitKeypath(ref));
  	}

  	return resolveAmbiguousReference(fragment, ref);
  }

  var stack = [];
  var captureGroup = undefined;

  function startCapturing() {
  	stack.push(captureGroup = []);
  }

  function stopCapturing() {
  	var dependencies = stack.pop();
  	captureGroup = stack[stack.length - 1];
  	return dependencies;
  }

  function capture(model) {
  	if (captureGroup) {
  		captureGroup.push(model);
  	}
  }

  var requestAnimationFrame;

  // If window doesn't exist, we don't need requestAnimationFrame
  if (!win) {
  	requestAnimationFrame = null;
  } else {
  	// https://gist.github.com/paulirish/1579671
  	(function (vendors, lastTime, win) {

  		var x, setTimeout;

  		if (win.requestAnimationFrame) {
  			return;
  		}

  		for (x = 0; x < vendors.length && !win.requestAnimationFrame; ++x) {
  			win.requestAnimationFrame = win[vendors[x] + 'RequestAnimationFrame'];
  		}

  		if (!win.requestAnimationFrame) {
  			setTimeout = win.setTimeout;

  			win.requestAnimationFrame = function (callback) {
  				var currTime, timeToCall, id;

  				currTime = Date.now();
  				timeToCall = Math.max(0, 16 - (currTime - lastTime));
  				id = setTimeout(function () {
  					callback(currTime + timeToCall);
  				}, timeToCall);

  				lastTime = currTime + timeToCall;
  				return id;
  			};
  		}
  	})(vendors, 0, win);

  	requestAnimationFrame = win.requestAnimationFrame;
  }

  var rAF = requestAnimationFrame;

  var getTime = win && win.performance && typeof win.performance.now === 'function' ? function () {
  	return win.performance.now();
  } : function () {
  	return Date.now();
  };

  // TODO what happens if a transition is aborted?

  var tickers = [];
  var running = false;

  function tick() {
  	runloop.start();

  	var now = getTime();

  	var i = undefined;
  	var ticker = undefined;

  	for (i = 0; i < tickers.length; i += 1) {
  		ticker = tickers[i];

  		if (!ticker.tick(now)) {
  			// ticker is complete, remove it from the stack, and decrement i so we don't miss one
  			tickers.splice(i--, 1);
  		}
  	}

  	runloop.end();

  	if (tickers.length) {
  		rAF(tick);
  	} else {
  		running = false;
  	}
  }

  var Ticker = (function () {
  	function Ticker(options) {
  		classCallCheck(this, Ticker);

  		this.duration = options.duration;
  		this.step = options.step;
  		this.complete = options.complete;
  		this.easing = options.easing;

  		this.start = getTime();
  		this.end = this.start + this.duration;

  		this.running = true;

  		tickers.push(this);
  		if (!running) rAF(tick);
  	}

  	Ticker.prototype.tick = function tick(now) {
  		if (!this.running) return false;

  		if (now > this.end) {
  			if (this.step) this.step(1);
  			if (this.complete) this.complete(1);

  			return false;
  		}

  		var elapsed = now - this.start;
  		var eased = this.easing(elapsed / this.duration);

  		if (this.step) this.step(eased);

  		return true;
  	};

  	Ticker.prototype.stop = function stop() {
  		if (this.abort) this.abort();
  		this.running = false;
  	};

  	return Ticker;
  })();

  var prefixers = {};

  // TODO this is legacy. sooner we can replace the old adaptor API the better
  function prefixKeypath(obj, prefix) {
  	var prefixed = {},
  	    key;

  	if (!prefix) {
  		return obj;
  	}

  	prefix += '.';

  	for (key in obj) {
  		if (obj.hasOwnProperty(key)) {
  			prefixed[prefix + key] = obj[key];
  		}
  	}

  	return prefixed;
  }
  function getPrefixer(rootKeypath) {
  	var rootDot;

  	if (!prefixers[rootKeypath]) {
  		rootDot = rootKeypath ? rootKeypath + '.' : '';

  		prefixers[rootKeypath] = function (relativeKeypath, value) {
  			var obj;

  			if (typeof relativeKeypath === 'string') {
  				obj = {};
  				obj[rootDot + relativeKeypath] = value;
  				return obj;
  			}

  			if (typeof relativeKeypath === 'object') {
  				// 'relativeKeypath' is in fact a hash, not a keypath
  				return rootDot ? prefixKeypath(relativeKeypath, rootKeypath) : relativeKeypath;
  			}
  		};
  	}

  	return prefixers[rootKeypath];
  }

  var KeyModel = (function () {
  	function KeyModel(key) {
  		classCallCheck(this, KeyModel);

  		this.value = key;
  		this.isReadonly = true;
  		this.dependants = [];
  	}

  	KeyModel.prototype.get = function get() {
  		return this.value;
  	};

  	KeyModel.prototype.getKeypath = function getKeypath() {
  		return this.value;
  	};

  	KeyModel.prototype.rebind = function rebind(key) {
  		this.value = key;
  		this.dependants.forEach(_handleChange);
  	};

  	KeyModel.prototype.register = function register(dependant) {
  		this.dependants.push(dependant);
  	};

  	KeyModel.prototype.unregister = function unregister(dependant) {
  		removeFromArray(this.dependants, dependant);
  	};

  	return KeyModel;
  })();

  var KeypathModel = (function () {
  	function KeypathModel(parent) {
  		classCallCheck(this, KeypathModel);

  		this.parent = parent;
  		this.value = parent.getKeypath();
  		this.dependants = [];
  	}

  	KeypathModel.prototype.get = function get() {
  		return this.value;
  	};

  	KeypathModel.prototype.getKeypath = function getKeypath() {
  		return this.value;
  	};

  	KeypathModel.prototype.handleChange = function handleChange() {
  		this.value = this.parent.getKeypath();
  		this.dependants.forEach(_handleChange);
  	};

  	KeypathModel.prototype.register = function register(dependant) {
  		this.dependants.push(dependant);
  	};

  	KeypathModel.prototype.unregister = function unregister(dependant) {
  		removeFromArray(this.dependants, dependant);
  	};

  	return KeypathModel;
  })();

  var hasProp = Object.prototype.hasOwnProperty;

  function _updateFromBindings(model) {
  	model.updateFromBindings(true);
  }

  function _updateKeypathDependants(model) {
  	model.updateKeypathDependants();
  }

  var originatingModel = null;

  var Model = (function () {
  	function Model(parent, key) {
  		classCallCheck(this, Model);

  		this.deps = [];

  		this.children = [];
  		this.childByKey = {};

  		this.indexModels = [];

  		this.unresolved = [];
  		this.unresolvedByKey = {};

  		this.bindings = [];

  		this.value = undefined;

  		this.ticker = null;

  		if (parent) {
  			this.parent = parent;
  			this.root = parent.root;
  			this.key = unescapeKey(key);
  			this.isReadonly = parent.isReadonly;

  			if (parent.value) {
  				this.value = parent.value[this.key];
  				this.adapt();
  			}
  		}
  	}

  	Model.prototype.adapt = function adapt() {
  		var adaptors = this.root.adaptors;
  		var value = this.value;
  		var len = adaptors.length;

  		// TODO remove this legacy nonsense
  		var ractive = this.root.ractive;
  		var keypath = this.getKeypath();

  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			var adaptor = adaptors[i];
  			if (adaptor.filter(value, keypath, ractive)) {
  				this.wrapper = adaptor.wrap(ractive, value, keypath, getPrefixer(keypath));
  				this.wrapper.value = this.value;
  				this.wrapper.__model = this; // massive temporary hack to enable array adaptor

  				this.value = this.wrapper.get();

  				break;
  			}
  		}
  	};

  	Model.prototype.addUnresolved = function addUnresolved(key, resolver) {
  		if (!this.unresolvedByKey[key]) {
  			this.unresolved.push(key);
  			this.unresolvedByKey[key] = [];
  		}

  		this.unresolvedByKey[key].push(resolver);
  	};

  	Model.prototype.animate = function animate(from, to, options, interpolator) {
  		var _this = this;

  		if (this.ticker) this.ticker.stop();

  		var fulfilPromise = undefined;
  		var promise = new Promise$1(function (fulfil) {
  			return fulfilPromise = fulfil;
  		});

  		this.ticker = new Ticker({
  			duration: options.duration,
  			easing: options.easing,
  			step: function (t) {
  				var value = interpolator(t);
  				_this.applyValue(value);
  				if (options.step) options.step(t, value);
  			},
  			complete: function () {
  				_this.applyValue(to);
  				if (options.complete) options.complete(to);

  				_this.ticker = null;
  				fulfilPromise();
  			}
  		});

  		promise.stop = this.ticker.stop;
  		return promise;
  	};

  	Model.prototype.applyValue = function applyValue(value) {
  		if (isEqual(value, this.value)) return;

  		// TODO deprecate this nonsense
  		this.root.changes[this.getKeypath()] = value;

  		if (this.parent.wrapper && this.parent.wrapper.set) {
  			this.parent.wrapper.set(this.key, value);
  			this.parent.value = this.parent.wrapper.get();

  			this.value = this.parent.value[this.key];
  			// TODO should this value be adapted? probably
  		} else if (this.wrapper) {
  				var shouldTeardown = !this.wrapper.reset || this.wrapper.reset(value) === false;

  				if (shouldTeardown) {
  					this.wrapper.teardown();
  					this.wrapper = null;
  					this.parent.value[this.key] = this.value = value;
  					this.adapt();
  				} else {
  					this.value = this.wrapper.get();
  				}
  			} else {
  				var parentValue = this.parent.value || this.parent.createBranch(this.key);
  				parentValue[this.key] = value;

  				this.value = value;
  				this.adapt();
  			}

  		this.parent.clearUnresolveds();
  		this.clearUnresolveds();

  		// notify dependants
  		var previousOriginatingModel = originatingModel; // for the array.length special case
  		originatingModel = this;

  		this.children.forEach(_mark);
  		this.deps.forEach(_handleChange);

  		var parent = this.parent;
  		while (parent) {
  			parent.deps.forEach(_handleChange);
  			parent = parent.parent;
  		}

  		originatingModel = previousOriginatingModel;
  	};

  	Model.prototype.clearUnresolveds = function clearUnresolveds(specificKey) {
  		var i = this.unresolved.length;

  		while (i--) {
  			var key = this.unresolved[i];

  			if (specificKey && key !== specificKey) continue;

  			var resolvers = this.unresolvedByKey[key];
  			var hasKey = this.has(key);

  			var j = resolvers.length;
  			while (j--) {
  				if (hasKey) resolvers[j].attemptResolution();
  				if (resolvers[j].resolved) resolvers.splice(j, 1);
  			}

  			if (!resolvers.length) {
  				this.unresolved.splice(i, 1);
  				this.unresolvedByKey[key] = null;
  			}
  		}
  	};

  	Model.prototype.createBranch = function createBranch(key) {
  		var branch = isNumeric(key) ? [] : {};
  		this.set(branch);

  		return branch;
  	};

  	Model.prototype.discard = function discard() {
  		var _this2 = this;

  		this.deps.forEach(function (d) {
  			if (d.boundsSensitive) _this2.unregister(d);
  		});
  	};

  	Model.prototype.findMatches = function findMatches(keys) {
  		var len = keys.length;

  		var existingMatches = [this];
  		var matches = undefined;
  		var i = undefined;

  		var _loop = function () {
  			var key = keys[i];

  			if (key === '*') {
  				matches = [];
  				existingMatches.forEach(function (model) {
  					if (isArray(model.value)) {
  						// special case - array.length. This is a horrible kludge, but
  						// it'll do for now. Alternatives welcome
  						if (originatingModel && originatingModel.parent === model && originatingModel.key === 'length') {
  							matches.push(originatingModel);
  						}

  						model.value.forEach(function (member, i) {
  							matches.push(model.joinKey(i));
  						});
  					} else if (isObject(model.value) || typeof model.value === 'function') {
  						Object.keys(model.value).forEach(function (key) {
  							matches.push(model.joinKey(key));
  						});

  						// special case - computed properties. TODO mappings also?
  						if (model.isRoot) {
  							Object.keys(model.computations).forEach(function (key) {
  								matches.push(model.joinKey(key));
  							});
  						}
  					}
  				});
  			} else {
  				matches = existingMatches.map(function (model) {
  					return model.joinKey(key);
  				});
  			}

  			existingMatches = matches;
  		};

  		for (i = 0; i < len; i += 1) {
  			_loop();
  		}

  		return matches;
  	};

  	Model.prototype.get = function get(shouldCapture) {
  		if (shouldCapture) capture(this);
  		return this.value;
  	};

  	Model.prototype.getIndexModel = function getIndexModel(fragmentIndex) {
  		var indexModels = this.parent.indexModels;

  		// non-numeric keys are a special of a numeric index in a object iteration
  		if (typeof this.key === 'string' && fragmentIndex !== undefined) {
  			return new KeyModel(fragmentIndex);
  		} else if (!indexModels[this.key]) {
  			indexModels[this.key] = new KeyModel(this.key);
  		}

  		return indexModels[this.key];
  	};

  	Model.prototype.getKeyModel = function getKeyModel() {
  		// TODO... different to IndexModel because key can never change
  		return new KeyModel(escapeKey(this.key));
  	};

  	Model.prototype.getKeypathModel = function getKeypathModel() {
  		return this.keypathModel || (this.keypathModel = new KeypathModel(this));
  	};

  	Model.prototype.getKeypath = function getKeypath() {
  		// TODO keypaths inside components... tricky
  		return this.parent.isRoot ? escapeKey(this.key) : this.parent.getKeypath() + '.' + escapeKey(this.key);
  	};

  	Model.prototype.has = function has(key) {
  		var value = this.get();
  		if (!value) return false;

  		key = unescapeKey(key);
  		if (hasProp.call(value, key)) return true;

  		// We climb up the constructor chain to find if one of them contains the key
  		var constructor = value.constructor;
  		while (constructor !== Function && constructor !== Array && constructor !== Object) {
  			if (hasProp.call(constructor.prototype, key)) return true;
  			constructor = constructor.constructor;
  		}

  		return false;
  	};

  	Model.prototype.joinKey = function joinKey(key) {
  		if (key === undefined || key === '') return this;

  		if (!this.childByKey.hasOwnProperty(key)) {
  			var child = new Model(this, key);
  			this.children.push(child);
  			this.childByKey[key] = child;
  		}

  		return this.childByKey[key];
  	};

  	Model.prototype.joinAll = function joinAll(keys) {
  		var model = this;
  		for (var i = 0; i < keys.length; i += 1) {
  			model = model.joinKey(keys[i]);
  		}

  		return model;
  	};

  	Model.prototype.mark = function mark() {
  		var value = this.retrieve();

  		if (!isEqual(value, this.value)) {
  			this.value = value;

  			this.children.forEach(_mark);

  			this.deps.forEach(_handleChange);
  			this.clearUnresolveds();
  		}
  	};

  	Model.prototype.merge = function merge(array, comparator) {
  		var oldArray = comparator ? this.value.map(comparator) : this.value;
  		var newArray = comparator ? array.map(comparator) : array;

  		var oldLength = oldArray.length;

  		var usedIndices = {};
  		var firstUnusedIndex = 0;

  		var newIndices = oldArray.map(function (item) {
  			var index = undefined;
  			var start = firstUnusedIndex;

  			do {
  				index = newArray.indexOf(item, start);

  				if (index === -1) {
  					return -1;
  				}

  				start = index + 1;
  			} while (usedIndices[index] === true && start < oldLength);

  			// keep track of the first unused index, so we don't search
  			// the whole of newArray for each item in oldArray unnecessarily
  			if (index === firstUnusedIndex) {
  				firstUnusedIndex += 1;
  			}
  			// allow next instance of next "equal" to be found item
  			usedIndices[index] = true;
  			return index;
  		});

  		this.parent.value[this.key] = array;
  		this._merged = true;
  		this.shuffle(newIndices);
  	};

  	Model.prototype.register = function register(dep) {
  		this.deps.push(dep);
  	};

  	Model.prototype.registerTwowayBinding = function registerTwowayBinding(binding) {
  		this.bindings.push(binding);
  	};

  	Model.prototype.retrieve = function retrieve() {
  		return this.parent.value ? this.parent.value[this.key] : undefined;
  	};

  	Model.prototype.set = function set(value) {
  		if (this.ticker) this.ticker.stop();
  		this.applyValue(value);
  	};

  	Model.prototype.shuffle = function shuffle(newIndices) {
  		var _this3 = this;

  		var indexModels = [];
  		var max = 0,
  		    child = undefined;

  		newIndices.forEach(function (newIndex, oldIndex) {
  			if (newIndex > max) max = newIndex;

  			if (! ~newIndex) return;

  			var model = _this3.indexModels[oldIndex];

  			if (!model) return;

  			indexModels[newIndex] = model;

  			if (newIndex !== oldIndex) {
  				model.rebind(newIndex);
  			}
  		});

  		// some children, notably computations, need to be notified when they are
  		// no longer attached to anything so they don't recompute
  		while (child = this.childByKey[++max]) {
  			if (typeof child.discard === 'function') child.discard();
  		}

  		this.indexModels = indexModels;

  		// shuffles need to happen before marks...
  		this.deps.forEach(function (dep) {
  			if (dep.shuffle) dep.shuffle(newIndices);
  		});

  		this.updateKeypathDependants();
  		this.mark();

  		// ...but handleChange must happen after (TODO document why)
  		this.deps.forEach(function (dep) {
  			if (!dep.shuffle) dep.handleChange();
  		});
  	};

  	Model.prototype.teardown = function teardown() {
  		this.children.forEach(_teardown);
  		if (this.wrapper) this.wrapper.teardown();
  	};

  	Model.prototype.unregister = function unregister(dependant) {
  		removeFromArray(this.deps, dependant);
  	};

  	Model.prototype.unregisterTwowayBinding = function unregisterTwowayBinding(binding) {
  		removeFromArray(this.bindings, binding);
  	};

  	Model.prototype.updateFromBindings = function updateFromBindings(cascade) {
  		var i = this.bindings.length;
  		while (i--) {
  			var value = this.bindings[i].getValue();
  			if (value !== this.value) this.set(value);
  		}

  		if (cascade) {
  			this.children.forEach(_updateFromBindings);
  		}
  	};

  	Model.prototype.updateKeypathDependants = function updateKeypathDependants() {
  		this.children.forEach(_updateKeypathDependants);
  		if (this.keypathModel) this.keypathModel.handleChange();
  	};

  	return Model;
  })();

  var ComputationChild = (function (_Model) {
  	inherits(ComputationChild, _Model);

  	function ComputationChild() {
  		classCallCheck(this, ComputationChild);

  		_Model.apply(this, arguments);
  	}

  	ComputationChild.prototype.get = function get(shouldCapture) {
  		if (shouldCapture) capture(this);

  		var parentValue = this.parent.get();
  		return parentValue ? parentValue[this.key] : undefined;
  	};

  	ComputationChild.prototype.handleChange = function handleChange() {
  		this.dirty = true;

  		this.deps.forEach(_handleChange);
  		this.children.forEach(_handleChange);
  		this.clearUnresolveds(); // TODO is this necessary?
  	};

  	ComputationChild.prototype.joinKey = function joinKey(key) {
  		if (key === undefined || key === '') return this;

  		if (!this.childByKey.hasOwnProperty(key)) {
  			var child = new ComputationChild(this, key);
  			this.children.push(child);
  			this.childByKey[key] = child;
  		}

  		return this.childByKey[key];
  	};

  	// TODO this causes problems with inter-component mappings
  	// set () {
  	// 	throw new Error( `Cannot set read-only property of computed value (${this.getKeypath()})` );
  	// }
  	return ComputationChild;
  })(Model);

  var functionCache = {};
  function createFunction(str, i) {
  	if (functionCache[str]) return functionCache[str];

  	var args = new Array(i);
  	while (i--) args[i] = "_" + i;

  	var fn = new Function(args.join(','), "return (" + str + ")");

  	return functionCache[str] = fn;
  }

  function getValue(model) {
  	return model ? model.get(true) : undefined;
  }

  var ExpressionProxy = (function (_Model) {
  	inherits(ExpressionProxy, _Model);

  	function ExpressionProxy(fragment, template) {
  		var _this = this;

  		classCallCheck(this, ExpressionProxy);

  		_Model.call(this, fragment.ractive.viewmodel, null);

  		this.fragment = fragment;
  		this.template = template;

  		this.isReadonly = true;

  		this.fn = createFunction(template.s, template.r.length);
  		this.computation = null;

  		this.resolvers = [];
  		this.models = template.r.map(function (ref, index) {
  			var model = resolveReference(fragment, ref);
  			var resolver = undefined;

  			if (!model) {
  				resolver = fragment.resolve(ref, function (model) {
  					removeFromArray(_this.resolvers, resolver);
  					_this.models[index] = model;
  					_this.bubble();
  				});

  				_this.resolvers.push(resolver);
  			}

  			return model;
  		});

  		this.bubble();
  	}

  	ExpressionProxy.prototype.bubble = function bubble() {
  		var _this2 = this;

  		var ractive = this.fragment.ractive;

  		// TODO the @ prevents computed props from shadowing keypaths, but the real
  		// question is why it's a computed prop in the first place... (hint, it's
  		// to do with {{else}} blocks)
  		var key = '@' + this.template.s.replace(/_(\d+)/g, function (match, i) {
  			if (i >= _this2.models.length) return match;

  			var model = _this2.models[i];
  			return model ? model.getKeypath() : '@undefined';
  		});

  		// TODO can/should we reuse computations?
  		var signature = {
  			getter: function () {
  				var values = _this2.models.map(getValue);
  				return _this2.fn.apply(ractive, values);
  			},
  			getterString: key
  		};

  		var computation = ractive.viewmodel.compute(key, signature);

  		this.value = computation.get(); // TODO should not need this, eventually

  		if (this.computation) {
  			this.computation.unregister(this);
  			// notify children...
  		}

  		this.computation = computation;
  		computation.register(this);

  		this.handleChange();
  	};

  	ExpressionProxy.prototype.get = function get(shouldCapture) {
  		return this.computation.get(shouldCapture);
  	};

  	ExpressionProxy.prototype.getKeypath = function getKeypath() {
  		return this.computation ? this.computation.getKeypath() : '@undefined';
  	};

  	ExpressionProxy.prototype.handleChange = function handleChange() {
  		this.deps.forEach(_handleChange);
  		this.children.forEach(_handleChange);

  		this.clearUnresolveds();
  	};

  	ExpressionProxy.prototype.joinKey = function joinKey(key) {
  		if (key === undefined || key === '') return this;

  		if (!this.childByKey.hasOwnProperty(key)) {
  			var child = new ComputationChild(this, key);
  			this.children.push(child);
  			this.childByKey[key] = child;
  		}

  		return this.childByKey[key];
  	};

  	ExpressionProxy.prototype.mark = function mark() {
  		this.handleChange();
  	};

  	ExpressionProxy.prototype.retrieve = function retrieve() {
  		return this.get();
  	};

  	ExpressionProxy.prototype.unbind = function unbind() {
  		this.resolvers.forEach(_unbind);
  	};

  	return ExpressionProxy;
  })(Model);

  var ReferenceExpressionProxy = (function (_Model) {
  	inherits(ReferenceExpressionProxy, _Model);

  	function ReferenceExpressionProxy(fragment, template) {
  		var _this = this;

  		classCallCheck(this, ReferenceExpressionProxy);

  		_Model.call(this, null, null);
  		this.root = fragment.ractive.viewmodel;

  		this.resolvers = [];

  		this.base = resolve$1(fragment, template);
  		var baseResolver = undefined;

  		if (!this.base) {
  			baseResolver = fragment.resolve(template.r, function (model) {
  				_this.base = model;
  				_this.bubble();

  				removeFromArray(_this.resolvers, baseResolver);
  			});

  			this.resolvers.push(baseResolver);
  		}

  		var intermediary = {
  			handleChange: function () {
  				return _this.bubble();
  			}
  		};

  		this.members = template.m.map(function (template, i) {
  			if (typeof template === 'string') {
  				return { get: function () {
  						return template;
  					} };
  			}

  			var model = undefined;
  			var resolver = undefined;

  			if (template.t === REFERENCE) {
  				model = resolveReference(fragment, template.n);

  				if (model) {
  					model.register(intermediary);
  				} else {
  					resolver = fragment.resolve(template.n, function (model) {
  						_this.members[i] = model;

  						model.register(intermediary);
  						_this.bubble();

  						removeFromArray(_this.resolvers, resolver);
  					});

  					_this.resolvers.push(resolver);
  				}

  				return model;
  			}

  			model = new ExpressionProxy(fragment, template);
  			model.register(intermediary);
  			return model;
  		});

  		this.isUnresolved = true;
  		this.bubble();
  	}

  	ReferenceExpressionProxy.prototype.bubble = function bubble() {
  		if (!this.base) return;

  		// if some members are not resolved, abort
  		var i = this.members.length;
  		while (i--) {
  			if (!this.members[i]) return;
  		}

  		this.isUnresolved = false;

  		var keys = this.members.map(function (model) {
  			return escapeKey(String(model.get()));
  		});
  		var model = this.base.joinAll(keys);

  		if (this.model) {
  			this.model.unregister(this);
  			this.model.unregisterTwowayBinding(this);
  		}

  		this.model = model;
  		this.parent = model.parent;

  		model.register(this);
  		model.registerTwowayBinding(this);

  		if (this.keypathModel) this.keypathModel.handleChange();

  		this.mark();
  	};

  	ReferenceExpressionProxy.prototype.forceResolution = function forceResolution() {
  		this.resolvers.forEach(function (resolver) {
  			return resolver.forceResolution();
  		});
  		this.bubble();
  	};

  	ReferenceExpressionProxy.prototype.get = function get() {
  		return this.model ? this.model.get() : undefined;
  	};

  	// indirect two-way bindings

  	ReferenceExpressionProxy.prototype.getValue = function getValue() {
  		var i = this.bindings.length;
  		while (i--) {
  			var value = this.bindings[i].getValue();
  			if (value !== this.value) return value;
  		}

  		return this.value;
  	};

  	ReferenceExpressionProxy.prototype.getKeypath = function getKeypath() {
  		return this.model ? this.model.getKeypath() : '@undefined';
  	};

  	ReferenceExpressionProxy.prototype.handleChange = function handleChange() {
  		this.mark();
  	};

  	ReferenceExpressionProxy.prototype.retrieve = function retrieve() {
  		return this.get();
  	};

  	ReferenceExpressionProxy.prototype.set = function set(value) {
  		if (!this.model) throw new Error('Unresolved reference expression. This should not happen!');
  		this.model.set(value);
  	};

  	ReferenceExpressionProxy.prototype.unbind = function unbind() {
  		this.resolvers.forEach(_unbind);
  	};

  	return ReferenceExpressionProxy;
  })(Model);

  function resolve$1(fragment, template) {
  	if (template.r) {
  		return resolveReference(fragment, template.r);
  	} else if (template.x) {
  		return new ExpressionProxy(fragment, template.x);
  	} else {
  		return new ReferenceExpressionProxy(fragment, template.rx);
  	}
  }

  function resolveAliases(section) {
  	if (section.template.z) {
  		section.aliases = {};

  		var refs = section.template.z;
  		for (var i = 0; i < refs.length; i++) {
  			section.aliases[refs[i].n] = resolve$1(section.parentFragment, refs[i].x);
  		}
  	}
  }

  var Alias = (function (_Item) {
  	inherits(Alias, _Item);

  	function Alias(options) {
  		classCallCheck(this, Alias);

  		_Item.call(this, options);

  		this.fragment = null;
  	}

  	Alias.prototype.bind = function bind() {
  		resolveAliases(this);

  		this.fragment = new Fragment({
  			owner: this,
  			template: this.template.f
  		}).bind();
  	};

  	Alias.prototype.detach = function detach() {
  		return this.fragment ? this.fragment.detach() : createDocumentFragment();
  	};

  	Alias.prototype.find = function find(selector) {
  		if (this.fragment) {
  			return this.fragment.find(selector);
  		}
  	};

  	Alias.prototype.findAll = function findAll(selector, query) {
  		if (this.fragment) {
  			this.fragment.findAll(selector, query);
  		}
  	};

  	Alias.prototype.findComponent = function findComponent(name) {
  		if (this.fragment) {
  			return this.fragment.findComponent(name);
  		}
  	};

  	Alias.prototype.findAllComponents = function findAllComponents(name, query) {
  		if (this.fragment) {
  			this.fragment.findAllComponents(name, query);
  		}
  	};

  	Alias.prototype.firstNode = function firstNode() {
  		return this.fragment && this.fragment.firstNode();
  	};

  	Alias.prototype.rebind = function rebind() {
  		resolveAliases(this);
  		if (this.fragment) this.fragment.rebind();
  	};

  	Alias.prototype.render = function render(target) {
  		this.rendered = true;
  		if (this.fragment) this.fragment.render(target);
  	};

  	Alias.prototype.toString = function toString(escape) {
  		return this.fragment ? this.fragment.toString(escape) : '';
  	};

  	Alias.prototype.unbind = function unbind() {
  		this.aliases = {};
  		if (this.fragment) this.fragment.unbind();
  	};

  	Alias.prototype.unrender = function unrender(shouldDestroy) {
  		if (this.rendered && this.fragment) this.fragment.unrender(shouldDestroy);
  		this.rendered = false;
  	};

  	Alias.prototype.update = function update() {
  		if (!this.dirty) return;

  		this.fragment.update();

  		this.dirty = false;
  	};

  	return Alias;
  })(Item);

  var Doctype = (function (_Item) {
  	inherits(Doctype, _Item);

  	function Doctype() {
  		classCallCheck(this, Doctype);

  		_Item.apply(this, arguments);
  	}

  	Doctype.prototype.bind = function bind() {
  		// noop
  	};

  	Doctype.prototype.render = function render() {
  		// noop
  	};

  	Doctype.prototype.teardown = function teardown() {
  		// noop
  	};

  	Doctype.prototype.toString = function toString() {
  		return '<!DOCTYPE' + this.template.a + '>';
  	};

  	Doctype.prototype.unbind = function unbind() {
  		// noop
  	};

  	Doctype.prototype.unrender = function unrender() {
  		// noop
  	};

  	return Doctype;
  })(Item);

  var Mustache = (function (_Item) {
  	inherits(Mustache, _Item);

  	function Mustache(options) {
  		classCallCheck(this, Mustache);

  		_Item.call(this, options);

  		this.parentFragment = options.parentFragment;
  		this.template = options.template;
  		this.index = options.index;

  		this.isStatic = !!options.template.s;

  		this.model = null;
  		this.dirty = false;
  	}

  	Mustache.prototype.bind = function bind() {
  		var _this = this;

  		// try to find a model for this view
  		var model = resolve$1(this.parentFragment, this.template);
  		var value = model ? model.get() : undefined;

  		if (this.isStatic) {
  			this.model = { get: function () {
  					return value;
  				} };
  			return;
  		}

  		if (model) {
  			model.register(this);
  			this.model = model;
  		} else {
  			this.resolver = this.parentFragment.resolve(this.template.r, function (model) {
  				_this.model = model;
  				model.register(_this);

  				_this.handleChange();
  				_this.resolver = null;
  			});
  		}
  	};

  	Mustache.prototype.handleChange = function handleChange() {
  		this.bubble();
  	};

  	Mustache.prototype.rebind = function rebind() {
  		if (this.isStatic || !this.model) return;

  		var model = resolve$1(this.parentFragment, this.template);

  		if (model === this.model) return;

  		this.model.unregister(this);

  		this.model = model;

  		if (model) {
  			model.register(this);
  			this.handleChange();
  		}
  	};

  	Mustache.prototype.unbind = function unbind() {
  		if (!this.isStatic) {
  			this.model && this.model.unregister(this);
  			this.resolver && this.resolver.unbind();
  		}
  	};

  	return Mustache;
  })(Item);

  // https://github.com/kangax/html-minifier/issues/63#issuecomment-37763316
  var booleanAttributes = /^(allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|translate|trueSpeed|typeMustMatch|visible)$/i;
  var voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

  var htmlEntities = { quot: 34, amp: 38, apos: 39, lt: 60, gt: 62, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, sect: 167, uml: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, macr: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402, circ: 710, tilde: 732, Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918, Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925, Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933, Phi: 934, Chi: 935, Psi: 936, Omega: 937, alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, zeta: 950, eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957, xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigma: 963, tau: 964, upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969, thetasym: 977, upsih: 978, piv: 982, ensp: 8194, emsp: 8195, thinsp: 8201, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207, ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, bull: 8226, hellip: 8230, permil: 8240, prime: 8242, Prime: 8243, lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, euro: 8364, image: 8465, weierp: 8472, real: 8476, trade: 8482, alefsym: 8501, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, crarr: 8629, lArr: 8656, uArr: 8657, rArr: 8658, dArr: 8659, hArr: 8660, forall: 8704, part: 8706, exist: 8707, empty: 8709, nabla: 8711, isin: 8712, notin: 8713, ni: 8715, prod: 8719, sum: 8721, minus: 8722, lowast: 8727, radic: 8730, prop: 8733, infin: 8734, ang: 8736, and: 8743, or: 8744, cap: 8745, cup: 8746, 'int': 8747, there4: 8756, sim: 8764, cong: 8773, asymp: 8776, ne: 8800, equiv: 8801, le: 8804, ge: 8805, sub: 8834, sup: 8835, nsub: 8836, sube: 8838, supe: 8839, oplus: 8853, otimes: 8855, perp: 8869, sdot: 8901, lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971, lang: 9001, rang: 9002, loz: 9674, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830 };
  var controlCharacters = [8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376];
  var entityPattern = new RegExp('&(#?(?:x[\\w\\d]+|\\d+|' + Object.keys(htmlEntities).join('|') + '));?', 'g');

  function decodeCharacterReferences(html) {
  	return html.replace(entityPattern, function (match, entity) {
  		var code;

  		// Handle named entities
  		if (entity[0] !== '#') {
  			code = htmlEntities[entity];
  		} else if (entity[1] === 'x') {
  			code = parseInt(entity.substring(2), 16);
  		} else {
  			code = parseInt(entity.substring(1), 10);
  		}

  		if (!code) {
  			return match;
  		}

  		return String.fromCharCode(validateCode(code));
  	});
  }

  var lessThan = /</g;
  var greaterThan = />/g;
  var amp = /&/g;

  function escapeHtml(str) {
  	return str.replace(amp, '&amp;').replace(lessThan, '&lt;').replace(greaterThan, '&gt;');
  }

  // some code points are verboten. If we were inserting HTML, the browser would replace the illegal
  // code points with alternatives in some cases - since we're bypassing that mechanism, we need
  // to replace them ourselves
  //
  // Source: http://en.wikipedia.org/wiki/Character_encodings_in_HTML#Illegal_characters
  function validateCode(code) {
  	if (!code) {
  		return 65533;
  	}

  	// line feed becomes generic whitespace
  	if (code === 10) {
  		return 32;
  	}

  	// ASCII range. (Why someone would use HTML entities for ASCII characters I don't know, but...)
  	if (code < 128) {
  		return code;
  	}

  	// code points 128-159 are dealt with leniently by browsers, but they're incorrect. We need
  	// to correct the mistake or we'll end up with missing € signs and so on
  	if (code <= 159) {
  		return controlCharacters[code - 128];
  	}

  	// basic multilingual plane
  	if (code < 55296) {
  		return code;
  	}

  	// UTF-16 surrogate halves
  	if (code <= 57343) {
  		return 65533;
  	}

  	// rest of the basic multilingual plane
  	if (code <= 65535) {
  		return code;
  	}

  	return 65533;
  }

  var Interpolator = (function (_Mustache) {
  	inherits(Interpolator, _Mustache);

  	function Interpolator() {
  		classCallCheck(this, Interpolator);

  		_Mustache.apply(this, arguments);
  	}

  	Interpolator.prototype.detach = function detach() {
  		return detachNode(this.node);
  	};

  	Interpolator.prototype.firstNode = function firstNode() {
  		return this.node;
  	};

  	Interpolator.prototype.getString = function getString() {
  		return this.model ? safeToStringValue(this.model.get()) : '';
  	};

  	Interpolator.prototype.render = function render(target, occupants) {
  		var value = this.getString();

  		this.rendered = true;

  		if (occupants) {
  			var n = occupants[0];
  			if (n && n.nodeType === 3) {
  				occupants.shift();
  				if (n.nodeValue !== value) {
  					n.nodeValue = value;
  				}
  			} else {
  				n = this.node = doc.createTextNode(value);
  				if (occupants[0]) {
  					target.insertBefore(n, occupants[0]);
  				} else {
  					target.appendChild(n);
  				}
  			}

  			this.node = n;
  		} else {
  			this.node = doc.createTextNode(value);
  			target.appendChild(this.node);
  		}
  	};

  	Interpolator.prototype.toString = function toString(escape) {
  		var string = this.getString();
  		return escape ? escapeHtml(string) : string;
  	};

  	Interpolator.prototype.unrender = function unrender(shouldDestroy) {
  		if (shouldDestroy) this.detach();
  		this.rendered = false;
  	};

  	Interpolator.prototype.update = function update() {
  		if (this.dirty) {
  			if (this.rendered) {
  				this.node.data = this.getString();
  			}

  			this.dirty = false;
  		}
  	};

  	Interpolator.prototype.valueOf = function valueOf() {
  		return this.model ? this.model.get() : undefined;
  	};

  	return Interpolator;
  })(Mustache);

  function findInViewHierarchy(registryName, ractive, name) {
  	var instance = findInstance(registryName, ractive, name);
  	return instance ? instance[registryName][name] : null;
  }

  function findInstance(registryName, ractive, name) {
  	while (ractive) {
  		if (name in ractive[registryName]) {
  			return ractive;
  		}

  		if (ractive.isolated) {
  			return null;
  		}

  		ractive = ractive.parent;
  	}
  }

  function getPartialTemplate(ractive, name, parentFragment) {
  	// If the partial in instance or view heirarchy instances, great
  	var partial = getPartialFromRegistry(ractive, name, parentFragment || {});
  	if (partial) return partial;

  	// Does it exist on the page as a script tag?
  	partial = parser.fromId(name, { noThrow: true });
  	if (partial) {
  		// parse and register to this ractive instance
  		var parsed = parser.parse(partial, parser.getParseOptions(ractive));

  		// register (and return main partial if there are others in the template)
  		return ractive.partials[name] = parsed.t;
  	}
  }

  function getPartialFromRegistry(ractive, name, parentFragment) {
  	// if there was an instance up-hierarchy, cool
  	var partial = findParentPartial(name, parentFragment.owner);
  	if (partial) return partial;

  	// find first instance in the ractive or view hierarchy that has this partial
  	var instance = findInstance('partials', ractive, name);

  	if (!instance) {
  		return;
  	}

  	partial = instance.partials[name];

  	// partial is a function?
  	var fn = undefined;
  	if (typeof partial === 'function') {
  		fn = partial.bind(instance);
  		fn.isOwner = instance.partials.hasOwnProperty(name);
  		partial = fn.call(ractive, parser);
  	}

  	if (!partial && partial !== '') {
  		warnIfDebug(noRegistryFunctionReturn, name, 'partial', 'partial', { ractive: ractive });
  		return;
  	}

  	// If this was added manually to the registry,
  	// but hasn't been parsed, parse it now
  	if (!parser.isParsed(partial)) {
  		// use the parseOptions of the ractive instance on which it was found
  		var parsed = parser.parse(partial, parser.getParseOptions(instance));

  		// Partials cannot contain nested partials!
  		// TODO add a test for this
  		if (parsed.p) {
  			warnIfDebug('Partials ({{>%s}}) cannot contain nested inline partials', name, { ractive: ractive });
  		}

  		// if fn, use instance to store result, otherwise needs to go
  		// in the correct point in prototype chain on instance or constructor
  		var target = fn ? instance : findOwner(instance, name);

  		// may be a template with partials, which need to be registered and main template extracted
  		target.partials[name] = partial = parsed.t;
  	}

  	// store for reset
  	if (fn) partial._fn = fn;

  	return partial.v ? partial.t : partial;
  }

  function findOwner(ractive, key) {
  	return ractive.partials.hasOwnProperty(key) ? ractive : findConstructor(ractive.constructor, key);
  }

  function findConstructor(constructor, key) {
  	if (!constructor) {
  		return;
  	}
  	return constructor.partials.hasOwnProperty(key) ? constructor : findConstructor(constructor._Parent, key);
  }

  function findParentPartial(name, parent) {
  	if (parent) {
  		if (parent.template && parent.template.p && parent.template.p[name]) {
  			return parent.template.p[name];
  		} else if (parent.parentFragment && parent.parentFragment.owner) {
  			return findParentPartial(name, parent.parentFragment.owner);
  		}
  	}
  }

  var Partial = (function (_Mustache) {
  	inherits(Partial, _Mustache);

  	function Partial() {
  		classCallCheck(this, Partial);

  		_Mustache.apply(this, arguments);
  	}

  	Partial.prototype.bind = function bind() {
  		_Mustache.prototype.bind.call(this);

  		// keep track of the reference name for future resets
  		this.refName = this.template.r;

  		// name matches take priority over expressions
  		var template = this.refName ? getPartialTemplate(this.ractive, this.refName, this.parentFragment) || null : null;

  		if (template) {
  			this.named = true;
  			this.setTemplate(this.template.r, template);
  		} else if ((!this.model || typeof this.model.get() !== 'string') && this.refName) {
  			this.setTemplate(this.refName, template);
  		} else {
  			this.setTemplate(this.model.get());
  		}

  		this.fragment = new Fragment({
  			owner: this,
  			template: this.partialTemplate
  		}).bind();
  	};

  	Partial.prototype.detach = function detach() {
  		return this.fragment.detach();
  	};

  	Partial.prototype.find = function find(selector) {
  		return this.fragment.find(selector);
  	};

  	Partial.prototype.findAll = function findAll(selector, query) {
  		this.fragment.findAll(selector, query);
  	};

  	Partial.prototype.findComponent = function findComponent(name) {
  		return this.fragment.findComponent(name);
  	};

  	Partial.prototype.findAllComponents = function findAllComponents(name, query) {
  		this.fragment.findAllComponents(name, query);
  	};

  	Partial.prototype.firstNode = function firstNode() {
  		return this.fragment.firstNode();
  	};

  	Partial.prototype.forceResetTemplate = function forceResetTemplate() {
  		this.partialTemplate = undefined;

  		// on reset, check for the reference name first
  		if (this.refName) {
  			this.partialTemplate = getPartialTemplate(this.ractive, this.refName, this.parentFragment);
  		}

  		// then look for the resolved name
  		if (!this.partialTemplate) {
  			this.partialTemplate = getPartialTemplate(this.ractive, this.name, this.parentFragment);
  		}

  		if (!this.partialTemplate) {
  			warnOnceIfDebug('Could not find template for partial \'' + this.name + '\'');
  			this.partialTemplate = [];
  		}

  		this.fragment.resetTemplate(this.partialTemplate);
  		this.bubble();
  	};

  	Partial.prototype.rebind = function rebind() {
  		_Mustache.prototype.unbind.call(this);
  		_Mustache.prototype.bind.call(this);
  		this.fragment.rebind();
  	};

  	Partial.prototype.render = function render(target, occupants) {
  		this.fragment.render(target, occupants);
  	};

  	Partial.prototype.setTemplate = function setTemplate(name, template) {
  		this.name = name;

  		if (!template && template !== null) template = getPartialTemplate(this.ractive, name, this.parentFragment);

  		if (!template) {
  			warnOnceIfDebug('Could not find template for partial \'' + name + '\'');
  		}

  		this.partialTemplate = template || [];
  	};

  	Partial.prototype.toString = function toString(escape) {
  		return this.fragment.toString(escape);
  	};

  	Partial.prototype.unbind = function unbind() {
  		_Mustache.prototype.unbind.call(this);
  		this.fragment.unbind();
  	};

  	Partial.prototype.unrender = function unrender(shouldDestroy) {
  		this.fragment.unrender(shouldDestroy);
  	};

  	Partial.prototype.update = function update() {
  		if (this.dirty) {
  			if (!this.named) {
  				if (this.model && typeof this.model.get() === 'string' && this.model.get() !== this.name) {
  					this.setTemplate(this.model.get());
  					this.fragment.resetTemplate(this.partialTemplate);
  				}
  			}

  			this.fragment.update();
  			this.dirty = false;
  		}
  	};

  	return Partial;
  })(Mustache);

  function getRefs(ref, value, parent) {
  	var refs = undefined;

  	if (ref) {
  		refs = {};
  		Object.keys(parent).forEach(function (ref) {
  			refs[ref] = parent[ref];
  		});
  		refs[ref] = value;
  	} else {
  		refs = parent;
  	}

  	return refs;
  }

  var RepeatedFragment = (function () {
  	function RepeatedFragment(options) {
  		classCallCheck(this, RepeatedFragment);

  		this.parent = options.owner.parentFragment;

  		// bit of a hack, so reference resolution works without another
  		// layer of indirection
  		this.parentFragment = this;
  		this.owner = options.owner;
  		this.ractive = this.parent.ractive;

  		this.context = null;
  		this.rendered = false;
  		this.iterations = [];

  		this.template = options.template;

  		this.indexRef = options.indexRef;
  		this.keyRef = options.keyRef;
  		this.indexByKey = null; // for `{{#each object}}...`

  		this.pendingNewIndices = null;
  		this.previousIterations = null;

  		// track array versus object so updates of type rest
  		this.isArray = false;
  	}

  	RepeatedFragment.prototype.bind = function bind(context) {
  		var _this = this;

  		this.context = context;
  		var value = context.get();

  		// {{#each array}}...
  		if (this.isArray = isArray(value)) {
  			// we can't use map, because of sparse arrays
  			this.iterations = [];
  			for (var i = 0; i < value.length; i += 1) {
  				this.iterations[i] = this.createIteration(i, i);
  			}
  		}

  		// {{#each object}}...
  		else if (isObject(value)) {
  				this.isArray = false;

  				// TODO this is a dreadful hack. There must be a neater way
  				if (this.indexRef) {
  					var refs = this.indexRef.split(',');
  					this.keyRef = refs[0];
  					this.indexRef = refs[1];
  				}

  				this.indexByKey = {};
  				this.iterations = Object.keys(value).map(function (key, index) {
  					_this.indexByKey[key] = index;
  					return _this.createIteration(key, index);
  				});
  			}

  		return this;
  	};

  	RepeatedFragment.prototype.bubble = function bubble() {
  		this.owner.bubble();
  	};

  	RepeatedFragment.prototype.createIteration = function createIteration(key, index) {
  		var parentFragment = this.owner.parentFragment;
  		var keyRefs = getRefs(this.keyRef, key, parentFragment.keyRefs);
  		var indexRefs = getRefs(this.indexRef, index, parentFragment.indexRefs);

  		var fragment = new Fragment({
  			owner: this,
  			template: this.template,
  			indexRefs: indexRefs,
  			keyRefs: keyRefs
  		});

  		// TODO this is a bit hacky
  		fragment.key = key;
  		fragment.index = index;
  		fragment.isIteration = true;

  		var model = this.context.joinKey(key);

  		// set up an iteration alias if there is one
  		if (this.owner.template.z) {
  			fragment.aliases = defineProperty({}, this.owner.template.z[0].n, model);
  		}

  		return fragment.bind(model);
  	};

  	RepeatedFragment.prototype.detach = function detach() {
  		var docFrag = createDocumentFragment();
  		this.iterations.forEach(function (fragment) {
  			return docFrag.appendChild(fragment.detach());
  		});
  		return docFrag;
  	};

  	RepeatedFragment.prototype.find = function find(selector) {
  		var len = this.iterations.length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			var found = this.iterations[i].find(selector);
  			if (found) return found;
  		}
  	};

  	RepeatedFragment.prototype.findAll = function findAll(selector, query) {
  		var len = this.iterations.length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			this.iterations[i].findAll(selector, query);
  		}
  	};

  	RepeatedFragment.prototype.findComponent = function findComponent(name) {
  		var len = this.iterations.length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			var found = this.iterations[i].findComponent(name);
  			if (found) return found;
  		}
  	};

  	RepeatedFragment.prototype.findAllComponents = function findAllComponents(name, query) {
  		var len = this.iterations.length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			this.iterations[i].findAllComponents(name, query);
  		}
  	};

  	RepeatedFragment.prototype.findNextNode = function findNextNode(iteration) {
  		if (iteration.index < this.iterations.length - 1) {
  			for (var i = iteration.index + 1; i < this.iterations.length; i++) {
  				var node = this.iterations[i].firstNode();
  				if (node) return node;
  			}
  		}

  		return this.owner.findNextNode();
  	};

  	RepeatedFragment.prototype.firstNode = function firstNode() {
  		return this.iterations[0] ? this.iterations[0].firstNode() : null;
  	};

  	RepeatedFragment.prototype.rebind = function rebind(context) {
  		var _this2 = this;

  		this.context = context;

  		// {{#each array}}...
  		if (isArray(context.get())) {
  			this.iterations.forEach(function (fragment, i) {
  				var model = context.joinKey(i);
  				if (_this2.owner.template.z) {
  					fragment.aliases = defineProperty({}, _this2.owner.template.z[0].n, model);
  				}
  				fragment.rebind(model);
  			});
  		}
  	};

  	RepeatedFragment.prototype.render = function render(target, occupants) {
  		// TODO use docFrag.cloneNode...

  		if (this.iterations) {
  			this.iterations.forEach(function (fragment) {
  				return fragment.render(target, occupants);
  			});
  		}

  		this.rendered = true;
  	};

  	RepeatedFragment.prototype.shuffle = function shuffle(newIndices) {
  		var _this3 = this;

  		if (!this.pendingNewIndices) this.previousIterations = this.iterations.slice();

  		if (!this.pendingNewIndices) this.pendingNewIndices = [];

  		this.pendingNewIndices.push(newIndices);

  		var iterations = [];

  		newIndices.forEach(function (newIndex, oldIndex) {
  			if (newIndex === -1) return;

  			var fragment = _this3.iterations[oldIndex];
  			iterations[newIndex] = fragment;

  			if (newIndex !== oldIndex && fragment) fragment.dirty = true;
  		});

  		this.iterations = iterations;

  		this.bubble();
  	};

  	RepeatedFragment.prototype.toString = function toString(escape) {
  		return this.iterations ? this.iterations.map(escape ? toEscapedString : _toString).join('') : '';
  	};

  	RepeatedFragment.prototype.unbind = function unbind() {
  		this.iterations.forEach(_unbind);
  		return this;
  	};

  	RepeatedFragment.prototype.unrender = function unrender(shouldDestroy) {
  		this.iterations.forEach(shouldDestroy ? unrenderAndDestroy$1 : _unrender);
  		this.rendered = false;
  	};

  	// TODO smart update

  	RepeatedFragment.prototype.update = function update() {
  		var _this4 = this;

  		// skip dirty check, since this is basically just a facade

  		if (this.pendingNewIndices) {
  			this.updatePostShuffle();
  			return;
  		}

  		var value = this.context.get(),
  		    wasArray = this.isArray;

  		var toRemove = undefined;
  		var oldKeys = undefined;
  		var reset = true;
  		var i = undefined;

  		if (this.isArray = isArray(value)) {
  			if (wasArray) {
  				reset = false;
  				if (this.iterations.length > value.length) {
  					toRemove = this.iterations.splice(value.length);
  				}
  			}
  		} else if (isObject(value) && !wasArray) {
  			reset = false;
  			toRemove = [];
  			oldKeys = {};
  			i = this.iterations.length;

  			while (i--) {
  				var _fragment = this.iterations[i];
  				if (_fragment.key in value) {
  					oldKeys[_fragment.key] = true;
  				} else {
  					this.iterations.splice(i, 1);
  					toRemove.push(_fragment);
  				}
  			}
  		}

  		if (reset) {
  			toRemove = this.iterations;
  			this.iterations = [];
  		}

  		if (toRemove) {
  			toRemove.forEach(function (fragment) {
  				fragment.unbind();
  				fragment.unrender(true);
  			});
  		}

  		// update the remaining ones
  		this.iterations.forEach(_update);

  		// add new iterations
  		var newLength = isArray(value) ? value.length : isObject(value) ? Object.keys(value).length : 0;

  		var docFrag = undefined;
  		var fragment = undefined;

  		if (newLength > this.iterations.length) {
  			docFrag = this.rendered ? createDocumentFragment() : null;
  			i = this.iterations.length;

  			if (isArray(value)) {
  				while (i < value.length) {
  					fragment = this.createIteration(i, i);

  					this.iterations.push(fragment);
  					if (this.rendered) fragment.render(docFrag);

  					i += 1;
  				}
  			} else if (isObject(value)) {
  				Object.keys(value).forEach(function (key) {
  					if (!oldKeys || !(key in oldKeys)) {
  						fragment = _this4.createIteration(key, i);

  						_this4.iterations.push(fragment);
  						if (_this4.rendered) fragment.render(docFrag);

  						i += 1;
  					}
  				});
  			}

  			if (this.rendered) {
  				var parentNode = this.parent.findParentNode();
  				var anchor = this.parent.findNextNode(this.owner);

  				parentNode.insertBefore(docFrag, anchor);
  			}
  		}
  	};

  	RepeatedFragment.prototype.updatePostShuffle = function updatePostShuffle() {
  		var _this5 = this;

  		var newIndices = this.pendingNewIndices[0];

  		// map first shuffle through
  		this.pendingNewIndices.slice(1).forEach(function (indices) {
  			newIndices.forEach(function (newIndex, oldIndex) {
  				newIndices[oldIndex] = indices[newIndex];
  			});
  		});

  		// This algorithm (for detaching incorrectly-ordered fragments from the DOM and
  		// storing them in a document fragment for later reinsertion) seems a bit hokey,
  		// but it seems to work for now
  		var previousNewIndex = -1;
  		var reinsertFrom = null;

  		newIndices.forEach(function (newIndex, oldIndex) {
  			var fragment = _this5.previousIterations[oldIndex];

  			if (newIndex === -1) {
  				fragment.unbind().unrender(true);
  			} else {
  				fragment.index = newIndex;
  				var model = _this5.context.joinKey(newIndex);
  				if (_this5.owner.template.z) {
  					fragment.aliases = defineProperty({}, _this5.owner.template.z[0].n, model);
  				}
  				fragment.rebind(model);

  				if (reinsertFrom === null && newIndex !== previousNewIndex + 1) {
  					reinsertFrom = oldIndex;
  				}
  			}

  			previousNewIndex = newIndex;
  		});

  		// create new iterations
  		var docFrag = this.rendered ? createDocumentFragment() : null;
  		var parentNode = this.rendered ? this.parent.findParentNode() : null;

  		var len = this.context.get().length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			var existingFragment = this.iterations[i];

  			if (this.rendered) {
  				if (existingFragment) {
  					if (reinsertFrom !== null && i >= reinsertFrom) {
  						docFrag.appendChild(existingFragment.detach());
  					} else if (docFrag.childNodes.length) {
  						parentNode.insertBefore(docFrag, existingFragment.firstNode());
  					}
  				} else {
  					this.iterations[i] = this.createIteration(i, i);
  					this.iterations[i].render(docFrag);
  				}
  			}

  			if (!this.rendered) {
  				if (!existingFragment) {
  					this.iterations[i] = this.createIteration(i, i);
  				}
  			}
  		}

  		if (this.rendered && docFrag.childNodes.length) {
  			parentNode.insertBefore(docFrag, this.owner.findNextNode());
  		}

  		this.iterations.forEach(_update);

  		this.pendingNewIndices = null;
  	};

  	return RepeatedFragment;
  })();

  function isEmpty(value) {
  	return !value || isArray(value) && value.length === 0 || isObject(value) && Object.keys(value).length === 0;
  }

  function getType(value, hasIndexRef) {
  	if (hasIndexRef || isArray(value)) return SECTION_EACH;
  	if (isObject(value) || typeof value === 'function') return SECTION_WITH;
  	if (value === undefined) return null;
  	return SECTION_IF;
  }

  var Section = (function (_Mustache) {
  	inherits(Section, _Mustache);

  	function Section(options) {
  		classCallCheck(this, Section);

  		_Mustache.call(this, options);

  		this.sectionType = options.template.n || null;
  		this.templateSectionType = this.sectionType;
  		this.fragment = null;
  	}

  	Section.prototype.bind = function bind() {
  		_Mustache.prototype.bind.call(this);

  		// if we managed to bind, we need to create children
  		if (this.model) {
  			this.dirty = true;
  			this.update();
  		} else if (this.sectionType && this.sectionType === SECTION_UNLESS) {
  			this.fragment = new Fragment({
  				owner: this,
  				template: this.template.f
  			}).bind();
  		}
  	};

  	Section.prototype.detach = function detach() {
  		return this.fragment ? this.fragment.detach() : createDocumentFragment();
  	};

  	Section.prototype.find = function find(selector) {
  		if (this.fragment) {
  			return this.fragment.find(selector);
  		}
  	};

  	Section.prototype.findAll = function findAll(selector, query) {
  		if (this.fragment) {
  			this.fragment.findAll(selector, query);
  		}
  	};

  	Section.prototype.findComponent = function findComponent(name) {
  		if (this.fragment) {
  			return this.fragment.findComponent(name);
  		}
  	};

  	Section.prototype.findAllComponents = function findAllComponents(name, query) {
  		if (this.fragment) {
  			this.fragment.findAllComponents(name, query);
  		}
  	};

  	Section.prototype.firstNode = function firstNode() {
  		return this.fragment && this.fragment.firstNode();
  	};

  	Section.prototype.rebind = function rebind() {
  		_Mustache.prototype.rebind.call(this);

  		if (this.fragment) {
  			this.fragment.rebind(this.sectionType === SECTION_IF ? null : this.model);
  		}
  	};

  	Section.prototype.render = function render(target, occupants) {
  		this.rendered = true;
  		if (this.fragment) this.fragment.render(target, occupants);
  	};

  	Section.prototype.shuffle = function shuffle(newIndices) {
  		if (this.fragment && this.sectionType === SECTION_EACH) {
  			this.fragment.shuffle(newIndices);
  		}
  	};

  	Section.prototype.toString = function toString(escape) {
  		return this.fragment ? this.fragment.toString(escape) : '';
  	};

  	Section.prototype.unbind = function unbind() {
  		_Mustache.prototype.unbind.call(this);
  		if (this.fragment) this.fragment.unbind();
  	};

  	Section.prototype.unrender = function unrender(shouldDestroy) {
  		if (this.rendered && this.fragment) this.fragment.unrender(shouldDestroy);
  		this.rendered = false;
  	};

  	Section.prototype.update = function update() {
  		if (!this.dirty) return;
  		if (!this.model && this.sectionType !== SECTION_UNLESS) return;

  		var value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
  		var lastType = this.sectionType;

  		// watch for switching section types
  		if (this.sectionType === null || this.templateSectionType === null) this.sectionType = getType(value, this.template.i);
  		if (lastType && lastType !== this.sectionType && this.fragment) {
  			if (this.rendered) {
  				this.fragment.unbind().unrender(true);
  			}

  			this.fragment = null;
  		}

  		var newFragment = undefined;

  		if (this.sectionType === SECTION_EACH) {
  			if (this.fragment) {
  				this.fragment.update();
  			} else {
  				// TODO can this happen?
  				newFragment = new RepeatedFragment({
  					owner: this,
  					template: this.template.f,
  					indexRef: this.template.i
  				}).bind(this.model);
  			}
  		}

  		// TODO same comment as before - WITH should be IF_WITH
  		else if (this.sectionType === SECTION_WITH) {
  				if (this.fragment) {
  					this.fragment.update();
  				} else {
  					newFragment = new Fragment({
  						owner: this,
  						template: this.template.f
  					}).bind(this.model);
  				}
  			} else if (this.sectionType === SECTION_IF_WITH) {
  				if (this.fragment) {
  					if (isEmpty(value)) {
  						if (this.rendered) {
  							this.fragment.unbind().unrender(true);
  						}

  						this.fragment = null;
  					} else {
  						this.fragment.update();
  					}
  				} else if (!isEmpty(value)) {
  					newFragment = new Fragment({
  						owner: this,
  						template: this.template.f
  					}).bind(this.model);
  				}
  			} else {
  				var fragmentShouldExist = this.sectionType === SECTION_UNLESS ? isEmpty(value) : !!value && !isEmpty(value);

  				if (this.fragment) {
  					if (fragmentShouldExist) {
  						this.fragment.update();
  					} else {
  						if (this.rendered) {
  							this.fragment.unbind().unrender(true);
  						}

  						this.fragment = null;
  					}
  				} else if (fragmentShouldExist) {
  					newFragment = new Fragment({
  						owner: this,
  						template: this.template.f
  					}).bind(null);
  				}
  			}

  		if (newFragment) {
  			if (this.rendered) {
  				var parentNode = this.parentFragment.findParentNode();
  				var anchor = this.parentFragment.findNextNode(this);

  				if (anchor) {
  					var docFrag = createDocumentFragment();
  					newFragment.render(docFrag);

  					// we use anchor.parentNode, not parentNode, because the sibling
  					// may be temporarily detached as a result of a shuffle
  					anchor.parentNode.insertBefore(docFrag, anchor);
  				} else {
  					newFragment.render(parentNode);
  				}
  			}

  			this.fragment = newFragment;
  		}

  		this.dirty = false;
  	};

  	return Section;
  })(Mustache);

  var elementCache = {};

  var ieBug = undefined;
  var ieBlacklist = undefined;

  try {
  	createElement('table').innerHTML = 'foo';
  } catch (err) {
  	ieBug = true;

  	ieBlacklist = {
  		TABLE: ['<table class="x">', '</table>'],
  		THEAD: ['<table><thead class="x">', '</thead></table>'],
  		TBODY: ['<table><tbody class="x">', '</tbody></table>'],
  		TR: ['<table><tr class="x">', '</tr></table>'],
  		SELECT: ['<select class="x">', '</select>']
  	};
  }

  function insertHtml (html, node, docFrag) {
  	var nodes = [];

  	// render 0 and false
  	if (html == null || html === '') return nodes;

  	var container = undefined;
  	var wrapper = undefined;
  	var selectedOption = undefined;

  	if (ieBug && (wrapper = ieBlacklist[node.tagName])) {
  		container = element('DIV');
  		container.innerHTML = wrapper[0] + html + wrapper[1];
  		container = container.querySelector('.x');

  		if (container.tagName === 'SELECT') {
  			selectedOption = container.options[container.selectedIndex];
  		}
  	} else if (node.namespaceURI === svg$1) {
  		container = element('DIV');
  		container.innerHTML = '<svg class="x">' + html + '</svg>';
  		container = container.querySelector('.x');
  	} else {
  		container = element(node.tagName);
  		container.innerHTML = html;

  		if (container.tagName === 'SELECT') {
  			selectedOption = container.options[container.selectedIndex];
  		}
  	}

  	var child = undefined;
  	while (child = container.firstChild) {
  		nodes.push(child);
  		docFrag.appendChild(child);
  	}

  	// This is really annoying. Extracting <option> nodes from the
  	// temporary container <select> causes the remaining ones to
  	// become selected. So now we have to deselect them. IE8, you
  	// amaze me. You really do
  	// ...and now Chrome too
  	var i = undefined;
  	if (node.tagName === 'SELECT') {
  		i = nodes.length;
  		while (i--) {
  			if (nodes[i] !== selectedOption) {
  				nodes[i].selected = false;
  			}
  		}
  	}

  	return nodes;
  }

  function element(tagName) {
  	return elementCache[tagName] || (elementCache[tagName] = createElement(tagName));
  }

  var Triple = (function (_Mustache) {
  	inherits(Triple, _Mustache);

  	function Triple(options) {
  		classCallCheck(this, Triple);

  		_Mustache.call(this, options);
  	}

  	Triple.prototype.detach = function detach() {
  		var docFrag = createDocumentFragment();
  		this.nodes.forEach(function (node) {
  			return docFrag.appendChild(node);
  		});
  		return docFrag;
  	};

  	Triple.prototype.find = function find(selector) {
  		var len = this.nodes.length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			var node = this.nodes[i];

  			if (node.nodeType !== 1) continue;

  			if (matches(node, selector)) return node;

  			var queryResult = node.querySelector(selector);
  			if (queryResult) return queryResult;
  		}

  		return null;
  	};

  	Triple.prototype.findAll = function findAll(selector, query) {
  		var len = this.nodes.length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			var node = this.nodes[i];

  			if (node.nodeType !== 1) continue;

  			if (query.test(node)) query.add(node);

  			var queryAllResult = node.querySelectorAll(selector);
  			if (queryAllResult) {
  				var numNodes = queryAllResult.length;
  				var j = undefined;

  				for (j = 0; j < numNodes; j += 1) {
  					query.add(queryAllResult[j]);
  				}
  			}
  		}
  	};

  	Triple.prototype.findComponent = function findComponent() {
  		return null;
  	};

  	Triple.prototype.firstNode = function firstNode() {
  		return this.nodes[0];
  	};

  	Triple.prototype.render = function render(target) {
  		var html = this.model ? this.model.get() : '';
  		this.nodes = insertHtml(html, this.parentFragment.findParentNode(), target);
  		this.rendered = true;
  	};

  	Triple.prototype.toString = function toString() {
  		return this.model && this.model.get() != null ? decodeCharacterReferences('' + this.model.get()) : '';
  	};

  	Triple.prototype.unrender = function unrender() {
  		if (this.nodes) this.nodes.forEach(function (node) {
  			return detachNode(node);
  		});
  		this.rendered = false;
  	};

  	Triple.prototype.update = function update() {
  		if (this.rendered && this.dirty) {
  			this.unrender();
  			var docFrag = createDocumentFragment();
  			this.render(docFrag);

  			var parentNode = this.parentFragment.findParentNode();
  			var anchor = this.parentFragment.findNextNode(this);

  			parentNode.insertBefore(docFrag, anchor);

  			this.dirty = false;
  		}
  	};

  	return Triple;
  })(Mustache);

  var Yielder = (function (_Item) {
  	inherits(Yielder, _Item);

  	function Yielder(options) {
  		classCallCheck(this, Yielder);

  		_Item.call(this, options);

  		this.container = options.parentFragment.ractive;
  		this.component = this.container.component;

  		this.containerFragment = options.parentFragment;
  		this.parentFragment = this.component.parentFragment;

  		// {{yield}} is equivalent to {{yield content}}
  		this.name = options.template.n || '';
  	}

  	Yielder.prototype.bind = function bind() {
  		var name = this.name;

  		(this.component.yielders[name] || (this.component.yielders[name] = [])).push(this);

  		// TODO don't parse here
  		var template = this.container._inlinePartials[name || 'content'];

  		if (typeof template === 'string') {
  			template = parse(template).t;
  		}

  		if (!template) {
  			warnIfDebug('Could not find template for partial "' + name + '"', { ractive: this.ractive });
  			template = [];
  		}

  		this.fragment = new Fragment({
  			owner: this,
  			ractive: this.container.parent,
  			template: template
  		}).bind();
  	};

  	Yielder.prototype.bubble = function bubble() {
  		if (!this.dirty) {
  			this.containerFragment.bubble();
  			this.dirty = true;
  		}
  	};

  	Yielder.prototype.detach = function detach() {
  		return this.fragment.detach();
  	};

  	Yielder.prototype.find = function find(selector) {
  		return this.fragment.find(selector);
  	};

  	Yielder.prototype.findAll = function findAll(selector, queryResult) {
  		this.fragment.find(selector, queryResult);
  	};

  	Yielder.prototype.findComponent = function findComponent(name) {
  		return this.fragment.findComponent(name);
  	};

  	Yielder.prototype.findAllComponents = function findAllComponents(name, queryResult) {
  		this.fragment.findAllComponents(name, queryResult);
  	};

  	Yielder.prototype.findNextNode = function findNextNode() {
  		return this.containerFragment.findNextNode(this);
  	};

  	Yielder.prototype.firstNode = function firstNode() {
  		return this.fragment.firstNode();
  	};

  	Yielder.prototype.rebind = function rebind() {
  		this.fragment.rebind();
  	};

  	Yielder.prototype.render = function render(target, occupants) {
  		return this.fragment.render(target, occupants);
  	};

  	Yielder.prototype.setTemplate = function setTemplate(name) {
  		var template = this.parentFragment.ractive.partials[name];

  		if (typeof template === 'string') {
  			template = parse(template).t;
  		}

  		this.partialTemplate = template || []; // TODO warn on missing partial
  	};

  	Yielder.prototype.toString = function toString(escape) {
  		return this.fragment.toString(escape);
  	};

  	Yielder.prototype.unbind = function unbind() {
  		this.fragment.unbind();
  		removeFromArray(this.component.yielders[this.name], this);
  	};

  	Yielder.prototype.unrender = function unrender(shouldDestroy) {
  		this.fragment.unrender(shouldDestroy);
  	};

  	Yielder.prototype.update = function update() {
  		this.fragment.update();
  		this.dirty = false;
  	};

  	return Yielder;
  })(Item);

  function determineNameAndNamespace (attribute, name) {
  	// are we dealing with a namespaced attribute, e.g. xlink:href?
  	var colonIndex = name.indexOf(':');
  	if (colonIndex !== -1) {
  		// looks like we are, yes...
  		var namespacePrefix = name.substr(0, colonIndex);

  		// ...unless it's a namespace *declaration*, which we ignore (on the assumption
  		// that only valid namespaces will be used)
  		if (namespacePrefix !== 'xmlns') {
  			name = name.substring(colonIndex + 1);

  			attribute.name = name;
  			attribute.namespace = namespaces[namespacePrefix.toLowerCase()];
  			attribute.namespacePrefix = namespacePrefix;

  			if (!attribute.namespace) {
  				throw 'Unknown namespace ("' + namespacePrefix + '")';
  			}

  			return;
  		}
  	}

  	attribute.name = name;
  }

  function getUpdateDelegate(attribute) {
  	var element = attribute.element;
  	var name = attribute.name;

  	if (name === 'id') return updateId;

  	if (name === 'value') {
  		// special case - selects
  		if (element.name === 'select' && name === 'value') {
  			return element.getAttribute('multiple') ? updateMultipleSelectValue : updateSelectValue;
  		}

  		if (element.name === 'textarea') return updateValue;

  		// special case - contenteditable
  		if (element.getAttribute('contenteditable') != null) return updateContentEditableValue;

  		// special case - <input>
  		if (element.name === 'input') {
  			var type = element.getAttribute('type');

  			// type='file' value='{{fileList}}'>
  			if (type === 'file') return noop; // read-only

  			// type='radio' name='{{twoway}}'
  			if (type === 'radio' && element.binding && element.binding.attribute.name === 'name') return updateRadioValue;
  		}

  		return updateValue;
  	}

  	var node = element.node;

  	// special case - <input type='radio' name='{{twoway}}' value='foo'>
  	if (attribute.isTwoway && name === 'name') {
  		if (node.type === 'radio') return updateRadioName;
  		if (node.type === 'checkbox') return updateCheckboxName;
  	}

  	// special case - style attributes in Internet Exploder
  	if (name === 'style' && node.style.setAttribute) return updateIEStyleAttribute;

  	// special case - class names. IE fucks things up, again
  	if (name === 'class' && (!node.namespaceURI || node.namespaceURI === html)) return updateClassName;

  	if (attribute.isBoolean) return updateBoolean;

  	if (attribute.namespace) return updateNamespacedAttribute;

  	return updateAttribute;
  }

  function updateId() {
  	var node = this.node;

  	var value = this.getValue();

  	delete this.ractive.nodes[node.id];
  	this.ractive.nodes[value] = node;

  	node.id = value;
  }

  function updateMultipleSelectValue() {
  	var value = this.getValue();

  	if (!isArray(value)) value = [value];

  	var options = this.node.options;
  	var i = options.length;

  	while (i--) {
  		var option = options[i];
  		var optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive

  		option.selected = arrayContains(value, optionValue);
  	}
  }

  function updateSelectValue() {
  	var value = this.getValue();

  	if (!this.locked) {
  		// TODO is locked still a thing?
  		this.node._ractive.value = value;

  		var options = this.node.options;
  		var i = options.length;

  		while (i--) {
  			var option = options[i];
  			var optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive

  			if (optionValue == value) {
  				// double equals as we may be comparing numbers with strings
  				option.selected = true;
  				break;
  			}
  		}
  	}

  	// if we're still here, it means the new value didn't match any of the options...
  	// TODO figure out what to do in this situation
  }

  function updateContentEditableValue() {
  	var value = this.getValue();

  	if (!this.locked) {
  		this.node.innerHTML = value === undefined ? '' : value;
  	}
  }

  function updateRadioValue() {
  	var node = this.node;
  	var wasChecked = node.checked;

  	var value = this.getValue();

  	//node.value = this.element.getAttribute( 'value' );
  	node.value = this.node._ractive.value = value;
  	node.checked = value === this.element.getAttribute('name');

  	// This is a special case - if the input was checked, and the value
  	// changed so that it's no longer checked, the twoway binding is
  	// most likely out of date. To fix it we have to jump through some
  	// hoops... this is a little kludgy but it works
  	if (wasChecked && !node.checked && this.element.binding && this.element.binding.rendered) {
  		this.element.binding.group.model.set(this.element.binding.group.getValue());
  	}
  }

  function updateValue() {
  	if (!this.locked) {
  		var value = this.getValue();

  		this.node.value = this.node._ractive.value = value;
  		this.node.setAttribute('value', value);
  	}
  }

  function updateRadioName() {
  	this.node.checked = this.getValue() == this.node._ractive.value;
  }

  function updateCheckboxName() {
  	var element = this.element;
  	var node = this.node;

  	var binding = element.binding;

  	var value = this.getValue();
  	var valueAttribute = element.getAttribute('value');

  	if (!isArray(value)) {
  		binding.isChecked = node.checked = value == valueAttribute;
  	} else {
  		var i = value.length;
  		while (i--) {
  			if (valueAttribute == value[i]) {
  				binding.isChecked = node.checked = true;
  				return;
  			}
  		}
  		binding.isChecked = node.checked = false;
  	}
  }

  function updateIEStyleAttribute() {
  	this.node.style.setAttribute('cssText', this.getValue() || '');
  }

  function updateClassName() {
  	this.node.className = safeToStringValue(this.getValue());
  }

  function updateBoolean() {
  	// with two-way binding, only update if the change wasn't initiated by the user
  	// otherwise the cursor will often be sent to the wrong place
  	if (!this.locked) {
  		if (this.useProperty) {
  			this.node[this.propertyName] = this.getValue();
  		} else {
  			if (this.getValue()) {
  				this.node.setAttribute(this.propertyName, '');
  			} else {
  				this.node.removeAttribute(this.propertyName);
  			}
  		}
  	}
  }

  function updateAttribute() {
  	this.node.setAttribute(this.name, safeToStringValue(this.getString()));
  }

  function updateNamespacedAttribute() {
  	this.node.setAttributeNS(this.namespace, this.name, safeToStringValue(this.getString()));
  }

  var propertyNames = {
  	'accept-charset': 'acceptCharset',
  	accesskey: 'accessKey',
  	bgcolor: 'bgColor',
  	'class': 'className',
  	codebase: 'codeBase',
  	colspan: 'colSpan',
  	contenteditable: 'contentEditable',
  	datetime: 'dateTime',
  	dirname: 'dirName',
  	'for': 'htmlFor',
  	'http-equiv': 'httpEquiv',
  	ismap: 'isMap',
  	maxlength: 'maxLength',
  	novalidate: 'noValidate',
  	pubdate: 'pubDate',
  	readonly: 'readOnly',
  	rowspan: 'rowSpan',
  	tabindex: 'tabIndex',
  	usemap: 'useMap'
  };

  var Attribute = (function (_Item) {
  	inherits(Attribute, _Item);

  	function Attribute(options) {
  		classCallCheck(this, Attribute);

  		_Item.call(this, options);

  		determineNameAndNamespace(this, options.name);

  		this.element = options.element;
  		this.parentFragment = options.element.parentFragment; // shared
  		this.ractive = this.parentFragment.ractive;

  		this.rendered = false;
  		this.updateDelegate = null;
  		this.fragment = null;
  		this.value = null;

  		if (!isArray(options.template)) {
  			this.value = options.template;
  			if (this.value === 0) {
  				this.value = '';
  			}
  		} else {
  			this.fragment = new Fragment({
  				owner: this,
  				template: options.template
  			});
  		}

  		this.interpolator = this.fragment && this.fragment.items.length === 1 && this.fragment.items[0].type === INTERPOLATOR && this.fragment.items[0];
  	}

  	Attribute.prototype.bind = function bind() {
  		if (this.fragment) {
  			this.fragment.bind();
  		}
  	};

  	Attribute.prototype.bubble = function bubble() {
  		if (!this.dirty) {
  			this.element.bubble();
  			this.dirty = true;
  		}
  	};

  	Attribute.prototype.getString = function getString() {
  		return this.fragment ? this.fragment.toString() : this.value != null ? '' + this.value : '';
  	};

  	// TODO could getValue ever be called for a static attribute,
  	// or can we assume that this.fragment exists?

  	Attribute.prototype.getValue = function getValue() {
  		return this.fragment ? this.fragment.valueOf() : booleanAttributes.test(this.name) ? true : this.value;
  	};

  	Attribute.prototype.rebind = function rebind() {
  		this.unbind();
  		this.bind();
  	};

  	Attribute.prototype.render = function render() {
  		var node = this.element.node;
  		this.node = node;

  		// should we use direct property access, or setAttribute?
  		if (!node.namespaceURI || node.namespaceURI === html) {
  			this.propertyName = propertyNames[this.name] || this.name;

  			if (node[this.propertyName] !== undefined) {
  				this.useProperty = true;
  			}

  			// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
  			// node.selected = true rather than node.setAttribute( 'selected', '' )
  			if (booleanAttributes.test(this.name) || this.isTwoway) {
  				this.isBoolean = true;
  			}

  			if (this.propertyName === 'value') {
  				node._ractive.value = this.value;
  			}
  		}

  		this.rendered = true;
  		this.updateDelegate = getUpdateDelegate(this);
  		this.updateDelegate();
  	};

  	Attribute.prototype.toString = function toString() {
  		var value = this.getValue();

  		// Special case - select and textarea values (should not be stringified)
  		if (this.name === 'value' && (this.element.getAttribute('contenteditable') !== undefined || this.element.name === 'select' || this.element.name === 'textarea')) {
  			return;
  		}

  		// Special case – bound radio `name` attributes
  		if (this.name === 'name' && this.element.name === 'input' && this.interpolator && this.element.getAttribute('type') === 'radio') {
  			return 'name="{{' + this.interpolator.model.getKeypath() + '}}"';
  		}

  		if (booleanAttributes.test(this.name)) return value ? this.name : '';
  		if (value == null) return '';

  		var str = safeToStringValue(this.getString()).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  		return str ? this.name + '="' + str + '"' : this.name;
  	};

  	Attribute.prototype.unbind = function unbind() {
  		if (this.fragment) this.fragment.unbind();
  	};

  	Attribute.prototype.update = function update() {
  		if (this.dirty) {
  			if (this.fragment) this.fragment.update();
  			if (this.rendered) this.updateDelegate();
  			this.dirty = false;
  		}
  	};

  	return Attribute;
  })(Item);

  var div$1 = doc ? createElement('div') : null;

  var ConditionalAttribute = (function (_Item) {
  	inherits(ConditionalAttribute, _Item);

  	function ConditionalAttribute(options) {
  		classCallCheck(this, ConditionalAttribute);

  		_Item.call(this, options);

  		this.attributes = [];

  		this.owner = options.owner;

  		this.fragment = new Fragment({
  			ractive: this.ractive,
  			owner: this,
  			template: [this.template]
  		});

  		this.dirty = false;
  	}

  	ConditionalAttribute.prototype.bind = function bind() {
  		this.fragment.bind();
  	};

  	ConditionalAttribute.prototype.bubble = function bubble() {
  		if (!this.dirty) {
  			this.dirty = true;
  			this.owner.bubble();
  		}
  	};

  	ConditionalAttribute.prototype.rebind = function rebind() {
  		this.fragment.rebind();
  	};

  	ConditionalAttribute.prototype.render = function render() {
  		this.node = this.owner.node;
  		this.isSvg = this.node.namespaceURI === svg$1;

  		this.rendered = true;
  		this.dirty = true; // TODO this seems hacky, but necessary for tests to pass in browser AND node.js
  		this.update();
  	};

  	ConditionalAttribute.prototype.toString = function toString() {
  		return this.fragment.toString();
  	};

  	ConditionalAttribute.prototype.unbind = function unbind() {
  		this.fragment.unbind();
  	};

  	ConditionalAttribute.prototype.unrender = function unrender() {
  		this.rendered = false;
  	};

  	ConditionalAttribute.prototype.update = function update() {
  		var _this = this;

  		var str = undefined;
  		var attrs = undefined;

  		if (this.dirty) {
  			this.fragment.update();

  			if (this.rendered) {
  				str = this.fragment.toString();
  				attrs = parseAttributes(str, this.isSvg);

  				// any attributes that previously existed but no longer do
  				// must be removed
  				this.attributes.filter(function (a) {
  					return notIn(attrs, a);
  				}).forEach(function (a) {
  					_this.node.removeAttribute(a.name);
  				});

  				attrs.forEach(function (a) {
  					_this.node.setAttribute(a.name, a.value);
  				});

  				this.attributes = attrs;
  			}

  			this.dirty = false;
  		}
  	};

  	return ConditionalAttribute;
  })(Item);

  function parseAttributes(str, isSvg) {
  	var tagName = isSvg ? 'svg' : 'div';
  	div$1.innerHTML = '<' + tagName + ' ' + str + '></' + tagName + '>';

  	return toArray(div$1.childNodes[0].attributes);
  }

  function notIn(haystack, needle) {
  	var i = haystack.length;

  	while (i--) {
  		if (haystack[i].name === needle.name) {
  			return false;
  		}
  	}

  	return true;
  }

  var missingDecorator = {
  	update: noop,
  	teardown: noop
  };

  var Decorator = (function () {
  	function Decorator(owner, template) {
  		classCallCheck(this, Decorator);

  		this.owner = owner;
  		this.template = template;

  		this.parentFragment = owner.parentFragment;
  		this.ractive = owner.ractive;

  		this.dynamicName = typeof template.n === 'object';
  		this.dynamicArgs = !!template.d;

  		if (this.dynamicName) {
  			this.nameFragment = new Fragment({
  				owner: this,
  				template: template.n
  			});
  		} else {
  			this.name = template.n || template;
  		}

  		if (this.dynamicArgs) {
  			this.argsFragment = new Fragment({
  				owner: this,
  				template: template.d
  			});
  		} else {
  			this.args = template.a || [];
  		}

  		this.node = null;
  		this.intermediary = null;
  	}

  	Decorator.prototype.bind = function bind() {
  		if (this.dynamicName) {
  			this.nameFragment.bind();
  			this.name = this.nameFragment.toString();
  		}

  		if (this.dynamicArgs) this.argsFragment.bind();
  	};

  	Decorator.prototype.bubble = function bubble() {
  		if (!this.dirty) {
  			this.dirty = true;
  			this.owner.bubble();
  		}
  	};

  	Decorator.prototype.rebind = function rebind() {
  		if (this.dynamicName) this.nameFragment.rebind();
  		if (this.dynamicArgs) this.argsFragment.rebind();
  	};

  	Decorator.prototype.render = function render() {
  		var fn = findInViewHierarchy('decorators', this.ractive, this.name);

  		if (!fn) {
  			warnOnce(missingPlugin(this.name, 'decorators'));
  			this.intermediary = missingDecorator;
  			return;
  		}

  		this.node = this.owner.node;

  		var args = this.dynamicArgs ? this.argsFragment.getArgsList() : this.args;
  		this.intermediary = fn.apply(this.ractive, [this.node].concat(args));

  		if (!this.intermediary || !this.intermediary.teardown) {
  			throw new Error('The \'' + this.name + '\' decorator must return an object with a teardown method');
  		}
  	};

  	Decorator.prototype.unbind = function unbind() {
  		if (this.dynamicName) this.nameFragment.unbind();
  		if (this.dynamicArgs) this.argsFragment.unbind();
  	};

  	Decorator.prototype.unrender = function unrender() {
  		if (this.intermediary) this.intermediary.teardown();
  	};

  	Decorator.prototype.update = function update() {
  		if (!this.dirty) return;

  		var nameChanged = false;

  		if (this.dynamicName && this.nameFragment.dirty) {
  			var _name = this.nameFragment.toString();
  			nameChanged = _name !== this.name;
  			this.name = _name;
  		}

  		if (nameChanged || !this.intermediary.update) {
  			this.unrender();
  			this.render();
  		} else {
  			if (this.dynamicArgs) {
  				if (this.argsFragment.dirty) {
  					var args = this.argsFragment.getArgsList();
  					this.intermediary.update.apply(this.ractive, args);
  				}
  			} else {
  				this.intermediary.update.apply(this.ractive, this.args);
  			}
  		}

  		// need to run these for unrender/render cases
  		// so can't just be in conditional if above

  		if (this.dynamicName && this.nameFragment.dirty) {
  			this.nameFragment.update();
  		}

  		if (this.dynamicArgs && this.argsFragment.dirty) {
  			this.argsFragment.update();
  		}

  		this.dirty = false;
  	};

  	return Decorator;
  })();

  function enqueue(ractive, event) {
  	if (ractive.event) {
  		ractive._eventQueue.push(ractive.event);
  	}

  	ractive.event = event;
  }

  function dequeue(ractive) {
  	if (ractive._eventQueue.length) {
  		ractive.event = ractive._eventQueue.pop();
  	} else {
  		ractive.event = null;
  	}
  }

  var starMaps = {};

  // This function takes a keypath such as 'foo.bar.baz', and returns
  // all the variants of that keypath that include a wildcard in place
  // of a key, such as 'foo.bar.*', 'foo.*.baz', 'foo.*.*' and so on.
  // These are then checked against the dependants map (ractive.viewmodel.depsMap)
  // to see if any pattern observers are downstream of one or more of
  // these wildcard keypaths (e.g. 'foo.bar.*.status')

  function getPotentialWildcardMatches(keypath) {
  	var keys, starMap, mapper, i, result, wildcardKeypath;

  	keys = splitKeypath(keypath);
  	if (!(starMap = starMaps[keys.length])) {
  		starMap = getStarMap(keys.length);
  	}

  	result = [];

  	mapper = function (star, i) {
  		return star ? '*' : keys[i];
  	};

  	i = starMap.length;
  	while (i--) {
  		wildcardKeypath = starMap[i].map(mapper).join('.');

  		if (!result.hasOwnProperty(wildcardKeypath)) {
  			result.push(wildcardKeypath);
  			result[wildcardKeypath] = true;
  		}
  	}

  	return result;
  }

  // This function returns all the possible true/false combinations for
  // a given number - e.g. for two, the possible combinations are
  // [ true, true ], [ true, false ], [ false, true ], [ false, false ].
  // It does so by getting all the binary values between 0 and e.g. 11
  function getStarMap(num) {
  	var ones = '',
  	    max,
  	    binary,
  	    starMap,
  	    mapper,
  	    i,
  	    j,
  	    l,
  	    map;

  	if (!starMaps[num]) {
  		starMap = [];

  		while (ones.length < num) {
  			ones += 1;
  		}

  		max = parseInt(ones, 2);

  		mapper = function (digit) {
  			return digit === '1';
  		};

  		for (i = 0; i <= max; i += 1) {
  			binary = i.toString(2);
  			while (binary.length < num) {
  				binary = '0' + binary;
  			}

  			map = [];
  			l = binary.length;
  			for (j = 0; j < l; j++) {
  				map.push(mapper(binary[j]));
  			}
  			starMap[i] = map;
  		}

  		starMaps[num] = starMap;
  	}

  	return starMaps[num];
  }

  var wildcardCache = {};
  function fireEvent(ractive, eventName) {
  	var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  	if (!eventName) {
  		return;
  	}

  	if (!options.event) {
  		options.event = {
  			name: eventName,
  			// until event not included as argument default
  			_noArg: true
  		};
  	} else {
  		options.event.name = eventName;
  	}

  	var eventNames = getWildcardNames(eventName);

  	fireEventAs(ractive, eventNames, options.event, options.args, true);
  }

  function getWildcardNames(eventName) {
  	if (wildcardCache.hasOwnProperty(eventName)) {
  		return wildcardCache[eventName];
  	} else {
  		return wildcardCache[eventName] = getPotentialWildcardMatches(eventName);
  	}
  }

  function fireEventAs(ractive, eventNames, event, args) {
  	var initialFire = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

  	var subscribers,
  	    i,
  	    bubble = true;

  	enqueue(ractive, event);

  	for (i = eventNames.length; i >= 0; i--) {
  		subscribers = ractive._subs[eventNames[i]];

  		if (subscribers) {
  			bubble = notifySubscribers(ractive, subscribers, event, args) && bubble;
  		}
  	}

  	dequeue(ractive);

  	if (ractive.parent && bubble) {

  		if (initialFire && ractive.component) {
  			var fullName = ractive.component.name + '.' + eventNames[eventNames.length - 1];
  			eventNames = getWildcardNames(fullName);

  			if (event && !event.component) {
  				event.component = ractive;
  			}
  		}

  		fireEventAs(ractive.parent, eventNames, event, args);
  	}
  }

  function notifySubscribers(ractive, subscribers, event, args) {
  	var originalEvent = null,
  	    stopEvent = false;

  	if (event && !event._noArg) {
  		args = [event].concat(args);
  	}

  	// subscribers can be modified inflight, e.g. "once" functionality
  	// so we need to copy to make sure everyone gets called
  	subscribers = subscribers.slice();

  	for (var i = 0, len = subscribers.length; i < len; i += 1) {
  		if (subscribers[i].apply(ractive, args) === false) {
  			stopEvent = true;
  		}
  	}

  	if (event && !event._noArg && stopEvent && (originalEvent = event.original)) {
  		originalEvent.preventDefault && originalEvent.preventDefault();
  		originalEvent.stopPropagation && originalEvent.stopPropagation();
  	}

  	return !stopEvent;
  }

  var eventPattern = /^event(?:\.(.+))?$/;
  var argumentsPattern = /^arguments\.(\d*)$/;
  var dollarArgsPattern = /^\$(\d*)$/;

  var EventDirective = (function () {
  	function EventDirective(owner, event, template) {
  		classCallCheck(this, EventDirective);

  		this.owner = owner;
  		this.event = event;
  		this.template = template;

  		this.ractive = owner.parentFragment.ractive;
  		this.parentFragment = owner.parentFragment;

  		this.context = null;
  		this.passthru = false;

  		// method calls
  		this.method = null;
  		this.resolvers = null;
  		this.models = null;
  		this.argsFn = null;

  		// handler directive
  		this.action = null;
  		this.args = null;
  	}

  	EventDirective.prototype.bind = function bind() {
  		var _this = this;

  		this.context = this.parentFragment.findContext();

  		var template = this.template;

  		if (template.m) {
  			this.method = template.m;

  			// pass-thru "...arguments"
  			this.passthru = !!template.g;

  			if (template.a) {
  				this.resolvers = [];
  				this.models = template.a.r.map(function (ref, i) {

  					if (eventPattern.test(ref)) {
  						// on-click="foo(event.node)"
  						return {
  							event: true,
  							keys: ref.length > 5 ? splitKeypath(ref.slice(6)) : [],
  							unbind: noop
  						};
  					}

  					var argMatch = argumentsPattern.exec(ref);
  					if (argMatch) {
  						// on-click="foo(arguments[0])"
  						return {
  							argument: true,
  							index: argMatch[1]
  						};
  					}

  					var dollarMatch = dollarArgsPattern.exec(ref);
  					if (dollarMatch) {
  						// on-click="foo($1)"
  						return {
  							argument: true,
  							index: dollarMatch[1] - 1
  						};
  					}

  					var resolver = undefined;

  					var model = resolveReference(_this.parentFragment, ref);
  					if (!model) {
  						resolver = _this.parentFragment.resolve(ref, function (model) {
  							_this.models[i] = model;
  							removeFromArray(_this.resolvers, resolver);
  						});

  						_this.resolvers.push(resolver);
  					}

  					return model;
  				});

  				this.argsFn = createFunction(template.a.s, template.a.r.length);
  			}
  		} else {
  			// TODO deprecate this style of directive
  			this.action = typeof template === 'string' ? // on-click='foo'
  			template : typeof template.n === 'string' ? // on-click='{{dynamic}}'
  			template.n : new Fragment({
  				owner: this,
  				template: template.n
  			});

  			this.args = template.a ? // static arguments
  			typeof template.a === 'string' ? [template.a] : template.a : template.d ? // dynamic arguments
  			new Fragment({
  				owner: this,
  				template: template.d
  			}) : []; // no arguments
  		}

  		if (this.template.n && typeof this.template.n !== 'string') this.action.bind();
  		if (this.template.d) this.args.bind();
  	};

  	EventDirective.prototype.bubble = function bubble() {
  		if (!this.dirty) {
  			this.dirty = true;
  			this.owner.bubble();
  		}
  	};

  	EventDirective.prototype.fire = function fire(event) {
  		var passedArgs = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  		// augment event object
  		if (event) {
  			event.keypath = this.context.getKeypath();
  			event.context = this.context.get();
  			event.index = this.parentFragment.indexRefs;
  		}

  		if (this.method) {
  			if (typeof this.ractive[this.method] !== 'function') {
  				throw new Error('Attempted to call a non-existent method ("' + this.method + '")');
  			}

  			var args = undefined;

  			if (event) passedArgs.unshift(event);

  			if (this.models) {
  				var values = this.models.map(function (model) {
  					if (!model) return undefined;

  					if (model.event) {
  						var obj = event;
  						var keys = model.keys.slice();

  						while (keys.length) obj = obj[keys.shift()];
  						return obj;
  					}

  					if (model.argument) {
  						return passedArgs ? passedArgs[model.index] : void 0;
  					}

  					if (model.wrapper) {
  						return model.wrapper.value;
  					}

  					return model.get();
  				});

  				args = this.argsFn.apply(null, values);
  			}

  			if (this.passthru) {
  				args = args ? args.concat(passedArgs) : passedArgs;
  			}

  			// make event available as `this.event`
  			var ractive = this.ractive;
  			var oldEvent = ractive.event;

  			ractive.event = event;
  			ractive[this.method].apply(ractive, args);
  			ractive.event = oldEvent;
  		} else {
  			var action = this.action.toString();
  			var args = this.template.d ? this.args.getArgsList() : this.args;

  			if (passedArgs.length) args = args.concat(passedArgs);

  			if (event) event.name = action;

  			fireEvent(this.ractive, action, {
  				event: event,
  				args: args
  			});
  		}
  	};

  	EventDirective.prototype.rebind = function rebind() {
  		this.unbind();
  		this.bind();
  	};

  	EventDirective.prototype.render = function render() {
  		this.event.listen(this);
  	};

  	EventDirective.prototype.unbind = function unbind() {
  		var template = this.template;

  		if (template.m) {
  			this.resolvers.forEach(_unbind);
  			this.resolvers = [];

  			this.models = null;
  		} else {
  			// TODO this is brittle and non-explicit, fix it
  			if (this.action.unbind) this.action.unbind();
  			if (this.args.unbind) this.args.unbind();
  		}
  	};

  	EventDirective.prototype.unrender = function unrender() {
  		this.event.unlisten();
  	};

  	EventDirective.prototype.update = function update() {
  		if (this.method) return; // nothing to do

  		// ugh legacy
  		if (this.action.update) this.action.update();
  		if (this.template.d) this.args.update();

  		this.dirty = false;
  	};

  	return EventDirective;
  })();

  var DOMEvent = (function () {
  	function DOMEvent(name, owner) {
  		classCallCheck(this, DOMEvent);

  		if (name.indexOf('*') !== -1) {
  			fatal('Only component proxy-events may contain "*" wildcards, <' + owner.name + ' on-' + name + '="..."/> is not valid');
  		}

  		this.name = name;
  		this.owner = owner;
  		this.node = null;
  		this.handler = null;
  	}

  	DOMEvent.prototype.listen = function listen(directive) {
  		var node = this.node = this.owner.node;
  		var name = this.name;

  		if (!('on' + name in node)) {
  			warnOnce(missingPlugin(name, 'events'));
  		}

  		node.addEventListener(name, this.handler = function (event) {
  			directive.fire({
  				node: node,
  				original: event
  			});
  		}, false);
  	};

  	DOMEvent.prototype.unlisten = function unlisten() {
  		this.node.removeEventListener(this.name, this.handler, false);
  	};

  	return DOMEvent;
  })();

  var CustomEvent = (function () {
  	function CustomEvent(eventPlugin, owner) {
  		classCallCheck(this, CustomEvent);

  		this.eventPlugin = eventPlugin;
  		this.owner = owner;
  		this.handler = null;
  	}

  	CustomEvent.prototype.listen = function listen(directive) {
  		var node = this.owner.node;

  		this.handler = this.eventPlugin(node, function () {
  			var event = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  			event.node = event.node || node;
  			directive.fire(event);
  		});
  	};

  	CustomEvent.prototype.unlisten = function unlisten() {
  		this.handler.teardown();
  	};

  	return CustomEvent;
  })();

  function camelCase (hyphenatedStr) {
  	return hyphenatedStr.replace(/-([a-zA-Z])/g, function (match, $1) {
  		return $1.toUpperCase();
  	});
  }

  var prefix$1 = undefined;

  if (!isClient) {
  	prefix$1 = null;
  } else {
  	(function () {
  		var prefixCache = {};
  		var testStyle = createElement('div').style;

  		prefix$1 = function (prop) {
  			prop = camelCase(prop);

  			if (!prefixCache[prop]) {
  				if (testStyle[prop] !== undefined) {
  					prefixCache[prop] = prop;
  				} else {
  					// test vendors...
  					var capped = prop.charAt(0).toUpperCase() + prop.substring(1);

  					var i = vendors.length;
  					while (i--) {
  						var vendor = vendors[i];
  						if (testStyle[vendor + capped] !== undefined) {
  							prefixCache[prop] = vendor + capped;
  							break;
  						}
  					}
  				}
  			}

  			return prefixCache[prop];
  		};
  	})();
  }

  var prefix$2 = prefix$1;

  var visible = undefined;
  var hidden = 'hidden';

  if (doc) {
  	var prefix$3 = undefined;

  	if (hidden in doc) {
  		prefix$3 = '';
  	} else {
  		var i$2 = vendors.length;
  		while (i$2--) {
  			var vendor = vendors[i$2];
  			hidden = vendor + 'Hidden';

  			if (hidden in doc) {
  				prefix$3 = vendor;
  				break;
  			}
  		}
  	}

  	if (prefix$3 !== undefined) {
  		doc.addEventListener(prefix$3 + 'visibilitychange', onChange);
  		onChange();
  	} else {
  		// gah, we're in an old browser
  		if ('onfocusout' in doc) {
  			doc.addEventListener('focusout', onHide);
  			doc.addEventListener('focusin', onShow);
  		} else {
  			win.addEventListener('pagehide', onHide);
  			win.addEventListener('blur', onHide);

  			win.addEventListener('pageshow', onShow);
  			win.addEventListener('focus', onShow);
  		}

  		visible = true; // until proven otherwise. Not ideal but hey
  	}
  }

  function onChange() {
  	visible = !doc[hidden];
  }

  function onHide() {
  	visible = false;
  }

  function onShow() {
  	visible = true;
  }

  var interpolators = {
  	number: function (from, to) {
  		var delta;

  		if (!isNumeric(from) || !isNumeric(to)) {
  			return null;
  		}

  		from = +from;
  		to = +to;

  		delta = to - from;

  		if (!delta) {
  			return function () {
  				return from;
  			};
  		}

  		return function (t) {
  			return from + t * delta;
  		};
  	},

  	array: function (from, to) {
  		var intermediate, interpolators, len, i;

  		if (!isArray(from) || !isArray(to)) {
  			return null;
  		}

  		intermediate = [];
  		interpolators = [];

  		i = len = Math.min(from.length, to.length);
  		while (i--) {
  			interpolators[i] = interpolate(from[i], to[i]);
  		}

  		// surplus values - don't interpolate, but don't exclude them either
  		for (i = len; i < from.length; i += 1) {
  			intermediate[i] = from[i];
  		}

  		for (i = len; i < to.length; i += 1) {
  			intermediate[i] = to[i];
  		}

  		return function (t) {
  			var i = len;

  			while (i--) {
  				intermediate[i] = interpolators[i](t);
  			}

  			return intermediate;
  		};
  	},

  	object: function (from, to) {
  		var properties, len, interpolators, intermediate, prop;

  		if (!isObject(from) || !isObject(to)) {
  			return null;
  		}

  		properties = [];
  		intermediate = {};
  		interpolators = {};

  		for (prop in from) {
  			if (hasOwn.call(from, prop)) {
  				if (hasOwn.call(to, prop)) {
  					properties.push(prop);
  					interpolators[prop] = interpolate(from[prop], to[prop]);
  				} else {
  					intermediate[prop] = from[prop];
  				}
  			}
  		}

  		for (prop in to) {
  			if (hasOwn.call(to, prop) && !hasOwn.call(from, prop)) {
  				intermediate[prop] = to[prop];
  			}
  		}

  		len = properties.length;

  		return function (t) {
  			var i = len,
  			    prop;

  			while (i--) {
  				prop = properties[i];

  				intermediate[prop] = interpolators[prop](t);
  			}

  			return intermediate;
  		};
  	}
  };

  var interpolators$1 = interpolators;

  function interpolate(from, to, ractive, type) {
  	if (from === to) return null;

  	if (type) {
  		var interpol = findInViewHierarchy('interpolators', ractive, type);
  		if (interpol) return interpol(from, to) || null;

  		fatal(missingPlugin(type, 'interpolator'));
  	}

  	return interpolators$1.number(from, to) || interpolators$1.array(from, to) || interpolators$1.object(from, to) || null;
  }

  var unprefixPattern = new RegExp('^-(?:' + vendors.join('|') + ')-');

  function unprefix (prop) {
  	return prop.replace(unprefixPattern, '');
  }

  var vendorPattern = new RegExp('^(?:' + vendors.join('|') + ')([A-Z])');

  function hyphenate (str) {
  	if (!str) return ''; // edge case

  	if (vendorPattern.test(str)) str = '-' + str;

  	return str.replace(/[A-Z]/g, function (match) {
  		return '-' + match.toLowerCase();
  	});
  }

  var createTransitions = undefined;

  if (!isClient) {
  	createTransitions = null;
  } else {
  	(function () {
  		var testStyle = createElement('div').style;
  		var linear = function (x) {
  			return x;
  		};

  		var canUseCssTransitions = {};
  		var cannotUseCssTransitions = {};

  		// determine some facts about our environment
  		var TRANSITION = undefined;
  		var TRANSITIONEND = undefined;
  		var CSS_TRANSITIONS_ENABLED = undefined;
  		var TRANSITION_DURATION = undefined;
  		var TRANSITION_PROPERTY = undefined;
  		var TRANSITION_TIMING_FUNCTION = undefined;

  		if (testStyle.transition !== undefined) {
  			TRANSITION = 'transition';
  			TRANSITIONEND = 'transitionend';
  			CSS_TRANSITIONS_ENABLED = true;
  		} else if (testStyle.webkitTransition !== undefined) {
  			TRANSITION = 'webkitTransition';
  			TRANSITIONEND = 'webkitTransitionEnd';
  			CSS_TRANSITIONS_ENABLED = true;
  		} else {
  			CSS_TRANSITIONS_ENABLED = false;
  		}

  		if (TRANSITION) {
  			TRANSITION_DURATION = TRANSITION + 'Duration';
  			TRANSITION_PROPERTY = TRANSITION + 'Property';
  			TRANSITION_TIMING_FUNCTION = TRANSITION + 'TimingFunction';
  		}

  		createTransitions = function (t, to, options, changedProperties, resolve) {

  			// Wait a beat (otherwise the target styles will be applied immediately)
  			// TODO use a fastdom-style mechanism?
  			setTimeout(function () {
  				var jsTransitionsComplete = undefined;
  				var cssTransitionsComplete = undefined;

  				function checkComplete() {
  					if (jsTransitionsComplete && cssTransitionsComplete) {
  						// will changes to events and fire have an unexpected consequence here?
  						t.ractive.fire(t.name + ':end', t.node, t.isIntro);
  						resolve();
  					}
  				}

  				// this is used to keep track of which elements can use CSS to animate
  				// which properties
  				var hashPrefix = (t.node.namespaceURI || '') + t.node.tagName;

  				t.node.style[TRANSITION_PROPERTY] = changedProperties.map(prefix$2).map(hyphenate).join(',');
  				t.node.style[TRANSITION_TIMING_FUNCTION] = hyphenate(options.easing || 'linear');
  				t.node.style[TRANSITION_DURATION] = options.duration / 1000 + 's';

  				function transitionEndHandler(event) {
  					var index = changedProperties.indexOf(camelCase(unprefix(event.propertyName)));
  					if (index !== -1) {
  						changedProperties.splice(index, 1);
  					}

  					if (changedProperties.length) {
  						// still transitioning...
  						return;
  					}

  					t.node.removeEventListener(TRANSITIONEND, transitionEndHandler, false);

  					cssTransitionsComplete = true;
  					checkComplete();
  				}

  				t.node.addEventListener(TRANSITIONEND, transitionEndHandler, false);

  				setTimeout(function () {
  					var i = changedProperties.length;
  					var hash = undefined;
  					var originalValue = undefined;
  					var index = undefined;
  					var propertiesToTransitionInJs = [];
  					var prop = undefined;
  					var suffix = undefined;
  					var interpolator = undefined;

  					while (i--) {
  						prop = changedProperties[i];
  						hash = hashPrefix + prop;

  						if (CSS_TRANSITIONS_ENABLED && !cannotUseCssTransitions[hash]) {
  							t.node.style[prefix$2(prop)] = to[prop];

  							// If we're not sure if CSS transitions are supported for
  							// this tag/property combo, find out now
  							if (!canUseCssTransitions[hash]) {
  								originalValue = t.getStyle(prop);

  								// if this property is transitionable in this browser,
  								// the current style will be different from the target style
  								canUseCssTransitions[hash] = t.getStyle(prop) != to[prop];
  								cannotUseCssTransitions[hash] = !canUseCssTransitions[hash];

  								// Reset, if we're going to use timers after all
  								if (cannotUseCssTransitions[hash]) {
  									t.node.style[prefix$2(prop)] = originalValue;
  								}
  							}
  						}

  						if (!CSS_TRANSITIONS_ENABLED || cannotUseCssTransitions[hash]) {
  							// we need to fall back to timer-based stuff
  							if (originalValue === undefined) {
  								originalValue = t.getStyle(prop);
  							}

  							// need to remove this from changedProperties, otherwise transitionEndHandler
  							// will get confused
  							index = changedProperties.indexOf(prop);
  							if (index === -1) {
  								warnIfDebug('Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!', { node: t.node });
  							} else {
  								changedProperties.splice(index, 1);
  							}

  							// TODO Determine whether this property is animatable at all

  							suffix = /[^\d]*$/.exec(to[prop])[0];
  							interpolator = interpolate(parseFloat(originalValue), parseFloat(to[prop])) || function () {
  								return to[prop];
  							};

  							// ...then kick off a timer-based transition
  							propertiesToTransitionInJs.push({
  								name: prefix$2(prop),
  								interpolator: interpolator,
  								suffix: suffix
  							});
  						}
  					}

  					// javascript transitions
  					if (propertiesToTransitionInJs.length) {
  						var easing = undefined;

  						if (typeof options.easing === 'string') {
  							easing = t.ractive.easing[options.easing];

  							if (!easing) {
  								warnOnceIfDebug(missingPlugin(options.easing, 'easing'));
  								easing = linear;
  							}
  						} else if (typeof options.easing === 'function') {
  							easing = options.easing;
  						} else {
  							easing = linear;
  						}

  						new Ticker({
  							duration: options.duration,
  							easing: easing,
  							step: function (pos) {
  								var i = propertiesToTransitionInJs.length;
  								while (i--) {
  									var _prop = propertiesToTransitionInJs[i];
  									t.node.style[_prop.name] = _prop.interpolator(pos) + _prop.suffix;
  								}
  							},
  							complete: function () {
  								jsTransitionsComplete = true;
  								checkComplete();
  							}
  						});
  					} else {
  						jsTransitionsComplete = true;
  					}

  					if (!changedProperties.length) {
  						// We need to cancel the transitionEndHandler, and deal with
  						// the fact that it will never fire
  						t.node.removeEventListener(TRANSITIONEND, transitionEndHandler, false);
  						cssTransitionsComplete = true;
  						checkComplete();
  					}
  				}, 0);
  			}, options.delay || 0);
  		};
  	})();
  }

  var createTransitions$1 = createTransitions;

  function resetStyle(node, style) {
  	if (style) {
  		node.setAttribute('style', style);
  	} else {
  		// Next line is necessary, to remove empty style attribute!
  		// See http://stackoverflow.com/a/7167553
  		node.getAttribute('style');
  		node.removeAttribute('style');
  	}
  }

  var getComputedStyle = win && (win.getComputedStyle || legacy.getComputedStyle);
  var resolved = Promise$1.resolve();

  var Transition = (function () {
  	function Transition(owner, template, isIntro) {
  		classCallCheck(this, Transition);

  		this.owner = owner;
  		this.isIntro = isIntro;
  		this.ractive = owner.ractive;

  		var ractive = owner.ractive;

  		var name = template.n || template;

  		if (typeof name !== 'string') {
  			var fragment = new Fragment({
  				owner: owner,
  				template: name
  			}).bind(); // TODO need a way to capture values without bind()

  			name = fragment.toString();
  			fragment.unbind();

  			if (name === '') {
  				// empty string okay, just no transition
  				return;
  			}
  		}

  		this.name = name;

  		if (template.a) {
  			this.params = template.a;
  		} else if (template.d) {
  			// TODO is there a way to interpret dynamic arguments without all the
  			// 'dependency thrashing'?
  			var fragment = new Fragment({
  				owner: owner,
  				template: template.d
  			}).bind();

  			this.params = fragment.getArgsList();
  			fragment.unbind();
  		}

  		this._fn = findInViewHierarchy('transitions', ractive, name);

  		if (!this._fn) {
  			warnOnceIfDebug(missingPlugin(name, 'transition'), { ractive: ractive });
  		}
  	}

  	Transition.prototype.animateStyle = function animateStyle(style, value, options) {
  		var _this = this;

  		if (arguments.length === 4) {
  			throw new Error('t.animateStyle() returns a promise - use .then() instead of passing a callback');
  		}

  		// Special case - page isn't visible. Don't animate anything, because
  		// that way you'll never get CSS transitionend events
  		if (!visible) {
  			this.setStyle(style, value);
  			return resolved;
  		}

  		var to = undefined;

  		if (typeof style === 'string') {
  			to = {};
  			to[style] = value;
  		} else {
  			to = style;

  			// shuffle arguments
  			options = value;
  		}

  		// As of 0.3.9, transition authors should supply an `option` object with
  		// `duration` and `easing` properties (and optional `delay`), plus a
  		// callback function that gets called after the animation completes

  		// TODO remove this check in a future version
  		if (!options) {
  			warnOnceIfDebug('The "%s" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340', this.name);
  			options = this;
  		}

  		return new Promise$1(function (fulfil) {
  			// Edge case - if duration is zero, set style synchronously and complete
  			if (!options.duration) {
  				_this.setStyle(to);
  				fulfil();
  				return;
  			}

  			// Get a list of the properties we're animating
  			var propertyNames = Object.keys(to);
  			var changedProperties = [];

  			// Store the current styles
  			var computedStyle = getComputedStyle(_this.node);

  			var i = propertyNames.length;
  			while (i--) {
  				var prop = propertyNames[i];
  				var current = computedStyle[prefix$2(prop)];

  				if (current === '0px') current = 0;

  				// we need to know if we're actually changing anything
  				if (current != to[prop]) {
  					// use != instead of !==, so we can compare strings with numbers
  					changedProperties.push(prop);

  					// make the computed style explicit, so we can animate where
  					// e.g. height='auto'
  					_this.node.style[prefix$2(prop)] = current;
  				}
  			}

  			// If we're not actually changing anything, the transitionend event
  			// will never fire! So we complete early
  			if (!changedProperties.length) {
  				fulfil();
  				return;
  			}

  			createTransitions$1(_this, to, options, changedProperties, fulfil);
  		});
  	};

  	Transition.prototype.getStyle = function getStyle(props) {
  		var computedStyle = getComputedStyle(this.node);

  		if (typeof props === 'string') {
  			var value = computedStyle[prefix$2(props)];
  			return value === '0px' ? 0 : value;
  		}

  		if (!isArray(props)) {
  			throw new Error('Transition$getStyle must be passed a string, or an array of strings representing CSS properties');
  		}

  		var styles = {};

  		var i = props.length;
  		while (i--) {
  			var prop = props[i];
  			var value = computedStyle[prefix$2(prop)];

  			if (value === '0px') value = 0;
  			styles[prop] = value;
  		}

  		return styles;
  	};

  	Transition.prototype.processParams = function processParams(params, defaults) {
  		if (typeof params === 'number') {
  			params = { duration: params };
  		} else if (typeof params === 'string') {
  			if (params === 'slow') {
  				params = { duration: 600 };
  			} else if (params === 'fast') {
  				params = { duration: 200 };
  			} else {
  				params = { duration: 400 };
  			}
  		} else if (!params) {
  			params = {};
  		}

  		return extend({}, defaults, params);
  	};

  	Transition.prototype.setStyle = function setStyle(style, value) {
  		if (typeof style === 'string') {
  			this.node.style[prefix$2(style)] = value;
  		} else {
  			var prop = undefined;
  			for (prop in style) {
  				if (style.hasOwnProperty(prop)) {
  					this.node.style[prefix$2(prop)] = style[prop];
  				}
  			}
  		}

  		return this;
  	};

  	Transition.prototype.start = function start() {
  		var _this2 = this;

  		var node = this.node = this.owner.node;
  		var originalStyle = node.getAttribute('style');

  		var completed = undefined;

  		// create t.complete() - we don't want this on the prototype,
  		// because we don't want `this` silliness when passing it as
  		// an argument
  		this.complete = function (noReset) {
  			if (completed) {
  				return;
  			}

  			if (!noReset && _this2.isIntro) {
  				resetStyle(node, originalStyle);
  			}

  			_this2._manager.remove(_this2);

  			completed = true;
  		};

  		// If the transition function doesn't exist, abort
  		if (!this._fn) {
  			this.complete();
  			return;
  		}

  		this._fn.apply(this.root, [this].concat(this.params));
  	};

  	return Transition;
  })();

  function updateLiveQueries$1(element) {
  	// Does this need to be added to any live queries?
  	var node = element.node;
  	var instance = element.ractive;

  	do {
  		var liveQueries = instance._liveQueries;

  		var i = liveQueries.length;
  		while (i--) {
  			var selector = liveQueries[i];
  			var query = liveQueries["_" + selector];

  			if (query.test(node)) {
  				query.add(node);
  				// keep register of applicable selectors, for when we teardown
  				element.liveQueries.push(query);
  			}
  		}
  	} while (instance = instance.parent);
  }

  // TODO element.parent currently undefined
  function findParentForm(element) {
  	while (element = element.parent) {
  		if (element.name === 'form') {
  			return element;
  		}
  	}
  }

  function warnAboutAmbiguity(description, ractive) {
  	warnOnceIfDebug('The ' + description + ' being used for two-way binding is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity', { ractive: ractive });
  }

  var Binding = (function () {
  	function Binding(element) {
  		var name = arguments.length <= 1 || arguments[1] === undefined ? 'value' : arguments[1];
  		classCallCheck(this, Binding);

  		this.element = element;
  		this.ractive = element.ractive;
  		this.attribute = element.attributeByName[name];

  		var interpolator = this.attribute.interpolator;
  		interpolator.twowayBinding = this;

  		var model = interpolator.model;

  		// not bound?
  		if (!model) {
  			// try to force resolution
  			interpolator.resolver.forceResolution();
  			model = interpolator.model;

  			warnAboutAmbiguity('\'' + interpolator.template.r + '\' reference', this.ractive);
  		} else if (model.isUnresolved) {
  			// reference expressions (e.g. foo[bar])
  			model.forceResolution();
  			warnAboutAmbiguity('expression', this.ractive);
  		}

  		// TODO include index/key/keypath refs as read-only
  		else if (model.isReadonly) {
  				var keypath = model.getKeypath().replace(/^@/, '');
  				warnOnceIfDebug('Cannot use two-way binding on <' + element.name + '> element: ' + keypath + ' is read-only. To suppress this warning use <' + element.name + ' twoway=\'false\'...>', { ractive: this.ractive });
  				return false;
  			}

  		this.attribute.isTwoway = true;
  		this.model = model;

  		// initialise value, if it's undefined
  		var value = model.get();
  		this.wasUndefined = value === undefined;

  		if (value === undefined && this.getInitialValue) {
  			value = this.getInitialValue();
  			model.set(value);
  		}

  		var parentForm = findParentForm(element);
  		if (parentForm) {
  			this.resetValue = value;
  			parentForm.formBindings.push(this);
  		}
  	}

  	Binding.prototype.bind = function bind() {
  		this.model.registerTwowayBinding(this);
  	};

  	Binding.prototype.handleChange = function handleChange() {
  		var _this = this;

  		runloop.start(this.root);
  		this.attribute.locked = true;
  		this.model.set(this.getValue());
  		runloop.scheduleTask(function () {
  			return _this.attribute.locked = false;
  		});
  		runloop.end();
  	};

  	Binding.prototype.rebind = function rebind() {
  		// TODO what does this work with CheckboxNameBinding et al?
  		this.unbind();
  		this.model = this.attribute.interpolator.model;
  		this.bind();
  	};

  	Binding.prototype.render = function render() {
  		this.node = this.element.node;
  		this.node._ractive.binding = this;
  		this.rendered = true; // TODO is this used anywhere?
  	};

  	Binding.prototype.setFromNode = function setFromNode(node) {
  		this.model.set(node.value);
  	};

  	Binding.prototype.unbind = function unbind() {
  		this.model.unregisterTwowayBinding(this);
  	};

  	Binding.prototype.unrender = function unrender() {
  		// noop?
  	};

  	return Binding;
  })();

  // This is the handler for DOM events that would lead to a change in the model
  // (i.e. change, sometimes, input, and occasionally click and keyup)

  function handleDomEvent() {
  	this._ractive.binding.handleChange();
  }

  var CheckboxBinding = (function (_Binding) {
  	inherits(CheckboxBinding, _Binding);

  	function CheckboxBinding(element) {
  		classCallCheck(this, CheckboxBinding);

  		_Binding.call(this, element, 'checked');
  	}

  	CheckboxBinding.prototype.render = function render() {
  		_Binding.prototype.render.call(this);

  		this.node.addEventListener('change', handleDomEvent, false);

  		if (this.node.attachEvent) {
  			this.node.addEventListener('click', handleDomEvent, false);
  		}
  	};

  	CheckboxBinding.prototype.unrender = function unrender() {
  		this.node.removeEventListener('change', handleDomEvent, false);
  		this.node.removeEventListener('click', handleDomEvent, false);
  	};

  	CheckboxBinding.prototype.getInitialValue = function getInitialValue() {
  		return !!this.element.getAttribute('checked');
  	};

  	CheckboxBinding.prototype.getValue = function getValue() {
  		return this.node.checked;
  	};

  	CheckboxBinding.prototype.setFromNode = function setFromNode(node) {
  		this.model.set(node.checked);
  	};

  	return CheckboxBinding;
  })(Binding);

  function getBindingGroup(group, model, getValue) {
  	var hash = group + "-bindingGroup";
  	return model[hash] || (model[hash] = new BindingGroup(hash, model, getValue));
  }

  var BindingGroup = (function () {
  	function BindingGroup(hash, model, getValue) {
  		var _this = this;

  		classCallCheck(this, BindingGroup);

  		this.model = model;
  		this.hash = hash;
  		this.getValue = function () {
  			_this.value = getValue.call(_this);
  			return _this.value;
  		};

  		this.bindings = [];
  	}

  	BindingGroup.prototype.add = function add(binding) {
  		this.bindings.push(binding);
  	};

  	BindingGroup.prototype.bind = function bind() {
  		this.value = this.model.get();
  		this.model.registerTwowayBinding(this);
  		this.bound = true;
  	};

  	BindingGroup.prototype.remove = function remove(binding) {
  		removeFromArray(this.bindings, binding);
  		if (!this.bindings.length) {
  			this.unbind();
  		}
  	};

  	BindingGroup.prototype.unbind = function unbind() {
  		this.model.unregisterTwowayBinding(this);
  		this.bound = false;
  		delete this.model[this.hash];
  	};

  	return BindingGroup;
  })();

  var push$1 = [].push;

  function getValue$1() {
  	var all = this.bindings.filter(function (b) {
  		return b.node && b.node.checked;
  	}).map(function (b) {
  		return b.element.getAttribute('value');
  	});
  	var res = [];
  	all.forEach(function (v) {
  		if (!arrayContains(res, v)) res.push(v);
  	});
  	return res;
  }

  var CheckboxNameBinding = (function (_Binding) {
  	inherits(CheckboxNameBinding, _Binding);

  	function CheckboxNameBinding(element) {
  		classCallCheck(this, CheckboxNameBinding);

  		_Binding.call(this, element, 'name');

  		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this

  		// Each input has a reference to an array containing it and its
  		// group, as two-way binding depends on being able to ascertain
  		// the status of all inputs within the group
  		this.group = getBindingGroup('checkboxes', this.model, getValue$1);
  		this.group.add(this);

  		if (this.noInitialValue) {
  			this.group.noInitialValue = true;
  		}

  		// If no initial value was set, and this input is checked, we
  		// update the model
  		if (this.group.noInitialValue && this.element.getAttribute('checked')) {
  			var existingValue = this.model.get();
  			var bindingValue = this.element.getAttribute('value');

  			if (!arrayContains(existingValue, bindingValue)) {
  				push$1.call(existingValue, bindingValue); // to avoid triggering runloop with array adaptor
  			}
  		}
  	}

  	CheckboxNameBinding.prototype.bind = function bind() {
  		if (!this.group.bound) {
  			this.group.bind();
  		}
  	};

  	CheckboxNameBinding.prototype.changed = function changed() {
  		var wasChecked = !!this.isChecked;
  		this.isChecked = this.node.checked;
  		return this.isChecked === wasChecked;
  	};

  	CheckboxNameBinding.prototype.getInitialValue = function getInitialValue() {
  		// This only gets called once per group (of inputs that
  		// share a name), because it only gets called if there
  		// isn't an initial value. By the same token, we can make
  		// a note of that fact that there was no initial value,
  		// and populate it using any `checked` attributes that
  		// exist (which users should avoid, but which we should
  		// support anyway to avoid breaking expectations)
  		this.noInitialValue = true; // TODO are noInitialValue and wasUndefined the same thing?
  		return [];
  	};

  	CheckboxNameBinding.prototype.getValue = function getValue() {
  		return this.group.value;
  	};

  	CheckboxNameBinding.prototype.handleChange = function handleChange() {
  		this.isChecked = this.element.node.checked;
  		this.group.value = this.model.get();
  		var value = this.element.getAttribute('value');
  		if (this.isChecked && !arrayContains(this.group.value, value)) {
  			this.group.value.push(value);
  		} else if (!this.isChecked && arrayContains(this.group.value, value)) {
  			removeFromArray(this.group.value, value);
  		}
  		_Binding.prototype.handleChange.call(this);
  	};

  	CheckboxNameBinding.prototype.render = function render() {
  		_Binding.prototype.render.call(this);

  		var node = this.node;

  		var existingValue = this.model.get();
  		var bindingValue = this.element.getAttribute('value');

  		if (isArray(existingValue)) {
  			this.isChecked = arrayContains(existingValue, bindingValue);
  		} else {
  			this.isChecked = existingValue == bindingValue;
  		}

  		node.name = '{{' + this.model.getKeypath() + '}}';
  		node.checked = this.isChecked;

  		node.addEventListener('change', handleDomEvent, false);

  		// in case of IE emergency, bind to click event as well
  		if (node.attachEvent) {
  			node.addEventListener('click', handleDomEvent, false);
  		}
  	};

  	CheckboxNameBinding.prototype.setFromNode = function setFromNode(node) {
  		this.group.bindings.forEach(function (binding) {
  			return binding.wasUndefined = true;
  		});

  		if (node.checked) {
  			var valueSoFar = this.group.getValue();
  			valueSoFar.push(this.element.getAttribute('value'));

  			this.group.model.set(valueSoFar);
  		}
  	};

  	CheckboxNameBinding.prototype.unbind = function unbind() {
  		this.group.remove(this);
  	};

  	CheckboxNameBinding.prototype.unrender = function unrender() {
  		var node = this.element.node;

  		node.removeEventListener('change', handleDomEvent, false);
  		node.removeEventListener('click', handleDomEvent, false);
  	};

  	return CheckboxNameBinding;
  })(Binding);

  var ContentEditableBinding = (function (_Binding) {
  	inherits(ContentEditableBinding, _Binding);

  	function ContentEditableBinding() {
  		classCallCheck(this, ContentEditableBinding);

  		_Binding.apply(this, arguments);
  	}

  	ContentEditableBinding.prototype.getInitialValue = function getInitialValue() {
  		return this.element.fragment ? this.element.fragment.toString() : '';
  	};

  	ContentEditableBinding.prototype.getValue = function getValue() {
  		return this.element.node.innerHTML;
  	};

  	ContentEditableBinding.prototype.render = function render() {
  		_Binding.prototype.render.call(this);

  		var node = this.node;

  		node.addEventListener('change', handleDomEvent, false);
  		node.addEventListener('blur', handleDomEvent, false);

  		if (!this.ractive.lazy) {
  			node.addEventListener('input', handleDomEvent, false);

  			if (node.attachEvent) {
  				node.addEventListener('keyup', handleDomEvent, false);
  			}
  		}
  	};

  	ContentEditableBinding.prototype.setFromNode = function setFromNode(node) {
  		this.model.set(node.innerHTML);
  	};

  	ContentEditableBinding.prototype.unrender = function unrender() {
  		var node = this.node;

  		node.removeEventListener('blur', handleDomEvent, false);
  		node.removeEventListener('change', handleDomEvent, false);
  		node.removeEventListener('input', handleDomEvent, false);
  		node.removeEventListener('keyup', handleDomEvent, false);
  	};

  	return ContentEditableBinding;
  })(Binding);

  function handleBlur() {
  	handleDomEvent.call(this);

  	var value = this._ractive.binding.model.get();
  	this.value = value == undefined ? '' : value;
  }

  function handleDelay(delay) {
  	var timeout = undefined;

  	return function () {
  		var _this = this;

  		if (timeout) clearTimeout(timeout);

  		timeout = setTimeout(function () {
  			var binding = _this._ractive.binding;
  			if (binding.rendered) handleDomEvent.call(_this);
  			timeout = null;
  		}, delay);
  	};
  }

  var GenericBinding = (function (_Binding) {
  	inherits(GenericBinding, _Binding);

  	function GenericBinding() {
  		classCallCheck(this, GenericBinding);

  		_Binding.apply(this, arguments);
  	}

  	GenericBinding.prototype.getInitialValue = function getInitialValue() {
  		return '';
  	};

  	GenericBinding.prototype.getValue = function getValue() {
  		return this.node.value;
  	};

  	GenericBinding.prototype.render = function render() {
  		_Binding.prototype.render.call(this);

  		// any lazy setting for this element overrides the root
  		// if the value is a number, it's a timeout
  		var lazy = this.ractive.lazy;
  		var timeout = false;

  		// TODO handle at parse time
  		if (this.element.template.a && 'lazy' in this.element.template.a) {
  			lazy = this.element.template.a.lazy;
  			if (lazy === 0) lazy = true; // empty attribute
  		}

  		// TODO handle this at parse time as well?
  		if (lazy === 'false') lazy = false;

  		if (isNumeric(lazy)) {
  			timeout = +lazy;
  			lazy = false;
  		}

  		this.handler = timeout ? handleDelay(timeout) : handleDomEvent;

  		var node = this.node;

  		node.addEventListener('change', handleDomEvent, false);

  		if (!lazy) {
  			node.addEventListener('input', this.handler, false);

  			if (node.attachEvent) {
  				node.addEventListener('keyup', this.handler, false);
  			}
  		}

  		node.addEventListener('blur', handleBlur, false);
  	};

  	GenericBinding.prototype.unrender = function unrender() {
  		var node = this.element.node;
  		this.rendered = false;

  		node.removeEventListener('change', handleDomEvent, false);
  		node.removeEventListener('input', this.handler, false);
  		node.removeEventListener('keyup', this.handler, false);
  		node.removeEventListener('blur', handleBlur, false);
  	};

  	return GenericBinding;
  })(Binding);

  var MultipleSelectBinding = (function (_Binding) {
  	inherits(MultipleSelectBinding, _Binding);

  	function MultipleSelectBinding() {
  		classCallCheck(this, MultipleSelectBinding);

  		_Binding.apply(this, arguments);
  	}

  	MultipleSelectBinding.prototype.forceUpdate = function forceUpdate() {
  		var _this = this;

  		var value = this.getValue();

  		if (value !== undefined) {
  			this.attribute.locked = true;
  			runloop.scheduleTask(function () {
  				return _this.attribute.locked = false;
  			});
  			this.model.set(value);
  		}
  	};

  	MultipleSelectBinding.prototype.getInitialValue = function getInitialValue() {
  		return this.element.options.filter(function (option) {
  			return option.getAttribute('selected');
  		}).map(function (option) {
  			return option.getAttribute('value');
  		});
  	};

  	MultipleSelectBinding.prototype.getValue = function getValue() {
  		var options = this.element.node.options;
  		var len = options.length;

  		var selectedValues = [];

  		for (var i = 0; i < len; i += 1) {
  			var option = options[i];

  			if (option.selected) {
  				var optionValue = option._ractive ? option._ractive.value : option.value;
  				selectedValues.push(optionValue);
  			}
  		}

  		return selectedValues;
  	};

  	MultipleSelectBinding.prototype.handleChange = function handleChange() {
  		var attribute = this.attribute;
  		var previousValue = attribute.getValue();

  		var value = this.getValue();

  		if (previousValue === undefined || !arrayContentsMatch(value, previousValue)) {
  			_Binding.prototype.handleChange.call(this);
  		}

  		return this;
  	};

  	MultipleSelectBinding.prototype.render = function render() {
  		_Binding.prototype.render.call(this);

  		this.node.addEventListener('change', handleDomEvent, false);

  		if (this.model.get() === undefined) {
  			// get value from DOM, if possible
  			this.handleChange();
  		}
  	};

  	MultipleSelectBinding.prototype.setFromNode = function setFromNode(node) {
  		var i = node.selectedOptions.length;
  		var result = new Array(i);

  		while (i--) {
  			var option = node.selectedOptions[i];
  			result[i] = option._ractive ? option._ractive.value : option.value;
  		}

  		this.model.set(result);
  	};

  	MultipleSelectBinding.prototype.setValue = function setValue() {
  		throw new Error('TODO not implemented yet');
  	};

  	MultipleSelectBinding.prototype.unrender = function unrender() {
  		this.node.removeEventListener('change', handleDomEvent, false);
  	};

  	MultipleSelectBinding.prototype.updateModel = function updateModel() {
  		if (this.attribute.value === undefined || !this.attribute.value.length) {
  			this.keypath.set(this.initialValue);
  		}
  	};

  	return MultipleSelectBinding;
  })(Binding);

  var NumericBinding = (function (_GenericBinding) {
  	inherits(NumericBinding, _GenericBinding);

  	function NumericBinding() {
  		classCallCheck(this, NumericBinding);

  		_GenericBinding.apply(this, arguments);
  	}

  	NumericBinding.prototype.getInitialValue = function getInitialValue() {
  		return undefined;
  	};

  	NumericBinding.prototype.getValue = function getValue() {
  		var value = parseFloat(this.node.value);
  		return isNaN(value) ? undefined : value;
  	};

  	NumericBinding.prototype.setFromNode = function setFromNode(node) {
  		var value = parseFloat(node.value);
  		if (!isNaN(value)) this.model.set(value);
  	};

  	return NumericBinding;
  })(GenericBinding);

  var siblings = {};

  function getSiblings(hash) {
  	return siblings[hash] || (siblings[hash] = []);
  }

  var RadioBinding = (function (_Binding) {
  	inherits(RadioBinding, _Binding);

  	function RadioBinding(element) {
  		classCallCheck(this, RadioBinding);

  		_Binding.call(this, element, 'checked');

  		this.siblings = getSiblings(this.ractive._guid + this.element.getAttribute('name'));
  		this.siblings.push(this);
  	}

  	RadioBinding.prototype.getValue = function getValue() {
  		return this.node.checked;
  	};

  	RadioBinding.prototype.handleChange = function handleChange() {
  		runloop.start(this.root);

  		this.siblings.forEach(function (binding) {
  			binding.model.set(binding.getValue());
  		});

  		runloop.end();
  	};

  	RadioBinding.prototype.render = function render() {
  		_Binding.prototype.render.call(this);

  		this.node.addEventListener('change', handleDomEvent, false);

  		if (this.node.attachEvent) {
  			this.node.addEventListener('click', handleDomEvent, false);
  		}
  	};

  	RadioBinding.prototype.setFromNode = function setFromNode(node) {
  		this.model.set(node.checked);
  	};

  	RadioBinding.prototype.unbind = function unbind() {
  		removeFromArray(this.siblings, this);
  	};

  	RadioBinding.prototype.unrender = function unrender() {
  		this.node.removeEventListener('change', handleDomEvent, false);
  		this.node.removeEventListener('click', handleDomEvent, false);
  	};

  	return RadioBinding;
  })(Binding);

  function getValue$2() {
  	var checked = this.bindings.filter(function (b) {
  		return b.node.checked;
  	});
  	if (checked.length > 0) {
  		return checked[0].element.getAttribute('value');
  	}
  }

  var RadioNameBinding = (function (_Binding) {
  	inherits(RadioNameBinding, _Binding);

  	function RadioNameBinding(element) {
  		classCallCheck(this, RadioNameBinding);

  		_Binding.call(this, element, 'name');

  		this.group = getBindingGroup('radioname', this.model, getValue$2);
  		this.group.add(this);

  		if (element.checked) {
  			this.group.value = this.getValue();
  		}
  	}

  	RadioNameBinding.prototype.bind = function bind() {
  		var _this = this;

  		if (!this.group.bound) {
  			this.group.bind();
  		}

  		// update name keypath when necessary
  		this.nameAttributeBinding = {
  			handleChange: function () {
  				return _this.node.name = '{{' + _this.model.getKeypath() + '}}';
  			}
  		};

  		this.model.getKeypathModel().register(this.nameAttributeBinding);
  	};

  	RadioNameBinding.prototype.getInitialValue = function getInitialValue() {
  		if (this.element.getAttribute('checked')) {
  			return this.element.getAttribute('value');
  		}
  	};

  	RadioNameBinding.prototype.getValue = function getValue() {
  		return this.element.getAttribute('value');
  	};

  	RadioNameBinding.prototype.handleChange = function handleChange() {
  		// If this <input> is the one that's checked, then the value of its
  		// `name` model gets set to its value
  		if (this.node.checked) {
  			this.group.value = this.getValue();
  			_Binding.prototype.handleChange.call(this);
  		}
  	};

  	RadioNameBinding.prototype.render = function render() {
  		_Binding.prototype.render.call(this);

  		var node = this.node;

  		node.name = '{{' + this.model.getKeypath() + '}}';
  		node.checked = this.model.get() == this.element.getAttribute('value');

  		node.addEventListener('change', handleDomEvent, false);

  		if (node.attachEvent) {
  			node.addEventListener('click', handleDomEvent, false);
  		}
  	};

  	RadioNameBinding.prototype.setFromNode = function setFromNode(node) {
  		if (node.checked) {
  			this.group.model.set(this.element.getAttribute('value'));
  		}
  	};

  	RadioNameBinding.prototype.unbind = function unbind() {
  		this.group.remove(this);

  		this.model.getKeypathModel().unregister(this.nameAttributeBinding);
  	};

  	RadioNameBinding.prototype.unrender = function unrender() {
  		var node = this.node;

  		node.removeEventListener('change', handleDomEvent, false);
  		node.removeEventListener('click', handleDomEvent, false);
  	};

  	return RadioNameBinding;
  })(Binding);

  var SingleSelectBinding = (function (_Binding) {
  	inherits(SingleSelectBinding, _Binding);

  	function SingleSelectBinding() {
  		classCallCheck(this, SingleSelectBinding);

  		_Binding.apply(this, arguments);
  	}

  	SingleSelectBinding.prototype.forceUpdate = function forceUpdate() {
  		var _this = this;

  		var value = this.getValue();

  		if (value !== undefined) {
  			this.attribute.locked = true;
  			runloop.scheduleTask(function () {
  				return _this.attribute.locked = false;
  			});
  			this.model.set(value);
  		}
  	};

  	SingleSelectBinding.prototype.getInitialValue = function getInitialValue() {
  		if (this.element.getAttribute('value') !== undefined) {
  			return;
  		}

  		var options = this.element.options;
  		var len = options.length;

  		if (!len) return;

  		var value = undefined;
  		var optionWasSelected = undefined;
  		var i = len;

  		// take the final selected option...
  		while (i--) {
  			var option = options[i];

  			if (option.getAttribute('selected')) {
  				if (!option.getAttribute('disabled')) {
  					value = option.getAttribute('value');
  				}

  				optionWasSelected = true;
  				break;
  			}
  		}

  		// or the first non-disabled option, if none are selected
  		if (!optionWasSelected) {
  			while (++i < len) {
  				if (!options[i].getAttribute('disabled')) {
  					value = options[i].getAttribute('value');
  					break;
  				}
  			}
  		}

  		// This is an optimisation (aka hack) that allows us to forgo some
  		// other more expensive work
  		// TODO does it still work? seems at odds with new architecture
  		if (value !== undefined) {
  			this.element.attributeByName.value.value = value;
  		}

  		return value;
  	};

  	SingleSelectBinding.prototype.getValue = function getValue() {
  		var options = this.node.options;
  		var len = options.length;

  		var i = undefined;
  		for (i = 0; i < len; i += 1) {
  			var option = options[i];

  			if (options[i].selected && !options[i].disabled) {
  				return option._ractive ? option._ractive.value : option.value;
  			}
  		}
  	};

  	SingleSelectBinding.prototype.render = function render() {
  		_Binding.prototype.render.call(this);
  		this.node.addEventListener('change', handleDomEvent, false);
  	};

  	SingleSelectBinding.prototype.setFromNode = function setFromNode(node) {
  		var option = node.selectedOptions[0];
  		this.model.set(option._ractive ? option._ractive.value : option.value);
  	};

  	// TODO this method is an anomaly... is it necessary?

  	SingleSelectBinding.prototype.setValue = function setValue(value) {
  		this.model.set(value);
  	};

  	SingleSelectBinding.prototype.unrender = function unrender() {
  		this.node.removeEventListener('change', handleDomEvent, false);
  	};

  	return SingleSelectBinding;
  })(Binding);

  function isBindable(attribute) {
  	return attribute && attribute.template.length === 1 && attribute.template[0].t === INTERPOLATOR && !attribute.template[0].s;
  }

  function selectBinding(element) {
  	var attributes = element.attributeByName;

  	// contenteditable - bind if the contenteditable attribute is true
  	// or is bindable and may thus become true...
  	if (element.getAttribute('contenteditable') || isBindable(attributes.contenteditable)) {
  		// ...and this element also has a value attribute to bind
  		return isBindable(attributes.value) ? ContentEditableBinding : null;
  	}

  	// <input>
  	if (element.name === 'input') {
  		var type = element.getAttribute('type');

  		if (type === 'radio' || type === 'checkbox') {
  			var bindName = isBindable(attributes.name);
  			var bindChecked = isBindable(attributes.checked);

  			// we can either bind the name attribute, or the checked attribute - not both
  			if (bindName && bindChecked) {
  				warnIfDebug('A radio input can have two-way binding on its name attribute, or its checked attribute - not both', { ractive: element.root });
  			}

  			if (bindName) {
  				return type === 'radio' ? RadioNameBinding : CheckboxNameBinding;
  			}

  			if (bindChecked) {
  				return type === 'radio' ? RadioBinding : CheckboxBinding;
  			}
  		}

  		if (type === 'file' && isBindable(attributes.value)) {
  			return Binding;
  		}

  		if (isBindable(attributes.value)) {
  			return type === 'number' || type === 'range' ? NumericBinding : GenericBinding;
  		}

  		return null;
  	}

  	// <select>
  	if (element.name === 'select' && isBindable(attributes.value)) {
  		return element.getAttribute('multiple') ? MultipleSelectBinding : SingleSelectBinding;
  	}

  	// <textarea>
  	if (element.name === 'textarea' && isBindable(attributes.value)) {
  		return GenericBinding;
  	}
  }

  function makeDirty$1(query) {
  	query.makeDirty();
  }

  var Element = (function (_Item) {
  	inherits(Element, _Item);

  	function Element(options) {
  		var _this = this;

  		classCallCheck(this, Element);

  		_Item.call(this, options);

  		this.liveQueries = []; // TODO rare case. can we handle differently?

  		this.name = options.template.e.toLowerCase();
  		this.isVoid = voidElementNames.test(this.name);

  		// find parent element
  		var fragment = this.parentFragment;
  		while (fragment) {
  			if (fragment.owner.type === ELEMENT) {
  				this.parent = fragment.owner;
  				break;
  			}
  			fragment = fragment.parent;
  		}

  		if (this.parent && this.parent.name === 'option') {
  			throw new Error('An <option> element cannot contain other elements (encountered <' + this.name + '>)');
  		}

  		// create attributes
  		this.attributeByName = {};
  		this.attributes = [];

  		if (this.template.a) {
  			Object.keys(this.template.a).forEach(function (name) {
  				// TODO process this at parse time
  				if (name === 'twoway' || name === 'lazy') return;

  				var attribute = new Attribute({
  					name: name,
  					element: _this,
  					parentFragment: _this.parentFragment,
  					template: _this.template.a[name]
  				});

  				_this.attributeByName[name] = attribute;

  				if (name !== 'value' && name !== 'type') _this.attributes.push(attribute);
  			});

  			if (this.attributeByName.type) this.attributes.unshift(this.attributeByName.type);
  			if (this.attributeByName.value) this.attributes.push(this.attributeByName.value);
  		}

  		// create conditional attributes
  		this.conditionalAttributes = (this.template.m || []).map(function (template) {
  			return new ConditionalAttribute({
  				owner: _this,
  				parentFragment: _this.parentFragment,
  				template: template
  			});
  		});

  		// create decorator
  		if (this.template.o) {
  			this.decorator = new Decorator(this, this.template.o);
  		}

  		// attach event handlers
  		this.eventHandlers = [];
  		if (this.template.v) {
  			Object.keys(this.template.v).forEach(function (key) {
  				var eventNames = key.split('-');
  				var template = _this.template.v[key];

  				eventNames.forEach(function (eventName) {
  					var fn = findInViewHierarchy('events', _this.ractive, eventName);
  					// we need to pass in "this" in order to get
  					// access to node when it is created.
  					var event = fn ? new CustomEvent(fn, _this) : new DOMEvent(eventName, _this);
  					_this.eventHandlers.push(new EventDirective(_this, event, template));
  				});
  			});
  		}

  		// create children
  		if (options.template.f && !options.noContent) {
  			this.fragment = new Fragment({
  				template: options.template.f,
  				owner: this,
  				cssIds: null
  			});
  		}

  		this.binding = null; // filled in later
  	}

  	Element.prototype.bind = function bind() {
  		this.attributes.forEach(_bind);
  		this.conditionalAttributes.forEach(_bind);
  		this.eventHandlers.forEach(_bind);

  		if (this.decorator) this.decorator.bind();
  		if (this.fragment) this.fragment.bind();

  		// create two-way binding if necessary
  		if (this.binding = this.createTwowayBinding()) this.binding.bind();
  	};

  	Element.prototype.createTwowayBinding = function createTwowayBinding() {
  		var attributes = this.template.a;

  		if (!attributes) return null;

  		var shouldBind = 'twoway' in attributes ? attributes.twoway === 0 || attributes.twoway === 'true' : // covers `twoway` and `twoway='true'`
  		this.ractive.twoway;

  		if (!shouldBind) return null;

  		var Binding = selectBinding(this);

  		if (!Binding) return null;

  		var binding = new Binding(this);

  		return binding && binding.model ? binding : null;
  	};

  	Element.prototype.detach = function detach() {
  		if (this.decorator) this.decorator.unrender();
  		return detachNode(this.node);
  	};

  	Element.prototype.find = function find(selector) {
  		if (matches(this.node, selector)) return this.node;
  		if (this.fragment) {
  			return this.fragment.find(selector);
  		}
  	};

  	Element.prototype.findAll = function findAll(selector, query) {
  		// Add this node to the query, if applicable, and register the
  		// query on this element
  		var matches = query.test(this.node);
  		if (matches) {
  			query.add(this.node);
  			if (query.live) this.liveQueries.push(query);
  		}

  		if (this.fragment) {
  			this.fragment.findAll(selector, query);
  		}
  	};

  	Element.prototype.findComponent = function findComponent(name) {
  		if (this.fragment) {
  			return this.fragment.findComponent(name);
  		}
  	};

  	Element.prototype.findAllComponents = function findAllComponents(name, query) {
  		if (this.fragment) {
  			this.fragment.findAllComponents(name, query);
  		}
  	};

  	Element.prototype.findNextNode = function findNextNode() {
  		return null;
  	};

  	Element.prototype.firstNode = function firstNode() {
  		return this.node;
  	};

  	Element.prototype.getAttribute = function getAttribute(name) {
  		var attribute = this.attributeByName[name];
  		return attribute ? attribute.getValue() : undefined;
  	};

  	Element.prototype.rebind = function rebind() {
  		this.attributes.forEach(_rebind);
  		this.conditionalAttributes.forEach(_rebind);
  		this.eventHandlers.forEach(_rebind);
  		if (this.decorator) this.decorator.rebind();
  		if (this.fragment) this.fragment.rebind();
  		if (this.binding) this.binding.rebind();

  		this.liveQueries.forEach(makeDirty$1);
  	};

  	Element.prototype.render = function render(target, occupants) {
  		var _this2 = this;

  		// TODO determine correct namespace
  		this.namespace = getNamespace(this);

  		var node = undefined;
  		var existing = false;

  		if (occupants) {
  			var n = undefined;
  			while (n = occupants.shift()) {
  				if (n.nodeName === this.template.e.toUpperCase() && n.namespaceURI === this.namespace) {
  					this.node = node = n;
  					existing = true;
  					break;
  				} else {
  					detachNode(n);
  				}
  			}
  		}

  		if (!node) {
  			node = createElement(this.template.e, this.namespace, this.getAttribute('is'));
  			this.node = node;
  		}

  		var context = this.parentFragment.findContext();

  		defineProperty(node, '_ractive', {
  			value: {
  				proxy: this,
  				ractive: this.ractive,
  				fragment: this.parentFragment,
  				context: context,
  				keypath: context.getKeypath()
  			}
  		});

  		// Is this a top-level node of a component? If so, we may need to add
  		// a data-ractive-css attribute, for CSS encapsulation
  		if (this.parentFragment.cssIds) {
  			node.setAttribute('data-ractive-css', this.parentFragment.cssIds.map(function (x) {
  				return '{' + x + '}';
  			}).join(' '));
  		}

  		if (this.fragment) {
  			var children = existing ? toArray(node.childNodes) : undefined;
  			this.fragment.render(node, children);

  			// clean up leftover children
  			if (children) {
  				children.forEach(detachNode);
  			}
  		}

  		if (existing) {
  			// store initial values for two-way binding
  			if (this.binding && this.binding.wasUndefined) this.binding.setFromNode(node);

  			// remove unused attributes
  			var i = node.attributes.length;
  			while (i--) {
  				var _name = node.attributes[i].name;
  				if (!this.template.a || !(_name in this.template.a)) node.removeAttribute(_name);
  			}
  		}

  		this.attributes.forEach(_render);
  		this.conditionalAttributes.forEach(_render);

  		if (this.decorator) runloop.scheduleTask(function () {
  			return _this2.decorator.render();
  		}, true);
  		if (this.binding) this.binding.render();

  		this.eventHandlers.forEach(_render);

  		updateLiveQueries$1(this);

  		// transitions
  		var transitionTemplate = this.template.t0 || this.template.t1;
  		if (transitionTemplate && this.ractive.transitionsEnabled) {
  			var transition = new Transition(this, transitionTemplate, true);
  			runloop.registerTransition(transition);

  			this._introTransition = transition; // so we can abort if it gets removed
  		}

  		if (!existing) {
  			target.appendChild(node);
  		}

  		this.rendered = true;
  	};

  	Element.prototype.toString = function toString() {
  		var tagName = this.template.e;

  		var attrs = this.attributes.map(stringifyAttribute).join('') + this.conditionalAttributes.map(stringifyAttribute).join('');

  		// Special case - selected options
  		if (this.name === 'option' && this.isSelected()) {
  			attrs += ' selected';
  		}

  		// Special case - two-way radio name bindings
  		if (this.name === 'input' && inputIsCheckedRadio(this)) {
  			attrs += ' checked';
  		}

  		var str = '<' + tagName + attrs + '>';

  		if (this.isVoid) return str;

  		// Special case - textarea
  		if (this.name === 'textarea' && this.getAttribute('value') !== undefined) {
  			str += escapeHtml(this.getAttribute('value'));
  		}

  		// Special case - contenteditable
  		else if (this.getAttribute('contenteditable') !== undefined) {
  				str += this.getAttribute('value') || '';
  			}

  		if (this.fragment) {
  			str += this.fragment.toString(!/^(?:script|style)$/i.test(this.template.e)); // escape text unless script/style
  		}

  		str += '</' + tagName + '>';
  		return str;
  	};

  	Element.prototype.unbind = function unbind() {
  		this.attributes.forEach(_unbind);
  		this.conditionalAttributes.forEach(_unbind);

  		if (this.decorator) this.decorator.unbind();
  		if (this.fragment) this.fragment.unbind();
  	};

  	Element.prototype.unrender = function unrender(shouldDestroy) {
  		if (!this.rendered) return;
  		this.rendered = false;

  		// unrendering before intro completed? complete it now
  		// TODO should be an API for aborting transitions
  		var transition = this._introTransition;
  		if (transition) transition.complete();

  		// Detach as soon as we can
  		if (this.name === 'option') {
  			// <option> elements detach immediately, so that
  			// their parent <select> element syncs correctly, and
  			// since option elements can't have transitions anyway
  			this.detach();
  		} else if (shouldDestroy) {
  			runloop.detachWhenReady(this);
  		}

  		if (this.fragment) this.fragment.unrender();

  		this.eventHandlers.forEach(_unrender);

  		if (this.binding) this.binding.unrender();
  		if (!shouldDestroy && this.decorator) this.decorator.unrender();

  		// outro transition
  		var transitionTemplate = this.template.t0 || this.template.t2;
  		if (transitionTemplate && this.ractive.transitionsEnabled) {
  			var _transition = new Transition(this, transitionTemplate, false);
  			runloop.registerTransition(_transition);
  		}

  		// special case
  		var id = this.attributeByName.id;
  		if (id) {
  			delete this.ractive.nodes[id.getValue()];
  		}

  		removeFromLiveQueries(this);
  		// TODO forms are a special case
  	};

  	Element.prototype.update = function update() {
  		if (this.dirty) {
  			this.attributes.forEach(_update);
  			this.conditionalAttributes.forEach(_update);
  			this.eventHandlers.forEach(_update);

  			if (this.decorator) this.decorator.update();
  			if (this.fragment) this.fragment.update();

  			this.dirty = false;
  		}
  	};

  	return Element;
  })(Item);

  function inputIsCheckedRadio(element) {
  	var attributes = element.attributeByName;

  	var typeAttribute = attributes.type;
  	var valueAttribute = attributes.value;
  	var nameAttribute = attributes.name;

  	if (!typeAttribute || typeAttribute.value !== 'radio' || !valueAttribute || !nameAttribute.interpolator) {
  		return;
  	}

  	if (valueAttribute.getValue() === nameAttribute.interpolator.model.get()) {
  		return true;
  	}
  }

  function stringifyAttribute(attribute) {
  	var str = attribute.toString();
  	return str ? ' ' + str : '';
  }

  function removeFromLiveQueries(element) {
  	var i = element.liveQueries.length;
  	while (i--) {
  		var query = element.liveQueries[i];
  		query.remove(element.node);
  	}
  }

  function getNamespace(element) {
  	// Use specified namespace...
  	var xmlns = element.getAttribute('xmlns');
  	if (xmlns) return xmlns;

  	// ...or SVG namespace, if this is an <svg> element
  	if (element.name === 'svg') return svg$1;

  	var parent = element.parent;

  	if (parent) {
  		// ...or HTML, if the parent is a <foreignObject>
  		if (parent.name === 'foreignobject') return html;

  		// ...or inherit from the parent node
  		return parent.node.namespaceURI;
  	}

  	return element.ractive.el.namespaceURI;
  }

  var Input = (function (_Element) {
  	inherits(Input, _Element);

  	function Input() {
  		classCallCheck(this, Input);

  		_Element.apply(this, arguments);
  	}

  	Input.prototype.render = function render(target, occupants) {
  		_Element.prototype.render.call(this, target, occupants);
  		this.node.defaultValue = this.node.value;
  	};

  	return Input;
  })(Element);

  var Textarea = (function (_Input) {
  	inherits(Textarea, _Input);

  	function Textarea(options) {
  		classCallCheck(this, Textarea);

  		var template = options.template;

  		// if there is a bindable value, there should be no body
  		if (template.a && template.a.value && isBindable({ template: template.a.value })) {
  			options.noContent = true;
  		}

  		// otherwise, if there is a single bindable interpolator as content, move it to the value attr
  		else if (template.f && (!template.a || !template.a.value) && isBindable({ template: template.f })) {
  				if (!template.a) template.a = {};
  				template.a.value = template.f;
  				options.noContent = true;
  			}

  		_Input.call(this, options);
  	}

  	Textarea.prototype.bubble = function bubble() {
  		var _this = this;

  		if (!this.dirty) {
  			this.dirty = true;

  			if (this.rendered && !this.binding && this.fragment) {
  				runloop.scheduleTask(function () {
  					_this.dirty = false;
  					_this.node.value = _this.fragment.toString();
  				});
  			}

  			this.parentFragment.bubble(); // default behaviour
  		}
  	};

  	return Textarea;
  })(Input);

  function valueContains(selectValue, optionValue) {
  	var i = selectValue.length;
  	while (i--) {
  		if (selectValue[i] == optionValue) return true;
  	}
  }

  var Select = (function (_Element) {
  	inherits(Select, _Element);

  	function Select(options) {
  		classCallCheck(this, Select);

  		_Element.call(this, options);
  		this.options = [];
  	}

  	Select.prototype.bubble = function bubble() {
  		var _this = this;

  		if (!this.dirty) {
  			this.dirty = true;

  			if (this.rendered) {
  				runloop.scheduleTask(function () {
  					_this.sync();
  					_this.dirty = false;
  				});
  			}

  			this.parentFragment.bubble(); // default behaviour
  		}
  	};

  	Select.prototype.render = function render(target, occupants) {
  		_Element.prototype.render.call(this, target, occupants);
  		this.sync();

  		var node = this.node;

  		var i = node.options.length;
  		while (i--) {
  			node.options[i].defaultSelected = node.options[i].selected;
  		}

  		this.rendered = true;
  	};

  	Select.prototype.sync = function sync() {
  		var selectNode = this.node;

  		if (!selectNode) return;

  		var options = toArray(selectNode.options);

  		var selectValue = this.getAttribute('value');
  		var isMultiple = this.getAttribute('multiple');

  		// If the <select> has a specified value, that should override
  		// these options
  		if (selectValue !== undefined) {
  			var optionWasSelected = undefined;

  			options.forEach(function (o) {
  				var optionValue = o._ractive ? o._ractive.value : o.value;
  				var shouldSelect = isMultiple ? valueContains(selectValue, optionValue) : selectValue == optionValue;

  				if (shouldSelect) {
  					optionWasSelected = true;
  				}

  				o.selected = shouldSelect;
  			});

  			if (!optionWasSelected && !isMultiple) {
  				if (options[0]) {
  					options[0].selected = true;
  				}

  				if (this.binding) {
  					this.binding.forceUpdate();
  				}
  			}
  		}

  		// Otherwise the value should be initialised according to which
  		// <option> element is selected, if twoway binding is in effect
  		else if (this.binding) {
  				this.binding.forceUpdate();
  			}
  	};

  	Select.prototype.update = function update() {
  		_Element.prototype.update.call(this);
  		this.sync();
  	};

  	return Select;
  })(Element);

  function findParentSelect(element) {
  	while (element) {
  		if (element.name === 'select') return element;
  		element = element.parent;
  	}
  }

  var Option = (function (_Element) {
  	inherits(Option, _Element);

  	function Option(options) {
  		classCallCheck(this, Option);

  		var template = options.template;
  		if (!template.a) template.a = {};

  		// If the value attribute is missing, use the element's content,
  		// as long as it isn't disabled
  		if (template.a.value === undefined && !('disabled' in template)) {
  			template.a.value = template.f || '';
  		}

  		_Element.call(this, options);

  		this.select = findParentSelect(this.parent);
  	}

  	Option.prototype.bind = function bind() {
  		if (!this.select) {
  			_Element.prototype.bind.call(this);
  			return;
  		}

  		// If the select has a value, it overrides the `selected` attribute on
  		// this option - so we delete the attribute
  		var selectedAttribute = this.attributeByName.selected;
  		if (selectedAttribute && this.select.getAttribute('value') !== undefined) {
  			var index = this.attributes.indexOf(selectedAttribute);
  			this.attributes.splice(index, 1);
  			delete this.attributeByName.selected;
  		}

  		_Element.prototype.bind.call(this);
  		this.select.options.push(this);
  	};

  	Option.prototype.isSelected = function isSelected() {
  		var optionValue = this.getAttribute('value');

  		if (optionValue === undefined || !this.select) {
  			return false;
  		}

  		var selectValue = this.select.getAttribute('value');

  		if (selectValue == optionValue) {
  			return true;
  		}

  		if (this.select.getAttribute('multiple') && isArray(selectValue)) {
  			var i = selectValue.length;
  			while (i--) {
  				if (selectValue[i] == optionValue) {
  					return true;
  				}
  			}
  		}
  	};

  	Option.prototype.unbind = function unbind() {
  		_Element.prototype.unbind.call(this);

  		if (this.select) {
  			removeFromArray(this.select.options, this);
  		}
  	};

  	return Option;
  })(Element);

  var Form = (function (_Element) {
  	inherits(Form, _Element);

  	function Form(options) {
  		classCallCheck(this, Form);

  		_Element.call(this, options);
  		this.formBindings = [];
  	}

  	Form.prototype.render = function render(target, occupants) {
  		_Element.prototype.render.call(this, target, occupants);
  		this.node.addEventListener('reset', handleReset, false);
  	};

  	Form.prototype.unrender = function unrender() {
  		this.node.removeEventListener('reset', handleReset, false);
  	};

  	return Form;
  })(Element);

  function handleReset() {
  	var element = this._ractive.proxy;

  	runloop.start();
  	element.formBindings.forEach(updateModel);
  	runloop.end();
  }

  function updateModel(binding) {
  	binding.model.set(binding.resetValue);
  }

  function processWrapper (wrapper, array, methodName, newIndices) {
  	var __model = wrapper.__model;

  	if (newIndices) {
  		__model.shuffle(newIndices);
  	} else {
  		// If this is a sort or reverse, we just do root.set()...
  		// TODO use merge logic?
  		//root.viewmodel.mark( keypath );
  	}
  }

  var mutatorMethods = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];
  var patchedArrayProto = [];

  mutatorMethods.forEach(function (methodName) {
  	var method = function () {
  		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
  			args[_key] = arguments[_key];
  		}

  		var newIndices = getNewIndices(this.length, methodName, args);

  		// apply the underlying method
  		var result = Array.prototype[methodName].apply(this, arguments);

  		// trigger changes
  		runloop.start();

  		this._ractive.setting = true;
  		var i = this._ractive.wrappers.length;
  		while (i--) {
  			processWrapper(this._ractive.wrappers[i], this, methodName, newIndices);
  		}

  		runloop.end();

  		this._ractive.setting = false;
  		return result;
  	};

  	defineProperty(patchedArrayProto, methodName, {
  		value: method
  	});
  });

  var patchArrayMethods = undefined;
  var unpatchArrayMethods = undefined;

  // can we use prototype chain injection?
  // http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
  if (({}).__proto__) {
  	// yes, we can
  	patchArrayMethods = function (array) {
  		return array.__proto__ = patchedArrayProto;
  	};
  	unpatchArrayMethods = function (array) {
  		return array.__proto__ = Array.prototype;
  	};
  } else {
  	// no, we can't
  	patchArrayMethods = function (array) {
  		var i = mutatorMethods.length;
  		while (i--) {
  			var methodName = mutatorMethods[i];
  			defineProperty(array, methodName, {
  				value: patchedArrayProto[methodName],
  				configurable: true
  			});
  		}
  	};

  	unpatchArrayMethods = function (array) {
  		var i = mutatorMethods.length;
  		while (i--) {
  			delete array[mutatorMethods[i]];
  		}
  	};
  }

  patchArrayMethods.unpatch = unpatchArrayMethods; // TODO export separately?
  var patch = patchArrayMethods;

  var errorMessage = 'Something went wrong in a rather interesting way';

  var arrayAdaptor = {
  	filter: function (object) {
  		// wrap the array if a) b) it's an array, and b) either it hasn't been wrapped already,
  		// or the array didn't trigger the get() itself
  		return isArray(object) && (!object._ractive || !object._ractive.setting);
  	},
  	wrap: function (ractive, array, keypath) {
  		return new ArrayWrapper(ractive, array, keypath);
  	}
  };

  var ArrayWrapper = (function () {
  	function ArrayWrapper(ractive, array) {
  		classCallCheck(this, ArrayWrapper);

  		this.root = ractive;
  		this.value = array;
  		this.__model = null; // filled in later

  		// if this array hasn't already been ractified, ractify it
  		if (!array._ractive) {
  			// define a non-enumerable _ractive property to store the wrappers
  			defineProperty(array, '_ractive', {
  				value: {
  					wrappers: [],
  					instances: [],
  					setting: false
  				},
  				configurable: true
  			});

  			patch(array);
  		}

  		// store the ractive instance, so we can handle transitions later
  		if (!array._ractive.instances[ractive._guid]) {
  			array._ractive.instances[ractive._guid] = 0;
  			array._ractive.instances.push(ractive);
  		}

  		array._ractive.instances[ractive._guid] += 1;
  		array._ractive.wrappers.push(this);
  	}

  	ArrayWrapper.prototype.get = function get() {
  		return this.value;
  	};

  	ArrayWrapper.prototype.teardown = function teardown() {
  		var array, storage, wrappers, instances, index;

  		array = this.value;
  		storage = array._ractive;
  		wrappers = storage.wrappers;
  		instances = storage.instances;

  		// if teardown() was invoked because we're clearing the cache as a result of
  		// a change that the array itself triggered, we can save ourselves the teardown
  		// and immediate setup
  		if (storage.setting) {
  			return false; // so that we don't remove it from cached wrappers
  		}

  		index = wrappers.indexOf(this);
  		if (index === -1) {
  			throw new Error(errorMessage);
  		}

  		wrappers.splice(index, 1);

  		// if nothing else depends on this array, we can revert it to its
  		// natural state
  		if (!wrappers.length) {
  			delete array._ractive;
  			patch.unpatch(this.value);
  		} else {
  			// remove ractive instance if possible
  			instances[this.root._guid] -= 1;
  			if (!instances[this.root._guid]) {
  				index = instances.indexOf(this.root);

  				if (index === -1) {
  					throw new Error(errorMessage);
  				}

  				instances.splice(index, 1);
  			}
  		}
  	};

  	return ArrayWrapper;
  })();

  var magicAdaptor = undefined;

  try {
  	Object.defineProperty({}, 'test', { value: 0 });

  	magicAdaptor = {
  		filter: function (value) {
  			return value && typeof value === 'object';
  		},
  		wrap: function (ractive, value, keypath) {
  			return new MagicWrapper(ractive, value, keypath);
  		}
  	};
  } catch (err) {
  	magicAdaptor = false;
  }

  var magicAdaptor$1 = magicAdaptor;

  function createOrWrapDescriptor(originalDescriptor, ractive, keypath) {
  	if (originalDescriptor.set && originalDescriptor.set.__magic) {
  		originalDescriptor.set.__magic.dependants.push({ ractive: ractive, keypath: keypath });
  		return originalDescriptor;
  	}

  	var setting = undefined;

  	var dependants = [{ ractive: ractive, keypath: keypath }];

  	var descriptor = {
  		get: function () {
  			return 'value' in originalDescriptor ? originalDescriptor.value : originalDescriptor.get();
  		},
  		set: function (value) {
  			if (setting) return;

  			if ('value' in originalDescriptor) {
  				originalDescriptor.value = value;
  			} else {
  				originalDescriptor.set(value);
  			}

  			setting = true;
  			dependants.forEach(function (_ref) {
  				var ractive = _ref.ractive;
  				var keypath = _ref.keypath;

  				ractive.set(keypath, value);
  			});
  			setting = false;
  		},
  		enumerable: true
  	};

  	descriptor.set.__magic = { dependants: dependants, originalDescriptor: originalDescriptor };

  	return descriptor;
  }

  function revert(descriptor, ractive, keypath) {
  	if (!descriptor.set || !descriptor.set.__magic) return true;

  	var dependants = descriptor.set.__magic;
  	var i = dependants.length;
  	while (i--) {
  		var dependant = dependants[i];
  		if (dependant.ractive === ractive && dependant.keypath === keypath) {
  			dependants.splice(i, 1);
  			return false;
  		}
  	}
  }

  var MagicWrapper = (function () {
  	function MagicWrapper(ractive, value, keypath) {
  		var _this = this;

  		classCallCheck(this, MagicWrapper);

  		this.ractive = ractive;
  		this.value = value;
  		this.keypath = keypath;

  		this.originalDescriptors = {};

  		// wrap all properties with getters
  		Object.keys(value).forEach(function (key) {
  			var originalDescriptor = Object.getOwnPropertyDescriptor(_this.value, key);
  			_this.originalDescriptors[key] = originalDescriptor;

  			var childKeypath = keypath ? keypath + '.' + escapeKey(key) : escapeKey(key);

  			var descriptor = createOrWrapDescriptor(originalDescriptor, ractive, childKeypath);

  			Object.defineProperty(_this.value, key, descriptor);
  		});
  	}

  	MagicWrapper.prototype.get = function get() {
  		return this.value;
  	};

  	MagicWrapper.prototype.reset = function reset() {
  		throw new Error('TODO magic adaptor reset'); // does this ever happen?
  	};

  	MagicWrapper.prototype.set = function set(key, value) {
  		this.value[key] = value;
  	};

  	MagicWrapper.prototype.teardown = function teardown() {
  		var _this2 = this;

  		Object.keys(this.value).forEach(function (key) {
  			var descriptor = Object.getOwnPropertyDescriptor(_this2.value, key);
  			if (!descriptor.set || !descriptor.set.__magic) return;

  			revert(descriptor);

  			if (descriptor.set.__magic.dependants.length === 1) {
  				Object.defineProperty(_this2.value, key, descriptor.set.__magic.originalDescriptor);
  			}
  		});
  	};

  	return MagicWrapper;
  })();

  var MagicArrayWrapper = (function () {
  	function MagicArrayWrapper(ractive, array, keypath) {
  		classCallCheck(this, MagicArrayWrapper);

  		this.value = array;

  		this.magic = true;

  		this.magicWrapper = magicAdaptor$1.wrap(ractive, array, keypath);
  		this.arrayWrapper = arrayAdaptor.wrap(ractive, array, keypath);

  		// ugh, this really is a terrible hack
  		Object.defineProperty(this, '__model', {
  			get: function () {
  				return this.arrayWrapper.__model;
  			},
  			set: function (model) {
  				this.arrayWrapper.__model = model;
  			}
  		});
  	}

  	MagicArrayWrapper.prototype.get = function get() {
  		return this.value;
  	};

  	MagicArrayWrapper.prototype.teardown = function teardown() {
  		this.arrayWrapper.teardown();
  		this.magicWrapper.teardown();
  	};

  	MagicArrayWrapper.prototype.reset = function reset(value) {
  		return this.magicWrapper.reset(value);
  	};

  	return MagicArrayWrapper;
  })();

  var magicArrayAdaptor = {
  	filter: function (object, keypath, ractive) {
  		return magicAdaptor$1.filter(object, keypath, ractive) && arrayAdaptor.filter(object);
  	},

  	wrap: function (ractive, array, keypath) {
  		return new MagicArrayWrapper(ractive, array, keypath);
  	}
  };

  function validate(data) {
  	// Warn if userOptions.data is a non-POJO
  	if (data && data.constructor !== Object) {
  		if (typeof data === 'function') {
  			// TODO do we need to support this in the new Ractive() case?
  		} else if (typeof data !== 'object') {
  				fatal('data option must be an object or a function, `' + data + '` is not valid');
  			} else {
  				warnIfDebug('If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged');
  			}
  	}
  }

  var dataConfigurator = {
  	name: 'data',

  	extend: function (Parent, proto, options) {
  		var key = undefined;
  		var value = undefined;

  		// check for non-primitives, which could cause mutation-related bugs
  		if (options.data && isObject(options.data)) {
  			for (key in options.data) {
  				value = options.data[key];

  				if (value && typeof value === 'object') {
  					if (isObject(value) || isArray(value)) {
  						warnIfDebug('Passing a `data` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:\n\n  // this...\n  data: function () {\n    return {\n      myObject: {}\n    };\n  })\n\n  // instead of this:\n  data: {\n    myObject: {}\n  }');
  					}
  				}
  			}
  		}

  		proto.data = combine$1(proto.data, options.data);
  	},

  	init: function (Parent, ractive, options) {
  		var result = combine$1(Parent.prototype.data, options.data);

  		if (typeof result === 'function') result = result.call(ractive);

  		// bind functions to the ractive instance at the top level,
  		// unless it's a non-POJO (in which case alarm bells should ring)
  		if (result && result.constructor === Object) {
  			for (var prop in result) {
  				if (typeof result[prop] === 'function') result[prop] = bind(result[prop], ractive);
  			}
  		}

  		return result || {};
  	},

  	reset: function (ractive) {
  		var result = this.init(ractive.constructor, ractive, ractive.viewmodel);
  		ractive.viewmodel.root.set(result);
  		return true;
  	}
  };

  function combine$1(parentValue, childValue) {
  	validate(childValue);

  	var parentIsFn = typeof parentValue === 'function';
  	var childIsFn = typeof childValue === 'function';

  	// Very important, otherwise child instance can become
  	// the default data object on Ractive or a component.
  	// then ractive.set() ends up setting on the prototype!
  	if (!childValue && !parentIsFn) {
  		childValue = {};
  	}

  	// Fast path, where we just need to copy properties from
  	// parent to child
  	if (!parentIsFn && !childIsFn) {
  		return fromProperties(childValue, parentValue);
  	}

  	return function () {
  		var child = childIsFn ? callDataFunction(childValue, this) : childValue;
  		var parent = parentIsFn ? callDataFunction(parentValue, this) : parentValue;

  		return fromProperties(child, parent);
  	};
  }

  function callDataFunction(fn, context) {
  	var data = fn.call(context);

  	if (!data) return;

  	if (typeof data !== 'object') {
  		fatal('Data function must return an object');
  	}

  	if (data.constructor !== Object) {
  		warnOnceIfDebug('Data function returned something other than a plain JavaScript object. This might work, but is strongly discouraged');
  	}

  	return data;
  }

  function fromProperties(primary, secondary) {
  	if (primary && secondary) {
  		for (var key in secondary) {
  			if (!(key in primary)) {
  				primary[key] = secondary[key];
  			}
  		}

  		return primary;
  	}

  	return primary || secondary;
  }

  // TODO this is probably a bit anal, maybe we should leave it out
  function prettify(fnBody) {
  	var lines = fnBody.replace(/^\t+/gm, function (tabs) {
  		return tabs.split('\t').join('  ');
  	}).split('\n');

  	var minIndent = lines.length < 2 ? 0 : lines.slice(1).reduce(function (prev, line) {
  		return Math.min(prev, /^\s*/.exec(line)[0].length);
  	}, Infinity);

  	return lines.map(function (line, i) {
  		return '    ' + (i ? line.substring(minIndent) : line);
  	}).join('\n');
  }

  // Ditto. This function truncates the stack to only include app code
  function truncateStack(stack) {
  	if (!stack) return '';

  	var lines = stack.split('\n');
  	var name = Computation.name + '.getValue';

  	var truncated = [];

  	var len = lines.length;
  	for (var i = 1; i < len; i += 1) {
  		var line = lines[i];

  		if (~line.indexOf(name)) {
  			return truncated.join('\n');
  		} else {
  			truncated.push(line);
  		}
  	}
  }

  var Computation = (function (_Model) {
  	inherits(Computation, _Model);

  	function Computation(viewmodel, signature, key) {
  		classCallCheck(this, Computation);

  		_Model.call(this, null, null);

  		this.root = this.parent = viewmodel;
  		this.signature = signature;
  		this.key = key; // not actually used, but helps with debugging

  		this.isReadonly = !this.signature.setter;

  		this.context = viewmodel.computationContext;

  		this.dependencies = [];

  		this.children = [];
  		this.childByKey = {};

  		this.deps = [];

  		this.boundsSensitive = true;
  		this.dirty = true;
  	}

  	Computation.prototype.get = function get(shouldCapture) {
  		if (shouldCapture) capture(this);

  		if (this.dirty) {
  			this.value = this.getValue();
  			this.adapt();
  			this.dirty = false;
  		}

  		return this.value;
  	};

  	Computation.prototype.getValue = function getValue() {
  		startCapturing();
  		var result = undefined;

  		try {
  			result = this.signature.getter.call(this.context);
  		} catch (err) {
  			warnIfDebug('Failed to compute ' + this.getKeypath() + ': ' + (err.message || err));

  			// TODO this is all well and good in Chrome, but...
  			// ...also, should encapsulate this stuff better, and only
  			// show it if Ractive.DEBUG
  			if (console.groupCollapsed) console.groupCollapsed('%cshow details', 'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;');
  			var functionBody = prettify(this.signature.getterString);
  			var stack = this.signature.getterUseStack ? '\n\n' + truncateStack(err.stack) : '';
  			console.error(err.name + ': ' + err.message + '\n\n' + functionBody + stack);
  			if (console.groupCollapsed) console.groupEnd();
  		}

  		var dependencies = stopCapturing();
  		this.setDependencies(dependencies);

  		return result;
  	};

  	Computation.prototype.handleChange = function handleChange() {
  		this.dirty = true;

  		this.deps.forEach(_handleChange);
  		this.children.forEach(_handleChange);
  		this.clearUnresolveds(); // TODO same question as on Model - necessary for primitives?
  	};

  	Computation.prototype.joinKey = function joinKey(key) {
  		if (key === undefined || key === '') return this;

  		if (!this.childByKey.hasOwnProperty(key)) {
  			var child = new ComputationChild(this, key);
  			this.children.push(child);
  			this.childByKey[key] = child;
  		}

  		return this.childByKey[key];
  	};

  	Computation.prototype.mark = function mark() {
  		this.handleChange();
  	};

  	Computation.prototype.set = function set(value) {
  		if (!this.signature.setter) {
  			throw new Error('Cannot set read-only computed value \'' + this.key + '\'');
  		}

  		this.signature.setter(value);
  	};

  	Computation.prototype.setDependencies = function setDependencies(dependencies) {
  		// unregister any soft dependencies we no longer have
  		var i = this.dependencies.length;
  		while (i--) {
  			var model = this.dependencies[i];
  			if (! ~dependencies.indexOf(model)) model.unregister(this);
  		}

  		// and add any new ones
  		i = dependencies.length;
  		while (i--) {
  			var model = dependencies[i];
  			if (! ~this.dependencies.indexOf(model)) model.register(this);
  		}

  		this.dependencies = dependencies;
  	};

  	return Computation;
  })(Model);

  var RootModel = (function (_Model) {
  	inherits(RootModel, _Model);

  	function RootModel(options) {
  		classCallCheck(this, RootModel);

  		_Model.call(this, null, null);

  		// TODO deprecate this
  		this.changes = {};

  		this.isRoot = true;
  		this.root = this;
  		this.ractive = options.ractive; // TODO sever this link

  		this.value = options.data;
  		this.adaptors = options.adapt;
  		this.adapt();

  		this.mappings = {};

  		this.computationContext = options.ractive;
  		this.computations = {};
  	}

  	RootModel.prototype.applyChanges = function applyChanges() {
  		this._changeHash = {};
  		this.flush();

  		return this._changeHash;
  	};

  	RootModel.prototype.compute = function compute(key, signature) {
  		var computation = new Computation(this, signature, key);
  		this.computations[key] = computation;

  		return computation;
  	};

  	RootModel.prototype.get = function get(shouldCapture) {
  		var _this = this;

  		if (shouldCapture) capture(this);
  		var result = extend({}, this.value);

  		Object.keys(this.mappings).forEach(function (key) {
  			result[key] = _this.mappings[key].value;
  		});

  		Object.keys(this.computations).forEach(function (key) {
  			if (key[0] !== '@') {
  				// exclude template expressions
  				result[key] = _this.computations[key].value;
  			}
  		});

  		return result;
  	};

  	RootModel.prototype.getKeypath = function getKeypath() {
  		return '';
  	};

  	RootModel.prototype.has = function has(key) {
  		return key in this.mappings || key in this.computations || _Model.prototype.has.call(this, key);
  	};

  	RootModel.prototype.joinKey = function joinKey(key) {
  		return this.mappings.hasOwnProperty(key) ? this.mappings[key] : this.computations.hasOwnProperty(key) ? this.computations[key] : _Model.prototype.joinKey.call(this, key);
  	};

  	RootModel.prototype.map = function map(localKey, origin) {
  		// TODO remapping
  		this.mappings[localKey] = origin;
  	};

  	RootModel.prototype.set = function set(value) {
  		// TODO wrapping root node is a baaaad idea. We should prevent this
  		var wrapper = this.wrapper;
  		if (wrapper) {
  			var shouldTeardown = !wrapper.reset || wrapper.reset(value) === false;

  			if (shouldTeardown) {
  				wrapper.teardown();
  				this.wrapper = null;
  				this.value = value;
  				this.adapt();
  			}
  		} else {
  			this.value = value;
  			this.adapt();
  		}

  		this.deps.forEach(_handleChange);
  		this.children.forEach(_mark);
  		this.clearUnresolveds(); // TODO do we need to do this with primitive values? if not, what about e.g. unresolved `length` property of null -> string?
  	};

  	RootModel.prototype.retrieve = function retrieve() {
  		return this.value;
  	};

  	RootModel.prototype.update = function update() {
  		// noop
  	};

  	RootModel.prototype.updateFromBindings = function updateFromBindings(cascade) {
  		var _this2 = this;

  		_Model.prototype.updateFromBindings.call(this, cascade);

  		if (cascade) {
  			// TODO computations as well?
  			Object.keys(this.mappings).forEach(function (key) {
  				var model = _this2.mappings[key];
  				model.updateFromBindings(cascade);
  			});
  		}
  	};

  	return RootModel;
  })(Model);

  var pattern = /\$\{([^\}]+)\}/g;

  function createFunctionFromString(ractive, str) {
  	var hasThis = undefined;

  	var functionBody = 'return (' + str.replace(pattern, function (match, keypath) {
  		hasThis = true;
  		return '__ractive.get("' + keypath + '")';
  	}) + ');';

  	if (hasThis) functionBody = 'var __ractive = this; ' + functionBody;

  	var fn = new Function(functionBody);
  	return hasThis ? fn.bind(ractive) : fn;
  }
  function getComputationSignature(ractive, key, signature) {
  	var getter = undefined;
  	var setter = undefined;

  	// useful for debugging
  	var getterString = undefined;
  	var getterUseStack = undefined;
  	var setterString = undefined;

  	if (typeof signature === 'function') {
  		getter = bind(signature, ractive);
  		getterString = signature.toString();
  		getterUseStack = true;
  	}

  	if (typeof signature === 'string') {
  		getter = createFunctionFromString(ractive, signature);
  		getterString = signature;
  	}

  	if (typeof signature === 'object') {
  		if (typeof signature.get === 'string') {
  			getter = createFunctionFromString(ractive, signature.get);
  			getterString = signature.get;
  		} else if (typeof signature.get === 'function') {
  			getter = bind(signature.get, ractive);
  			getterString = signature.get.toString();
  			getterUseStack = true;
  		} else {
  			fatal('`%s` computation must have a `get()` method', key);
  		}

  		if (typeof signature.set === 'function') {
  			setter = bind(signature.set, ractive);
  			setterString = signature.set.toString();
  		}
  	}

  	return {
  		getter: getter,
  		setter: setter,
  		getterString: getterString,
  		setterString: setterString,
  		getterUseStack: getterUseStack
  	};
  }

  var constructHook = new Hook('construct');

  var registryNames = ['adaptors', 'components', 'decorators', 'easing', 'events', 'interpolators', 'partials', 'transitions'];

  var uid = 0;
  function construct(ractive, options) {
  	if (Ractive.DEBUG) welcome();

  	initialiseProperties(ractive);

  	// TODO remove this, eventually
  	defineProperty(ractive, 'data', { get: deprecateRactiveData });

  	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
  	constructHook.fire(ractive, options);

  	// Add registries
  	registryNames.forEach(function (name) {
  		ractive[name] = extend(create(ractive.constructor[name] || null), options[name]);
  	});

  	// Create a viewmodel
  	var viewmodel = new RootModel({
  		adapt: getAdaptors(ractive, ractive.adapt, options),
  		data: dataConfigurator.init(ractive.constructor, ractive, options),
  		ractive: ractive
  	});

  	ractive.viewmodel = viewmodel;

  	// Add computed properties
  	var computed = extend(create(ractive.constructor.prototype.computed), options.computed);

  	for (var key in computed) {
  		var signature = getComputationSignature(ractive, key, computed[key]);
  		viewmodel.compute(key, signature);
  	}
  }

  function combine(a, b) {
  	var c = a.slice();
  	var i = b.length;

  	while (i--) {
  		if (! ~c.indexOf(b[i])) {
  			c.push(b[i]);
  		}
  	}

  	return c;
  }

  function getAdaptors(ractive, protoAdapt, options) {
  	protoAdapt = protoAdapt.map(lookup);
  	var adapt = ensureArray(options.adapt).map(lookup);

  	adapt = combine(protoAdapt, adapt);

  	var magic = 'magic' in options ? options.magic : ractive.magic;
  	var modifyArrays = 'modifyArrays' in options ? options.modifyArrays : ractive.modifyArrays;

  	if (magic) {
  		if (!magicSupported) {
  			throw new Error('Getters and setters (magic mode) are not supported in this browser');
  		}

  		if (modifyArrays) {
  			adapt.push(magicArrayAdaptor);
  		}

  		adapt.push(magicAdaptor$1);
  	}

  	if (modifyArrays) {
  		adapt.push(arrayAdaptor);
  	}

  	return adapt;

  	function lookup(adaptor) {
  		if (typeof adaptor === 'string') {
  			adaptor = findInViewHierarchy('adaptors', ractive, adaptor);

  			if (!adaptor) {
  				fatal(missingPlugin(adaptor, 'adaptor'));
  			}
  		}

  		return adaptor;
  	}
  }

  function initialiseProperties(ractive) {
  	// Generate a unique identifier, for places where you'd use a weak map if it
  	// existed
  	ractive._guid = 'r-' + uid++;

  	// events
  	ractive._subs = create(null);

  	// storage for item configuration from instantiation to reset,
  	// like dynamic functions or original values
  	ractive._config = {};

  	// nodes registry
  	ractive.nodes = {};

  	// events
  	ractive.event = null;
  	ractive._eventQueue = [];

  	// live queries
  	ractive._liveQueries = [];
  	ractive._liveComponentQueries = [];

  	// observers
  	ractive._observers = [];

  	if (!ractive.component) {
  		ractive.root = ractive;
  		ractive.parent = ractive.container = null; // TODO container still applicable?
  	}
  }

  function deprecateRactiveData() {
  	throw new Error('Using `ractive.data` is no longer supported - you must use the `ractive.get()` API instead');
  }

  function getChildQueue(queue, ractive) {
  	return queue[ractive._guid] || (queue[ractive._guid] = []);
  }

  function fire(hookQueue, ractive) {
  	var childQueue = getChildQueue(hookQueue.queue, ractive);

  	hookQueue.hook.fire(ractive);

  	// queue is "live" because components can end up being
  	// added while hooks fire on parents that modify data values.
  	while (childQueue.length) {
  		fire(hookQueue, childQueue.shift());
  	}

  	delete hookQueue.queue[ractive._guid];
  }

  var HookQueue = (function () {
  	function HookQueue(event) {
  		classCallCheck(this, HookQueue);

  		this.hook = new Hook(event);
  		this.inProcess = {};
  		this.queue = {};
  	}

  	HookQueue.prototype.begin = function begin(ractive) {
  		this.inProcess[ractive._guid] = true;
  	};

  	HookQueue.prototype.end = function end(ractive) {
  		var parent = ractive.parent;

  		// If this is *isn't* a child of a component that's in process,
  		// it should call methods or fire at this point
  		if (!parent || !this.inProcess[parent._guid]) {
  			fire(this, ractive);
  		}
  		// elsewise, handoff to parent to fire when ready
  		else {
  				getChildQueue(this.queue, parent).push(ractive);
  			}

  		delete this.inProcess[ractive._guid];
  	};

  	return HookQueue;
  })();

  var css;
  var update;
  var styleElement;
  var head;
  var styleSheet;
  var inDom;
  var prefix = '/* Ractive.js component styles */\n';
  var styles = [];
  var dirty = false;
  if (!doc) {
  	// TODO handle encapsulated CSS in server-rendered HTML!
  	css = {
  		add: noop,
  		apply: noop
  	};
  } else {
  	styleElement = doc.createElement('style');
  	styleElement.type = 'text/css';

  	head = doc.getElementsByTagName('head')[0];

  	inDom = false;

  	// Internet Exploder won't let you use styleSheet.innerHTML - we have to
  	// use styleSheet.cssText instead
  	styleSheet = styleElement.styleSheet;

  	update = function () {
  		var css = prefix + styles.map(function (s) {
  			return '\n/* {' + s.id + '} */\n' + s.styles;
  		}).join('\n');

  		if (styleSheet) {
  			styleSheet.cssText = css;
  		} else {
  			styleElement.innerHTML = css;
  		}

  		if (!inDom) {
  			head.appendChild(styleElement);
  			inDom = true;
  		}
  	};

  	css = {
  		add: function (s) {
  			styles.push(s);
  			dirty = true;
  		},

  		apply: function () {
  			if (dirty) {
  				update();
  				dirty = false;
  			}
  		}
  	};
  }

  var css$1 = css;

  var selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g;
  var commentsPattern = /\/\*.*?\*\//g;
  var selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>~:]))+)((?::[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
  var excludePattern = /^(?:@|\d+%)/;
  var dataRvcGuidPattern = /\[data-ractive-css~="\{[a-z0-9-]+\}"]/g;

  function trim$1(str) {
  	return str.trim();
  }

  function extractString(unit) {
  	return unit.str;
  }

  function transformSelector(selector, parent) {
  	var selectorUnits = [];
  	var match = undefined;

  	while (match = selectorUnitPattern.exec(selector)) {
  		selectorUnits.push({
  			str: match[0],
  			base: match[1],
  			modifiers: match[2]
  		});
  	}

  	// For each simple selector within the selector, we need to create a version
  	// that a) combines with the id, and b) is inside the id
  	var base = selectorUnits.map(extractString);

  	var transformed = [];
  	var i = selectorUnits.length;

  	while (i--) {
  		var appended = base.slice();

  		// Pseudo-selectors should go after the attribute selector
  		var unit = selectorUnits[i];
  		appended[i] = unit.base + parent + unit.modifiers || '';

  		var prepended = base.slice();
  		prepended[i] = parent + ' ' + prepended[i];

  		transformed.push(appended.join(' '), prepended.join(' '));
  	}

  	return transformed.join(', ');
  }
  function transformCss(css, id) {
  	var dataAttr = '[data-ractive-css~="{' + id + '}"]';

  	var transformed = undefined;

  	if (dataRvcGuidPattern.test(css)) {
  		transformed = css.replace(dataRvcGuidPattern, dataAttr);
  	} else {
  		transformed = css.replace(commentsPattern, '').replace(selectorsPattern, function (match, $1) {
  			// don't transform at-rules and keyframe declarations
  			if (excludePattern.test($1)) return match;

  			var selectors = $1.split(',').map(trim$1);
  			var transformed = selectors.map(function (selector) {
  				return transformSelector(selector, dataAttr);
  			}).join(', ') + ' ';

  			return match.replace($1, transformed);
  		});
  	}

  	return transformed;
  }

  var uid$1 = 1;

  var cssConfigurator = {
  	name: 'css',

  	extend: function (Parent, proto, options) {
  		if (options.css) {
  			var id = uid$1++;
  			var styles = options.noCssTransform ? options.css : transformCss(options.css, id);

  			proto.cssId = id;
  			css$1.add({ id: id, styles: styles });
  		}
  	},

  	init: function () {}
  };

  var adaptConfigurator = {
  	extend: function (Parent, proto, options) {
  		proto.adapt = combine$2(proto.adapt, ensureArray(options.adapt));
  	},

  	init: function () {}
  };

  function combine$2(a, b) {
  	var c = a.slice();
  	var i = b.length;

  	while (i--) {
  		if (! ~c.indexOf(b[i])) {
  			c.push(b[i]);
  		}
  	}

  	return c;
  }

  var registryNames$1 = ['adaptors', 'components', 'computed', 'decorators', 'easing', 'events', 'interpolators', 'partials', 'transitions'];

  var Registry = (function () {
  	function Registry(name, useDefaults) {
  		classCallCheck(this, Registry);

  		this.name = name;
  		this.useDefaults = useDefaults;
  	}

  	Registry.prototype.extend = function extend(Parent, proto, options) {
  		this.configure(this.useDefaults ? Parent.defaults : Parent, this.useDefaults ? proto : proto.constructor, options);
  	};

  	Registry.prototype.init = function init() {
  		// noop
  	};

  	Registry.prototype.configure = function configure(Parent, target, options) {
  		var name = this.name;
  		var option = options[name];

  		var registry = create(Parent[name]);

  		for (var key in option) {
  			registry[key] = option[key];
  		}

  		target[name] = registry;
  	};

  	Registry.prototype.reset = function reset(ractive) {
  		var registry = ractive[this.name];
  		var changed = false;

  		Object.keys(registry).forEach(function (key) {
  			var item = registry[key];

  			if (item._fn) {
  				if (item._fn.isOwner) {
  					registry[key] = item._fn;
  				} else {
  					delete registry[key];
  				}
  				changed = true;
  			}
  		});

  		return changed;
  	};

  	return Registry;
  })();

  var registries = registryNames$1.map(function (name) {
  	return new Registry(name, name === 'computed');
  });

  function wrap(parent, name, method) {
  	if (!/_super/.test(method)) return method;

  	function wrapper() {
  		var superMethod = getSuperMethod(wrapper._parent, name);
  		var hasSuper = ('_super' in this);
  		var oldSuper = this._super;

  		this._super = superMethod;

  		var result = method.apply(this, arguments);

  		if (hasSuper) {
  			this._super = oldSuper;
  		} else {
  			delete this._super;
  		}

  		return result;
  	}

  	wrapper._parent = parent;
  	wrapper._method = method;

  	return wrapper;
  }

  function getSuperMethod(parent, name) {
  	if (name in parent) {
  		var _ret = (function () {
  			var value = parent[name];

  			return {
  				v: typeof value === 'function' ? value : function () {
  					return value;
  				}
  			};
  		})();

  		if (typeof _ret === 'object') return _ret.v;
  	}

  	return noop;
  }

  function getMessage(deprecated, correct, isError) {
  	return 'options.' + deprecated + ' has been deprecated in favour of options.' + correct + '.' + (isError ? ' You cannot specify both options, please use options.' + correct + '.' : '');
  }

  function deprecateOption(options, deprecatedOption, correct) {
  	if (deprecatedOption in options) {
  		if (!(correct in options)) {
  			warnIfDebug(getMessage(deprecatedOption, correct));
  			options[correct] = options[deprecatedOption];
  		} else {
  			throw new Error(getMessage(deprecatedOption, correct, true));
  		}
  	}
  }
  function deprecate(options) {
  	deprecateOption(options, 'beforeInit', 'onconstruct');
  	deprecateOption(options, 'init', 'onrender');
  	deprecateOption(options, 'complete', 'oncomplete');
  	deprecateOption(options, 'eventDefinitions', 'events');

  	// Using extend with Component instead of options,
  	// like Human.extend( Spider ) means adaptors as a registry
  	// gets copied to options. So we have to check if actually an array
  	if (isArray(options.adaptors)) {
  		deprecateOption(options, 'adaptors', 'adapt');
  	}
  }

  var custom = {
  	adapt: adaptConfigurator,
  	css: cssConfigurator,
  	data: dataConfigurator,
  	template: templateConfigurator
  };

  var defaultKeys = Object.keys(defaults);

  var isStandardKey = makeObj(defaultKeys.filter(function (key) {
  	return !custom[key];
  }));

  // blacklisted keys that we don't double extend
  var isBlacklisted = makeObj(defaultKeys.concat(registries.map(function (r) {
  	return r.name;
  })));

  var order = [].concat(defaultKeys.filter(function (key) {
  	return !registries[key] && !custom[key];
  }), registries,
  //custom.data,
  custom.template, custom.css);

  var config = {
  	extend: function (Parent, proto, options) {
  		return configure('extend', Parent, proto, options);
  	},

  	init: function (Parent, ractive, options) {
  		return configure('init', Parent, ractive, options);
  	},

  	reset: function (ractive) {
  		return order.filter(function (c) {
  			return c.reset && c.reset(ractive);
  		}).map(function (c) {
  			return c.name;
  		});
  	},

  	// this defines the order. TODO this isn't used anywhere in the codebase,
  	// only in the test suite - should get rid of it
  	order: order
  };

  function configure(method, Parent, target, options) {
  	deprecate(options);

  	for (var key in options) {
  		if (isStandardKey.hasOwnProperty(key)) {
  			var value = options[key];

  			// warn the developer if they passed a function and ignore its value

  			// NOTE: we allow some functions on "el" because we duck type element lists
  			// and some libraries or ef'ed-up virtual browsers (phantomJS) return a
  			// function object as the result of querySelector methods
  			if (key !== 'el' && typeof value === 'function') {
  				warnIfDebug(key + ' is a Ractive option that does not expect a function and will be ignored', method === 'init' ? target : null);
  			} else {
  				target[key] = value;
  			}
  		}
  	}

  	// disallow combination of `append` and `enhance`
  	if (options.append && options.enhance) {
  		throw new Error('Cannot use append and enhance at the same time');
  	}

  	registries.forEach(function (registry) {
  		registry[method](Parent, target, options);
  	});

  	adaptConfigurator[method](Parent, target, options);
  	templateConfigurator[method](Parent, target, options);
  	cssConfigurator[method](Parent, target, options);

  	extendOtherMethods(Parent.prototype, target, options);
  }

  function extendOtherMethods(parent, target, options) {
  	for (var key in options) {
  		if (!isBlacklisted[key] && options.hasOwnProperty(key)) {
  			var member = options[key];

  			// if this is a method that overwrites a method, wrap it:
  			if (typeof member === 'function') {
  				member = wrap(parent, key, member);
  			}

  			target[key] = member;
  		}
  	}
  }

  function makeObj(array) {
  	var obj = {};
  	array.forEach(function (x) {
  		return obj[x] = true;
  	});
  	return obj;
  }

  var configHook = new Hook('config');
  var initHook = new HookQueue('init');
  function initialise(ractive, userOptions, options) {
  	Object.keys(ractive.viewmodel.computations).forEach(function (key) {
  		var computation = ractive.viewmodel.computations[key];

  		if (ractive.viewmodel.value.hasOwnProperty(key)) {
  			computation.set(ractive.viewmodel.value[key]);
  		}
  	});

  	// init config from Parent and options
  	config.init(ractive.constructor, ractive, userOptions);

  	configHook.fire(ractive);
  	initHook.begin(ractive);

  	var fragment = undefined;

  	// Render virtual DOM
  	if (ractive.template) {
  		var cssIds = undefined;

  		if (options.cssIds || ractive.cssId) {
  			cssIds = options.cssIds ? options.cssIds.slice() : [];

  			if (ractive.cssId) {
  				cssIds.push(ractive.cssId);
  			}
  		}

  		ractive.fragment = fragment = new Fragment({
  			owner: ractive,
  			template: ractive.template,
  			cssIds: cssIds,
  			indexRefs: options.indexRefs || {},
  			keyRefs: options.keyRefs || {}
  		}).bind(ractive.viewmodel);
  	}

  	initHook.end(ractive);

  	if (fragment) {
  		// render automatically ( if `el` is specified )
  		var el = getElement(ractive.el);
  		if (el) {
  			var promise = ractive.render(el, ractive.append);

  			if (Ractive.DEBUG_PROMISES) {
  				promise['catch'](function (err) {
  					warnOnceIfDebug('Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;');
  					warnIfDebug('An error happened during rendering', { ractive: ractive });
  					err.stack && logIfDebug(err.stack);

  					throw err;
  				});
  			}
  		}
  	}
  }

  var renderHook$1 = new Hook('render');
  var completeHook$1 = new Hook('complete');
  function render(ractive, target, anchor, occupants) {
  	// if `noIntro` is `true`, temporarily disable transitions
  	var transitionsEnabled = ractive.transitionsEnabled;
  	if (ractive.noIntro) ractive.transitionsEnabled = false;

  	var promise = runloop.start(ractive, true);
  	runloop.scheduleTask(function () {
  		return renderHook$1.fire(ractive);
  	}, true);

  	if (ractive.fragment.rendered) {
  		throw new Error('You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first');
  	}

  	anchor = getElement(anchor) || ractive.anchor;

  	ractive.el = target;
  	ractive.anchor = anchor;

  	// ensure encapsulated CSS is up-to-date
  	if (ractive.cssId) css$1.apply();

  	if (target) {
  		(target.__ractive_instances__ || (target.__ractive_instances__ = [])).push(ractive);

  		if (anchor) {
  			var docFrag = doc.createDocumentFragment();
  			ractive.fragment.render(docFrag);
  			target.insertBefore(docFrag, anchor);
  		} else {
  			ractive.fragment.render(target, occupants);
  		}
  	}

  	runloop.end();
  	ractive.transitionsEnabled = transitionsEnabled;

  	return promise.then(function () {
  		return completeHook$1.fire(ractive);
  	});
  }

  var Parser;
  var ParseError;
  var leadingWhitespace = /^\s+/;
  ParseError = function (message) {
  	this.name = 'ParseError';
  	this.message = message;
  	try {
  		throw new Error(message);
  	} catch (e) {
  		this.stack = e.stack;
  	}
  };

  ParseError.prototype = Error.prototype;

  Parser = function (str, options) {
  	var items,
  	    item,
  	    lineStart = 0;

  	this.str = str;
  	this.options = options || {};
  	this.pos = 0;

  	this.lines = this.str.split('\n');
  	this.lineEnds = this.lines.map(function (line) {
  		var lineEnd = lineStart + line.length + 1; // +1 for the newline

  		lineStart = lineEnd;
  		return lineEnd;
  	}, 0);

  	// Custom init logic
  	if (this.init) this.init(str, options);

  	items = [];

  	while (this.pos < this.str.length && (item = this.read())) {
  		items.push(item);
  	}

  	this.leftover = this.remaining();
  	this.result = this.postProcess ? this.postProcess(items, options) : items;
  };

  Parser.prototype = {
  	read: function (converters) {
  		var pos, i, len, item;

  		if (!converters) converters = this.converters;

  		pos = this.pos;

  		len = converters.length;
  		for (i = 0; i < len; i += 1) {
  			this.pos = pos; // reset for each attempt

  			if (item = converters[i](this)) {
  				return item;
  			}
  		}

  		return null;
  	},

  	getLinePos: function (char) {
  		var lineNum = 0,
  		    lineStart = 0,
  		    columnNum;

  		while (char >= this.lineEnds[lineNum]) {
  			lineStart = this.lineEnds[lineNum];
  			lineNum += 1;
  		}

  		columnNum = char - lineStart;
  		return [lineNum + 1, columnNum + 1, char]; // line/col should be one-based, not zero-based!
  	},

  	error: function (message) {
  		var pos = this.getLinePos(this.pos);
  		var lineNum = pos[0];
  		var columnNum = pos[1];

  		var line = this.lines[pos[0] - 1];
  		var numTabs = 0;
  		var annotation = line.replace(/\t/g, function (match, char) {
  			if (char < pos[1]) {
  				numTabs += 1;
  			}

  			return '  ';
  		}) + '\n' + new Array(pos[1] + numTabs).join(' ') + '^----';

  		var error = new ParseError(message + ' at line ' + lineNum + ' character ' + columnNum + ':\n' + annotation);

  		error.line = pos[0];
  		error.character = pos[1];
  		error.shortMessage = message;

  		throw error;
  	},

  	matchString: function (string) {
  		if (this.str.substr(this.pos, string.length) === string) {
  			this.pos += string.length;
  			return string;
  		}
  	},

  	matchPattern: function (pattern) {
  		var match;

  		if (match = pattern.exec(this.remaining())) {
  			this.pos += match[0].length;
  			return match[1] || match[0];
  		}
  	},

  	allowWhitespace: function () {
  		this.matchPattern(leadingWhitespace);
  	},

  	remaining: function () {
  		return this.str.substring(this.pos);
  	},

  	nextChar: function () {
  		return this.str.charAt(this.pos);
  	}
  };

  Parser.extend = function (proto) {
  	var Parent = this,
  	    Child,
  	    key;

  	Child = function (str, options) {
  		Parser.call(this, str, options);
  	};

  	Child.prototype = create(Parent.prototype);

  	for (key in proto) {
  		if (hasOwn.call(proto, key)) {
  			Child.prototype[key] = proto[key];
  		}
  	}

  	Child.extend = Parser.extend;
  	return Child;
  };

  var Parser$1 = Parser;

  var stringMiddlePattern;
  var escapeSequencePattern;
  var lineContinuationPattern;
  // Match one or more characters until: ", ', \, or EOL/EOF.
  // EOL/EOF is written as (?!.) (meaning there's no non-newline char next).
  stringMiddlePattern = /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/;

  // Match one escape sequence, including the backslash.
  escapeSequencePattern = /^\\(?:['"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/;

  // Match one ES5 line continuation (backslash + line terminator).
  lineContinuationPattern = /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/;

  // Helper for defining getDoubleQuotedString and getSingleQuotedString.
  function makeQuotedStringMatcher (okQuote) {
  	return function (parser) {
  		var literal = '"';
  		var done = false;
  		var next = undefined;

  		while (!done) {
  			next = parser.matchPattern(stringMiddlePattern) || parser.matchPattern(escapeSequencePattern) || parser.matchString(okQuote);
  			if (next) {
  				if (next === '"') {
  					literal += '\\"';
  				} else if (next === '\\\'') {
  					literal += '\'';
  				} else {
  					literal += next;
  				}
  			} else {
  				next = parser.matchPattern(lineContinuationPattern);
  				if (next) {
  					// convert \(newline-like) into a \u escape, which is allowed in JSON
  					literal += '\\u' + ('000' + next.charCodeAt(1).toString(16)).slice(-4);
  				} else {
  					done = true;
  				}
  			}
  		}

  		literal += '"';

  		// use JSON.parse to interpret escapes
  		return JSON.parse(literal);
  	};
  }

  var getSingleQuotedString = makeQuotedStringMatcher('"');
  var getDoubleQuotedString = makeQuotedStringMatcher('\'');

  function readStringLiteral (parser) {
  	var start, string;

  	start = parser.pos;

  	if (parser.matchString('"')) {
  		string = getDoubleQuotedString(parser);

  		if (!parser.matchString('"')) {
  			parser.pos = start;
  			return null;
  		}

  		return {
  			t: STRING_LITERAL,
  			v: string
  		};
  	}

  	if (parser.matchString('\'')) {
  		string = getSingleQuotedString(parser);

  		if (!parser.matchString('\'')) {
  			parser.pos = start;
  			return null;
  		}

  		return {
  			t: STRING_LITERAL,
  			v: string
  		};
  	}

  	return null;
  }

  // bulletproof number regex from https://gist.github.com/Rich-Harris/7544330
  var numberPattern$1 = /^(?:[+-]?)0*(?:(?:(?:[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
  function readNumberLiteral(parser) {
  	var result;

  	if (result = parser.matchPattern(numberPattern$1)) {
  		return {
  			t: NUMBER_LITERAL,
  			v: result
  		};
  	}

  	return null;
  }

  var name = /^[a-zA-Z_$][a-zA-Z_$0-9]*/;

  var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

  // http://mathiasbynens.be/notes/javascript-properties
  // can be any name, string literal, or number literal

  function readKey(parser) {
  	var token;

  	if (token = readStringLiteral(parser)) {
  		return identifier.test(token.v) ? token.v : '"' + token.v.replace(/"/g, '\\"') + '"';
  	}

  	if (token = readNumberLiteral(parser)) {
  		return token.v;
  	}

  	if (token = parser.matchPattern(name)) {
  		return token;
  	}

  	return null;
  }

  // simple JSON parser, without the restrictions of JSON parse
  // (i.e. having to double-quote keys).
  //
  // If passed a hash of values as the second argument, ${placeholders}
  // will be replaced with those values

  var specials = {
  	'true': true,
  	'false': false,
  	'null': null,
  	undefined: undefined
  };

  var specialsPattern = new RegExp('^(?:' + Object.keys(specials).join('|') + ')');
  var numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
  var placeholderPattern = /\$\{([^\}]+)\}/g;
  var placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
  var onlyWhitespace = /^\s*$/;

  var JsonParser = Parser$1.extend({
  	init: function (str, options) {
  		this.values = options.values;
  		this.allowWhitespace();
  	},

  	postProcess: function (result) {
  		if (result.length !== 1 || !onlyWhitespace.test(this.leftover)) {
  			return null;
  		}

  		return { value: result[0].v };
  	},

  	converters: [function getPlaceholder(parser) {
  		if (!parser.values) return null;

  		var placeholder = parser.matchPattern(placeholderAtStartPattern);

  		if (placeholder && parser.values.hasOwnProperty(placeholder)) {
  			return { v: parser.values[placeholder] };
  		}
  	}, function getSpecial(parser) {
  		var special = parser.matchPattern(specialsPattern);
  		if (special) return { v: specials[special] };
  	}, function getNumber(parser) {
  		var number = parser.matchPattern(numberPattern);
  		if (number) return { v: +number };
  	}, function getString(parser) {
  		var stringLiteral = readStringLiteral(parser);
  		var values = parser.values;

  		if (stringLiteral && values) {
  			return {
  				v: stringLiteral.v.replace(placeholderPattern, function (match, $1) {
  					return $1 in values ? values[$1] : $1;
  				})
  			};
  		}

  		return stringLiteral;
  	}, function getObject(parser) {
  		if (!parser.matchString('{')) return null;

  		var result = {};

  		parser.allowWhitespace();

  		if (parser.matchString('}')) {
  			return { v: result };
  		}

  		var pair = undefined;
  		while (pair = getKeyValuePair(parser)) {
  			result[pair.key] = pair.value;

  			parser.allowWhitespace();

  			if (parser.matchString('}')) {
  				return { v: result };
  			}

  			if (!parser.matchString(',')) {
  				return null;
  			}
  		}

  		return null;
  	}, function getArray(parser) {
  		if (!parser.matchString('[')) return null;

  		var result = [];

  		parser.allowWhitespace();

  		if (parser.matchString(']')) {
  			return { v: result };
  		}

  		var valueToken = undefined;
  		while (valueToken = parser.read()) {
  			result.push(valueToken.v);

  			parser.allowWhitespace();

  			if (parser.matchString(']')) {
  				return { v: result };
  			}

  			if (!parser.matchString(',')) {
  				return null;
  			}

  			parser.allowWhitespace();
  		}

  		return null;
  	}]
  });

  function getKeyValuePair(parser) {
  	parser.allowWhitespace();

  	var key = readKey(parser);

  	if (!key) return null;

  	var pair = { key: key };

  	parser.allowWhitespace();
  	if (!parser.matchString(':')) {
  		return null;
  	}
  	parser.allowWhitespace();

  	var valueToken = parser.read();

  	if (!valueToken) return null;

  	pair.value = valueToken.v;
  	return pair;
  }

  function parseJSON (str, values) {
  	var parser = new JsonParser(str, { values: values });
  	return parser.result;
  }

  var RactiveEvent = (function () {
  	function RactiveEvent(ractive, name) {
  		classCallCheck(this, RactiveEvent);

  		this.ractive = ractive;
  		this.name = name;
  		this.handler = null;
  	}

  	RactiveEvent.prototype.listen = function listen(directive) {
  		var ractive = this.ractive;

  		this.handler = ractive.on(this.name, function () {
  			var event = undefined;

  			// semi-weak test, but what else? tag the event obj ._isEvent ?
  			if (arguments.length && arguments[0] && arguments[0].node) {
  				event = Array.prototype.shift.call(arguments);
  				event.component = ractive;
  			}

  			var args = Array.prototype.slice.call(arguments);
  			directive.fire(event, args);

  			// cancel bubbling
  			return false;
  		});
  	};

  	RactiveEvent.prototype.unlisten = function unlisten() {
  		this.handler.cancel();
  	};

  	return RactiveEvent;
  })();

  // TODO it's unfortunate that this has to run every time a
  // component is rendered... is there a better way?

  function updateLiveQueries(component) {
  	// Does this need to be added to any live queries?
  	var instance = component.ractive;

  	do {
  		var liveQueries = instance._liveComponentQueries;

  		var i = liveQueries.length;
  		while (i--) {
  			var _name = liveQueries[i];
  			var query = liveQueries["_" + _name];

  			if (query.test(component)) {
  				query.add(component.instance);
  				// keep register of applicable selectors, for when we teardown
  				component.liveQueries.push(query);
  			}
  		}
  	} while (instance = instance.parent);
  }

  function removeFromLiveComponentQueries(component) {
  	var instance = component.ractive;

  	while (instance) {
  		var query = instance._liveComponentQueries['_' + component.name];
  		if (query) query.remove(component);

  		instance = instance.parent;
  	}
  }

  function makeDirty(query) {
  	query.makeDirty();
  }

  var teardownHook$1 = new Hook('teardown');

  var Component = (function (_Item) {
  	inherits(Component, _Item);

  	function Component(options, ComponentConstructor) {
  		classCallCheck(this, Component);

  		_Item.call(this, options);
  		this.type = COMPONENT; // override ELEMENT from super

  		var instance = create(ComponentConstructor.prototype);

  		this.instance = instance;
  		this.name = options.template.e;
  		this.parentFragment = options.parentFragment;
  		this.complexMappings = [];

  		this.liveQueries = [];

  		if (instance.el) {
  			warnIfDebug('The <' + this.name + '> component has a default \'el\' property; it has been disregarded');
  		}

  		var partials = options.template.p || {};
  		if (!('content' in partials)) partials.content = options.template.f || [];
  		this._partials = partials; // TEMP

  		this.yielders = {};

  		// find container
  		var fragment = options.parentFragment;
  		var container = undefined;
  		while (fragment) {
  			if (fragment.owner.type === YIELDER) {
  				container = fragment.owner.container;
  				break;
  			}

  			fragment = fragment.parent;
  		}

  		// add component-instance-specific properties
  		instance.parent = this.parentFragment.ractive;
  		instance.container = container || null;
  		instance.root = instance.parent.root;
  		instance.component = this;

  		construct(this.instance, { partials: partials });

  		// for hackability, this could be an open option
  		// for any ractive instance, but for now, just
  		// for components and just for ractive...
  		instance._inlinePartials = partials;

  		this.eventHandlers = [];
  		if (this.template.v) this.setupEvents();
  	}

  	Component.prototype.bind = function bind() {
  		var _this = this;

  		var viewmodel = this.instance.viewmodel;
  		var childData = viewmodel.value;

  		// determine mappings
  		if (this.template.a) {
  			Object.keys(this.template.a).forEach(function (localKey) {
  				var template = _this.template.a[localKey];
  				var model = undefined;
  				var fragment = undefined;

  				if (template === 0) {
  					// empty attributes are `true`
  					viewmodel.joinKey(localKey).set(true);
  				} else if (typeof template === 'string') {
  					var parsed = parseJSON(template);
  					viewmodel.joinKey(localKey).set(parsed ? parsed.value : template);
  				} else if (isArray(template)) {
  					if (template.length === 1 && template[0].t === INTERPOLATOR) {
  						model = resolve$1(_this.parentFragment, template[0]);

  						if (!model) {
  							warnOnceIfDebug('The ' + localKey + '=\'{{' + template[0].r + '}}\' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity', { ractive: _this.instance }); // TODO add docs page explaining this
  							_this.parentFragment.ractive.get(localKey); // side-effect: create mappings as necessary
  							model = _this.parentFragment.findContext().joinKey(localKey);
  						}

  						viewmodel.map(localKey, model);

  						if (model.get() === undefined && localKey in childData) {
  							model.set(childData[localKey]);
  						}
  					} else {
  						fragment = new Fragment({
  							owner: _this,
  							template: template
  						}).bind();

  						model = viewmodel.joinKey(localKey);
  						model.set(fragment.valueOf());

  						// this is a *bit* of a hack
  						fragment.bubble = function () {
  							Fragment.prototype.bubble.call(fragment);
  							model.set(fragment.valueOf());
  						};

  						_this.complexMappings.push(fragment);
  					}
  				}
  			});
  		}

  		initialise(this.instance, {
  			partials: this._partials
  		}, {
  			indexRefs: this.instance.isolated ? {} : this.parentFragment.indexRefs,
  			keyRefs: this.instance.isolated ? {} : this.parentFragment.keyRefs,
  			cssIds: this.parentFragment.cssIds
  		});

  		this.eventHandlers.forEach(_bind);
  	};

  	Component.prototype.bubble = function bubble() {
  		if (!this.dirty) {
  			this.dirty = true;
  			this.parentFragment.bubble();
  		}
  	};

  	Component.prototype.checkYielders = function checkYielders() {
  		var _this2 = this;

  		Object.keys(this.yielders).forEach(function (name) {
  			if (_this2.yielders[name].length > 1) {
  				runloop.end();
  				throw new Error('A component template can only have one {{yield' + (name ? ' ' + name : '') + '}} declaration at a time');
  			}
  		});
  	};

  	Component.prototype.detach = function detach() {
  		return this.instance.fragment.detach();
  	};

  	Component.prototype.find = function find(selector) {
  		return this.instance.fragment.find(selector);
  	};

  	Component.prototype.findAll = function findAll(selector, query) {
  		this.instance.fragment.findAll(selector, query);
  	};

  	Component.prototype.findComponent = function findComponent(name) {
  		if (!name || this.name === name) return this.instance;

  		if (this.instance.fragment) {
  			return this.instance.fragment.findComponent(name);
  		}
  	};

  	Component.prototype.findAllComponents = function findAllComponents(name, query) {
  		if (query.test(this)) {
  			query.add(this.instance);

  			if (query.live) {
  				this.liveQueries.push(query);
  			}
  		}

  		this.instance.fragment.findAllComponents(name, query);
  	};

  	Component.prototype.firstNode = function firstNode() {
  		return this.instance.fragment.firstNode();
  	};

  	Component.prototype.rebind = function rebind() {
  		var _this3 = this;

  		this.complexMappings.forEach(_rebind);

  		this.liveQueries.forEach(makeDirty);

  		// update relevant mappings
  		var viewmodel = this.instance.viewmodel;
  		viewmodel.mappings = {};

  		if (this.template.a) {
  			Object.keys(this.template.a).forEach(function (localKey) {
  				var template = _this3.template.a[localKey];
  				var model = undefined;

  				if (isArray(template) && template.length === 1 && template[0].t === INTERPOLATOR) {
  					model = resolve$1(_this3.parentFragment, template[0]);

  					if (!model) {
  						// TODO is this even possible?
  						warnOnceIfDebug('The ' + localKey + '=\'{{' + template[0].r + '}}\' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity', { ractive: _this3.instance });
  						_this3.parentFragment.ractive.get(localKey); // side-effect: create mappings as necessary
  						model = _this3.parentFragment.findContext().joinKey(localKey);
  					}

  					viewmodel.map(localKey, model);
  				}
  			});
  		}

  		this.instance.fragment.rebind(viewmodel);
  	};

  	Component.prototype.render = function render$$(target, occupants) {
  		render(this.instance, target, null, occupants);

  		this.checkYielders();
  		this.eventHandlers.forEach(_render);
  		updateLiveQueries(this);

  		this.rendered = true;
  	};

  	Component.prototype.setupEvents = function setupEvents() {
  		var _this4 = this;

  		var handlers = this.eventHandlers;

  		Object.keys(this.template.v).forEach(function (key) {
  			var eventNames = key.split('-');
  			var template = _this4.template.v[key];

  			eventNames.forEach(function (eventName) {
  				var event = new RactiveEvent(_this4.instance, eventName);
  				handlers.push(new EventDirective(_this4, event, template));
  			});
  		});
  	};

  	Component.prototype.toString = function toString() {
  		return this.instance.toHTML();
  	};

  	Component.prototype.unbind = function unbind() {
  		this.complexMappings.forEach(_unbind);

  		var instance = this.instance;
  		instance.viewmodel.teardown();
  		instance.fragment.unbind();
  		instance._observers.forEach(cancel);

  		removeFromLiveComponentQueries(this);

  		if (instance.fragment.rendered && instance.el.__ractive_instances__) {
  			removeFromArray(instance.el.__ractive_instances__, instance);
  		}

  		teardownHook$1.fire(instance);
  	};

  	Component.prototype.unrender = function unrender(shouldDestroy) {
  		var _this5 = this;

  		this.shouldDestroy = shouldDestroy;
  		this.instance.unrender();
  		this.eventHandlers.forEach(_unrender);
  		this.liveQueries.forEach(function (query) {
  			return query.remove(_this5.instance);
  		});
  	};

  	Component.prototype.update = function update() {
  		this.instance.fragment.update();
  		this.checkYielders();
  		this.eventHandlers.forEach(_update);
  		this.dirty = false;
  	};

  	return Component;
  })(Item);

  var Text = (function (_Item) {
  	inherits(Text, _Item);

  	function Text(options) {
  		classCallCheck(this, Text);

  		_Item.call(this, options);
  		this.type = TEXT;
  	}

  	Text.prototype.bind = function bind() {
  		// noop
  	};

  	Text.prototype.detach = function detach() {
  		return detachNode(this.node);
  	};

  	Text.prototype.firstNode = function firstNode() {
  		return this.node;
  	};

  	Text.prototype.rebind = function rebind() {
  		// noop
  	};

  	Text.prototype.render = function render(target, occupants) {
  		this.rendered = true;

  		if (occupants) {
  			var n = occupants[0];
  			if (n && n.nodeType === 3) {
  				occupants.shift();
  				if (n.nodeValue !== this.template) {
  					n.nodeValue = this.template;
  				}
  			} else {
  				n = this.node = doc.createTextNode(this.template);
  				if (occupants[0]) {
  					target.insertBefore(n, occupants[0]);
  				} else {
  					target.appendChild(n);
  				}
  			}

  			this.node = n;
  		} else {
  			this.node = doc.createTextNode(this.template);
  			target.appendChild(this.node);
  		}
  	};

  	Text.prototype.toString = function toString(escape) {
  		return escape ? escapeHtml(this.template) : this.template;
  	};

  	Text.prototype.unbind = function unbind() {
  		// noop
  	};

  	Text.prototype.unrender = function unrender(shouldDestroy) {
  		if (this.rendered && shouldDestroy) this.detach();
  		this.rendered = false;
  	};

  	Text.prototype.update = function update() {
  		// noop
  	};

  	Text.prototype.valueOf = function valueOf() {
  		return this.template;
  	};

  	return Text;
  })(Item);

  // finds the component constructor in the registry or view hierarchy registries

  function getComponentConstructor(ractive, name) {
  	var instance = findInstance('components', ractive, name);
  	var Component = undefined;

  	if (instance) {
  		Component = instance.components[name];

  		// best test we have for not Ractive.extend
  		if (!Component._Parent) {
  			// function option, execute and store for reset
  			var fn = Component.bind(instance);
  			fn.isOwner = instance.components.hasOwnProperty(name);
  			Component = fn();

  			if (!Component) {
  				warnIfDebug(noRegistryFunctionReturn, name, 'component', 'component', { ractive: ractive });
  				return;
  			}

  			if (typeof Component === 'string') {
  				// allow string lookup
  				Component = getComponentConstructor(ractive, Component);
  			}

  			Component._fn = fn;
  			instance.components[name] = Component;
  		}
  	}

  	return Component;
  }

  var constructors = {};
  constructors[ALIAS] = Alias;
  constructors[DOCTYPE] = Doctype;
  constructors[INTERPOLATOR] = Interpolator;
  constructors[PARTIAL] = Partial;
  constructors[SECTION] = Section;
  constructors[TRIPLE] = Triple;
  constructors[YIELDER] = Yielder;

  var specialElements = {
  	doctype: Doctype,
  	form: Form,
  	input: Input,
  	option: Option,
  	select: Select,
  	textarea: Textarea
  };
  function createItem(options) {
  	if (typeof options.template === 'string') {
  		return new Text(options);
  	}

  	if (options.template.t === ELEMENT) {
  		// could be component or element
  		var ComponentConstructor = getComponentConstructor(options.parentFragment.ractive, options.template.e);
  		if (ComponentConstructor) {
  			return new Component(options, ComponentConstructor);
  		}

  		var tagName = options.template.e.toLowerCase();

  		var ElementConstructor = specialElements[tagName] || Element;
  		return new ElementConstructor(options);
  	}

  	var Item = constructors[options.template.t];

  	if (!Item) throw new Error('Unrecognised item type ' + options.template.t);

  	return new Item(options);
  }

  var ReferenceResolver = (function () {
  	function ReferenceResolver(fragment, reference, callback) {
  		classCallCheck(this, ReferenceResolver);

  		this.fragment = fragment;
  		this.reference = normalise(reference);
  		this.callback = callback;

  		this.keys = splitKeypath(reference);
  		this.resolved = false;

  		// TODO the consumer should take care of addUnresolved
  		// we attach to all the contexts between here and the root
  		// - whenever their values change, they can quickly
  		// check to see if we can resolve
  		while (fragment) {
  			if (fragment.context) {
  				fragment.context.addUnresolved(this.keys[0], this);
  			}

  			fragment = fragment.componentParent || fragment.parent;
  		}
  	}

  	ReferenceResolver.prototype.attemptResolution = function attemptResolution() {
  		if (this.resolved) return;

  		var model = resolveAmbiguousReference(this.fragment, this.reference);

  		if (model) {
  			this.resolved = true;
  			this.callback(model);
  		}
  	};

  	ReferenceResolver.prototype.forceResolution = function forceResolution() {
  		if (this.resolved) return;

  		var model = this.fragment.findContext().joinAll(this.keys);
  		this.callback(model);
  		this.resolved = true;
  	};

  	ReferenceResolver.prototype.unbind = function unbind() {
  		removeFromArray(this.fragment.unresolved, this);
  	};

  	return ReferenceResolver;
  })();

  // TODO all this code needs to die

  function processItems(items, values, guid) {
  	var counter = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  	return items.map(function (item) {
  		if (item.type === TEXT) {
  			return item.template;
  		}

  		if (item.fragment) {
  			if (item.fragment.iterations) {
  				return item.fragment.iterations.map(function (fragment) {
  					return processItems(fragment.items, values, guid, counter);
  				}).join('');
  			} else {
  				return processItems(item.fragment.items, values, guid, counter);
  			}
  		}

  		var placeholderId = guid + '-' + counter++;

  		values[placeholderId] = item.model ? item.model.wrapper ? item.model.wrapper.value : item.model.get() : undefined;

  		return '${' + placeholderId + '}';
  	}).join('');
  }

  function unrenderAndDestroy(item) {
  	item.unrender(true);
  }

  var Fragment = (function () {
  	function Fragment(options) {
  		classCallCheck(this, Fragment);

  		this.owner = options.owner; // The item that owns this fragment - an element, section, partial, or attribute

  		this.isRoot = !options.owner.parentFragment;
  		this.parent = this.isRoot ? null : this.owner.parentFragment;
  		this.ractive = options.ractive || (this.isRoot ? options.owner : this.parent.ractive);

  		this.componentParent = this.isRoot && this.ractive.component ? this.ractive.component.parentFragment : null;

  		this.context = null;
  		this.rendered = false;
  		this.indexRefs = options.indexRefs || (this.parent ? this.parent.indexRefs : []);
  		this.keyRefs = options.keyRefs || (this.parent ? this.parent.keyRefs : {});

  		// encapsulated styles should be inherited until they get applied by an element
  		this.cssIds = 'cssIds' in options ? options.cssIds : this.parent ? this.parent.cssIds : null;

  		this.resolvers = [];

  		this.dirty = false;
  		this.dirtyArgs = this.dirtyValue = true; // TODO getArgsList is nonsense - should deprecate legacy directives style

  		this.template = options.template || [];
  		this.createItems();
  	}

  	Fragment.prototype.bind = function bind(context) {
  		this.context = context;
  		this.items.forEach(_bind);
  		this.bound = true;

  		// in rare cases, a forced resolution (or similar) will cause the
  		// fragment to be dirty before it's even finished binding. In those
  		// cases we update immediately
  		if (this.dirty) this.update();

  		return this;
  	};

  	Fragment.prototype.bubble = function bubble() {
  		this.dirtyArgs = this.dirtyValue = true;

  		if (!this.dirty) {
  			this.dirty = true;

  			if (this.isRoot) {
  				// TODO encapsulate 'is component root, but not overall root' check?
  				if (this.ractive.component) {
  					this.ractive.component.bubble();
  				} else if (this.bound) {
  					runloop.addFragment(this);
  				}
  			} else {
  				this.owner.bubble();
  			}
  		}
  	};

  	Fragment.prototype.createItems = function createItems() {
  		var _this = this;

  		this.items = this.template.map(function (template, index) {
  			return createItem({ parentFragment: _this, template: template, index: index });
  		});
  	};

  	Fragment.prototype.detach = function detach() {
  		var docFrag = createDocumentFragment();
  		this.items.forEach(function (item) {
  			return docFrag.appendChild(item.detach());
  		});
  		return docFrag;
  	};

  	Fragment.prototype.find = function find(selector) {
  		var len = this.items.length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			var found = this.items[i].find(selector);
  			if (found) return found;
  		}
  	};

  	Fragment.prototype.findAll = function findAll(selector, query) {
  		if (this.items) {
  			var len = this.items.length;
  			var i = undefined;

  			for (i = 0; i < len; i += 1) {
  				var item = this.items[i];

  				if (item.findAll) {
  					item.findAll(selector, query);
  				}
  			}
  		}

  		return query;
  	};

  	Fragment.prototype.findComponent = function findComponent(name) {
  		var len = this.items.length;
  		var i = undefined;

  		for (i = 0; i < len; i += 1) {
  			var found = this.items[i].findComponent(name);
  			if (found) return found;
  		}
  	};

  	Fragment.prototype.findAllComponents = function findAllComponents(name, query) {
  		if (this.items) {
  			var len = this.items.length;
  			var i = undefined;

  			for (i = 0; i < len; i += 1) {
  				var item = this.items[i];

  				if (item.findAllComponents) {
  					item.findAllComponents(name, query);
  				}
  			}
  		}

  		return query;
  	};

  	Fragment.prototype.findContext = function findContext() {
  		var fragment = this;
  		while (!fragment.context) fragment = fragment.parent;
  		return fragment.context;
  	};

  	Fragment.prototype.findNextNode = function findNextNode(item) {
  		var nextItem = this.items[item.index + 1];

  		if (nextItem) return nextItem.firstNode();

  		// if this is the root fragment, and there are no more items,
  		// it means we're at the end...
  		if (this.isRoot) {
  			if (this.ractive.component) {
  				return this.ractive.component.parentFragment.findNextNode(this.ractive.component);
  			}

  			// TODO possible edge case with other content
  			// appended to this.ractive.el?
  			return null;
  		}

  		return this.owner.findNextNode(this); // the argument is in case the parent is a RepeatedFragment
  	};

  	Fragment.prototype.findParentNode = function findParentNode() {
  		var fragment = this;

  		do {
  			if (fragment.owner.type === ELEMENT) {
  				return fragment.owner.node;
  			}

  			if (fragment.isRoot && !fragment.ractive.component) {
  				// TODO encapsulate check
  				return fragment.ractive.el;
  			}

  			if (fragment.owner.type === YIELDER) {
  				fragment = fragment.owner.containerFragment;
  			} else {
  				fragment = fragment.componentParent || fragment.parent; // TODO ugh
  			}
  		} while (fragment);

  		throw new Error('Could not find parent node'); // TODO link to issue tracker
  	};

  	Fragment.prototype.findRepeatingFragment = function findRepeatingFragment() {
  		var fragment = this;
  		// TODO better check than fragment.parent.iterations
  		while (fragment.parent && !fragment.isIteration) {
  			fragment = fragment.parent || fragment.componentParent;
  		}

  		return fragment;
  	};

  	Fragment.prototype.firstNode = function firstNode() {
  		var node = undefined;
  		for (var i = 0; i < this.items.length; i++) {
  			node = this.items[i].firstNode();

  			if (node) {
  				return node;
  			}
  		}
  		return this.parent.findNextNode(this.owner);
  	};

  	// TODO ideally, this would be deprecated in favour of an
  	// expression-like approach

  	Fragment.prototype.getArgsList = function getArgsList() {
  		if (this.dirtyArgs) {
  			var values = {};
  			var source = processItems(this.items, values, this.ractive._guid);
  			var parsed = parseJSON('[' + source + ']', values);

  			this.argsList = parsed ? parsed.value : [this.toString()];

  			this.dirtyArgs = false;
  		}

  		return this.argsList;
  	};

  	Fragment.prototype.rebind = function rebind(context) {
  		this.context = context;

  		this.items.forEach(_rebind);
  	};

  	Fragment.prototype.render = function render(target, occupants) {
  		if (this.rendered) throw new Error('Fragment is already rendered!');
  		this.rendered = true;

  		this.items.forEach(function (item) {
  			return item.render(target, occupants);
  		});
  	};

  	Fragment.prototype.resetTemplate = function resetTemplate(template) {
  		var wasBound = this.bound;
  		var wasRendered = this.rendered;

  		// TODO ensure transitions are disabled globally during reset

  		if (wasBound) {
  			if (wasRendered) this.unrender(true);
  			this.unbind();
  		}

  		this.template = template;
  		this.createItems();

  		if (wasBound) {
  			this.bind(this.context);

  			if (wasRendered) {
  				var parentNode = this.findParentNode();
  				var anchor = this.parent ? this.parent.findNextNode(this.owner) : null;

  				if (anchor) {
  					var docFrag = createDocumentFragment();
  					this.render(docFrag);
  					parentNode.insertBefore(docFrag, anchor);
  				} else {
  					this.render(parentNode);
  				}
  			}
  		}
  	};

  	Fragment.prototype.resolve = function resolve(template, callback) {
  		if (!this.context) {
  			return this.parent.resolve(template, callback);
  		}

  		var resolver = new ReferenceResolver(this, template, callback);
  		this.resolvers.push(resolver);

  		return resolver; // so we can e.g. force resolution
  	};

  	Fragment.prototype.toHtml = function toHtml() {
  		return this.toString();
  	};

  	Fragment.prototype.toString = function toString(escape) {
  		return this.items.map(escape ? toEscapedString : _toString).join('');
  	};

  	Fragment.prototype.unbind = function unbind() {
  		this.items.forEach(_unbind);
  		this.bound = false;

  		return this;
  	};

  	Fragment.prototype.unrender = function unrender(shouldDestroy) {
  		this.items.forEach(shouldDestroy ? unrenderAndDestroy : _unrender);
  		this.rendered = false;
  	};

  	Fragment.prototype.update = function update() {
  		if (this.dirty) {
  			this.items.forEach(_update);
  			this.dirty = false;
  		}
  	};

  	Fragment.prototype.valueOf = function valueOf() {
  		if (this.items.length === 1) {
  			return this.items[0].valueOf();
  		}

  		if (this.dirtyValue) {
  			var values = {};
  			var source = processItems(this.items, values, this.ractive._guid);
  			var parsed = parseJSON(source, values);

  			this.value = parsed ? parsed.value : this.toString();

  			this.dirtyValue = false;
  		}

  		return this.value;
  	};

  	return Fragment;
  })();

  // TODO should resetTemplate be asynchronous? i.e. should it be a case
  // of outro, update template, intro? I reckon probably not, since that
  // could be achieved with unrender-resetTemplate-render. Also, it should
  // conceptually be similar to resetPartial, which couldn't be async

  function Ractive$resetTemplate(template) {
  	templateConfigurator.init(null, this, { template: template });

  	var transitionsEnabled = this.transitionsEnabled;
  	this.transitionsEnabled = false;

  	// Is this is a component, we need to set the `shouldDestroy`
  	// flag, otherwise it will assume by default that a parent node
  	// will be detached, and therefore it doesn't need to bother
  	// detaching its own nodes
  	var component = this.component;
  	if (component) component.shouldDestroy = true;
  	this.unrender();
  	if (component) component.shouldDestroy = false;

  	// remove existing fragment and create new one
  	this.fragment.unbind();
  	this.fragment = new Fragment({
  		template: this.template,
  		root: this,
  		owner: this
  	});
  	this.fragment.bind(this.viewmodel);

  	this.render(this.el, this.anchor);

  	this.transitionsEnabled = transitionsEnabled;
  }

  function collect(source, name, dest) {
  	source.forEach(function (item) {
  		// queue to rerender if the item is a partial and the current name matches
  		if (item.type === PARTIAL && (item.refName === name || item.name === name)) {
  			dest.push(item);
  			return; // go no further
  		}

  		// if it has a fragment, process its items
  		if (item.fragment) {
  			collect(item.fragment.iterations || item.fragment.items, name, dest);
  		}

  		// or if it is itself a fragment, process its items
  		else if (isArray(item.items)) {
  				collect(item.items, name, dest);
  			}

  			// or if it is a component, step in and process its items
  			else if (item.type === COMPONENT && item.instance) {
  					// ...unless the partial is shadowed
  					if (item.instance.partials[name]) return;
  					collect(item.instance.fragment.items, name, dest);
  				}

  		// if the item is an element, process its attributes too
  		if (item.type === ELEMENT) {
  			if (isArray(item.attributes)) {
  				collect(item.attributes, name, dest);
  			}

  			if (isArray(item.conditionalAttributes)) {
  				collect(item.conditionalAttributes, name, dest);
  			}
  		}
  	});
  }

  function forceResetTemplate(partial) {
  	partial.forceResetTemplate();
  }

  function resetPartial (name, partial) {
  	var collection = [];
  	collect(this.fragment.items, name, collection);

  	var promise = runloop.start(this, true);

  	this.partials[name] = partial;
  	collection.forEach(forceResetTemplate);

  	runloop.end();

  	return promise;
  }

  var shouldRerender = ['template', 'partials', 'components', 'decorators', 'events'];

  var completeHook = new Hook('complete');
  var resetHook = new Hook('reset');
  var renderHook = new Hook('render');
  var unrenderHook = new Hook('unrender');
  function Ractive$reset(data) {
  	data = data || {};

  	if (typeof data !== 'object') {
  		throw new Error('The reset method takes either no arguments, or an object containing new data');
  	}

  	// TEMP need to tidy this up
  	data = dataConfigurator.init(this.constructor, this, { data: data });

  	var promise = runloop.start(this, true);

  	// If the root object is wrapped, try and use the wrapper's reset value
  	var wrapper = this.viewmodel.wrapper;
  	if (wrapper && wrapper.reset) {
  		if (wrapper.reset(data) === false) {
  			// reset was rejected, we need to replace the object
  			this.viewmodel.set(data);
  		}
  	} else {
  		this.viewmodel.set(data);
  	}

  	// reset config items and track if need to rerender
  	var changes = config.reset(this);
  	var rerender = undefined;

  	var i = changes.length;
  	while (i--) {
  		if (shouldRerender.indexOf(changes[i]) > -1) {
  			rerender = true;
  			break;
  		}
  	}

  	if (rerender) {
  		unrenderHook.fire(this);
  		this.fragment.resetTemplate(this.template);
  		renderHook.fire(this);
  		completeHook.fire(this);
  	}

  	runloop.end();

  	resetHook.fire(this, data);

  	return promise;
  }

  function Ractive$render(target, anchor) {
  	target = getElement(target) || this.el;

  	if (!this.append && target) {
  		// Teardown any existing instances *before* trying to set up the new one -
  		// avoids certain weird bugs
  		var others = target.__ractive_instances__;
  		if (others) others.forEach(_teardown);

  		// make sure we are the only occupants
  		if (!this.enhance) {
  			target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
  		}
  	}

  	var occupants = this.enhance ? toArray(target.childNodes) : null;
  	var promise = render(this, target, anchor, occupants);

  	if (occupants) {
  		while (occupants.length) target.removeChild(occupants.pop());
  	}

  	return promise;
  }

  var push = makeArrayMethod('push');

  var pop = makeArrayMethod('pop');

  function Ractive$once(eventName, handler) {
  	var listener = this.on(eventName, function () {
  		handler.apply(this, arguments);
  		listener.cancel();
  	});

  	// so we can still do listener.cancel() manually
  	return listener;
  }

  function trim (str) {
    return str.trim();
  }

  function notEmptyString (str) {
    return str !== '';
  }

  function Ractive$on(eventName, callback) {
  	var _this = this;

  	// allow mutliple listeners to be bound in one go
  	if (typeof eventName === 'object') {
  		var _ret = (function () {
  			var listeners = [];
  			var n = undefined;

  			for (n in eventName) {
  				if (eventName.hasOwnProperty(n)) {
  					listeners.push(_this.on(n, eventName[n]));
  				}
  			}

  			return {
  				v: {
  					cancel: function () {
  						var listener = undefined;
  						while (listener = listeners.pop()) listener.cancel();
  					}
  				}
  			};
  		})();

  		if (typeof _ret === 'object') return _ret.v;
  	}

  	// Handle multiple space-separated event names
  	var eventNames = eventName.split(' ').map(trim).filter(notEmptyString);

  	eventNames.forEach(function (eventName) {
  		(_this._subs[eventName] || (_this._subs[eventName] = [])).push(callback);
  	});

  	return {
  		cancel: function () {
  			return _this.off(eventName, callback);
  		}
  	};
  }

  function Ractive$off(eventName, callback) {
  	var _this = this;

  	// if no arguments specified, remove all callbacks
  	if (!eventName) {
  		// TODO use this code instead, once the following issue has been resolved
  		// in PhantomJS (tests are unpassable otherwise!)
  		// https://github.com/ariya/phantomjs/issues/11856
  		// defineProperty( this, '_subs', { value: create( null ), configurable: true });
  		for (eventName in this._subs) {
  			delete this._subs[eventName];
  		}
  	} else {
  		// Handle multiple space-separated event names
  		var eventNames = eventName.split(' ').map(trim).filter(notEmptyString);

  		eventNames.forEach(function (eventName) {
  			var subscribers = _this._subs[eventName];

  			// If we have subscribers for this event...
  			if (subscribers) {
  				// ...if a callback was specified, only remove that
  				if (callback) {
  					var index = subscribers.indexOf(callback);
  					if (index !== -1) {
  						subscribers.splice(index, 1);
  					}
  				}

  				// ...otherwise remove all callbacks
  				else {
  						_this._subs[eventName] = [];
  					}
  			}
  		});
  	}

  	return this;
  }

  var onceOptions = { init: false, once: true };
  function observeOnce(keypath, callback, options) {
  	if (isObject(keypath) || typeof keypath === 'function') {
  		options = extend(callback || {}, onceOptions);
  		return this.observe(keypath, options);
  	}

  	options = extend(options || {}, onceOptions);
  	return this.observe(keypath, callback, options);
  }

  function observeList(keypath, callback, options) {
  	if (typeof keypath !== 'string') {
  		throw new Error('ractive.observeList() must be passed a string as its first argument');
  	}

  	var model = this.viewmodel.joinAll(splitKeypath(keypath));
  	var observer = new ListObserver(this, model, callback, options || {});

  	// add observer to the Ractive instance, so it can be
  	// cancelled on ractive.teardown()
  	this._observers.push(observer);

  	return {
  		cancel: function () {
  			observer.cancel();
  		}
  	};
  }

  function negativeOne() {
  	return -1;
  }

  var ListObserver = (function () {
  	function ListObserver(context, model, callback, options) {
  		classCallCheck(this, ListObserver);

  		this.context = context;
  		this.model = model;
  		this.keypath = model.getKeypath();
  		this.callback = callback;

  		this.pending = null;

  		model.register(this);

  		if (options.init !== false) {
  			this.sliced = [];
  			this.shuffle([]);
  			this.handleChange();
  		} else {
  			this.sliced = this.slice();
  		}
  	}

  	ListObserver.prototype.handleChange = function handleChange() {
  		if (this.pending) {
  			// post-shuffle
  			this.callback(this.pending);
  			this.pending = null;
  		} else {
  			// entire array changed
  			this.shuffle(this.sliced.map(negativeOne));
  			this.handleChange();
  		}
  	};

  	ListObserver.prototype.shuffle = function shuffle(newIndices) {
  		var _this = this;

  		var newValue = this.slice();

  		var inserted = [];
  		var deleted = [];
  		var start = undefined;

  		var hadIndex = {};

  		newIndices.forEach(function (newIndex, oldIndex) {
  			hadIndex[newIndex] = true;

  			if (newIndex !== oldIndex && start === undefined) {
  				start = oldIndex;
  			}

  			if (newIndex === -1) {
  				deleted.push(_this.sliced[oldIndex]);
  			}
  		});

  		if (start === undefined) start = newIndices.length;

  		var len = newValue.length;
  		for (var i = 0; i < len; i += 1) {
  			if (!hadIndex[i]) inserted.push(newValue[i]);
  		}

  		this.pending = { inserted: inserted, deleted: deleted, start: start };
  		this.sliced = newValue;
  	};

  	ListObserver.prototype.slice = function slice() {
  		var value = this.model.get();
  		return isArray(value) ? value.slice() : [];
  	};

  	return ListObserver;
  })();

  function observe(keypath, callback, options) {
  	var _this = this;

  	var observers = [];
  	var map = undefined;

  	if (isObject(keypath)) {
  		map = keypath;
  		options = callback || {};

  		Object.keys(map).forEach(function (keypath) {
  			var callback = map[keypath];

  			keypath.split(' ').forEach(function (keypath) {
  				observers.push(createObserver(_this, keypath, callback, options));
  			});
  		});
  	} else {
  		var keypaths = undefined;

  		if (typeof keypath === 'function') {
  			options = callback;
  			callback = keypath;
  			keypaths = [''];
  		} else {
  			keypaths = keypath.split(' ');
  		}

  		keypaths.forEach(function (keypath) {
  			observers.push(createObserver(_this, keypath, callback, options || {}));
  		});
  	}

  	// add observers to the Ractive instance, so they can be
  	// cancelled on ractive.teardown()
  	this._observers.push.apply(this._observers, observers);

  	return {
  		cancel: function () {
  			observers.forEach(cancel);
  		}
  	};
  }

  function createObserver(ractive, keypath, callback, options) {
  	var viewmodel = ractive.viewmodel;

  	var keys = splitKeypath(keypath);
  	var wildcardIndex = keys.indexOf('*');

  	// normal keypath - no wildcards
  	if (! ~wildcardIndex) {
  		var key = keys[0];

  		if (!viewmodel.has(key)) {
  			// if this is an inline component, we may need to create an implicit mapping
  			if (ractive.component) {
  				var _model = resolveReference(ractive.component.parentFragment, key);
  				if (_model) viewmodel.map(key, _model);
  			}
  		}

  		var model = viewmodel.joinAll(keys);
  		return new Observer(options.context || ractive, model, callback, options);
  	}

  	// pattern observers - more complex case
  	var baseModel = wildcardIndex === 0 ? viewmodel : viewmodel.joinAll(keys.slice(0, wildcardIndex));

  	return new PatternObserver(options.context || ractive, baseModel, keys.splice(wildcardIndex), callback, options);
  }

  var Observer = (function () {
  	function Observer(context, model, callback, options) {
  		classCallCheck(this, Observer);

  		this.context = context;
  		this.model = model;
  		this.keypath = model.getKeypath();
  		this.callback = callback;

  		this.oldValue = undefined;
  		this.newValue = model.get();

  		this.defer = options.defer;
  		this.once = options.once;
  		this.strict = options.strict;

  		this.dirty = false;

  		if (options.init !== false) {
  			this.dispatch();
  		} else {
  			this.oldValue = this.newValue;
  		}

  		model.register(this);
  	}

  	Observer.prototype.cancel = function cancel() {
  		this.model.unregister(this);
  	};

  	Observer.prototype.dispatch = function dispatch() {
  		this.callback.call(this.context, this.newValue, this.oldValue, this.keypath);
  		this.oldValue = this.newValue;
  		this.dirty = false;
  	};

  	Observer.prototype.handleChange = function handleChange() {
  		if (!this.dirty) {
  			this.newValue = this.model.get();

  			if (this.strict && this.newValue === this.oldValue) return;

  			runloop.addObserver(this, this.defer);
  			this.dirty = true;

  			if (this.once) this.cancel();
  		}
  	};

  	return Observer;
  })();

  var PatternObserver = (function () {
  	function PatternObserver(context, baseModel, keys, callback, options) {
  		var _this2 = this;

  		classCallCheck(this, PatternObserver);

  		this.context = context;
  		this.baseModel = baseModel;
  		this.keys = keys;
  		this.callback = callback;

  		var pattern = keys.join('\\.').replace(/\*/g, '(.+)');
  		var baseKeypath = baseModel.getKeypath();
  		this.pattern = new RegExp('^' + (baseKeypath ? baseKeypath + '\\.' : '') + pattern + '$');

  		this.oldValues = {};
  		this.newValues = {};

  		this.defer = options.defer;
  		this.once = options.once;
  		this.strict = options.strict;

  		this.dirty = false;

  		this.baseModel.findMatches(this.keys).forEach(function (model) {
  			_this2.newValues[model.getKeypath()] = model.get();
  		});

  		if (options.init !== false) {
  			this.dispatch();
  		} else {
  			this.oldValues = this.newValues;
  		}

  		baseModel.register(this);
  	}

  	PatternObserver.prototype.cancel = function cancel() {
  		this.baseModel.unregister(this);
  	};

  	PatternObserver.prototype.dispatch = function dispatch() {
  		var _this3 = this;

  		Object.keys(this.newValues).forEach(function (keypath) {
  			if (_this3.newKeys && !_this3.newKeys[keypath]) return;

  			var newValue = _this3.newValues[keypath];
  			var oldValue = _this3.oldValues[keypath];

  			if (_this3.strict && newValue === oldValue) return;
  			if (isEqual(newValue, oldValue)) return;

  			var wildcards = _this3.pattern.exec(keypath).slice(1);
  			var args = [newValue, oldValue, keypath].concat(wildcards);

  			_this3.callback.apply(_this3.context, args);
  		});

  		this.oldValues = this.newValues;
  		this.newKeys = null;
  		this.dirty = false;
  	};

  	PatternObserver.prototype.shuffle = function shuffle(newIndices) {
  		if (!isArray(this.baseModel.value)) return;

  		var base = this.baseModel.getKeypath();
  		var max = this.baseModel.value.length;
  		var suffix = this.keys.length > 1 ? '.' + this.keys.slice(1).join('.') : '';

  		this.newKeys = {};
  		for (var i = 0; i < newIndices.length; i++) {
  			if (newIndices[i] === -1 || newIndices[i] === i) continue;
  			this.newKeys[base + '.' + i + suffix] = true;
  		}

  		for (var i = newIndices.touchedFrom; i < max; i++) {
  			this.newKeys[base + '.' + i + suffix] = true;
  		}
  	};

  	PatternObserver.prototype.handleChange = function handleChange() {
  		var _this4 = this;

  		if (!this.dirty) {
  			this.newValues = {};

  			// handle case where previously extant keypath no longer exists -
  			// observer should still fire, with undefined as new value
  			// TODO huh. according to the test suite that's not the case...
  			// Object.keys( this.oldValues ).forEach( keypath => {
  			// 	this.newValues[ keypath ] = undefined;
  			// });

  			this.baseModel.findMatches(this.keys).forEach(function (model) {
  				var keypath = model.getKeypath();
  				_this4.newValues[keypath] = model.get();
  			});

  			runloop.addObserver(this, this.defer);
  			this.dirty = true;

  			if (this.once) this.cancel();
  		}
  	};

  	return PatternObserver;
  })();

  var comparators = {};

  function getComparator(option) {
  	if (!option) return null; // use existing arrays
  	if (option === true) return JSON.stringify;
  	if (typeof option === 'function') return option;

  	if (typeof option === 'string') {
  		return comparators[option] || (comparators[option] = function (thing) {
  			return thing[option];
  		});
  	}

  	throw new Error('If supplied, options.compare must be a string, function, or `true`'); // TODO link to docs
  }
  function Ractive$merge(keypath, array, options) {
  	var model = this.viewmodel.joinAll(splitKeypath(keypath));
  	var promise = runloop.start(this, true);
  	var value = model.get();

  	if (array === value) {
  		throw new Error('You cannot merge an array with itself'); // TODO link to docs
  	} else if (!isArray(value) || !isArray(array)) {
  			throw new Error('You cannot merge an array with a non-array');
  		}

  	var comparator = getComparator(options && options.compare);
  	model.merge(array, comparator);

  	runloop.end();
  	return promise;
  }

  var insertHook = new Hook('insert');
  function Ractive$insert(target, anchor) {
  	if (!this.fragment.rendered) {
  		// TODO create, and link to, documentation explaining this
  		throw new Error('The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.');
  	}

  	target = getElement(target);
  	anchor = getElement(anchor) || null;

  	if (!target) {
  		throw new Error('You must specify a valid target to insert into');
  	}

  	target.insertBefore(this.detach(), anchor);
  	this.el = target;

  	(target.__ractive_instances__ || (target.__ractive_instances__ = [])).push(this);
  	this.isDetached = false;

  	fireInsertHook(this);
  }

  function fireInsertHook(ractive) {
  	insertHook.fire(ractive);

  	ractive.findAllComponents('*').forEach(function (child) {
  		fireInsertHook(child.instance);
  	});
  }

  function Ractive$get(keypath) {
  	if (!keypath) return this.viewmodel.get(true);

  	var keys = splitKeypath(keypath);
  	var key = keys[0];

  	var model = undefined;

  	if (!this.viewmodel.has(key)) {
  		// if this is an inline component, we may need to create
  		// an implicit mapping
  		if (this.component) {
  			model = resolveReference(this.component.parentFragment, key);

  			if (model) {
  				this.viewmodel.map(key, model);
  			}
  		}
  	}

  	model = this.viewmodel.joinAll(keys);
  	return model.get(true);
  }

  function Ractive$fire(eventName) {
  	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
  		args[_key - 1] = arguments[_key];
  	}

  	fireEvent(this, eventName, { args: args });
  }

  function Ractive$findParent(selector) {

  	if (this.parent) {
  		if (this.parent.component && this.parent.component.name === selector) {
  			return this.parent;
  		} else {
  			return this.parent.findParent(selector);
  		}
  	}

  	return null;
  }

  function Ractive$findContainer(selector) {
  	if (this.container) {
  		if (this.container.component && this.container.component.name === selector) {
  			return this.container;
  		} else {
  			return this.container.findContainer(selector);
  		}
  	}

  	return null;
  }

  function Ractive$findComponent(selector) {
  	return this.fragment.findComponent(selector);
  }

  function sortByDocumentPosition(node, otherNode) {
  	if (node.compareDocumentPosition) {
  		var bitmask = node.compareDocumentPosition(otherNode);
  		return bitmask & 2 ? 1 : -1;
  	}

  	// In old IE, we can piggy back on the mechanism for
  	// comparing component positions
  	return sortByItemPosition(node, otherNode);
  }

  function sortByItemPosition(a, b) {
  	var ancestryA = getAncestry(a.component || a._ractive.proxy);
  	var ancestryB = getAncestry(b.component || b._ractive.proxy);

  	var oldestA = lastItem(ancestryA);
  	var oldestB = lastItem(ancestryB);
  	var mutualAncestor = undefined;

  	// remove items from the end of both ancestries as long as they are identical
  	// - the final one removed is the closest mutual ancestor
  	while (oldestA && oldestA === oldestB) {
  		ancestryA.pop();
  		ancestryB.pop();

  		mutualAncestor = oldestA;

  		oldestA = lastItem(ancestryA);
  		oldestB = lastItem(ancestryB);
  	}

  	// now that we have the mutual ancestor, we can find which is earliest
  	oldestA = oldestA.component || oldestA;
  	oldestB = oldestB.component || oldestB;

  	var fragmentA = oldestA.parentFragment;
  	var fragmentB = oldestB.parentFragment;

  	// if both items share a parent fragment, our job is easy
  	if (fragmentA === fragmentB) {
  		var indexA = fragmentA.items.indexOf(oldestA);
  		var indexB = fragmentB.items.indexOf(oldestB);

  		// if it's the same index, it means one contains the other,
  		// so we see which has the longest ancestry
  		return indexA - indexB || ancestryA.length - ancestryB.length;
  	}

  	// if mutual ancestor is a section, we first test to see which section
  	// fragment comes first
  	var fragments = mutualAncestor.iterations;
  	if (fragments) {
  		var indexA = fragments.indexOf(fragmentA);
  		var indexB = fragments.indexOf(fragmentB);

  		return indexA - indexB || ancestryA.length - ancestryB.length;
  	}

  	throw new Error('An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/ractivejs/ractive/issues - thanks!');
  }

  function getParent(item) {
  	var parentFragment = item.parentFragment;

  	if (parentFragment) return parentFragment.owner;

  	if (item.component && (parentFragment = item.component.parentFragment)) {
  		return parentFragment.owner;
  	}
  }

  function getAncestry(item) {
  	var ancestry = [item];
  	var ancestor = getParent(item);

  	while (ancestor) {
  		ancestry.push(ancestor);
  		ancestor = getParent(ancestor);
  	}

  	return ancestry;
  }

  var Query = (function () {
  	function Query(ractive, selector, live, isComponentQuery) {
  		classCallCheck(this, Query);

  		this.ractive = ractive;
  		this.selector = selector;
  		this.live = live;
  		this.isComponentQuery = isComponentQuery;

  		this.result = [];

  		this.dirty = true;
  	}

  	Query.prototype.add = function add(item) {
  		this.result.push(item);
  		this.makeDirty();
  	};

  	Query.prototype.cancel = function cancel() {
  		var liveQueries = this._root[this.isComponentQuery ? 'liveComponentQueries' : 'liveQueries'];
  		var selector = this.selector;

  		var index = liveQueries.indexOf(selector);

  		if (index !== -1) {
  			liveQueries.splice(index, 1);
  			liveQueries[selector] = null;
  		}
  	};

  	Query.prototype.init = function init() {
  		this.dirty = false;
  	};

  	Query.prototype.makeDirty = function makeDirty() {
  		var _this = this;

  		if (!this.dirty) {
  			this.dirty = true;

  			// Once the DOM has been updated, ensure the query
  			// is correctly ordered
  			runloop.scheduleTask(function () {
  				return _this.update();
  			});
  		}
  	};

  	Query.prototype.remove = function remove(nodeOrComponent) {
  		var index = this.result.indexOf(this.isComponentQuery ? nodeOrComponent.instance : nodeOrComponent);
  		if (index !== -1) this.result.splice(index, 1);
  	};

  	Query.prototype.update = function update() {
  		this.result.sort(this.isComponentQuery ? sortByItemPosition : sortByDocumentPosition);
  		this.dirty = false;
  	};

  	Query.prototype.test = function test(item) {
  		return this.isComponentQuery ? !this.selector || item.name === this.selector : item ? matches(item, this.selector) : null;
  	};

  	return Query;
  })();

  function Ractive$findAllComponents(selector, options) {
  	options = options || {};
  	var liveQueries = this._liveComponentQueries;

  	// Shortcut: if we're maintaining a live query with this
  	// selector, we don't need to traverse the parallel DOM
  	var query = liveQueries[selector];
  	if (query) {
  		// Either return the exact same query, or (if not live) a snapshot
  		return options && options.live ? query : query.slice();
  	}

  	query = new Query(this, selector, !!options.live, true);

  	// Add this to the list of live queries Ractive needs to maintain,
  	// if applicable
  	if (query.live) {
  		liveQueries.push(selector);
  		liveQueries['_' + selector] = query;
  	}

  	this.fragment.findAllComponents(selector, query);

  	query.init();
  	return query.result;
  }

  function Ractive$findAll(selector, options) {
  	if (!this.el) return [];

  	options = options || {};
  	var liveQueries = this._liveQueries;

  	// Shortcut: if we're maintaining a live query with this
  	// selector, we don't need to traverse the parallel DOM
  	var query = liveQueries[selector];
  	if (query) {
  		// Either return the exact same query, or (if not live) a snapshot
  		return options && options.live ? query : query.slice();
  	}

  	query = new Query(this, selector, !!options.live, false);

  	// Add this to the list of live queries Ractive needs to maintain,
  	// if applicable
  	if (query.live) {
  		liveQueries.push(selector);
  		liveQueries['_' + selector] = query;
  	}

  	this.fragment.findAll(selector, query);

  	query.init();
  	return query.result;
  }

  function Ractive$find(selector) {
  	if (!this.el) {
  		return null;
  	}

  	return this.fragment.find(selector);
  }

  var detachHook = new Hook('detach');
  function Ractive$detach() {
  	if (this.isDetached) {
  		return this.el;
  	}

  	if (this.el) {
  		removeFromArray(this.el.__ractive_instances__, this);
  	}

  	this.el = this.fragment.detach();
  	this.isDetached = true;

  	detachHook.fire(this);
  	return this.el;
  }

  // These are a subset of the easing equations found at
  // https://raw.github.com/danro/easing-js - license info
  // follows:

  // --------------------------------------------------
  // easing.js v0.5.4
  // Generic set of easing functions with AMD support
  // https://github.com/danro/easing-js
  // This code may be freely distributed under the MIT license
  // http://danro.mit-license.org/
  // --------------------------------------------------
  // All functions adapted from Thomas Fuchs & Jeremy Kahn
  // Easing Equations (c) 2003 Robert Penner, BSD license
  // https://raw.github.com/danro/easing-js/master/LICENSE
  // --------------------------------------------------

  // In that library, the functions named easeIn, easeOut, and
  // easeInOut below are named easeInCubic, easeOutCubic, and
  // (you guessed it) easeInOutCubic.
  //
  // You can add additional easing functions to this list, and they
  // will be globally available.

  var easing = {
  	linear: function (pos) {
  		return pos;
  	},
  	easeIn: function (pos) {
  		return Math.pow(pos, 3);
  	},
  	easeOut: function (pos) {
  		return Math.pow(pos - 1, 3) + 1;
  	},
  	easeInOut: function (pos) {
  		if ((pos /= 0.5) < 1) {
  			return 0.5 * Math.pow(pos, 3);
  		}
  		return 0.5 * (Math.pow(pos - 2, 3) + 2);
  	}
  };

  var noAnimation = { stop: noop };
  var linear = easing.linear;

  function getOptions(options, instance) {
  	options = options || {};

  	var easing = undefined;
  	if (options.easing) {
  		easing = typeof options.easing === 'function' ? options.easing : instance.easing[options.easing];
  	}

  	return {
  		easing: easing || linear,
  		duration: 'duration' in options ? options.duration : 400,
  		complete: options.complete || noop,
  		step: options.step || noop
  	};
  }
  function Ractive$animate(keypath, to, options) {
  	if (typeof keypath === 'object') {
  		var keys = Object.keys(keypath);

  		throw new Error('ractive.animate(...) no longer supports objects. Instead of ractive.animate({\n  ' + keys.map(function (key) {
  			return '\'' + key + '\': ' + keypath[key];
  		}).join('\n  ') + '\n}, {...}), do\n\n' + keys.map(function (key) {
  			return 'ractive.animate(\'' + key + '\', ' + keypath[key] + ', {...});';
  		}).join('\n') + '\n');
  	}

  	options = getOptions(options);

  	var model = this.viewmodel.joinAll(splitKeypath(keypath));
  	var from = model.get();

  	// don't bother animating values that stay the same
  	if (isEqual(from, to)) {
  		options.complete(options.to);
  		return noAnimation; // TODO should this have .then and .catch methods?
  	}

  	var interpolator = interpolate(from, to, this, options.interpolator);

  	// if we can't interpolate the value, set it immediately
  	if (!interpolator) {
  		runloop.start();
  		model.set(to);
  		runloop.end();

  		return noAnimation;
  	}

  	return model.animate(from, to, options, interpolator);
  }

  function Ractive$add(keypath, d) {
  	return add(this, keypath, d === undefined ? 1 : +d);
  }

  var proto$1 = {
  	add: Ractive$add,
  	animate: Ractive$animate,
  	detach: Ractive$detach,
  	find: Ractive$find,
  	findAll: Ractive$findAll,
  	findAllComponents: Ractive$findAllComponents,
  	findComponent: Ractive$findComponent,
  	findContainer: Ractive$findContainer,
  	findParent: Ractive$findParent,
  	fire: Ractive$fire,
  	get: Ractive$get,
  	insert: Ractive$insert,
  	merge: Ractive$merge,
  	observe: observe,
  	observeList: observeList,
  	observeOnce: observeOnce,
  	// TODO reinstate these
  	// observeListOnce,
  	off: Ractive$off,
  	on: Ractive$on,
  	once: Ractive$once,
  	pop: pop,
  	push: push,
  	render: Ractive$render,
  	reset: Ractive$reset,
  	resetPartial: resetPartial,
  	resetTemplate: Ractive$resetTemplate,
  	reverse: reverse,
  	set: Ractive$set,
  	shift: shift,
  	sort: sort,
  	splice: splice,
  	subtract: Ractive$subtract,
  	teardown: Ractive$teardown,
  	toggle: Ractive$toggle,
  	toHTML: Ractive$toHTML,
  	toHtml: Ractive$toHTML,
  	unrender: Ractive$unrender,
  	unshift: unshift,
  	update: Ractive$update,
  	updateModel: Ractive$updateModel
  };

  function getNodeInfo (node) {
  	if (!node || !node._ractive) return {};

  	var storage = node._ractive;

  	return {
  		ractive: storage.ractive,
  		keypath: storage.context.getKeypath(),
  		index: extend({}, storage.fragment.indexRefs),
  		key: extend({}, storage.fragment.keyRefs)
  	};
  }

  function wrap$1 (method, superMethod, force) {

  	if (force || needsSuper$1(method, superMethod)) {

  		return function () {

  			var hasSuper = ('_super' in this),
  			    _super = this._super,
  			    result;

  			this._super = superMethod;

  			result = method.apply(this, arguments);

  			if (hasSuper) {
  				this._super = _super;
  			}

  			return result;
  		};
  	} else {
  		return method;
  	}
  }

  function needsSuper$1(method, superMethod) {
  	return typeof superMethod === 'function' && /_super/.test(method);
  }

  function unwrap(Child) {
  	var options = {};

  	while (Child) {
  		addRegistries(Child, options);
  		addOtherOptions(Child, options);

  		if (Child._Parent !== Ractive) {
  			Child = Child._Parent;
  		} else {
  			Child = false;
  		}
  	}

  	return options;
  }

  function addRegistries(Child, options) {
  	registries.forEach(function (r) {
  		addRegistry(r.useDefaults ? Child.prototype : Child, options, r.name);
  	});
  }

  function addRegistry(target, options, name) {
  	var registry,
  	    keys = Object.keys(target[name]);

  	if (!keys.length) {
  		return;
  	}

  	if (!(registry = options[name])) {
  		registry = options[name] = {};
  	}

  	keys.filter(function (key) {
  		return !(key in registry);
  	}).forEach(function (key) {
  		return registry[key] = target[name][key];
  	});
  }

  function addOtherOptions(Child, options) {
  	Object.keys(Child.prototype).forEach(function (key) {
  		if (key === 'computed') {
  			return;
  		}

  		var value = Child.prototype[key];

  		if (!(key in options)) {
  			options[key] = value._method ? value._method : value;
  		}

  		// is it a wrapped function?
  		else if (typeof options[key] === 'function' && typeof value === 'function' && options[key]._method) {

  				var result = undefined,
  				    needsSuper = value._method;

  				if (needsSuper) {
  					value = value._method;
  				}

  				// rewrap bound directly to parent fn
  				result = wrap$1(options[key]._method, value);

  				if (needsSuper) {
  					result._method = result;
  				}

  				options[key] = result;
  			}
  	});
  }

  function extend$1() {
  	for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
  		options[_key] = arguments[_key];
  	}

  	if (!options.length) {
  		return extendOne(this);
  	} else {
  		return options.reduce(extendOne, this);
  	}
  }

  function extendOne(Parent) {
  	var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  	var Child, proto;

  	// if we're extending with another Ractive instance...
  	//
  	//   var Human = Ractive.extend(...), Spider = Ractive.extend(...);
  	//   var Spiderman = Human.extend( Spider );
  	//
  	// ...inherit prototype methods and default options as well
  	if (options.prototype instanceof Ractive) {
  		options = unwrap(options);
  	}

  	Child = function (options) {
  		if (!(this instanceof Child)) return new Child(options);

  		construct(this, options || {});
  		initialise(this, options || {}, {});
  	};

  	proto = create(Parent.prototype);
  	proto.constructor = Child;

  	// Static properties
  	defineProperties(Child, {
  		// alias prototype as defaults
  		defaults: { value: proto },

  		// extendable
  		extend: { value: extend$1, writable: true, configurable: true },

  		// Parent - for IE8, can't use Object.getPrototypeOf
  		_Parent: { value: Parent }
  	});

  	// extend configuration
  	config.extend(Parent, proto, options);

  	dataConfigurator.extend(Parent, proto, options);

  	if (options.computed) {
  		proto.computed = extend(create(Parent.prototype.computed), options.computed);
  	}

  	Child.prototype = proto;

  	return Child;
  }

  // Ractive.js makes liberal use of things like Array.prototype.indexOf. In
  // older browsers, these are made available via a shim - here, we do a quick
  // pre-flight check to make sure that either a) we're not in a shit browser,
  // or b) we're using a Ractive-legacy.js build
  var FUNCTION = 'function';

  if (typeof Date.now !== FUNCTION || typeof String.prototype.trim !== FUNCTION || typeof Object.keys !== FUNCTION || typeof Array.prototype.indexOf !== FUNCTION || typeof Array.prototype.forEach !== FUNCTION || typeof Array.prototype.map !== FUNCTION || typeof Array.prototype.filter !== FUNCTION || win && typeof win.addEventListener !== FUNCTION) {
  	throw new Error('It looks like you\'re attempting to use Ractive.js in an older browser. You\'ll need to use one of the \'legacy builds\' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.');
  }
  function Ractive(options) {
  	if (!(this instanceof Ractive)) return new Ractive(options);

  	construct(this, options || {});
  	initialise(this, options || {}, {});
  }

  extend(Ractive.prototype, proto$1, defaults);
  Ractive.prototype.constructor = Ractive;

  // alias prototype as `defaults`
  Ractive.defaults = Ractive.prototype;

  // static properties
  defineProperties(Ractive, {

  	// debug flag
  	DEBUG: { writable: true, value: true },
  	DEBUG_PROMISES: { writable: true, value: true },

  	// static methods:
  	extend: { value: extend$1 },
  	getNodeInfo: { value: getNodeInfo },
  	parse: { value: parse },

  	// namespaced constructors
  	Promise: { value: Promise$1 },

  	// support
  	enhance: { writable: true, value: false },
  	svg: { value: svg },
  	magic: { value: magicSupported },

  	// version
  	VERSION: { value: '0.8.0-edge' },

  	// plugins
  	adaptors: { writable: true, value: {} },
  	components: { writable: true, value: {} },
  	decorators: { writable: true, value: {} },
  	easing: { writable: true, value: easing },
  	events: { writable: true, value: {} },
  	interpolators: { writable: true, value: interpolators$1 },
  	partials: { writable: true, value: {} },
  	transitions: { writable: true, value: {} }
  });

  return Ractive;

}));