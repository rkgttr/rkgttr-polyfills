/**
 * rkgttr-polyfills
 *
 * Copyright © 2016 Erik Guittiere. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
export const ArrayFromPolyfill = (() => {
  if (!Array.from) {
    Array.from = (() => {
      let toStr = Object.prototype.toString,
        isCallable = fn =>
          typeof fn === 'function' || toStr.call(fn) === '[object Function]',
        toInteger = value => {
          let number = Number(value);
          if (isNaN(number)) {
            return 0;
          }
          if (number === 0 || !isFinite(number)) {
            return number;
          }
          return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        },
        maxSafeInteger = Math.pow(2, 53) - 1,
        toLength = value => {
          let len = toInteger(value);
          return Math.min(Math.max(len, 0), maxSafeInteger);
        };
      return function from(arrayLike) {
        let C = this, items = Object(arrayLike);
        if (arrayLike == null) {
          throw new TypeError(
            "Array.from must use an Array like object - null ou undefined can't be used"
          );
        }
        let mapFn = arguments.length > 1 ? arguments[1] : void undefined, T;
        if (typeof mapFn !== 'undefined') {
          if (!isCallable(mapFn)) {
            throw new TypeError(
              'Array.from: when used, second argument must be a function'
            );
          }
          if (arguments.length > 2) {
            T = arguments[2];
          }
        }
        let len = toLength(items.length),
          A = isCallable(C) ? Object(new C(len)) : new Array(len),
          k = 0,
          kValue;
        while (k < len) {
          kValue = items[k];
          if (mapFn) {
            A[k] = typeof T === 'undefined'
              ? mapFn(kValue, k)
              : mapFn.call(T, kValue, k);
          } else {
            A[k] = kValue;
          }
          k += 1;
        }
        A.length = len;
        return A;
      };
    })();
  }
})();

export const ArrayIncludesPolyfill = (() => {
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement) {
      'use strict';

      if (this == null) {
        throw new TypeError(
          'Array.prototype.includes called on null or undefined'
        );
      }

      var O = Object(this);
      var len = parseInt(O.length, 10) || 0;
      if (len === 0) {
        return false;
      }
      var n = parseInt(arguments[1], 10) || 0;
      var k;
      if (n >= 0) {
        k = n;
      } else {
        k = len + n;
        if (k < 0) {
          k = 0;
        }
      }
      var currentElement;
      while (k < len) {
        currentElement = O[k];
        if (
          searchElement === currentElement ||
            searchElement !== searchElement && currentElement !== currentElement
        ) {
          // NaN !== NaN
          return true;
        }
        k++;
      }
      return false;
    };
  }
})();

export const consolePolyfill = (() => {
  let method,
    noop = () => {},
    methods = [
      'assert',
      'clear',
      'count',
      'debug',
      'dir',
      'dirxml',
      'error',
      'exception',
      'group',
      'groupCollapsed',
      'groupEnd',
      'info',
      'log',
      'markTimeline',
      'profile',
      'profileEnd',
      'table',
      'time',
      'timeEnd',
      'timeStamp',
      'trace',
      'warn'
    ],
    length = methods.length,
    console = window.console = window.console || {};

  while (length--) {
    method = methods[length];
    if (!console[method]) {
      console[method] = noop;
    }
  }
})();

export const classListPolyfill = (() => {
  /*
    * classList.js: Cross-browser full element.classList implementation.
    * 1.1.20150312
    *
    * By Eli Grey, http://eligrey.com
    * License: Dedicated to the public domain.
    *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
    */
  /*global self, document, DOMException */
  /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */
  if ('document' in self) {
    // Full polyfill for browsers with no classList support
    // Including IE < Edge missing SVGElement.classList
    if (
      !('classList' in document.createElement('_')) ||
        document.createElementNS &&
          !('classList' in
            document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    ) {
      (function(view) {
        'use strict';

        if (!('Element' in view))
          return;

        var classListProp = 'classList',
          protoProp = 'prototype',
          elemCtrProto = view.Element[protoProp],
          objCtr = Object,
          // Vendors: please allow content code to instantiate DOMExceptions
          strTrim = String[protoProp].trim || function() {
              return this.replace(/^\s+|\s+$/g, '');
            },
          arrIndexOf = Array[protoProp].indexOf || function(item) {
              var i = 0, len = this.length;
              for (; i < len; i++) {
                if (i in this && this[i] === item) {
                  return i;
                }
              }
              return -1;
            },
          DOMEx = function(type, message) {
            this.name = type;
            this.code = DOMException[type];
            this.message = message;
          },
          checkTokenAndGetIndex = function(classList, token) {
            if (token === '') {
              throw new DOMEx(
                'SYNTAX_ERR',
                'An invalid or illegal string was specified'
              );
            }
            if (/\s/.test(token)) {
              throw new DOMEx(
                'INVALID_CHARACTER_ERR',
                'String contains an invalid character'
              );
            }
            return arrIndexOf.call(classList, token);
          },
          ClassList = function(elem) {
            var trimmedClasses = strTrim.call(elem.getAttribute('class') || ''),
              classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
              i = 0,
              len = classes.length;
            for (; i < len; i++) {
              this.push(classes[i]);
            }
            this._updateClassName = function() {
              elem.setAttribute('class', this.toString());
            };
          },
          classListProto = ClassList[protoProp] = [],
          classListGetter = function() {
            return new ClassList(this);
          }; // Most DOMException implementations don't allow calling DOMException's toString() // on non-DOMExceptions. Error's toString() is sufficient here.
        DOMEx[protoProp] = Error[protoProp];
        classListProto.item = function(i) {
          return this[i] || null;
        };
        classListProto.contains = function(token) {
          token += '';
          return checkTokenAndGetIndex(this, token) !== -1;
        };
        classListProto.add = function() {
          var tokens = arguments,
            i = 0,
            l = tokens.length,
            token,
            updated = false;
          do {
            token = tokens[i] + '';
            if (checkTokenAndGetIndex(this, token) === -1) {
              this.push(token);
              updated = true;
            }
          } while (++i < l);

          if (updated) {
            this._updateClassName();
          }
        };
        classListProto.remove = function() {
          var tokens = arguments,
            i = 0,
            l = tokens.length,
            token,
            updated = false,
            index;
          do {
            token = tokens[i] + '';
            index = checkTokenAndGetIndex(this, token);
            while (index !== -1) {
              this.splice(index, 1);
              updated = true;
              index = checkTokenAndGetIndex(this, token);
            }
          } while (++i < l);

          if (updated) {
            this._updateClassName();
          }
        };
        classListProto.toggle = function(token, force) {
          token += '';

          var result = this.contains(token),
            method = result
              ? force !== true && 'remove'
              : force !== false && 'add';

          if (method) {
            this[method](token);
          }

          if (force === true || force === false) {
            return force;
          } else {
            return !result;
          }
        };
        classListProto.toString = function() {
          return this.join(' ');
        };

        if (objCtr.defineProperty) {
          var classListPropDesc = {
            get: classListGetter,
            enumerable: true,
            configurable: true
          };
          try {
            objCtr.defineProperty(
              elemCtrProto,
              classListProp,
              classListPropDesc
            );
          } catch (ex) {
            // IE 8 doesn't support enumerable:true
            if (ex.number === -2146823252) {
              classListPropDesc.enumerable = false;
              objCtr.defineProperty(
                elemCtrProto,
                classListProp,
                classListPropDesc
              );
            }
          }
        } else if (objCtr[protoProp].__defineGetter__) {
          elemCtrProto.__defineGetter__(classListProp, classListGetter);
        }
      })(self);
    } else {
      // There is full or partial native classList support, so just check if we need
      // to normalize the add/remove and toggle APIs.
      (function() {
        'use strict';

        var testElement = document.createElement('_');

        testElement.classList.add(
          'c1',
          'c2'
        ); // Polyfill for IE 10/11 and Firefox <26, where classList.add and // classList.remove exist but support only one argument at a time.

        if (!testElement.classList.contains('c2')) {
          var createMethod = function(method) {
            var original = DOMTokenList.prototype[method];

            DOMTokenList.prototype[method] = function(token) {
              var i, len = arguments.length;

              for (i = 0; i < len; i++) {
                token = arguments[i];
                original.call(this, token);
              }
            };
          };
          createMethod('add');
          createMethod('remove');
        }

        testElement.classList.toggle(
          'c3',
          false
        ); // Polyfill for IE 10 and Firefox <24, where classList.toggle does not // support the second argument.

        if (testElement.classList.contains('c3')) {
          var _toggle = DOMTokenList.prototype.toggle;

          DOMTokenList.prototype.toggle = function(token, force) {
            if (1 in arguments && !this.contains(token) === !force) {
              return force;
            } else {
              return _toggle.call(this, token);
            }
          };
        }

        testElement = null;
      })();
    }
  }
})();

export const matchesPolyfill = (() => {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }
})();

export const mutationObserverPolyfill = (() => {
  /*
    * Copyright 2012 The Polymer Authors. All rights reserved.
    * Use of this source code is goverened by a BSD-style
    * license that can be found in the LICENSE file.
    */
  var registrationsTable = new WeakMap(); // We use setImmediate or postMessage for our future callback.

  var setImmediate = window.msSetImmediate; // Use post message to emulate setImmediate.

  if (!setImmediate) {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener('message', function(e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function(func) {
          func();
        });
      }
    });
    setImmediate = function(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, '*');
    };
  } // This is used to ensure that we never schedule 2 callas to setImmediate

  var isScheduled = false; // Keep track of observers that needs to be notified next time.

  var scheduledObservers = []; /**
      * Schedules |dispatchCallback| to be called in the future.
      * @param {MutationObserver} observer
      */

  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }

  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill &&
      window.ShadowDOMPolyfill.wrapIfNeeded(node) ||
      node;
  }

  function dispatchCallbacks() {
    // http://dom.spec.whatwg.org/#mutation-observers
    isScheduled = false; // Used to allow a new setImmediate call above.
    var observers = scheduledObservers;
    scheduledObservers = []; // Sort observers based on their creation UID (incremental).
    observers.sort(function(o1, o2) {
      return o1.uid_ - o2.uid_;
    });

    var anyNonEmpty = false;
    observers.forEach(function(observer) {
      // 2.1, 2.2
      var queue = observer.takeRecords(); // 2.3. Remove all transient registered observers whose observer is mo.
      removeTransientObserversFor(observer); // 2.4

      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    }); // 3.

    if (anyNonEmpty)
      dispatchCallbacks();
  }

  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      if (!registrations)
        return;
      registrations.forEach(function(registration) {
        if (registration.observer === observer)
          registration.removeTransientObservers();
      });
    });
  } /**
      * This function is used for the "For each registered observer observer (with
      * observer's options as options) in target's list of registered observers,
      * run these substeps:" and the "For each ancestor ancestor of target, and for
      * each registered observer observer (with options options) in ancestor's list
      * of registered observers, run these substeps:" part of the algorithms. The
      * |options.subtree| is checked to ensure that the callback is called
      * correctly.
      *
      * @param {Node} target
      * @param {function(MutationObserverInit):MutationRecord} callback
      */

  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);

      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options; // Only target ignores subtree.

          if (node !== target && !options.subtree)
            continue;

          var record = callback(options);
          if (record)
            registration.enqueue(record);
        }
      }
    }
  }

  var uidCounter = 0; /**
      * The class that maps to the DOM MutationObserver interface.
      * @param {Function} callback.
      * @constructor
      */

  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }

  JsMutationObserver.prototype = {
    observe: function(target, options) {
      target = wrapIfNeeded(target); // 1.1

      if (// 1.4
        // 1.3
        // 1.2
        !options.childList && !options.attributes &&
          !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }

      var registrations = registrationsTable.get(target);
      if (!registrations)
        registrationsTable.set(
          target,
          registrations = []
        ); // 2 // If target's list of registered observers already includes a registered // observer associated with the context object, replace that registered // observer's options with options.

      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      } // 3. // Otherwise, add a new registered observer to target's list of registered // observers with the context object as the observer and options as the // options, and add target to context object's list of nodes on which it // is registered.

      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }

      registration.addListeners();
    },
    disconnect: function() {
      this.nodes_.forEach(
        function(node) {
          var registrations = registrationsTable.get(node);
          for (var i = 0; i < registrations.length; i++) {
            var registration = registrations[i];
            if (registration.observer === this) {
              registration.removeListeners();
              registrations.splice(
                i,
                1
              ); // Each node can only have one registered observer associated with // this observer.
              break;
            }
          }
        },
        this
      );
      this.records_ = [];
    },
    takeRecords: function() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  }; /**
      * @param {string} type
      * @param {Node} target
      * @constructor
      */

  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }

  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  } // We keep track of the two (possibly one) records used in a single mutation.

  var currentRecord,
    recordWithOldValue; /**
      * Creates a record without |oldValue| and caches it as |currentRecord| for
      * later use.
      * @param {string} oldValue
      * @return {MutationRecord}
      */

  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  } /**
      * Gets or creates a record with |oldValue| based in the |currentRecord|
      * @param {string} oldValue
      * @return {MutationRecord}
      */

  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue)
      return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }

  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  } /**
      * @param {MutationRecord} record
      * @return {boolean} Whether the record represents a record from the current
      * mutation event.
      */

  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  } /**
      * Selects which record, if any, to replace the last record in the queue.
      * This returns |null| if no record should be replaced.
      *
      * @param {MutationRecord} lastRecord
      * @param {MutationRecord} newRecord
      * @param {MutationRecord}
      */

  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord)
      return lastRecord; // Check if the the record we are adding represents the same record. If // so, we keep the one with the oldValue in it.

    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
      return recordWithOldValue;

    return null;
  } /**
      * Class used to represent a registered observer.
      * @param {MutationObserver} observer
      * @param {Node} target
      * @param {MutationObserverInit} options
      * @constructor
      */

  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }

  Registration.prototype = {
    enqueue: function(record) {
      var records = this.observer.records_;
      var length = records.length; // There are cases where we replace the last record with the new record. // For example if the record represents the same mutation we need to use // the one with the oldValue. If we get same record (this can happen as we // walk up the tree) we ignore the new record.

      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }

      records[length] = record;
    },
    addListeners: function() {
      this.addListeners_(this.target);
    },
    addListeners_: function(node) {
      var options = this.options;
      if (options.attributes)
        node.addEventListener('DOMAttrModified', this, true);

      if (options.characterData)
        node.addEventListener('DOMCharacterDataModified', this, true);

      if (options.childList)
        node.addEventListener('DOMNodeInserted', this, true);

      if (options.childList || options.subtree)
        node.addEventListener('DOMNodeRemoved', this, true);
    },
    removeListeners: function() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function(node) {
      var options = this.options;
      if (options.attributes)
        node.removeEventListener('DOMAttrModified', this, true);

      if (options.characterData)
        node.removeEventListener('DOMCharacterDataModified', this, true);

      if (options.childList)
        node.removeEventListener('DOMNodeInserted', this, true);

      if (options.childList || options.subtree)
        node.removeEventListener('DOMNodeRemoved', this, true);
    } /**
        * Adds a transient observer on node. The transient observer gets removed
        * next time we deliver the change records.
        * @param {Node} node
        */,
    addTransientObserver: function(node) {
      // Don't add transient observers on the target itself. We already have all
      // the required listeners set up on the target.
      if (node === this.target)
        return;

      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations)
        registrationsTable.set(
          node,
          registrations = []
        ); // We know that registrations does not contain this because we already // checked if node === this.target.

      registrations.push(this);
    },
    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];

      transientObservedNodes.forEach(
        function(node) {
          // Transient observers are never added to the target.
          this.removeListeners_(node);

          var registrations = registrationsTable.get(node);
          for (var i = 0; i < registrations.length; i++) {
            if (registrations[i] === this) {
              registrations.splice(
                i,
                1
              ); // Each node can only have one registered observer associated with // this observer.
              break;
            }
          }
        },
        this
      );
    },
    handleEvent: function(e) {
      // Stop propagation since we are managing the propagation manually.
      // This means that other mutation events on the page will not work
      // correctly but that is by design.
      e.stopImmediatePropagation();

      switch (e.type) {
        case // http://dom.spec.whatwg.org/#concept-mo-queue-attributes
        'DOMAttrModified':
          var name = e.attrName;
          var namespace = e.relatedNode.namespaceURI;
          var target = e.target; // 1.

          var record = new getRecord('attributes', target);
          record.attributeName = name;
          record.attributeNamespace = namespace; // 2.

          var oldValue = e.attrChange === MutationEvent.ADDITION
            ? null
            : e.prevValue;

          forEachAncestorAndObserverEnqueueRecord(target, function(options) {
            // 3.1, 4.2
            if (!options.attributes)
              return; // 3.2, 4.3

            if (
              options.attributeFilter && options.attributeFilter.length &&
                options.attributeFilter.indexOf(name) === -1 &&
                options.attributeFilter.indexOf(namespace) === -1
            ) {
              return;
            } // 3.3, 4.4
            if (options.attributeOldValue)
              return getRecordWithOldValue(oldValue); // 3.4, 4.5

            return record;
          });

          break;

        case // http://dom.spec.whatwg.org/#concept-mo-queue-characterdata
        'DOMCharacterDataModified':
          var target = e.target; // 1.

          var record = getRecord('characterData', target); // 2.

          var oldValue = e.prevValue;

          forEachAncestorAndObserverEnqueueRecord(target, function(options) {
            // 3.1, 4.2
            if (!options.characterData)
              return; // 3.2, 4.3

            if (options.characterDataOldValue)
              return getRecordWithOldValue(oldValue); // 3.3, 4.4

            return record;
          });

          break;

        // Fall through.
        case 'DOMNodeRemoved':
          this.addTransientObserver(e.target);
        case // http://dom.spec.whatwg.org/#concept-mo-queue-childlist
        'DOMNodeInserted':
          var target = e.relatedNode;
          var changedNode = e.target;
          var addedNodes, removedNodes;
          if (e.type === 'DOMNodeInserted') {
            addedNodes = [ changedNode ];
            removedNodes = [];
          } else {
            addedNodes = [];
            removedNodes = [ changedNode ];
          }
          var previousSibling = changedNode.previousSibling;
          var nextSibling = changedNode.nextSibling; // 1.

          var record = getRecord('childList', target);
          record.addedNodes = addedNodes;
          record.removedNodes = removedNodes;
          record.previousSibling = previousSibling;
          record.nextSibling = nextSibling;

          forEachAncestorAndObserverEnqueueRecord(target, function(options) {
            // 2.1, 3.2
            if (!options.childList)
              return; // 2.2, 3.3

            return record;
          });

      }

      clearRecords();
    }
  };

  window.JsMutationObserver = JsMutationObserver;

  if (!window.MutationObserver)
    window.MutationObserver = JsMutationObserver;
})();

export const weakMapPolyfill = (() => {
  /*
    * Copyright 2012 The Polymer Authors. All rights reserved.
    * Use of this source code is governed by a BSD-style
    * license that can be found in the LICENSE file.
    */
  if (typeof WeakMap === 'undefined') {
    (function() {
      var defineProperty = Object.defineProperty;
      var counter = Date.now() % 1000000000;

      var WeakMap = function() {
        this.name = '__st' + (Math.random() * 1000000000 >>> 0) +
          (counter++ + '__');
      };

      WeakMap.prototype = {
        set: function(key, value) {
          var entry = key[this.name];
          if (entry && entry[0] === key)
            entry[1] = value;
          else
            defineProperty(key, this.name, {
              value: [ key, value ],
              writable: true
            });
          return this;
        },
        get: function(key) {
          var entry;
          return (entry = key[this.name]) && entry[0] === key
            ? entry[1]
            : undefined;
        },
        delete: function(key) {
          var entry = key[this.name];
          if (!entry)
            return false;
          var hasValue = entry[0] === key;
          entry[0] = entry[1] = undefined;
          return hasValue;
        },
        has: function(key) {
          var entry = key[this.name];
          if (!entry)
            return false;
          return entry[0] === key;
        }
      };

      window.WeakMap = WeakMap;
    })();
  }
})();
