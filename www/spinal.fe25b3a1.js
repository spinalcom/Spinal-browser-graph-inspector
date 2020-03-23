// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/node-libs-browser/node_modules/punycode/punycode.js":[function(require,module,exports) {
var global = arguments[3];
var define;
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

},{}],"../node_modules/url/util.js":[function(require,module,exports) {
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],"../node_modules/querystring-es3/decode.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict'; // If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function (qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);
  var maxKeys = 1000;

  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length; // maxKeys <= 0 means that we should not limit keys count

  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr,
        vstr,
        k,
        v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};
},{}],"../node_modules/querystring-es3/encode.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

var stringifyPrimitive = function (v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function (obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';

  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function (k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;

      if (isArray(obj[k])) {
        return map(obj[k], function (v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);
  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map(xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];

  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }

  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }

  return res;
};
},{}],"../node_modules/querystring-es3/index.js":[function(require,module,exports) {
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');
},{"./decode":"../node_modules/querystring-es3/decode.js","./encode":"../node_modules/querystring-es3/encode.js"}],"../node_modules/url/url.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"punycode":"../node_modules/node-libs-browser/node_modules/punycode/punycode.js","./util":"../node_modules/url/util.js","querystring":"../node_modules/querystring-es3/index.js"}],"../node_modules/xhr2/lib/browser.js":[function(require,module,exports) {
module.exports = XMLHttpRequest;
},{}],"../node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"../node_modules/spinal-core-connectorjs/lib/spinalcore.node.js":[function(require,module,exports) {
var global = arguments[3];
var process = require("process");
/*
* Copyright 2015 SpinalCom - www.spinalcom.com
*
* This file is part of SpinalCore.
*
* Please read all of the following terms and conditions of the Free Software
* license Agreement ("Agreement") carefully.
*
* This Agreement is a legally binding contract between the Licensee (as defined
* below) and SpinalCom that sets forth the terms and conditions that govern
* your use of the Program. By installing and/or using the Program, you agree to
* abide by all the terms and conditions stated or referenced herein.
*
* If you do not agree to abide by these terms and conditions, do not
* demonstrate your acceptance and do not install or use the Program.
*
* You should have received a copy of the license along with this file. If not,
* see <http://resources.spinalcom.com/licenses.pdf>.
*/

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Generated by CoffeeScript 2.4.1
(function () {
  // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  var BindProcess,
      Bool,
      Choice,
      ConstOrNotModel,
      ConstrainedVal,
      Directory,
      File,
      FileSystem,
      Lst,
      Model,
      Obj,
      Path,
      Pbr,
      Process,
      Ptr,
      RightSetList,
      RightsItem,
      SessionModel,
      Str,
      TiffFile,
      TypedArray,
      TypedArray_Float64,
      TypedArray_Int32,
      User,
      UserRight,
      Val,
      Vec,
      _index_current_popup,
      root,
      spinal_new_popup,
      url,
      indexOf = [].indexOf;

  url = require('url');
  root = typeof _root_obj === "undefined" ? global : window;

  if (typeof root.spinalCore !== 'undefined') {
    module.exports = root.spinalCore;
    return;
  }

  root.spinalCore = function () {
    var spinalCore =
    /*#__PURE__*/
    function () {
      function spinalCore() {
        _classCallCheck(this, spinalCore);
      }

      _createClass(spinalCore, null, [{
        key: "connect",
        value: function connect(options) {
          var auth;

          if (typeof options === 'string') {
            options = url.parse(options);
          }

          if (options.path.slice(-1)[0] !== "/") {
            options.path += "/";
          }

          FileSystem._home_dir = options.path;
          FileSystem._url = options.hostname;
          FileSystem._port = options.port;

          if (options.auth !== null) {
            auth = options.auth.split(":");
            FileSystem._userid = auth[0];

            if (auth.length > 1) {
              FileSystem._password = auth[1];
            }
          } else {
            // set default user id
            FileSystem._userid = 644;
            FileSystem._password = "";
          }

          return new FileSystem();
        } // stores a model in the file system

      }, {
        key: "store",
        value: function store(fs, model, path, callback_success, callback_error) {
          var file_name, lst;

          if (typeof callback_error === "undefined") {
            callback_error = function callback_error() {
              return console.log("Model could not be stored. You can pass a callback to handle this error.");
            };
          } // Parse path


          lst = path.split("/");
          file_name = lst.pop();

          if (lst[0] === "") {
            lst.splice(0, 1);
          }

          path = lst.join("/"); // Absolute paths are not allowed

          return fs.load_or_make_dir(FileSystem._home_dir + path, function (dir, err) {
            var file;

            if (err) {
              return callback_error();
            } else {
              file = dir.detect(function (x) {
                return x.name.get() === file_name;
              });

              if (file != null) {
                dir.remove(file);
              }

              dir.add_file(file_name, model, {
                model_type: "Model"
              });
              return callback_success();
            }
          });
        } // register models, required when ussing modules require/import

      }, {
        key: "register_models",
        value: function register_models(modelList) {
          var key, len, m, q, results, results1, value;

          if (modelList) {
            if (modelList instanceof Function) {
              // function
              spinalCore._register_models_check(modelList);
            }

            if (modelList instanceof Array) {
              // array
              results = [];

              for (q = 0, len = modelList.length; q < len; q++) {
                m = modelList[q];

                if (m instanceof Function) {
                  results.push(spinalCore._register_models_check(m)); // object
                } else {
                  results.push(void 0);
                }
              }

              return results;
            } else {
              results1 = [];

              for (key in modelList) {
                value = modelList[key];

                if (value instanceof Function) {
                  results1.push(spinalCore._register_models_check(value));
                } else {
                  results1.push(void 0);
                }
              }

              return results1;
            }
          }
        }
      }, {
        key: "_register_models_check",
        value: function _register_models_check(func) {
          if (typeof spinalCore._def[func.name] !== 'undefined' && spinalCore._def[func.name] !== func) {
            console.warn("trying to register \"".concat(func.name, "\" Model but was already defined"));
            console.warn("old =", spinalCore._def[func.name]);
            console.warn("new =", func);
          }

          return spinalCore._def[func.name] = func;
        } // loads a model from the file system

      }, {
        key: "load",
        value: function load(fs, path, callback_success, callback_error) {
          var file_name, lst;

          if (typeof callback_error === "undefined") {
            callback_error = function callback_error() {
              return console.log("Model could not be loaded. You can pass a callback to handle this error.");
            };
          } // Parse path


          lst = path.split("/");
          file_name = lst.pop();

          if (lst[0] === "") {
            lst.splice(0, 1);
          }

          path = lst.join("/"); // Absolute paths are not allowed

          return fs.load_or_make_dir(FileSystem._home_dir + path, function (current_dir, err) {
            var file;

            if (err) {
              return callback_error();
            } else {
              file = current_dir.detect(function (x) {
                return x.name.get() === file_name;
              });

              if (file != null) {
                return file.load(function (data, err) {
                  if (err) {
                    return callback_error();
                  } else {
                    return callback_success(data, err);
                  }
                });
              } else {
                return callback_error();
              }
            }
          });
        } // loads all the models of a specific type

      }, {
        key: "load_type",
        value: function load_type(fs, type, callback_success, callback_error) {
          if (typeof callback_error === "undefined") {
            callback_error = function callback_error() {
              return console.log("Model of this type could not be loaded. " + "You can pass a callback to handle this error.");
            };
          }

          return fs.load_type(type, function (data, err) {
            if (err) {
              return callback_error();
            } else {
              return callback_success(data, err);
            }
          });
        }
      }, {
        key: "load_right",
        value: function load_right(fs, ptr, callback_success, callback_error) {
          if (typeof callback_error === "undefined") {
            callback_error = function callback_error() {
              return console.log("Model Right could not be loaded." + " You can pass a callback to handle this error.");
            };
          }

          return fs.load_right(ptr, function (data, err) {
            if (err) {
              return callback_error();
            } else {
              return callback_success(data, err);
            }
          });
        }
      }, {
        key: "share_model",
        value: function share_model(fs, ptr, file_name, right_flag, targetName) {
          return fs.share_model(ptr, file_name, right_flag, targetName);
        } // "static" method: extend one object as a class, using the same 'class' concept as coffeescript

      }, {
        key: "extend",
        value: function extend(child, parent) {
          var child_name, ctor, key, value;

          for (key in parent) {
            value = parent[key];
            child[key] = value;
          }

          ctor = function ctor() {
            this.constructor = child;
          };

          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
          child.__super__ = parent.prototype;

          child.super = function () {
            var args = [];

            for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
            }

            child.__super__.constructor.apply(arguments[0], args); // using embedded javascript because the word 'super' is reserved

          };

          root = typeof global !== "undefined" && global !== null ? global : window;
          child_name = /^(function|class)\s+([\w\$]+)\s*\(/.exec(child.toString())[1];
          return root[child_name] = child;
        }
      }]);

      return spinalCore;
    }();

    ;
    spinalCore._def = {};
    spinalCore.version = "2.4.0";
    spinalCore.right_flag = {
      AD: 1,
      WR: 2,
      RD: 4
    };
    return spinalCore;
  }.call(this);

  module.exports = spinalCore; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // scalar

  root = typeof _root_obj === "undefined" ? global : window;

  root.ModelProcessManager = function () {
    var ModelProcessManager =
    /*#__PURE__*/
    function () {
      function ModelProcessManager() {
        _classCallCheck(this, ModelProcessManager);
      }

      _createClass(ModelProcessManager, null, [{
        key: "new_from_state",
        // modify state according to str. str can be the result of a previous @get_state
        value: function new_from_state(str) {
          var l, len, lst, map, mid, q, s;
          map = {};
          lst = str.split("\n");
          mid = lst.shift();

          for (q = 0, len = lst.length; q < len; q++) {
            l = lst[q];

            if (!l.length) {
              continue;
            }

            s = l.split(" ");
            map[s[0]] = {
              type: s[1],
              data: s[2],
              buff: void 0
            };
          } // fill / update this with data in map[ mid ]


          eval("var __new__ = new ".concat(map[mid].type, ";"));

          __new__._set_state(map[mid].data, map);

          return __new__;
        }
      }, {
        key: "load",
        value: function load(filename, func) {
          if (!ModelProcessManager.synchronizer) {
            ModelProcessManager._synchro = new Synchronizer();
          }

          return ModelProcessManager._synchro.load(filename, func);
        } // If v is a Model, return v. Else, return a Model of guessed right type

      }, {
        key: "conv",
        value: function conv(v) {
          if (v instanceof Model) {
            return v;
          }

          if (v instanceof Array) {
            return new Lst(v);
          }

          if (typeof v === "string") {
            return new Str(v);
          }

          if (typeof v === "number") {
            return new Val(v);
          }

          if (typeof v === "boolean") {
            return new Bool(v);
          }

          if (v instanceof Object) {
            return new Model(v);
          }

          return new Obj(v);
        } // return the type of obj

      }, {
        key: "get_object_class",
        value: function get_object_class(obj) {
          var arr;

          if (obj && obj.constructor && obj.constructor.name) {
            return obj.constructor.name;
          }

          if (obj && obj.constructor && obj.constructor.toString) {
            arr = obj.constructor.toString().match(/function\s*(\w+)/);

            if (!arr) {
              arr = obj.constructor.toString().match(/class\s*(\w+)/);
            }

            if (arr && arr.length === 2) {
              return arr[1];
            }
          }
        }
      }, {
        key: "_get_attribute_names",
        value: function _get_attribute_names(m) {
          var key, results, val;

          if (m instanceof Model) {
            return m._attribute_names;
          } else {
            results = [];

            for (key in m) {
              val = m[key];
              results.push(key);
            }

            return results;
          }
        } // create a Model using a line of get_state (using .type, .data, ...)

      }, {
        key: "_new_model_from_state",
        value: function _new_model_from_state(mid, map) {
          var info;
          info = map[mid];
          eval("info.buff = new ".concat(info.type, ";"));

          info.buff._set_state(info.data, map);

          return info.buff;
        } // say that something will need a call
        // to ModelProcessManager._sync_processes during the next round

      }, {
        key: "_need_sync_processes",
        value: function _need_sync_processes() {
          if (ModelProcessManager._timeout == null) {
            return ModelProcessManager._timeout = setTimeout(ModelProcessManager._sync_processes, 1);
          }
        } // the function that is called after a very short timeout,
        // when at least one object has been modified

      }, {
        key: "_sync_processes",
        value: function _sync_processes() {
          var id, len, model, process, processes, q, ref, ref1, ref2;
          processes = {};
          ref = ModelProcessManager._modlist;

          for (id in ref) {
            model = ref[id];
            ref1 = model._processes;

            for (q = 0, len = ref1.length; q < len; q++) {
              process = ref1[q];
              processes[process.process_id] = {
                value: process,
                force: false
              };
            }
          }

          ref2 = ModelProcessManager._n_processes;

          for (id in ref2) {
            process = ref2[id];
            processes[id] = {
              value: process,
              force: true
            };
          }

          ModelProcessManager._timeout = void 0;
          ModelProcessManager._modlist = {};
          ModelProcessManager._n_processes = {};
          ModelProcessManager._counter += 2;

          for (id in processes) {
            process = processes[id];
            ModelProcessManager._force_m = process.force;
            process.value.onchange();
          }

          return ModelProcessManager._force_m = false;
        }
      }]);

      return ModelProcessManager;
    }();

    ; // nb "change rounds" since the beginning ( * 2 to differenciate direct and indirect changes )

    ModelProcessManager._counter = 0; // changed models (current round)

    ModelProcessManager._modlist = {}; // new processes (that will need a first onchange call in "force" mode)

    ModelProcessManager._n_processes = {}; // current model id (used to create new ids)

    ModelProcessManager._cur_mid = 0; // current process id (used to create new ids)

    ModelProcessManager._cur_process_id = 0; // timer used to create a new "round"

    ModelProcessManager._timeout = void 0; // if _force_m == true, every has_been_modified function will return true

    ModelProcessManager._force_m = false; // synchronizer (link to the server that will store files)

    ModelProcessManager._synchro = void 0;
    return ModelProcessManager;
  }.call(this); // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // scalar


  root = typeof _root_obj === "undefined" ? global : window;

  root.SpinalUserManager =
  /*#__PURE__*/
  function () {
    function SpinalUserManager() {
      _classCallCheck(this, SpinalUserManager);
    }

    _createClass(SpinalUserManager, null, [{
      key: "get_user_id",
      value: function get_user_id(options, user_name, password, success_callback) {
        var error_callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var get_cmd; // Access: /get_user_id?u=<user>&p=<password>

        get_cmd = '/get_user_id?u=' + user_name + '&p=' + password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_user_id', response);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_user_id', status);
        });
      }
    }, {
      key: "get_admin_id",
      value: function get_admin_id(options, admin_name, password, success_callback) {
        var error_callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var get_cmd; // Access: /get_user_id?u=<user>&p=<password>

        get_cmd = '/get_admin_id?u=' + admin_name + '&p=' + password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_admin_id', response);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_admin_id', status);
        });
      }
    }, {
      key: "new_account",
      value: function new_account(options, user_name, password, success_callback) {
        var error_callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var get_cmd; // Access: /get_new_account?e=<user>&p=<password>&cp=<confirm_password>

        get_cmd = '/get_new_account?e=' + user_name + '&p=' + password + '&cp=' + password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_new_account', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_new_account', status);
        });
      }
    }, {
      key: "change_password",
      value: function change_password(options, user_id, password, new_password, success_callback) {
        var error_callback = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
        var get_cmd; // Access: /get_change_user_password?e=<user>&op=<old_pass>&np=<newpass>&cp=<confim_pass>

        get_cmd = '/get_change_user_password?e=' + user_id + '&op=' + password + '&np=' + new_password + '&cp=' + new_password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_change_user_password', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_change_user_password', status);
        });
      }
    }, {
      key: "delete_account",
      value: function delete_account(options, user_id, password, success_callback) {
        var error_callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var get_cmd; // Access: /get_delete_account?e=<user>&i=<id>&p=<password>

        get_cmd = '/get_delete_account?e=' + user_name + '&i=' + user_id + '&p=' + password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_delete_account', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_delete_account', status);
        });
      }
    }, {
      key: "change_password_by_admin",
      value: function change_password_by_admin(options, username, password, admin_id, admin_password, success_callback) {
        var error_callback = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
        var get_cmd; // Access: ?u=<username>&np=<newpass>&a=<admin_id>&ap=<adminPass>
        // admin == 644(root) or 168(admin)

        get_cmd = '/get_change_user_password_by_admin?u=' + username + '&np=' + password + '&a=' + admin_id + '&ap=' + admin_password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_change_user_password_by_admin', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_change_user_password_by_admin', status);
        });
      }
    }, {
      key: "delete_account_by_admin",
      value: function delete_account_by_admin(options, username, admin_id, admin_password, success_callback) {
        var error_callback = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
        var get_cmd; // Access: /get_delete_account_by_admin?u=<username>&a=<admin_id>&ap=<adminPassword>
        // admin == 644(root) or 168(admin)

        get_cmd = '/get_delete_account_by_admin?u=' + username + '&a=' + admin_id + '&ap=' + admin_password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_delete_account_by_admin', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_delete_account_by_admin', status);
        });
      }
    }, {
      key: "change_account_rights_by_admin",
      value: function change_account_rights_by_admin(options, username, right, admin_id, admin_password, success_callback) {
        var error_callback = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
        var get_cmd; // Access: ?u=<username>&ri=<rights>&a=<admin_id>&ap=<adminPass>
        // admin == 644(root) or 168(admin)

        get_cmd = '/get_change_account_rights_by_admin?u=' + username + '&ri=' + right + '&a=' + admin_id + '&ap=' + admin_password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_change_account_rights_by_admin', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_change_account_rights_by_admin', status);
        });
      }
    }, {
      key: "send_xhr",
      value: function send_xhr(options, get_cmd, success_callback, error_callback) {
        var path, xhr_object;
        path = "";

        if (typeof options === 'string') {
          options = url.parse(options);
        }

        FileSystem._url = options.hostname;
        FileSystem._port = options.port;

        if (FileSystem.CONNECTOR_TYPE === "Node" || FileSystem.is_cordova) {
          if (FileSystem._port) {
            path = "http://" + FileSystem._url + ":" + FileSystem._port + get_cmd;
          } else {
            path = "http://" + FileSystem._url + get_cmd;
          }
        } else if (FileSystem.CONNECTOR_TYPE === "Browser") {
          path = get_cmd;
        }

        xhr_object = FileSystem._my_xml_http_request();
        xhr_object.open('GET', path, true);

        xhr_object.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            return success_callback(this.responseText);
          } else if (this.readyState === 4) {
            return error_callback(this.status);
          }
        };

        return xhr_object.send();
      }
    }, {
      key: "_if_error",
      value: function _if_error(error_callback, fun, response) {
        if (error_callback !== null) {
          return error_callback(response);
        } else {
          return console.log('Error on ' + fun + ' and the error_callback was not set.');
        }
      }
    }]);

    return SpinalUserManager;
  }(); // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.


  root = typeof _root_obj === "undefined" ? global : window;

  Model =
  /*#__PURE__*/
  function () {
    function Model(attr) {
      _classCallCheck(this, Model);

      // registered attribute names (in declaration order)
      this._attribute_names = []; // id of the model

      this.model_id = ModelProcessManager._cur_mid;
      ModelProcessManager._cur_mid += 1; // synchronized processes

      this._processes = []; // parent models (depending on this)

      this._parents = []; // "date" of previous change. We start at + 2 because
      // we consider that an initialisation is a modification.

      this._date_last_modification = ModelProcessManager._counter + 2; // init

      if (attr != null) {
        this._set(attr);
      }
    }

    _createClass(Model, [{
      key: "destructor",
      value: function destructor() {} // return true if this (or a child of this) has changed since the previous synchronisation

    }, {
      key: "has_been_modified",
      value: function has_been_modified() {
        return this._date_last_modification > ModelProcessManager._counter - 2 || ModelProcessManager._force_m;
      } // return true if this has changed since previous synchronisation due to
      //  a direct modification (not from a child one)

    }, {
      key: "has_been_directly_modified",
      value: function has_been_directly_modified() {
        return this._date_last_modification > ModelProcessManager._counter - 1 || ModelProcessManager._force_m;
      } // if this has been modified during the preceding round, f will be called
      // If f is a process:
      //  process.onchange will be called each time this (or a child of this) will be modified.
      //  process.destructor will be called if this is destroyed.
      //  ...
      //  can be seen as a bind with an object
      // onchange_construction true means that onchange will be automatically called after the bind

    }, {
      key: "bind",
      value: function bind(f) {
        var onchange_construction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (f instanceof Process) {
          this._processes.push(f);

          f._models.push(this);

          if (onchange_construction) {
            ModelProcessManager._n_processes[f.process_id] = f;
            return ModelProcessManager._need_sync_processes();
          }
        } else {
          return new BindProcess(this, onchange_construction, f);
        }
      } //  ...

    }, {
      key: "unbind",
      value: function unbind(f) {
        var len, q, ref, results, v;

        if (f instanceof Process) {
          this._processes.splice(this._processes.indexOf(f), 1);

          return f._models.splice(f._models.indexOf(this), 1);
        } else {
          ref = this._processes;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            v = ref[q];

            if (v instanceof BindProcess && v.f === f) {
              results.push(this.unbind(v));
            }
          }

          return results;
        }
      } // return a copy of data in a "standard" representation (e.g. string, number, objects, ...)
      // users are encouraged to use Models as much as possible
      // (meaning that get should not be called for every manipulation),
      // adding methods for manipulation of data if necessary
      // (e.g. toggle, find, ... in Lst, Str, ...).
      // May be redefined for specific types (e.g. Str, Lst, ...)

    }, {
      key: "get",
      value: function get() {
        var len, name, q, ref, res;
        res = {};
        ref = this._attribute_names;

        for (q = 0, len = ref.length; q < len; q++) {
          name = ref[q];
          res[name] = this[name].get();
        }

        return res;
      } // modify data, using another values, or Model instances.
      // Should not be redefined (but _set should be)
      // returns true if object os modified

    }, {
      key: "set",
      value: function set(value) {
        if (this._set(value)) {
          // change internal data
          this._signal_change();

          return true;
        }

        return false;
      } // modify state according to str. str can be the result of a previous @get_state

    }, {
      key: "set_state",
      value: function set_state(str) {
        var l, len, lst, map, mid, q, s;
        map = {};
        lst = str.split("\n");
        mid = lst.shift();

        for (q = 0, len = lst.length; q < len; q++) {
          l = lst[q];

          if (!l.length) {
            continue;
          }

          s = l.split(" ");
          map[s[0]] = {
            type: s[1],
            data: s[2],
            buff: void 0
          };
        } // fill / update this with data in map[ mid ]


        map[mid].buff = this;
        return this._set_state(map[mid].data, map);
      } // return a string which describes the changes in this and children since date

    }, {
      key: "get_state",
      value: function get_state() {
        var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
        var fmm, id, obj, res; // get sub models

        fmm = {};

        this._get_flat_model_map(fmm, date);

        res = this.model_id.toString();

        if (this._date_last_modification > date) {
          for (id in fmm) {
            obj = fmm[id];
            res += "\n" + obj.model_id + " " + ModelProcessManager.get_object_class(obj) + " " + obj._get_state();
          }
        }

        return res;
      } // add attribute (p.values must contain models)
      // can be called with
      //  - name, instance of Model (two arguments)
      //  - { name_1: instance_1, name_2: instance_2, ... } (only one argument)

    }, {
      key: "add_attr",
      value: function add_attr(n, p) {
        var signal_change = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var key, results, val; // name, model

        if (p != null) {
          if (typeof p === "function") {
            return this[n] = p;
          } else {
            if (this[n] != null) {
              console.error("attribute ".concat(n, " already exists in ") + "".concat(ModelProcessManager.get_object_class(this)));
            }

            p = ModelProcessManager.conv(p);

            if (indexOf.call(p._parents, this) < 0) {
              p._parents.push(this);
            }

            this._attribute_names.push(n);

            this[n] = p;

            if (signal_change) {
              return this._signal_change();
            }
          }
        } else {
          // else, asuming { name_1: instance_1, name_2: instance_2, ... }
          results = [];

          for (key in n) {
            val = n[key];

            if (val != null) {
              results.push(this.add_attr(key, val, signal_change));
            }
          }

          return results;
        }
      } // remove attribute named name

    }, {
      key: "rem_attr",
      value: function rem_attr(name) {
        var signal_change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var c, i;
        c = this[name];

        if (c) {
          i = c._parents.indexOf(this);

          if (i >= 0) {
            c._parents.splice(i, 1);

            if (c._parents.length === 0) {
              c.destructor();
            }
          }

          delete this[name];
          i = this._attribute_names.indexOf(name);

          if (i >= 0) {
            this._attribute_names.splice(i, 1);
          }

          if (signal_change) {
            return this._signal_change();
          }
        }
      } // change attribute named n to p (use references for comparison)

    }, {
      key: "mod_attr",
      value: function mod_attr(n, p) {
        if (this[n] !== p) {
          this.rem_attr(n);
          return this.add_attr(n, p);
        }
      } // add / mod / rem attr to get the same data than o
      //  (assumed to be something like { key: val, ... })

    }, {
      key: "set_attr",
      value: function set_attr(o) {
        var k, len, q, r, results, to_rem, v; // new ones / updates

        for (k in o) {
          v = o[k];
          this.mod_attr(k, v);
        } // remove


        to_rem = function () {
          var len, q, ref, results;
          ref = this._attribute_names;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            k = ref[q];

            if (o[k] == null) {
              results.push(k);
            }
          }

          return results;
        }.call(this);

        results = [];

        for (q = 0, len = to_rem.length; q < len; q++) {
          r = to_rem[q];
          results.push(this.rem_attr(r));
        }

        return results;
      } // dimension of the object -> [] for a scalar, [ length ] for a vector,
      //  [ nb_row, nb_cols ] for a matrix...

    }, {
      key: "size",
      value: function size() {
        var for_display = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return [];
      } // dimensionnality of the object -> 0 for a scalar, 1 for a vector, ...

    }, {
      key: "dim",
      value: function dim() {
        var for_display = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return this.size(for_display).length;
      }
    }, {
      key: "equals",
      value: function equals(m) {
        var key, len, len1, q, ref, ref1, u, val, y;

        if (this === m) {
          return true;
        }

        if (m._attribute_names != null) {
          u = {};
          ref = m._attribute_names;

          for (q = 0, len = ref.length; q < len; q++) {
            key = ref[q];
            val = m[key];

            if (this[key] == null) {
              return false;
            }

            if (!this[key].equals(val)) {
              return false;
            }

            u[key] = true;
          }

          ref1 = this._attribute_names;

          for (y = 0, len1 = ref1.length; y < len1; y++) {
            key = ref1[y];

            if (u[key] == null) {
              return false;
            }
          }
        }

        return false;
      } // get first parents that checks func_to_check

    }, {
      key: "get_parents_that_check",
      value: function get_parents_that_check(func_to_check) {
        var res, visited;
        res = [];
        visited = {};

        this._get_parents_that_check_rec(res, visited, func_to_check);

        return res;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        var key, len, o, q, ref;
        o = {};
        ref = this._attribute_names;

        for (q = 0, len = ref.length; q < len; q++) {
          key = ref[q];
          o[key] = this[key].deep_copy();
        }

        eval("var __new__ = new ".concat(ModelProcessManager.get_object_class(this), ";"));

        __new__.set_attr(o);

        return __new__;
      } // returns true if change is not "cosmetic"

    }, {
      key: "real_change",
      value: function real_change() {
        var a, len, q, ref;

        if (this.has_been_directly_modified() && !this._attribute_names.length) {
          return true;
        }

        ref = this._attribute_names;

        for (q = 0, len = ref.length; q < len; q++) {
          a = ref[q];

          if (typeof this.cosmetic_attribute === "function" ? this.cosmetic_attribute(a) : void 0) {
            continue;
          }

          if (this[a].real_change()) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "cosmetic_attribute",
      value: function cosmetic_attribute(name) {
        return false;
      } // may be redefined

    }, {
      key: "_get_state",
      value: function _get_state() {
        var name, str;

        str = function () {
          var len, q, ref, results;
          ref = this._attribute_names;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            name = ref[q];
            results.push(name + ":" + this[name].model_id);
          }

          return results;
        }.call(this);

        return str.join(",");
      } // send data to server

    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        var name, obj, str;
        FileSystem.set_server_id_if_necessary(out, this);

        str = function () {
          var len, q, ref, results;
          ref = this._attribute_names;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            name = ref[q];
            obj = this[name];
            FileSystem.set_server_id_if_necessary(out, obj);
            results.push(name + ":" + obj._server_id);
          }

          return results;
        }.call(this);

        return out.mod += "C ".concat(this._server_id, " ").concat(str.join(","), " ");
      } // may be redefined.
      // by default, add attributes using keys and values (and remove old unused values)
      // must return true if data is changed

    }, {
      key: "_set",
      value: function _set(value) {
        var change, key, len, len1, q, ref, ref1, used, val, y;
        change = false; // rem

        used = {};
        ref = ModelProcessManager._get_attribute_names(value);

        for (q = 0, len = ref.length; q < len; q++) {
          key = ref[q];
          used[key] = true;
        }

        ref1 = function () {
          var len1, ref1, results, z;
          ref1 = this._attribute_names;
          results = [];

          for (z = 0, len1 = ref1.length; z < len1; z++) {
            key = ref1[z];

            if (!used[key]) {
              results.push(key);
            }
          }

          return results;
        }.call(this);

        for (y = 0, len1 = ref1.length; y < len1; y++) {
          key = ref1[y];
          change = true;
          this.rem_attr(key, false);
        } // mod / add


        for (key in value) {
          val = value[key];

          if (val != null) {
            if (this[key] != null) {
              if (this[key].constructor === val.constructor) {
                change |= this[key].set(val);
              } else {
                change = true;
                this.mod_attr(key, val, false);
              }
            } else {
              this.add_attr(key, val, false);
            }
          }
        }

        return change;
      } // called by set. change_level should not be defined by the user
      //  (it permits to != change from child of from this)

    }, {
      key: "_signal_change",
      value: function _signal_change() {
        var change_level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
        var len, p, q, ref;

        if (change_level === 2 && this._server_id != null) {
          FileSystem.signal_change(this);
        } // register this as a modified model


        ModelProcessManager._modlist[this.model_id] = this; // do the same thing for the parents

        if (this._date_last_modification <= ModelProcessManager._counter) {
          this._date_last_modification = ModelProcessManager._counter + change_level;
          ref = this._parents;

          for (q = 0, len = ref.length; q < len; q++) {
            p = ref[q];

            p._signal_change(1);
          }
        } // start if not done a timer


        return ModelProcessManager._need_sync_processes();
      } // generic definition of _set_state. ( called by _use_state )

    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        var attr, inr, k_id, len, len1, q, ref, ref1, results, spl, u, y;
        u = {}; // used attributes. Permits to know what to destroy

        if (str.length) {
          ref = str.split(",");

          for (q = 0, len = ref.length; q < len; q++) {
            spl = ref[q];
            inr = spl.split(":");
            attr = inr[0];
            k_id = inr[1];
            u[attr] = true; // if already defined in the map

            if (map[k_id].buff != null) {
              if (this[attr] == null) {
                this.add_attr(attr, map[k_id].buff);
              } else if (map[k_id].buff !== this[attr]) {
                this.mod_attr(attr, map[k_id].buff);
              } // else, if the attribute does not exist, we create if

            } else if (this[attr] == null) {
              this.add_attr(attr, ModelProcessManager._new_model_from_state(k_id, map)); // else, we already have an attribute and map has not been already explored
            } else if (!this[attr]._set_state_if_same_type(k_id, map)) {
              this.mod_attr(attr, ModelProcessManager._new_model_from_state(k_id, map));
            }
          }
        }

        ref1 = this._attribute_names;
        results = [];

        for (y = 0, len1 = ref1.length; y < len1; y++) {
          attr = ref1[y];

          if (!u[attr]) {
            results.push(this.rem_attr(attr));
          } else {
            results.push(void 0);
          }
        }

        return results;
      } // see get_parents_that_check

    }, {
      key: "_get_parents_that_check_rec",
      value: function _get_parents_that_check_rec(res, visited, func_to_check) {
        var len, p, q, ref, results;

        if (visited[this.model_id] == null) {
          visited[this.model_id] = true;

          if (func_to_check(this)) {
            return res.push(this);
          } else {
            ref = this._parents;
            results = [];

            for (q = 0, len = ref.length; q < len; q++) {
              p = ref[q];
              results.push(p._get_parents_that_check_rec(res, visited, func_to_check));
            }

            return results;
          }
        }
      } // return true if info from map[ mid ] if compatible with this.
      // If it's the case, use this information to update data

    }, {
      key: "_set_state_if_same_type",
      value: function _set_state_if_same_type(mid, map) {
        var dat;
        dat = map[mid];

        if (ModelProcessManager.get_object_class(this) === dat.type) {
          dat.buff = this;

          this._set_state(dat.data, map);

          return true;
        }

        return false;
      } // map[ id ] = obj for each objects starting from this recursively

    }, {
      key: "_get_flat_model_map",
      value: function _get_flat_model_map(map, date) {
        var len, name, obj, q, ref, results;
        map[this.model_id] = this;
        ref = this._attribute_names;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          name = ref[q];
          obj = this[name];

          if (map[obj.model_id] == null) {
            if (obj._date_last_modification > date) {
              results.push(obj._get_flat_model_map(map, date));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }

        return results;
      }
    }]);

    return Model;
  }();

  spinalCore.register_models(Model);
  root.Model = Model; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // generic object with data

  root = typeof _root_obj === "undefined" ? global : window;

  Obj =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode) {
    _inherits(Obj, _spinalCore$_def$Mode);

    function Obj(data) {
      var _this;

      _classCallCheck(this, Obj);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Obj).call(this));

      if (data != null) {
        _this._set(data);
      }

      return _this;
    }

    _createClass(Obj, [{
      key: "toString",
      value: function toString() {
        var ref;
        return (ref = this._data) != null ? ref.toString() : void 0;
      }
    }, {
      key: "equals",
      value: function equals(obj) {
        if (obj instanceof Obj) {
          return this._data === obj._data;
        }

        return this._data === obj;
      }
    }, {
      key: "get",
      value: function get() {
        return this._data;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);
        return out.mod += "C ".concat(this._server_id, " ").concat(this.toString(), " ");
      }
    }, {
      key: "_set",
      value: function _set(value) {
        if (this._data !== value) {
          this._data = value;
          return true;
        }

        return false;
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        return this._data;
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        return this.set(str);
      }
    }]);

    return Obj;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Obj);
  root.Obj = Obj; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // value choosen from a list
  // get() will give the value
  // num is the number of the choosen value in the list
  // lst contains the posible choices

  root = typeof _root_obj === "undefined" ? global : window;

  Choice =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode2) {
    _inherits(Choice, _spinalCore$_def$Mode2);

    function Choice(data) {
      var _this2;

      var initial_list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      _classCallCheck(this, Choice);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Choice).call(this)); // default

      _this2.add_attr({
        num: 0,
        lst: initial_list
      }); // init


      if (data != null) {
        _this2.num.set(data);
      }

      return _this2;
    }

    _createClass(Choice, [{
      key: "filter",
      value: function filter(obj) {
        return true;
      }
    }, {
      key: "item",
      value: function item() {
        return this._nlst()[this.num.get()];
      }
    }, {
      key: "get",
      value: function get() {
        var ref;
        return (ref = this.item()) != null ? ref.get() : void 0;
      }
    }, {
      key: "toString",
      value: function toString() {
        var ref;
        return (ref = this.item()) != null ? ref.toString() : void 0;
      }
    }, {
      key: "equals",
      value: function equals(a) {
        if (a instanceof Choice) {
          return _get(_getPrototypeOf(Choice.prototype), "equals", this).call(this, a);
        } else {
          return this._nlst()[this.num.get()].equals(a);
        }
      }
    }, {
      key: "_set",
      value: function _set(value) {
        var i, j, len, q, ref;
        ref = this._nlst();

        for (j = q = 0, len = ref.length; q < len; j = ++q) {
          i = ref[j];

          if (i.equals(value)) {
            return this.num.set(j);
          }
        }

        return this.num.set(value);
      }
    }, {
      key: "_nlst",
      value: function _nlst() {
        var l, len, q, ref, results;
        ref = this.lst;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          l = ref[q];

          if (this.filter(l)) {
            results.push(l);
          }
        }

        return results;
      }
    }]);

    return Choice;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Choice);
  root.Choice = Choice; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // false by default

  root = typeof _root_obj === "undefined" ? global : window;

  Bool =
  /*#__PURE__*/
  function (_spinalCore$_def$Obj) {
    _inherits(Bool, _spinalCore$_def$Obj);

    function Bool(data) {
      var _this3;

      _classCallCheck(this, Bool);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Bool).call(this));
      _this3._data = false; // default values

      if (data != null) {
        _this3._set(data);
      }

      return _this3;
    } // toggle true / false ( 1 / 0 )


    _createClass(Bool, [{
      key: "toggle",
      value: function toggle() {
        return this.set(!this._data);
      }
    }, {
      key: "toBoolean",
      value: function toBoolean() {
        return this._data;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new Bool(this._data);
      } // we do not take _set from Obj because we want a conversion if value is not a boolean

    }, {
      key: "_set",
      value: function _set(value) {
        var n;

        if (n instanceof Model) {
          n = value.toBoolean();
        } else if (value === "false") {
          n = false;
        } else if (value === "true") {
          n = true;
        } else {
          n = Boolean(value);
        }

        if (this._data !== n) {
          this._data = n;
          return true;
        }

        return false;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);
        return out.mod += "C ".concat(this._server_id, " ").concat(1 * Boolean(this._data), " ");
      }
    }]);

    return Bool;
  }(spinalCore._def["Obj"]);

  spinalCore.register_models(Bool);
  root.Bool = Bool; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  ConstOrNotModel =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode3) {
    _inherits(ConstOrNotModel, _spinalCore$_def$Mode3);

    function ConstOrNotModel(bool, model) {
      var _this4;

      var check_disabled = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      _classCallCheck(this, ConstOrNotModel);

      _this4 = _possibleConstructorReturn(this, _getPrototypeOf(ConstOrNotModel).call(this)); // default

      _this4.add_attr({
        bool: bool,
        model: model,
        check_disabled: check_disabled
      });

      return _this4;
    }

    _createClass(ConstOrNotModel, [{
      key: "get",
      value: function get() {
        var ref;
        return (ref = this.model) != null ? ref.get() : void 0;
      }
    }, {
      key: "set",
      value: function set(value) {
        var ref;
        return (ref = this.model) != null ? ref.set(value) : void 0;
      }
    }, {
      key: "toString",
      value: function toString() {
        var ref;
        return (ref = this.model) != null ? ref.toString() : void 0;
      }
    }]);

    return ConstOrNotModel;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(ConstOrNotModel);
  root.ConstOrNotModel = ConstOrNotModel; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // scalar

  root = typeof _root_obj === "undefined" ? global : window;

  ConstrainedVal =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode4) {
    _inherits(ConstrainedVal, _spinalCore$_def$Mode4);

    function ConstrainedVal(value) {
      var _this5;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, ConstrainedVal);

      _this5 = _possibleConstructorReturn(this, _getPrototypeOf(ConstrainedVal).call(this));

      _this5.add_attr({
        val: value || 0,
        _min: params.min != null ? params.min : 0,
        _max: params.max != null ? params.max : 100
      });

      _this5.add_attr({
        _div: params.div != null ? params.div : _this5._max - _this5._min
      });

      return _this5;
    }

    _createClass(ConstrainedVal, [{
      key: "get",
      value: function get() {
        return this.val.get();
      }
    }, {
      key: "ratio",
      value: function ratio() {
        return (this.val.get() - this._min.get()) / this.delta();
      }
    }, {
      key: "delta",
      value: function delta() {
        return this._max.get() - this._min.get();
      }
    }, {
      key: "set_params",
      value: function set_params(params) {
        this._min.set(params.min != null ? params.min : 0);

        this._max.set(params.max != null ? params.max : 100);

        return this._div.set(params.div != null ? params.div : this._max - this._min);
      }
    }, {
      key: "_set",
      value: function _set(value) {
        var res;

        if (value instanceof ConstrainedVal) {
          return this.val._set(value.get());
        }

        res = this.val.set(value);

        this._check_val();

        return res;
      }
    }, {
      key: "_check_val",
      value: function _check_val() {
        var d, m, n, r, s, v;
        v = this.val.get();
        m = this._min.get();
        n = this._max.get();
        d = this._div.get();

        if (v < m) {
          this.val.set(m);
        }

        if (v > n) {
          this.val.set(n);
        }

        if (d) {
          s = (n - m) / d;
          r = m + Math.round((this.val.get() - m) / s) * s;
          return this.val.set(r);
        }
      }
    }]);

    return ConstrainedVal;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(ConstrainedVal);
  root.ConstrainedVal = ConstrainedVal; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // vector of objects inherited from Model

  root = typeof _root_obj === "undefined" ? global : window;

  Lst =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode5) {
    _inherits(Lst, _spinalCore$_def$Mode5);

    function Lst(data) {
      var _this6;

      _classCallCheck(this, Lst);

      var d, i, q, ref, s;
      _this6 = _possibleConstructorReturn(this, _getPrototypeOf(Lst).call(this)); // default

      _this6.length = 0; // static length case

      s = _this6.static_length();

      if (s >= 0) {
        d = _this6.default_value();

        for (i = q = 0, ref = s; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          _this6.push(d, true);
        }
      } // init


      if (data != null) {
        _this6._set(data);
      }

      return _this6;
    } // if static_length < 0, length is dynamic (push, pop, ... are allowed)
    // else, length = static_length
    // may be redefined


    _createClass(Lst, [{
      key: "static_length",
      value: function static_length() {
        return -1;
      } // used for initialisation of for resize
      // may be redefined

    }, {
      key: "default_value",
      value: function default_value() {
        return 0;
      } // if base_type is defined, all values must be of this type

    }, {
      key: "base_type",
      value: function base_type() {
        return void 0;
      }
    }, {
      key: "get",
      value: function get() {
        var i, len, q, ref, results;
        ref = this;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];
          results.push(i.get());
        }

        return results;
      } // tensorial size (see models)

    }, {
      key: "size",
      value: function size() {
        return [length];
      }
    }, {
      key: "toString",
      value: function toString() {
        var l, x;

        if (this.length) {
          l = function () {
            var len, q, ref, results;
            ref = this;
            results = [];

            for (q = 0, len = ref.length; q < len; q++) {
              x = ref[q];
              results.push(x.toString());
            }

            return results;
          }.call(this);

          return l.join();
        } else {
          return "";
        }
      }
    }, {
      key: "equals",
      value: function equals(lst) {
        var i, q, ref;

        if (this.length !== lst.length) {
          return false;
        }

        for (i = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          if (!this[i].equals(lst[i])) {
            return false;
          }
        }

        return true;
      } // append value at the end of the list

    }, {
      key: "push",
      value: function push(value) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var b;

        if (this._static_size_check(force)) {
          return;
        }

        b = this.base_type();

        if (b != null) {
          if (!(value instanceof b)) {
            value = new b(value);
          }
        } else {
          value = ModelProcessManager.conv(value);
        }

        if (indexOf.call(value._parents, this) < 0) {
          value._parents.push(this);
        }

        this[this.length] = value;
        this.length += 1;
        return this._signal_change();
      } // remove and return the last element

    }, {
      key: "pop",
      value: function pop() {
        var old;

        if (this._static_size_check(false)) {
          return;
        }

        if (this.length <= 0) {
          return;
        }

        this.length -= 1;
        old = this[this.length];
        this.rem_attr(this.length);
        return old;
      }
    }, {
      key: "clear",
      value: function clear() {
        var results;
        results = [];

        while (this.length) {
          results.push(this.pop());
        }

        return results;
      } // add an element to the beginning of an array, return the new length

    }, {
      key: "unshift",
      value: function unshift(element) {
        var b, i, q, ref;

        if (this._static_size_check(false)) {
          return;
        }

        b = this.base_type();

        if (b != null) {
          if (!(element instanceof b)) {
            element = new b(element);
          }
        } else {
          element = ModelProcessManager.conv(element);
        }

        if (indexOf.call(element._parents, this) < 0) {
          element._parents.push(this);
        }

        if (this.length) {
          for (i = q = ref = this.length - 1; ref <= 0 ? q <= 0 : q >= 0; i = ref <= 0 ? ++q : --q) {
            this[i + 1] = this[i];
          }
        }

        this[0] = element;
        this.length += 1;

        this._signal_change();

        return this.length;
      } // remove and return the first element

    }, {
      key: "shift",
      value: function shift() {
        var r;
        r = this[0];
        this.splice(0, 1);
        return r;
      } // remove item from the list id present

    }, {
      key: "remove",
      value: function remove(item) {
        var i;
        i = this.indexOf(item);

        if (i >= 0) {
          return this.splice(i, 1);
        }
      } // remove item from the list id present, based on ref comparison

    }, {
      key: "remove_ref",
      value: function remove_ref(item) {
        var i;
        i = this.indexOf_ref(item);

        if (i >= 0) {
          return this.splice(i, 1);
        }
      } // return a list with item such as f( item ) is true

    }, {
      key: "filter",
      value: function filter(f) {
        var i, len, q, ref, results;
        ref = this;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];

          if (f(i)) {
            results.push(i);
          }
        }

        return results;
      } // return the first item such as f( item ) is true. If not item, return undefined

    }, {
      key: "detect",
      value: function detect(f) {
        var i, len, q, ref;
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];

          if (f(i)) {
            return i;
          }
        }

        return void 0;
      } // sort item depending function and return a new Array

    }, {
      key: "sorted",
      value: function sorted(fun_sort) {
        var it, len, new_array, q, ref; // lst to array

        new_array = new Array();
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          it = ref[q];
          new_array.push(it);
        } //sort array


        new_array.sort(fun_sort);
        return new_array;
      } // return true if there is an item that checks f( item )

    }, {
      key: "has",
      value: function has(f) {
        var i, len, q, ref;
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];

          if (f(i)) {
            return true;
          }
        }

        return false;
      } // returns index of v if v is present in the list. Else, return -1

    }, {
      key: "indexOf",
      value: function indexOf(v) {
        var i, q, ref;

        for (i = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          if (this[i].equals(v)) {
            return i;
          }
        }

        return -1;
      } // returns index of v if v is present in the list, based on ref comparison. Else, return -1

    }, {
      key: "indexOf_ref",
      value: function indexOf_ref(v) {
        var i, q, ref;

        for (i = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          if (this[i] === v) {
            return i;
          }
        }

        return -1;
      }
    }, {
      key: "contains",
      value: function contains(v) {
        return this.indexOf(v) >= 0;
      }
    }, {
      key: "contains_ref",
      value: function contains_ref(v) {
        return this.indexOf_ref(v) >= 0;
      } // toggle presence of v. return true if added

    }, {
      key: "toggle",
      value: function toggle(v) {
        var i;
        i = this.indexOf(v);

        if (i >= 0) {
          this.splice(i);
          return false;
        } else {
          this.push(v);
          return true;
        }
      } // toggle presence of v, base on ref comparison

    }, {
      key: "toggle_ref",
      value: function toggle_ref(v) {
        var i;
        i = this.indexOf_ref(v);

        if (i >= 0) {
          this.splice(i);
          return false;
        } else {
          this.push(v);
          return true;
        }
      } //return a new lst between begin and end index

    }, {
      key: "slice",
      value: function slice(begin) {
        var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.length;
        var i, q, ref, ref1, tab;

        if (begin < 0) {
          begin = 0;
        }

        if (end > this.length) {
          end = this.length;
        }

        tab = new Lst();

        for (i = q = ref = begin, ref1 = end; ref <= ref1 ? q < ref1 : q > ref1; i = ref <= ref1 ? ++q : --q) {
          tab.push(this[i].get());
        }

        return tab;
      } //return list with new_tab after

    }, {
      key: "concat",
      value: function concat(new_tab) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var el, len, q;

        if (this._static_size_check(force)) {
          return;
        }

        if (new_tab.length) {
          for (q = 0, len = new_tab.length; q < len; q++) {
            el = new_tab[q];
            this.push(el);
          }

          return this;
        }
      } // remove n items from index

    }, {
      key: "splice",
      value: function splice(index) {
        var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var i, q, ref, ref1, ref2, ref3, ref4, ref5, y, z;

        if (this._static_size_check(false)) {
          return;
        }

        for (i = q = ref = index, ref1 = Math.min(index + n, this.length); ref <= ref1 ? q < ref1 : q > ref1; i = ref <= ref1 ? ++q : --q) {
          this.rem_attr(i);
        }

        for (i = y = ref2 = index, ref3 = this.length - n; ref2 <= ref3 ? y < ref3 : y > ref3; i = ref2 <= ref3 ? ++y : --y) {
          this[i] = this[i + n];
        }

        for (i = z = ref4 = this.length - n, ref5 = this.length; ref4 <= ref5 ? z < ref5 : z > ref5; i = ref4 <= ref5 ? ++z : --z) {
          delete this[i];
        }

        this.length -= n;
        return this._signal_change();
      } // remove n items before index

    }, {
      key: "insert",
      value: function insert(index, list) {
        var i, l, len, len1, o, q, results, y;

        if (list.length) {
          l = Math.max(this.length - index, 0);

          o = function () {
            var q, ref, results;
            results = [];

            for (i = q = 0, ref = l; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
              results.push(this.pop());
            }

            return results;
          }.call(this);

          o.reverse();

          for (q = 0, len = list.length; q < len; q++) {
            l = list[q];
            this.push(l);
          }

          results = [];

          for (y = 0, len1 = o.length; y < len1; y++) {
            l = o[y];
            results.push(this.push(l));
          }

          return results;
        }
      } // permits to set an item or to grow the list if index == @length

    }, {
      key: "set_or_push",
      value: function set_or_push(index, val) {
        if (index < this.length) {
          return this.mod_attr(index, val);
        } else if (index === this.length) {
          return this.push(val);
        }
      } // permits to reduce the size (resize is allowed only if we known how to create new items)

    }, {
      key: "trim",
      value: function trim(size) {
        var results;
        results = [];

        while (this.length > size) {
          results.push(this.pop());
        }

        return results;
      } // return a string with representation of items, separated by sep

    }, {
      key: "join",
      value: function join(sep) {
        return this.get().join(sep);
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        var i, q, ref, res;
        res = new Lst();

        for (i = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          res.push(this[i].deep_copy());
        }

        return res;
      } // last element

    }, {
      key: "back",
      value: function back() {
        return this[this.length - 1];
      } // returns true if change is not "cosmetic"

    }, {
      key: "real_change",
      value: function real_change() {
        var a, len, q, ref;

        if (this.has_been_directly_modified()) {
          return true;
        }

        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          a = ref[q];

          if (a.real_change()) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "_set",
      value: function _set(value) {
        var change, p, q, ref, s;
        change = this.length !== value.length;
        s = this.static_length();

        if (s >= 0 && change) {
          console.error("resizing a static array (type " + "".concat(ModelProcessManager.get_object_class(this), ") is forbidden"));
        }

        for (p = q = 0, ref = value.length; 0 <= ref ? q < ref : q > ref; p = 0 <= ref ? ++q : --q) {
          if (p < this.length) {
            change |= this[p].set(value[p]);
          } else if (s < 0) {
            this.push(value[p]);
          }
        }

        if (s < 0) {
          while (this.length > value.length) {
            this.pop();
          }

          this.length = value.length;
        }

        return change;
      }
    }, {
      key: "_get_flat_model_map",
      value: function _get_flat_model_map(map, date) {
        var len, obj, q, ref, results;
        map[this.model_id] = this;
        ref = this;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          obj = ref[q];

          if (map[obj.model_id] == null) {
            if (obj._date_last_modification > date) {
              results.push(obj._get_flat_model_map(map, date));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }

        return results;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        var obj, str;
        FileSystem.set_server_id_if_necessary(out, this);

        str = function () {
          var len, q, ref, results;
          ref = this;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            obj = ref[q];
            FileSystem.set_server_id_if_necessary(out, obj);
            results.push(obj._server_id);
          }

          return results;
        }.call(this);

        return out.mod += "C ".concat(this._server_id, " ").concat(str.join(","), " ");
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        var obj, str;

        str = function () {
          var len, q, ref, results;
          ref = this;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            obj = ref[q];
            results.push(obj.model_id);
          }

          return results;
        }.call(this);

        return str.join(",");
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        var attr, k_id, l_id, q, ref, ref1, ref2, results, y;
        l_id = str.split(",").filter(function (x) {
          return x.length;
        });

        while (this.length > l_id.length) {
          this.pop();
        }

        for (attr = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; attr = 0 <= ref ? ++q : --q) {
          k_id = l_id[attr]; //             if not map[ k_id ]?
          //                 console.log map, k_id

          if (map[k_id].buff != null) {
            if (map[k_id].buff !== this[attr]) {
              this.mod_attr(attr, map[k_id].buff);
            }
          } else if (!this[attr]._set_state_if_same_type(k_id, map)) {
            this.mod_attr(attr, ModelProcessManager._new_model_from_state(k_id, map));
          }
        }

        results = [];

        for (attr = y = ref1 = this.length, ref2 = l_id.length; ref1 <= ref2 ? y < ref2 : y > ref2; attr = ref1 <= ref2 ? ++y : --y) {
          k_id = l_id[attr];

          if (map[k_id].buff != null) {
            results.push(this.push(map[k_id].buff));
          } else {
            results.push(this.push(ModelProcessManager._new_model_from_state(k_id, map)));
          }
        }

        return results;
      }
    }, {
      key: "_static_size_check",
      value: function _static_size_check(force) {
        if (this.static_length() >= 0 && !force) {
          console.error("resizing a static array (type " + "".concat(ModelProcessManager.get_object_class(this), ") is forbidden"));
          return true;
        }

        return false;
      }
    }]);

    return Lst;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Lst);
  root.Lst = Lst; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // scalar

  root = typeof _root_obj === "undefined" ? global : window;

  Val =
  /*#__PURE__*/
  function (_spinalCore$_def$Obj2) {
    _inherits(Val, _spinalCore$_def$Obj2);

    function Val(data) {
      var _this7;

      _classCallCheck(this, Val);

      _this7 = _possibleConstructorReturn(this, _getPrototypeOf(Val).call(this));
      _this7._data = 0; // default values

      if (data != null) {
        _this7._set(data);
      }

      return _this7;
    } // toggle true / false ( 1 / 0 )


    _createClass(Val, [{
      key: "toggle",
      value: function toggle() {
        return this.set(!this._data);
      }
    }, {
      key: "toBoolean",
      value: function toBoolean() {
        return Boolean(this._data);
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new Val(this._data);
      }
    }, {
      key: "add",
      value: function add(v) {
        if (v) {
          this._data += v;
          return this._signal_change();
        }
      } // we do not take _set from Obj because we want a conversion if value is not a number

    }, {
      key: "_set",
      value: function _set(value) {
        var n; // console.log value

        if (typeof value === "string") {
          if (value.slice(0, 2) === "0x") {
            n = parseInt(value, 16);
          } else {
            n = parseFloat(value);

            if (isNaN(n)) {
              n = parseInt(value);
            }

            if (isNaN(n)) {
              console.log("Don't know how to transform ".concat(value, " to a Val"));
            }
          }
        } else if (typeof value === "boolean") {
          n = 1 * value;
        } else if (value instanceof Val) {
          n = value._data; // assuming a number
        } else {
          n = value;
        }

        if (this._data !== n) {
          this._data = n;
          return true;
        }

        return false;
      }
    }]);

    return Val;
  }(spinalCore._def["Obj"]);

  spinalCore.register_models(Val);
  root.Val = Val; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  Vec =
  /*#__PURE__*/
  function (_spinalCore$_def$Lst) {
    _inherits(Vec, _spinalCore$_def$Lst);

    function Vec(data) {
      _classCallCheck(this, Vec);

      return _possibleConstructorReturn(this, _getPrototypeOf(Vec).call(this, data));
    }

    _createClass(Vec, [{
      key: "base_type",
      value: function base_type() {
        return Val;
      }
    }, {
      key: "_underlying_fs_type",
      value: function _underlying_fs_type() {
        return "Lst";
      }
    }]);

    return Vec;
  }(spinalCore._def["Lst"]);

  spinalCore.register_models(Vec);
  root.Vec = Vec; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // String

  root = typeof _root_obj === "undefined" ? global : window;

  Str =
  /*#__PURE__*/
  function (_spinalCore$_def$Obj3) {
    _inherits(Str, _spinalCore$_def$Obj3);

    function Str(data) {
      var _this8;

      _classCallCheck(this, Str);

      _this8 = _possibleConstructorReturn(this, _getPrototypeOf(Str).call(this)); // default value

      _this8._data = "";
      _this8.length = 0; // init if possible

      if (data != null) {
        _this8._set(data);
      }

      return _this8;
    } // toggle presence of str in this


    _createClass(Str, [{
      key: "toggle",
      value: function toggle(str) {
        var space = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : " ";
        var i, l;
        l = this._data.split(space);
        i = l.indexOf(str);

        if (i < 0) {
          l.push(str);
        } else {
          l.splice(i, 1);
        }

        return this.set(l.join(" "));
      } // true if str is contained in this

    }, {
      key: "contains",
      value: function contains(str) {
        return this._data.indexOf(str) >= 0;
      }
    }, {
      key: "equals",
      value: function equals(str) {
        return this._data === str.toString();
      }
    }, {
      key: "ends_with",
      value: function ends_with(str) {
        var l;
        l = this._data.match(str + "$");
        return (l != null ? l.length : void 0) && l[0] === str;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new Str(this._data + "");
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);
        return out.mod += "C ".concat(this._server_id, " ").concat(encodeURI(this._data), " ");
      }
    }, {
      key: "_set",
      value: function _set(value) {
        var n;

        if (value == null) {
          return this._set("");
        }

        n = value.toString();

        if (this._data !== n) {
          this._data = n;
          this.length = this._data.length;
          return true;
        }

        return false;
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        return encodeURI(this._data);
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        return this.set(decodeURIComponent(str));
      }
    }]);

    return Str;
  }(spinalCore._def["Obj"]);

  spinalCore.register_models(Str);
  root.Str = Str; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  TypedArray =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode6) {
    _inherits(TypedArray, _spinalCore$_def$Mode6);

    // size can be
    //  - a number
    //  - a list of number
    function TypedArray(size, data) {
      var _this9;

      _classCallCheck(this, TypedArray);

      var B;
      _this9 = _possibleConstructorReturn(this, _getPrototypeOf(TypedArray).call(this)); // size

      if (size == null) {
        size = [];
      }

      if (!size.length) {
        size = [size];
      }

      _this9._size = size; // data

      if (data == null) {
        B = _this9.base_type();
        data = new B(_this9.nb_items());
      }

      _this9._data = data;
      return _this9;
    }

    _createClass(TypedArray, [{
      key: "base_type",
      value: function base_type() {} // -> to be defined by children

    }, {
      key: "dim",
      value: function dim() {
        return this._size.length;
      }
    }, {
      key: "size",
      value: function size(d) {
        if (d != null) {
          return this._size[d];
        } else {
          return this._size;
        }
      }
    }, {
      key: "set_val",
      value: function set_val(index, value) {
        index = this._get_index(index);

        if (this._data[index] !== value) {
          this._data[index] = value;
          return this._signal_change();
        }
      }
    }, {
      key: "nb_items",
      value: function nb_items() {
        var i, len, q, ref, tot;
        tot = this._size[0] || 0;
        ref = this._size.slice(1);

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];
          tot *= i;
        }

        return tot;
      }
    }, {
      key: "toString",
      value: function toString() {
        var i, j, l, len, m, o, q, ref, ref1, res, s, v, y;
        m = 1;
        res = "";

        l = function () {
          var len, q, ref, results;
          ref = this._size;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            s = ref[q];
            o = m;
            m *= s;
            results.push(o);
          }

          return results;
        }.call(this);

        ref = this._data;

        for (i = q = 0, len = ref.length; q < len; i = ++q) {
          v = ref[i];
          res += v;

          for (j = y = ref1 = l.length - 1; ref1 <= 0 ? y <= 0 : y >= 0; j = ref1 <= 0 ? ++y : --y) {
            if (i % l[j] === l[j] - 1) {
              res += [" ", "\n", "\n\n"][j];
              break;
            }
          }
        }

        return res;
      }
    }, {
      key: "equals",
      value: function equals(obj) {
        var i, len, q, ref, v;

        if (obj instanceof TypedArray) {
          if (this._size.length !== obj._size.length) {
            return false;
          }

          ref = this._size;

          for (i = q = 0, len = ref.length; q < len; i = ++q) {
            v = ref[i];

            if (v !== obj._size[i]) {
              return false;
            }
          }

          return this._data === obj._data;
        }

        return this._data === obj;
      }
    }, {
      key: "get",
      value: function get(index) {
        if (index != null) {
          return this._data[this._get_index(index)];
        } else {
          return this._data;
        }
      }
    }, {
      key: "resize",
      value: function resize(new_size) {
        var B, len, n, q, s, tot;
        tot = 1;

        for (q = 0, len = new_size.length; q < len; q++) {
          s = new_size[q];
          tot *= s;
        }

        B = this.base_type();
        n = new B(tot);
        n.set(this._data);
        this._data = n;
        this._size = new_size;
        return this._signal_change();
      }
    }, {
      key: "_set",
      value: function _set(str) {
        var B;

        if (typeof str === "string") {
          // TODO optimize
          this._set_state(str, {});

          return true;
        }

        if (this._data !== str || this._size.length !== 1 || this._size[0] !== str.length) {
          B = this.base_type();
          this._data = new B(str);
          this._size = [str.length];
          return true;
        }

        return false;
      }
    }, {
      key: "_get_index",
      value: function _get_index(index) {
        var i, m, o, q, ref;

        if (index.length) {
          o = 0;
          m = 1;

          for (i = q = 0, ref = index.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
            o += m * index[i];
            m *= this._size[i];
          }

          return o;
        }

        return index;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);
        return out.mod += "C ".concat(this._server_id, " ").concat(this._get_state(), " ");
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        var d, len, len1, q, ref, ref1, res, s, y;
        res = "";
        res += this._size.length;
        ref = this._size;

        for (q = 0, len = ref.length; q < len; q++) {
          s = ref[q];
          res += "," + s;
        }

        ref1 = this._data;

        for (y = 0, len1 = ref1.length; y < len1; y++) {
          d = ref1[y];
          res += "," + d;
        }

        return res;
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        var B, l, n, q, ref, results, s, v;
        l = str.split(",");
        s = parseInt(l[0]);

        this._size = function () {
          var q, ref, results;
          results = [];

          for (v = q = 0, ref = s; 0 <= ref ? q < ref : q > ref; v = 0 <= ref ? ++q : --q) {
            results.push(parseInt(l[v + 1]));
          }

          return results;
        }();

        B = this.base_type();
        n = this.nb_items();
        this._data = new B(n);
        results = [];

        for (v = q = 0, ref = n; 0 <= ref ? q < ref : q > ref; v = 0 <= ref ? ++q : --q) {
          results.push(this._data[v] = parseFloat(l[s + 1 + v]));
        }

        return results;
      }
    }]);

    return TypedArray;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(TypedArray);
  root.TypedArray = TypedArray; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  TypedArray_Float64 =
  /*#__PURE__*/
  function (_spinalCore$_def$Type) {
    _inherits(TypedArray_Float64, _spinalCore$_def$Type);

    function TypedArray_Float64() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var data = arguments.length > 1 ? arguments[1] : undefined;

      _classCallCheck(this, TypedArray_Float64);

      return _possibleConstructorReturn(this, _getPrototypeOf(TypedArray_Float64).call(this, size, data));
    }

    _createClass(TypedArray_Float64, [{
      key: "base_type",
      value: function base_type() {
        return Float64Array;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new TypedArray_Float64(this._size, this._data);
      }
    }]);

    return TypedArray_Float64;
  }(spinalCore._def["TypedArray"]);

  spinalCore.register_models(TypedArray_Float64);
  root.TypedArray_Float64 = TypedArray_Float64; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  TypedArray_Int32 =
  /*#__PURE__*/
  function (_spinalCore$_def$Type2) {
    _inherits(TypedArray_Int32, _spinalCore$_def$Type2);

    function TypedArray_Int32() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var data = arguments.length > 1 ? arguments[1] : undefined;

      _classCallCheck(this, TypedArray_Int32);

      return _possibleConstructorReturn(this, _getPrototypeOf(TypedArray_Int32).call(this, size, data));
    }

    _createClass(TypedArray_Int32, [{
      key: "base_type",
      value: function base_type() {
        return Int32Array;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new TypedArray_Int32(this._size, this._data);
      }
    }]);

    return TypedArray_Int32;
  }(spinalCore._def["TypedArray"]);

  spinalCore.register_models(TypedArray_Int32);
  root.TypedArray_Int32 = TypedArray_Int32; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a session.

  User =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode7) {
    _inherits(User, _spinalCore$_def$Mode7);

    function User() {
      _classCallCheck(this, User);

      return _possibleConstructorReturn(this, _getPrototypeOf(User).call(this));
    }

    return User;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(User);
  root.User = User; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // data from changed object are sent if not activity since 100ms

  root = typeof _root_obj === "undefined" ? global : window;

  FileSystem = function () {
    var XMLHttpRequest_node;

    var FileSystem =
    /*#__PURE__*/
    function () {
      function FileSystem() {
        _classCallCheck(this, FileSystem);

        // default values
        this._data_to_send = ""; // -1 means that we are waiting for a session id after a first request.

        this._session_num = -2;
        this._num_inst = FileSystem._nb_insts++;
        this.make_channel_error_timer = 0; // register this in FileSystem instances

        FileSystem._insts[this._num_inst] = this; // first, we need a session id fom the server

        if (FileSystem._userid != null) {
          this.send("U ".concat(FileSystem._userid, " ").concat(FileSystem._password, " "));
        }

        this.send("S ".concat(this._num_inst, " "));
      } // load object in $path and call $callback with the corresponding model ref


      _createClass(FileSystem, [{
        key: "load",
        value: function load(path, callback) {
          FileSystem._send_chan();

          this.send("L ".concat(FileSystem._nb_callbacks, " ").concat(encodeURI(path), " "));
          FileSystem._callbacks[FileSystem._nb_callbacks] = callback;
          return FileSystem._nb_callbacks++;
        } // load all the objects of $type

      }, {
        key: "load_type",
        value: function load_type(type, callback) {
          FileSystem._send_chan();

          this.send("R 0 ".concat(type, " "));
          return FileSystem._type_callbacks.push([type, callback]);
        } // make dir if not already present in the server. Call callback
        // as in the @load proc -- when done (i.e. when loaded or created)

      }, {
        key: "load_or_make_dir",
        value: function load_or_make_dir(dir, callback) {
          var _this10 = this;

          return this.load(dir, function (res, err) {
            var lst, nir, oir, v;

            if (err) {
              if (dir === "/") {
                return callback(0, err);
              } else {
                lst = function () {
                  var len, q, ref, results;
                  ref = dir.split('/');
                  results = [];

                  for (q = 0, len = ref.length; q < len; q++) {
                    v = ref[q];

                    if (v.length) {
                      results.push(v);
                    }
                  }

                  return results;
                }();

                nir = lst.pop();
                oir = "/" + lst.join("/");
                return _this10.load_or_make_dir(oir, function (n_res, n_err) {
                  var n_dir;

                  if (n_err) {
                    return callback(0, n_err);
                  } else {
                    n_dir = new Directory();
                    n_res.add_file(nir, n_dir);
                    return callback(n_dir, n_err);
                  }
                });
              }
            } else {
              return callback(res, err);
            }
          });
        } // load an object using is pointer and call $callback with the corresponding ref

      }, {
        key: "load_ptr",
        value: function load_ptr(ptr, callback) {
          FileSystem._send_chan();

          this.send("l ".concat(FileSystem._nb_callbacks, " ").concat(ptr, " "));
          FileSystem._callbacks[FileSystem._nb_callbacks] = callback;
          return FileSystem._nb_callbacks++;
        }
      }, {
        key: "load_right",
        value: function load_right(ptr, callback) {
          FileSystem._send_chan();

          this.send("r ".concat(ptr, " ").concat(FileSystem._nb_callbacks, " "));
          FileSystem._callbacks[FileSystem._nb_callbacks] = callback;
          return FileSystem._nb_callbacks++;
        }
      }, {
        key: "share_model",
        value: function share_model(ptr, file_name, share_type, targetName) {
          FileSystem._send_chan();

          return this.send("h ".concat(ptr._server_id, " ").concat(share_type, " ").concat(encodeURI(targetName), " ").concat(encodeURI(file_name), " "));
        } // explicitly send a command

      }, {
        key: "send",
        value: function send(data) {
          this._data_to_send += data;

          if (FileSystem._timer_send == null) {
            return FileSystem._timer_send = setTimeout(FileSystem._timeout_send_func, 1);
          }
        } // send a request for a "push" channel

      }, {
        key: "make_channel",
        value: function make_channel() {
          var path, xhr_object;
          path = "";

          if (FileSystem.CONNECTOR_TYPE === "Node" || FileSystem.is_cordova) {
            if (FileSystem._port) {
              path = "http://" + FileSystem._url + ":" + FileSystem._port + FileSystem.url_com + "?s=".concat(this._session_num);
            } else {
              path = "http://" + FileSystem._url + FileSystem.url_com + "?s=".concat(this._session_num);
            }
          } else if (FileSystem.CONNECTOR_TYPE === "Browser") {
            path = FileSystem.url_com + "?s=".concat(this._session_num);
          }

          xhr_object = FileSystem._my_xml_http_request();
          xhr_object.open('GET', path, true);

          xhr_object.onreadystatechange = function () {
            var _fs, _w;

            if (this.readyState === 4 && this.status === 200) {
              _fs = FileSystem.get_inst();

              if (_fs.make_channel_error_timer !== 0) {
                _fs.onConnectionError(0);
              }

              _fs.make_channel_error_timer = 0;

              if (FileSystem._disp) {
                console.log("chan ->", this.responseText);
              }

              _w = function _w(sid, obj) {
                var _obj, c, len, mod_R, q, ref, results;

                _obj = FileSystem._create_model_by_name(obj);

                if (sid != null && _obj != null) {
                  _obj._server_id = sid;
                  FileSystem._objects[sid] = _obj;
                  ref = FileSystem._type_callbacks;
                  results = [];

                  for (q = 0, len = ref.length; q < len; q++) {
                    c = ref[q];
                    mod_R = root[c[0]] || spinalCore._def[c[0]];

                    if (_obj instanceof mod_R) {
                      results.push(c[1](_obj));
                    } else {
                      results.push(void 0);
                    }
                  }

                  return results;
                }
              };

              FileSystem._sig_server = false;
              eval(this.responseText);
              return FileSystem._sig_server = true;
            } else if (this.readyState === 4 && this.status === 0) {
              console.error("Disconnected from the server with request : ".concat(path, "."));
              _fs = FileSystem.get_inst();

              if (_fs.make_channel_error_timer === 0) {
                //first disconnect
                console.log("Trying to reconnect.");
                _fs.make_channel_error_timer = new Date();
                setTimeout(_fs.make_channel.bind(_fs), 1000);
                return _fs.onConnectionError(1);
              } else if (new Date() - _fs.make_channel_error_timer < FileSystem._timeout_reconnect) {
                // under timeout
                return setTimeout(_fs.make_channel.bind(_fs), 1000); // timeout reached
              } else {
                return _fs.onConnectionError(2);
              }
            } else if (this.readyState === 4 && this.status === 500) {
              return FileSystem.get_inst().onConnectionError(3);
            }
          };

          return xhr_object.send();
        } // default callback on make_channel error after the timeout disconnected reached
        // This method can be surcharged.
        // error_code :
        // 0 = Error resolved
        // 1 = 1st disconnection
        // 2 = disconnection timeout
        // 3 = Server went down Reinit everything
        // 4 = Server down on connection

      }, {
        key: "onConnectionError",
        value: function onConnectionError(error_code) {
          var msg;
          msg = "";

          if (error_code === 0) {
            // Error resolved
            if (FileSystem.CONNECTOR_TYPE === "Browser" || FileSystem.is_cordova) {
              FileSystem.popup.hide();
            } else {
              console.log("Reconnected to the server.");
            }
          } else if (error_code === 1) {
            // 1st disconnection
            if (FileSystem.CONNECTOR_TYPE === "Browser" || FileSystem.is_cordova) {
              msg = "Disconnected from the server, trying to reconnect...";
            } else {
              console.error("Disconnected from the server, trying to reconnect...");
            }
          } else if (error_code === 2 || error_code === 3 || error_code === 4) {
            if (FileSystem.CONNECTOR_TYPE === "Browser" || FileSystem.is_cordova) {
              msg = "Disconnected from the server, please refresh the window.";
            } else if (FileSystem.CONNECTOR_TYPE === "Node") {
              console.error("Disconnected from the server.");
              process.exit();
            } else {
              console.error("Disconnected from the server.");
            }
          }

          if (msg !== "") {
            if (FileSystem.popup === 0) {
              FileSystem.popup = new new_alert_msg({
                parent: document.getElementsByTagName("BODY")[0],
                msg: msg,
                btn: [{
                  txt: 'reload page',
                  click: window.location.reload.bind(window.location),
                  backgroundColor: '#ff5b57'
                }, {
                  txt: 'close',
                  backgroundColor: '#348fe2',
                  click: function click() {
                    return FileSystem.popup.hide();
                  }
                }]
              });
            } else {
              FileSystem.popup.show();
            }

            if (error_code === 2 || error_code === 3 || error_code === 4) {
              FileSystem.popup.show_btn();
            } else {
              FileSystem.popup.hide_btn();
            }

            return FileSystem.popup.setMsg(msg);
          }
        } // get the first running inst

      }], [{
        key: "get_inst",
        value: function get_inst() {
          var i, k, ref;
          ref = FileSystem._insts;

          for (k in ref) {
            i = ref[k];
            return i;
          }

          return new FileSystem();
        }
      }, {
        key: "set_server_id_if_necessary",
        value: function set_server_id_if_necessary(out, obj) {
          var ncl;

          if (obj._server_id == null) {
            // registering
            obj._server_id = FileSystem._get_new_tmp_server_id();
            FileSystem._tmp_objects[obj._server_id] = obj; // new object

            ncl = ModelProcessManager.get_object_class(obj);

            if (obj._underlying_fs_type != null) {
              out.mod += "T ".concat(obj._server_id, " ").concat(ncl, " ");
              ncl = obj._underlying_fs_type();
            }

            out.cre += "N ".concat(obj._server_id, " ").concat(ncl, " "); // data

            return obj._get_fs_data(out);
          }
        } // send changes of m to instances.

      }, {
        key: "signal_change",
        value: function signal_change(m) {
          if (FileSystem._sig_server) {
            FileSystem._objects_to_send[m.model_id] = m;

            if (FileSystem._timer_chan != null) {
              clearTimeout(FileSystem._timer_chan);
            }

            return FileSystem._timer_chan = setTimeout(FileSystem._timeout_chan_func, 250);
          }
        }
      }, {
        key: "_tmp_id_to_real",
        value: function _tmp_id_to_real(tmp_id, res) {
          var fs, path, ptr, tmp, xhr_object;
          tmp = FileSystem._tmp_objects[tmp_id];

          if (tmp == null) {
            console.log(tmp_id);
          }

          FileSystem._objects[res] = tmp;
          tmp._server_id = res;
          delete FileSystem._tmp_objects[tmp_id];
          ptr = FileSystem._ptr_to_update[tmp_id];

          if (ptr != null) {
            delete FileSystem._ptr_to_update[tmp_id];
            ptr.data.value = res;
          }

          if (FileSystem._files_to_upload[tmp_id] != null && tmp.file != null) {
            delete FileSystem._files_to_upload[tmp_id]; // send the file

            fs = FileSystem.get_inst();
            path = "";

            if (FileSystem.CONNECTOR_TYPE === "Node" || FileSystem.is_cordova) {
              if (FileSystem._port) {
                path = "http://" + FileSystem._url + ":" + FileSystem._port + FileSystem.url_com + "?s=".concat(fs._session_num, "&p=").concat(tmp._server_id);
              } else {
                path = "http://" + FileSystem._url + FileSystem.url_com + "?s=".concat(fs._session_num, "&p=").concat(tmp._server_id);
              }
            } else if (FileSystem.CONNECTOR_TYPE === "Browser") {
              path = FileSystem.url_com + "?s=".concat(fs._session_num, "&p=").concat(tmp._server_id);
            }

            xhr_object = FileSystem._my_xml_http_request();
            xhr_object.open('PUT', path, true);

            xhr_object.onreadystatechange = function () {
              var _w;

              if (this.readyState === 4 && this.status === 200) {
                _w = function _w(sid, obj) {
                  var _obj;

                  _obj = FileSystem._create_model_by_name(obj);

                  if (sid != null && _obj != null) {
                    _obj._server_id = sid;
                    return FileSystem._objects[sid] = _obj;
                  }
                };

                return eval(this.responseText);
              }
            };

            xhr_object.send(tmp.file);
            delete tmp.file;
          }

          return FileSystem.signal_change(FileSystem._objects[res]);
        }
      }, {
        key: "_create_model_by_name",
        value: function _create_model_by_name(name) {
          if (typeof name !== "string") {
            return name;
          }

          if (typeof spinalCore._def[name] !== 'undefined') {
            return new spinalCore._def[name]();
          }

          if (typeof root[name] === 'undefined') {
            if (FileSystem.debug === true) {
              console.warn("Got Model type \"".concat(name, "\" from hub but not registered."));
            }

            root[name] = new Function("return class ".concat(name, " extends spinalCore._def[\"Model\"] {}"))();
          }

          return new root[name]();
        }
      }, {
        key: "extend",
        value: function extend(child, parent) {
          var child_name, ctor, key, value;

          for (key in parent) {
            value = parent[key];
            child[key] = value;
          }

          ctor = function ctor() {
            this.constructor = child;
          };

          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
          child.__super__ = parent.prototype;

          child.super = function () {
            var args = [];

            for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
            }

            child.__super__.constructor.apply(arguments[0], args); // using embedded javascript because the word 'super' is reserved

          };

          root = typeof global !== "undefined" && global !== null ? global : window;
          child_name = /^(function|class)\s+([\w\$]+)\s*\(/.exec(child.toString())[1];
          return root[child_name] = child;
        }
      }, {
        key: "_get_new_tmp_server_id",
        value: function _get_new_tmp_server_id() {
          FileSystem._cur_tmp_server_id++;

          if (FileSystem._cur_tmp_server_id % 4 === 0) {
            FileSystem._cur_tmp_server_id++;
          }

          return FileSystem._cur_tmp_server_id;
        } // send changes

      }, {
        key: "_send_chan",
        value: function _send_chan() {
          var f, k, out, ref, results;
          out = FileSystem._get_chan_data();
          ref = FileSystem._insts;
          results = [];

          for (k in ref) {
            f = ref[k];
            results.push(f.send(out));
          }

          return results;
        } // timeout for at least one changed object

      }, {
        key: "_timeout_chan_func",
        value: function _timeout_chan_func() {
          FileSystem._send_chan();

          return delete FileSystem._timer_chan;
        } // get data of objects to send

      }, {
        key: "_get_chan_data",
        value: function _get_chan_data() {
          var model, n, out, ref;
          out = {
            cre: "",
            mod: ""
          };
          ref = FileSystem._objects_to_send;

          for (n in ref) {
            model = ref[n];

            model._get_fs_data(out);
          }

          FileSystem._objects_to_send = {};
          return out.cre + out.mod;
        }
      }, {
        key: "_timeout_send_func",
        value: function _timeout_send_func() {
          var f, k, out, path, ref, ref1, xhr_object; // if some model have changed, we have to send the changes now

          out = FileSystem._get_chan_data();
          ref = FileSystem._insts;

          for (k in ref) {
            f = ref[k];
            f._data_to_send += out;
          }

          ref1 = FileSystem._insts; // send data

          for (k in ref1) {
            f = ref1[k];

            if (!f._data_to_send.length) {
              continue;
            } // if we are waiting for a session id, do not send the data
            // (@responseText will contain another call to @_timeout_send with the session id)


            if (f._session_num === -1) {
              continue;
            } // for first call, do not add the session id (but say that we are waiting for one)


            if (f._session_num === -2) {
              f._session_num = -1;
            } else {
              f._data_to_send = "s ".concat(f._session_num, " ") + f._data_to_send;
            } // request


            path = "";

            if (FileSystem.CONNECTOR_TYPE === "Node" || FileSystem.is_cordova) {
              if (FileSystem._port) {
                path = "http://" + FileSystem._url + ":" + FileSystem._port + FileSystem.url_com;
              } else {
                path = "http://" + FileSystem._url + FileSystem.url_com;
              }
            } else if (FileSystem.CONNECTOR_TYPE === "Browser") {
              path = FileSystem.url_com;
            }

            xhr_object = FileSystem._my_xml_http_request();
            xhr_object.open('POST', path, true);

            xhr_object.onreadystatechange = function () {
              var _c, _w, c, len, q, results;

              if (this.readyState === 4 && this.status === 200) {
                if (FileSystem._disp) {
                  console.log("resp ->", this.responseText);
                }

                _c = []; // callbacks

                _w = function _w(sid, obj) {
                  var _obj, c, len, mod_R, q, ref2, results;

                  _obj = FileSystem._create_model_by_name(obj);

                  if (sid != null && _obj != null) {
                    _obj._server_id = sid;
                    FileSystem._objects[sid] = _obj;
                    ref2 = FileSystem._type_callbacks;
                    results = [];

                    for (q = 0, len = ref2.length; q < len; q++) {
                      c = ref2[q];
                      mod_R = root[c[0]] || spinalCore._def[c[0]];

                      if (_obj instanceof mod_R) {
                        results.push(c[1](_obj));
                      } else {
                        results.push(void 0);
                      }
                    }

                    return results;
                  }
                };

                FileSystem._sig_server = false;
                eval(this.responseText);
                FileSystem._sig_server = true;
                results = [];

                for (q = 0, len = _c.length; q < len; q++) {
                  c = _c[q];
                  results.push(FileSystem._callbacks[c[0]](FileSystem._objects[c[1]], c[2]));
                }

                return results;
              } else if (this.readyState === 4 && (this.status === 0 || this.status === 500)) {
                return FileSystem.get_inst().onConnectionError(4);
              }
            };

            if (FileSystem._disp) {
              console.log("sent ->", f._data_to_send + "E ");
            }

            xhr_object.setRequestHeader('Content-Type', 'text/plain');
            xhr_object.send(f._data_to_send + "E "); //console.log "-> ", f._data_to_send

            f._data_to_send = "";
          }

          FileSystem._objects_to_send = {};
          return delete FileSystem._timer_send;
        }
      }, {
        key: "_my_xml_http_request",
        value: function _my_xml_http_request() {
          if (FileSystem.CONNECTOR_TYPE === "Browser") {
            if (window.XMLHttpRequest) {
              return new XMLHttpRequest();
            }

            if (window.ActiveXObject) {
              return new ActiveXObject('Microsoft.XMLHTTP');
            }

            return alert('Your browser does not seem to support XMLHTTPRequest objects...');
          } else if (FileSystem.CONNECTOR_TYPE === "Node") {
            return new FileSystem._XMLHttpRequest();
          } else {
            return console.log("you must define CONNECTOR_TYPE");
          }
        }
      }]);

      return FileSystem;
    }();

    ; // when object are saved, their _server_id is assigned to a tmp value

    FileSystem.popup = 0;
    FileSystem.debug = false;
    FileSystem._cur_tmp_server_id = 0;
    FileSystem._sig_server = true; // if changes has to be sent

    FileSystem._disp = false;
    FileSystem._userid = "644";
    FileSystem._timeout_reconnect = 30000;

    if (typeof document !== "undefined") {
      FileSystem.is_cordova = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    } else {
      FileSystem.is_cordova = false;
    } //     if ( @is_cordova )
    //         // PhoneGap application
    //     else
    //         // Web page
    // TODO: Hardcoded: review this


    if (typeof global !== 'undefined') {
      XMLHttpRequest_node = require('xhr2');
      FileSystem._XMLHttpRequest = XMLHttpRequest_node;
    } // data are sent after a timeout (and are concatened before)


    FileSystem._objects_to_send = {};
    FileSystem._timer_send = void 0;
    FileSystem._timer_chan = void 0; // functions to be called after an answer

    FileSystem._nb_callbacks = 0;
    FileSystem._callbacks = {};
    FileSystem._type_callbacks = []; // list of callbacks associated to a type: [ [ "type", function ], ... ]
    // instances of FileSystem

    FileSystem._nb_insts = 0;
    FileSystem._insts = {}; // ..._server_id -> object

    FileSystem._files_to_upload = {}; // ref to Path waiting to be registered before sending data

    FileSystem._ptr_to_update = {}; // Ptr objects that need an update, associated with @_tmp_objects

    FileSystem._tmp_objects = {}; // objects waiting for a real _server_id

    FileSystem._objects = {}; // _server_id -> object
    // url and port of the server

    FileSystem._url = "127.0.0.1";
    FileSystem._port = "8888";
    FileSystem.url_com = "/sceen/_";
    FileSystem.url_upload = "/sceen/upload"; // conector type : Browser or Node

    if (typeof global !== 'undefined') {
      FileSystem.CONNECTOR_TYPE = "Node";
    } else {
      FileSystem.CONNECTOR_TYPE = "Browser";
    }

    return FileSystem;
  }.call(this);

  spinalCore.register_models(FileSystem);
  root.FileSystem = FileSystem; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // List of files
  // _underlying_fs_type is not needed ()

  root = typeof _root_obj === "undefined" ? global : window;

  Directory =
  /*#__PURE__*/
  function (_spinalCore$_def$Lst2) {
    _inherits(Directory, _spinalCore$_def$Lst2);

    function Directory() {
      _classCallCheck(this, Directory);

      return _possibleConstructorReturn(this, _getPrototypeOf(Directory).call(this));
    }

    _createClass(Directory, [{
      key: "base_type",
      value: function base_type() {
        return File;
      }
    }, {
      key: "find",
      value: function find(name) {
        var f, len, q, ref;
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          f = ref[q];

          if (f.name.equals(name)) {
            return f;
          }
        }

        return void 0;
      }
    }, {
      key: "load",
      value: function load(name, callback) {
        var f;
        f = this.find(name);

        if (f) {
          return f.load(callback);
        } else {
          return callback(void 0, "file does not exist");
        }
      }
    }, {
      key: "has",
      value: function has(name) {
        var f, len, q, ref;
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          f = ref[q];

          if (f.name.equals(name)) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "add_file",
      value: function add_file(name, obj) {
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var o, res;
        o = this.find(name);

        if (o != null) {
          return o;
        }

        res = new File(name, obj, params);
        this.push(res);
        return res;
      }
    }, {
      key: "add_tiff_file",
      value: function add_tiff_file(name, obj, tiff_obj) {
        var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var o, res;
        o = this.find(name);

        if (o != null) {
          return o;
        }

        res = new TiffFile(name, obj, tiff_obj, params);
        this.push(res);
        return res;
      }
    }, {
      key: "force_add_file",
      value: function force_add_file(name, obj) {
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var name_file, num, o, res;
        num = 0;
        name_file = name;
        o = this.find(name_file);

        if (o != null) {
          while (true) {
            name_file = name + "_" + num;
            o = this.find(name_file);

            if (o != null) {
              num += 1;
            } else {
              break;
            }
          }
        }

        res = new File(name_file, obj, params);
        this.push(res);
        return res;
      }
    }, {
      key: "get_file_info",
      value: function get_file_info(info) {
        return info.icon = "folder";
      }
    }]);

    return Directory;
  }(spinalCore._def["Lst"]);

  spinalCore.register_models(Directory);
  root.Directory = Directory; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  File =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode8) {
    _inherits(File, _spinalCore$_def$Mode8);

    function File() {
      var _this11;

      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var ptr_or_model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var info = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      _classCallCheck(this, File);

      var cp_info, key, val;
      _this11 = _possibleConstructorReturn(this, _getPrototypeOf(File).call(this));
      cp_info = {};

      for (key in info) {
        val = info[key];
        cp_info[key] = val;
      }

      if (ptr_or_model instanceof Model) {
        if (cp_info.model_type == null) {
          cp_info.model_type = ModelProcessManager.get_object_class(ptr_or_model);
        }

        if (typeof ptr_or_model.get_file_info === "function") {
          ptr_or_model.get_file_info(cp_info);
        }
      }

      _this11.add_attr({
        name: name,
        admins: new Lst(),
        users: new Lst(),
        _created_at: new Date(),
        _ptr: new Ptr(ptr_or_model),
        _info: cp_info
      });

      return _this11;
    } // -> img: "data/base64...."
    // -> icon: "toto"
    // -> model_type: "Directory"...
    // -> remaining
    // -> to_upload


    _createClass(File, [{
      key: "load",
      value: function load(callback) {
        return this._ptr.load(callback);
      }
    }]);

    return File;
  }(spinalCore._def["Model"]); //     drop: ( evt, info ) ->
  //         @handleFiles evt, info
  //         evt.returnValue = false
  //         evt.stopPropagation()
  //         evt.preventDefault()
  //         return false
  //     handleFiles: (event, info, files) ->
  //         if typeof files == "undefined" #Drag and drop
  //             event.stopPropagation()
  //             event.returnValue = false
  //             event.preventDefault()
  //             files = event.dataTransfer.files
  //         if event.dataTransfer.files.length > 0
  //             for file in files
  //                 format = file.type.indexOf "image"
  //                 if format isnt -1
  //                     pic = new ImgItem file.name
  //                     accept_child = info.item.accept_child pic
  //                     if accept_child == true
  //                         info.item.add_child pic
  //                         info.item.img_collection.push pic
  //             @sendFiles()
  // TreeView.default_types.push ( evt, info ) ->
  //     d = new Directory
  //     d.drop evt, info


  spinalCore.register_models(File);
  root.File = File; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // contains (privately on the server) a path to data on the server

  root = typeof _root_obj === "undefined" ? global : window;

  Path =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode9) {
    _inherits(Path, _spinalCore$_def$Mode9);

    // @file is optionnal. Must be a javascript File object
    function Path(file1) {
      var _this12;

      _classCallCheck(this, Path);

      var size;
      _this12 = _possibleConstructorReturn(this, _getPrototypeOf(Path).call(this));
      _this12.file = file1;
      size = _this12.file != null ? _this12.file.fileSize != null ? _this12.file.fileSize : _this12.file.size : 0;

      _this12.add_attr({
        remaining: size,
        to_upload: size
      });

      return _this12;
    }

    _createClass(Path, [{
      key: "get_file_info",
      value: function get_file_info(info) {
        info.remaining = this.remaining;
        return info.to_upload = this.to_upload;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        _get(_getPrototypeOf(Path.prototype), "_get_fs_data", this).call(this, out); // permit to send the data after the server's answer


        if (this.file != null && this._server_id & 3) {
          return FileSystem._files_to_upload[this._server_id] = this;
        }
      }
    }]);

    return Path;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Path);
  root.Path = Path; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // contains an id of a model on the server

  root = typeof _root_obj === "undefined" ? global : window;

  Ptr =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode10) {
    _inherits(Ptr, _spinalCore$_def$Mode10);

    // model may be a number (the pointer)
    function Ptr(model) {
      var _this13;

      _classCallCheck(this, Ptr);

      _this13 = _possibleConstructorReturn(this, _getPrototypeOf(Ptr).call(this));
      _this13.data = {};

      _this13._set(model);

      return _this13;
    }

    _createClass(Ptr, [{
      key: "load",
      value: function load(callback) {
        var ref;

        if (this.data.model != null) {
          return callback(this.data.model, false);
        } else {
          return (ref = FileSystem.get_inst()) != null ? ref.load_ptr(this.data.value, callback) : void 0;
        }
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);

        if (this.data.model != null) {
          FileSystem.set_server_id_if_necessary(out, this.data.model);
          out.mod += "C ".concat(this._server_id, " ").concat(this.data.model._server_id, " ");
          this.data.value = this.data.model._server_id;

          if (this.data.model._server_id & 3) {
            return FileSystem._ptr_to_update[this.data.model._server_id] = this;
          }
        } else {
          return out.mod += "C ".concat(this._server_id, " ").concat(this.data.value, " ");
        }
      }
    }, {
      key: "_set",
      value: function _set(model) {
        var res;

        if (typeof model === "number") {
          res = this.data.value !== model;
          this.data = {
            value: model
          };
          return res;
        }

        if (model instanceof Model) {
          res = this.data.value !== model._server_id;
          this.data = {
            model: model,
            value: model._server_id
          };
          return res;
        }

        return false;
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        return this._data;
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        return this.set(str);
      }
    }]);

    return Ptr;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Ptr);
  root.Ptr = Ptr; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // contains an id of a model on the server

  root = typeof _root_obj === "undefined" ? global : window;

  Pbr =
  /*#__PURE__*/
  function (_spinalCore$_def$Ptr) {
    _inherits(Pbr, _spinalCore$_def$Ptr);

    function Pbr(model) {
      _classCallCheck(this, Pbr);

      return _possibleConstructorReturn(this, _getPrototypeOf(Pbr).call(this, model));
    }

    return Pbr;
  }(spinalCore._def["Ptr"]);

  spinalCore.register_models(Pbr);
  root.Pbr = Pbr; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a RightsItem.

  RightsItem =
  /*#__PURE__*/
  function (_spinalCore$_def$Lst3) {
    _inherits(RightsItem, _spinalCore$_def$Lst3);

    function RightsItem() {
      _classCallCheck(this, RightsItem);

      return _possibleConstructorReturn(this, _getPrototypeOf(RightsItem).call(this));
    }

    return RightsItem;
  }(spinalCore._def["Lst"]);

  spinalCore.register_models(RightsItem);
  root.RightsItem = RightsItem; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a session.

  SessionModel =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode11) {
    _inherits(SessionModel, _spinalCore$_def$Mode11);

    function SessionModel() {
      _classCallCheck(this, SessionModel);

      return _possibleConstructorReturn(this, _getPrototypeOf(SessionModel).call(this));
    }

    return SessionModel;
  }(spinalCore._def["Model"]); // default
  // @add_attr
  //   id : 0                # user_id
  //   timestamp: 0          # timestamp of the last change or make_channel
  //   type: "Session type"  # type of the session e.g. HTTTP_JavaScript
  //   actif: true           # state of the session true/false


  spinalCore.register_models(SessionModel);
  root.SessionModel = SessionModel; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  TiffFile =
  /*#__PURE__*/
  function (_spinalCore$_def$File) {
    _inherits(TiffFile, _spinalCore$_def$File);

    function TiffFile() {
      var _this14;

      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var ptr_or_model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var ptr_tiff = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var info = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      _classCallCheck(this, TiffFile);

      _this14 = _possibleConstructorReturn(this, _getPrototypeOf(TiffFile).call(this, name, ptr_or_model, info));

      _this14.add_attr({
        _ptr_tiff: new Ptr(ptr_tiff),
        _has_been_converted: 0
      });

      return _this14;
    }

    _createClass(TiffFile, [{
      key: "load_tiff",
      value: function load_tiff(callback) {
        return this._ptr_tiff.load(callback);
      }
    }]);

    return TiffFile;
  }(spinalCore._def["File"]);

  spinalCore.register_models(TiffFile);
  root.TiffFile = TiffFile; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a UserRight.

  UserRight =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode12) {
    _inherits(UserRight, _spinalCore$_def$Mode12);

    function UserRight() {
      _classCallCheck(this, UserRight);

      return _possibleConstructorReturn(this, _getPrototypeOf(UserRight).call(this));
    }

    _createClass(UserRight, [{
      key: "set",
      value: function set() {
        return console.log("Set a UserRight is not allowed.");
      }
    }]);

    return UserRight;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(UserRight);
  root.UserRight = UserRight; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a RightSetList.

  RightSetList =
  /*#__PURE__*/
  function (_spinalCore$_def$Lst4) {
    _inherits(RightSetList, _spinalCore$_def$Lst4);

    function RightSetList() {
      _classCallCheck(this, RightSetList);

      return _possibleConstructorReturn(this, _getPrototypeOf(RightSetList).call(this));
    }

    return RightSetList;
  }(spinalCore._def["Lst"]);

  spinalCore.register_models(RightSetList);
  root.RightSetList = RightSetList; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // something which has to be synchronized with one or several model(s)
  // Each process has an uniquer id called "process_id"

  root = typeof _root_obj === "undefined" ? global : window;

  Process =
  /*#__PURE__*/
  function () {
    // m can be a model or a list of models
    function Process(m) {
      var onchange_construction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      _classCallCheck(this, Process);

      var i, len, q;
      this.process_id = ModelProcessManager._cur_process_id;
      ModelProcessManager._cur_process_id += 1; // what this is observing

      this._models = []; // bind

      if (m instanceof Model) {
        m.bind(this, onchange_construction);
      } else if (m.length != null) {
        for (q = 0, len = m.length; q < len; q++) {
          i = m[q];
          i.bind(this, onchange_construction);
        }
      } else if (m != null) {
        console.error("Process constructor doesn't know what to do with", m);
      }
    }

    _createClass(Process, [{
      key: "destructor",
      value: function destructor() {
        var i, len, m, q, ref, results;
        ref = this._models;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          m = ref[q];
          i = m._processes.indexOf(this);

          if (i >= 0) {
            results.push(m._processes.splice(i, 1));
          } else {
            results.push(void 0);
          }
        }

        return results;
      } // called if at least one of the corresponding models has changed in the previous round

    }, {
      key: "onchange",
      value: function onchange() {}
    }]);

    return Process;
  }(); // bind model or list of model to function or process f
  // (simply call the bind method of Model)


  root.bind = function (m, f) {
    var i, len, q, results;

    if (m instanceof Model) {
      return m.bind(f);
    } else {
      results = [];

      for (q = 0, len = m.length; q < len; q++) {
        i = m[q];
        results.push(i.bind(f));
      }

      return results;
    }
  };

  spinalCore.register_models(Process);
  root.Process = Process; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // permits to bind a function to a model
  // f is the function which has to be binded
  // onchange_construction true means that onchange will be automatically called after after the bind

  root = typeof _root_obj === "undefined" ? global : window;

  BindProcess =
  /*#__PURE__*/
  function (_spinalCore$_def$Proc) {
    _inherits(BindProcess, _spinalCore$_def$Proc);

    function BindProcess(model, onchange_construction, f1) {
      var _this15;

      _classCallCheck(this, BindProcess);

      _this15 = _possibleConstructorReturn(this, _getPrototypeOf(BindProcess).call(this, model, onchange_construction));
      _this15.f = f1;
      return _this15;
    }

    _createClass(BindProcess, [{
      key: "onchange",
      value: function onchange() {
        return this.f();
      }
    }]);

    return BindProcess;
  }(spinalCore._def["Process"]);

  spinalCore.register_models(BindProcess);
  root.BindProcess = BindProcess; // Copyright 2015 SpinalCom  www.spinalcom.com
  // This file is part of SpinalCore.
  // SpinalCore is free software: you can redistribute it and/or modify
  // it under the terms of the GNU Lesser General Public License as published by
  // the Free Software Foundation, either version 3 of the License, or
  // (at your option) any later version.
  // SpinalCore is distributed in the hope that it will be useful,
  // but WITHOUT ANY WARRANTY; without even the implied warranty of
  // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  // GNU Lesser General Public License for more details.
  // You should have received a copy of the GNU General Public License
  // along with SpinalCore. If not, see <http://www.gnu.org/licenses/>.

  root = typeof _root_obj === "undefined" ? global : window; // create a new dom element
  //  nodeName to specify kind (div by default)
  //  parentNode to specify a parent
  //  style { ... }
  //  txt for a text node as a child
  //  other paramers are used to set directly set attributes

  root.new_dom_element = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var nodeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "div";
    var k, n, name, v, val;
    n = document.createElement(params.nodeName || nodeName);

    for (name in params) {
      val = params[name];

      switch (name) {
        case "parentNode":
          val.appendChild(n);
          break;

        case "nodeName":
          void 0;
          break;

        case "style":
          for (k in val) {
            v = val[k];
            n.style[k] = v;
          }

          break;

        case "txt":
          //r = new RegExp " ", "g"
          //n.appendChild document.createTextNode val.replace r, "\u00a0"
          n.innerHTML = val;
          break;

        default:
          n[name] = val;
      }
    }

    return n;
  }; // obj is a DOM object. src is a string or an array of
  //  string containing one or several classNames separated with spaces


  root.add_class = function (obj, src) {
    var old, p_1;

    if (typeof src === "string") {
      return add_class(obj, src.split(" "));
    }

    old = (obj.className || "").split(" ");
    p_1 = src.filter(function (x) {
      return indexOf.call(old, x) < 0;
    });
    return obj.className = old.concat(p_1).filter(function (x) {
      return x;
    }).join(" ");
  }; // obj is a DOM object. src is a string or an array of string
  //  containing one or several classNames separated with spaces


  root.rem_class = function (obj, src) {
    var old;

    if (typeof src === "string") {
      return rem_class(obj, src.split(" "));
    }

    old = (obj.className || "").split(" ");
    return obj.className = old.filter(function (x) {
      return indexOf.call(src, x) < 0;
    }).join(" ");
  }; // real position of an object


  root.get_left = function (l) {
    if (l.offsetParent != null) {
      return l.offsetLeft + get_left(l.offsetParent);
    } else {
      return l.offsetLeft;
    }
  }; // real position of an object


  root.get_top = function (l) {
    if (l.offsetParent != null) {
      return l.offsetTop + get_top(l.offsetParent);
    } else {
      return l.offsetTop;
    }
  }; // make msg popup
  // params:
  //   parent
  //   onclose
  //   title
  //   msg


  root.new_alert_msg =
  /*#__PURE__*/
  function () {
    function new_alert_msg() {
      var params1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, new_alert_msg);

      this.create_footer = this.create_footer.bind(this);
      this.params = params1;
      this.rotatating = true;
      this.deg = 40;
      this.in_rotation = false;
      this.background = new_dom_element({
        nodeName: 'div',
        style: {
          position: 'fixed',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(36, 42, 48, 0.38)',
          zIndex: 100000,
          textAlign: 'center'
        },
        onclick: function onclick(evt) {
          if (evt.target !== this.background) {
            return;
          }

          if (this.params.onclose != null) {
            this.params.onClose();
          }

          this.hide();

          if (typeof evt.stopPropagation === "function") {
            evt.stopPropagation();
          }

          if (typeof evt.preventDefault === "function") {
            evt.preventDefault();
          }

          if (typeof evt.stopImmediatePropagation === "function") {
            evt.stopImmediatePropagation();
          }

          return false;
        }
      });

      if (this.params.parent != null) {
        this.params.parent.appendChild(this.background);
      }

      this.popup = new_dom_element({
        nodeName: 'div',
        style: {
          marginTop: '30px',
          display: 'inline-block',
          width: '80%',
          backgroundColor: '#FFF',
          zIndex: 100001,
          borderRadius: '30px'
        }
      });
      this.background.appendChild(this.popup); // @create_header()

      this.create_content();
      this.create_footer();
    } // @content = new_dom_element()
    // @footer = new_dom_element()


    _createClass(new_alert_msg, [{
      key: "create_header",
      value: function create_header() {
        var _this16 = this;

        this.header = new_dom_element({
          style: {
            width: '100%',
            backgroundColor: "#1a2229",
            color: '#fff'
          }
        });
        this.popup.appendChild(this.header);
        this.title = new_dom_element({
          nodeName: 'span'
        });

        if (this.params.title != null) {
          this.title.innerHTML = this.params.title;
        }

        this.title_close = new_dom_element({
          nodeName: 'span',
          innerHTML: 'x',
          style: {
            display: 'block',
            float: 'right',
            position: 'relative',
            right: '10px',
            cursor: 'pointer'
          },
          onclick: function onclick(evt) {
            if (evt.target !== _this16.title_close) {
              return;
            }

            if (_this16.params.onclose != null) {
              _this16.params.onClose();
            }

            _this16.hide();

            if (typeof evt.stopPropagation === "function") {
              evt.stopPropagation();
            }

            if (typeof evt.preventDefault === "function") {
              evt.preventDefault();
            }

            if (typeof evt.stopImmediatePropagation === "function") {
              evt.stopImmediatePropagation();
            }

            return false;
          }
        });
        this.header.appendChild(this.title);
        return this.header.appendChild(this.title_close);
      }
    }, {
      key: "create_content",
      value: function create_content() {
        this.content = new_dom_element({
          style: {
            width: '100%',
            // backgroundColor: "#FFF"
            color: '#000',
            position: 'relative',
            padding: '15px',
            fontSize: 'xx-large'
          }
        });
        this.popup.appendChild(this.content);
        this.img = new_dom_element({
          nodeName: 'img',
          src: "data:image/gif;base64,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",
          style: {
            height: '35px',
            marginRight: '20px'
          }
        });

        this._loop_spinner_();

        this.content.appendChild(this.img);
        this.msg = new_dom_element({
          nodeName: 'span'
        }); // backgroundColor: "#FFF"
        // color: '#000'
        // position: 'relative'
        // padding: '15px'
        // height: 'calc(100vh - 270px)'
        // overflowY: 'auto'

        return this.content.appendChild(this.msg);
      }
    }, {
      key: "_loop_spinner_",
      value: function _loop_spinner_() {
        if (this.in_rotation === true) {
          return;
        }

        this.in_rotation = true;
        this.deg = this.deg + 360 + 1;
        this.img.style.WebkitTransitionDuration = '2.2s';
        this.img.style.webkitTransform = "rotate(".concat(this.deg, "deg)");
        this.img.style.transitionTimingFunction = 'linear';

        if (this.rotatating === true) {
          return setTimeout(function () {
            this.in_rotation = false;
            return this._loop_spinner_();
          }, 2000);
        } else {
          return this.in_rotation = false;
        }
      }
    }, {
      key: "create_footer",
      value: function create_footer() {
        var b, btn, d, len, q, ref, results;
        this.footer = new_dom_element({
          style: {
            width: '100%',
            // backgroundColor: "#FFF"
            color: '#000',
            position: 'relative',
            padding: '15px',
            height: '100px'
          }
        });
        this.popup.appendChild(this.footer);
        ref = this.params.btn;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          btn = ref[q];
          d = new_dom_element({
            style: {
              width: "".concat(100 / this.params.btn.length, "%"),
              paddingRight: '5px',
              paddingLeft: '5px',
              float: 'left'
            }
          });
          b = new_dom_element({
            nodeName: 'button',
            innerHTML: btn.txt,
            onclick: btn.click,
            style: {
              display: "inline-block",
              padding: "6px 12px",
              marginBottom: "0",
              fontSize: "x-large",
              fontWeight: "400",
              height: '70px',
              lineHeight: "1.42857143",
              textAlign: "center",
              whiteSpace: "nowrap",
              verticalAlign: "middle",
              touchAction: "manipulation",
              cursor: "pointer",
              userSelect: "none",
              border: "1px solid transparent",
              borderRadius: "4px",
              width: "100%",
              backgroundColor: btn.backgroundColor,
              color: "#fff"
            }
          });
          this.footer.appendChild(d);
          results.push(d.appendChild(b));
        }

        return results;
      }
    }, {
      key: "hide_btn",
      value: function hide_btn() {
        this.footer.style.display = 'none';
        return this.img.style.display = 'inline';
      }
    }, {
      key: "show_btn",
      value: function show_btn() {
        this.footer.style.display = 'block';
        return this.img.style.display = 'none';
      }
    }, {
      key: "hide",
      value: function hide() {
        this.background.style.display = 'none';
        return this.rotatating = false;
      }
    }, {
      key: "show",
      value: function show() {
        this.background.style.display = 'block';
        this.rotatating = true;
        return this._loop_spinner_();
      }
    }, {
      key: "setMsg",
      value: function setMsg(msg) {
        return this.msg.innerHTML = msg;
      }
    }]);

    return new_alert_msg;
  }(); // setTile: (msg) ->
  //   @popup.innerHTML = msg
  // make a popup window.
  // returns the creted "inside" div
  // clicking outside closes the window.
  // drag title permits to move he window
  // class names:
  //  - PopupTitle
  //  - PopupWindow
  // Possible params:
  //  - fixed_opacity (for the fixed background)
  //  - fixed_background (for the fixed background)
  //  - width
  //  - height
  //  - event
  //  - child -> child of the main div
  //  - onclose -> callback function


  _index_current_popup = 10000;

  spinal_new_popup = function spinal_new_popup(title) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _drag_end_func2, _drag_evt_func, b, clientX, clientY, close_element, extention, height, old_x, old_y, repos, res, t, top_x, top_y, w, width;

    if (params.popup_closer == null) {
      b = new_dom_element({
        parentNode: document.body,
        id: "popup_closer",
        onmousedown: function onmousedown() {
          if (typeof params.onclose === "function") {
            params.onclose();
          }

          document.body.removeChild(b);
          return document.body.removeChild(w);
        },
        ondrop: function ondrop(evt) {
          if (!evt) {
            evt = window.event;
          }

          evt.cancelBubble = true;

          if (typeof evt.stopPropagation === "function") {
            evt.stopPropagation();
          }

          if (typeof evt.preventDefault === "function") {
            evt.preventDefault();
          }

          if (typeof evt.stopImmediatePropagation === "function") {
            evt.stopImmediatePropagation();
          }

          return false;
        },
        style: {
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: params.fixed_opacity || "#000",
          opacity: params.fixed_opacity || 0,
          zIndex: _index_current_popup
        }
      });
    }

    if (params.event != null && params.event.clientX) {
      //testing clientX to differenciate keyboards event
      clientX = params.event.clientX;
      clientY = params.event.clientY;
    } else {
      clientX = window.innerWidth / 2 - 10;
      clientY = window.innerHeight / 2 - 10;
    }

    top_x = params.top_x || -1000;
    top_y = params.top_y || -1000;
    old_x = 0;
    old_y = 0;
    w = void 0;

    if (params.width != null) {
      width = params.width;
    }

    if (params.height != null) {
      height = params.height;
    } //alert "top: " + top_y + " left: " + top_x + " width: " +  width + " height: " + height


    repos = function repos() {
      top_x = clientX - w.clientWidth / 2;
      top_y = clientY - w.clientHeight / 2;

      if (top_x + w.clientWidth > window.innerWidth) {
        top_x = window.innerWidth - w.clientWidth - 50;
      }

      if (top_y + w.clientHeight > window.innerHeight) {
        top_y = window.innerHeight - w.clientHeight + 50;
      }

      if (top_x < 50) {
        top_x = 50;
      }

      if (top_y < 50) {
        top_y = 50;
      }

      w.style.left = top_x;
      return w.style.top = top_y;
    }; //alert "top: " + top_y + " left: " + top_x + " width: " +  width + " height: " + height


    _drag_evt_func = function _drag_evt_func(evt) {
      top_x += evt.clientX - old_x;
      top_y += evt.clientY - old_y;
      w.style.left = top_x;
      w.style.top = top_y;
      old_x = evt.clientX;
      old_y = evt.clientY;
      return typeof evt.preventDefault === "function" ? evt.preventDefault() : void 0;
    };

    _drag_end_func2 = function _drag_end_func(evt) {
      if (typeof document.detachEvent === "function") {
        document.detachEvent("onmousemove", _drag_evt_func);
      }

      if (typeof document.detachEvent === "function") {
        document.detachEvent("onmouseup", _drag_end_func2);
      }

      if (typeof document.removeEventListener === "function") {
        document.removeEventListener("mousemove", _drag_evt_func, true);
      }

      return typeof document.removeEventListener === "function" ? document.removeEventListener("mouseup", _drag_end_func2, true) : void 0;
    };

    extention = "px";

    if (!params.top_x) {
      setTimeout(repos, 1);
      extention = "%";
    }

    w = new_dom_element({
      parentNode: document.body,
      className: "Popup",
      style: {
        position: "absolute",
        left: top_x,
        top: top_y,
        width: width + extention,
        height: height + extention,
        zIndex: _index_current_popup + 1,
        border: 'thin solid black',
        background: '#e5e5e5',
        resize: 'both',
        overflow: 'auto',
        paddingBottom: '8px'
      }
    });
    _index_current_popup += 2;
    close_element = new_dom_element({
      parentNode: w,
      className: "PopupClose",
      txt: "Close",
      style: {
        float: 'right',
        marginRight: '4px',
        marginTop: '4px',
        cursor: 'pointer'
      },
      onmousedown: function onmousedown(evt) {
        if (typeof params.onclose === "function") {
          params.onclose();
        }

        if (b != null) {
          document.body.removeChild(b);
        }

        return document.body.removeChild(w);
      }
    });

    if (title) {
      t = new_dom_element({
        parentNode: w,
        className: "PopupTitle",
        innerHTML: title,
        style: {
          background: '#262626',
          padding: '5 10 3 10',
          height: '22px',
          fontSize: '12px',
          borderBottom: 'thin solid black',
          cursor: 'pointer',
          color: 'white'
        },
        onmousedown: function onmousedown(evt) {
          old_x = evt.clientX;
          old_y = evt.clientY;
          top_x = parseInt(w.style.left);
          top_y = parseInt(w.style.top);
          document.addEventListener("mousemove", _drag_evt_func, true);
          document.addEventListener("mouseup", _drag_end_func2, true);
          return typeof evt.preventDefault === "function" ? evt.preventDefault() : void 0;
        }
      });
    }

    res = new_dom_element({
      parentNode: w,
      className: "PopupWindow",
      style: {
        padding: "6px",
        height: '100%',
        color: '#262626'
      }
    });

    if (params.child != null) {
      res.appendChild(params.child);
    }

    return res;
  };
}).call(this);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Generated by CoffeeScript 2.4.1
(function () {
  // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  var BindProcess,
      Bool,
      Choice,
      ConstOrNotModel,
      ConstrainedVal,
      Directory,
      File,
      FileSystem,
      Lst,
      Model,
      Obj,
      Path,
      Pbr,
      Process,
      Ptr,
      RightSetList,
      RightsItem,
      SessionModel,
      Str,
      TiffFile,
      TypedArray,
      TypedArray_Float64,
      TypedArray_Int32,
      User,
      UserRight,
      Val,
      Vec,
      _index_current_popup,
      root,
      spinal_new_popup,
      url,
      indexOf = [].indexOf;

  url = require('url');
  root = typeof _root_obj === "undefined" ? global : window;

  if (typeof root.spinalCore !== 'undefined') {
    module.exports = root.spinalCore;
    return;
  }

  root.spinalCore = function () {
    var spinalCore =
    /*#__PURE__*/
    function () {
      function spinalCore() {
        _classCallCheck(this, spinalCore);
      }

      _createClass(spinalCore, null, [{
        key: "connect",
        value: function connect(options) {
          var auth;

          if (typeof options === 'string') {
            options = url.parse(options);
          }

          if (options.path.slice(-1)[0] !== "/") {
            options.path += "/";
          }

          FileSystem._home_dir = options.path;
          FileSystem._url = options.hostname;
          FileSystem._port = options.port;

          if (options.auth !== null) {
            auth = options.auth.split(":");
            FileSystem._userid = auth[0];

            if (auth.length > 1) {
              FileSystem._password = auth[1];
            }
          } else {
            // set default user id
            FileSystem._userid = 644;
            FileSystem._password = "";
          }

          return new FileSystem();
        } // stores a model in the file system

      }, {
        key: "store",
        value: function store(fs, model, path, callback_success, callback_error) {
          var file_name, lst;

          if (typeof callback_error === "undefined") {
            callback_error = function callback_error() {
              return console.log("Model could not be stored. You can pass a callback to handle this error.");
            };
          } // Parse path


          lst = path.split("/");
          file_name = lst.pop();

          if (lst[0] === "") {
            lst.splice(0, 1);
          }

          path = lst.join("/"); // Absolute paths are not allowed

          return fs.load_or_make_dir(FileSystem._home_dir + path, function (dir, err) {
            var file;

            if (err) {
              return callback_error();
            } else {
              file = dir.detect(function (x) {
                return x.name.get() === file_name;
              });

              if (file != null) {
                dir.remove(file);
              }

              dir.add_file(file_name, model, {
                model_type: "Model"
              });
              return callback_success();
            }
          });
        } // register models, required when ussing modules require/import

      }, {
        key: "register_models",
        value: function register_models(modelList) {
          var key, len, m, q, results, results1, value;

          if (modelList) {
            if (modelList instanceof Function) {
              // function
              spinalCore._register_models_check(modelList);
            }

            if (modelList instanceof Array) {
              // array
              results = [];

              for (q = 0, len = modelList.length; q < len; q++) {
                m = modelList[q];

                if (m instanceof Function) {
                  results.push(spinalCore._register_models_check(m)); // object
                } else {
                  results.push(void 0);
                }
              }

              return results;
            } else {
              results1 = [];

              for (key in modelList) {
                value = modelList[key];

                if (value instanceof Function) {
                  results1.push(spinalCore._register_models_check(value));
                } else {
                  results1.push(void 0);
                }
              }

              return results1;
            }
          }
        }
      }, {
        key: "_register_models_check",
        value: function _register_models_check(func) {
          if (typeof spinalCore._def[func.name] !== 'undefined' && spinalCore._def[func.name] !== func) {
            console.warn("trying to register \"".concat(func.name, "\" Model but was already defined"));
            console.warn("old =", spinalCore._def[func.name]);
            console.warn("new =", func);
          }

          return spinalCore._def[func.name] = func;
        } // loads a model from the file system

      }, {
        key: "load",
        value: function load(fs, path, callback_success, callback_error) {
          var file_name, lst;

          if (typeof callback_error === "undefined") {
            callback_error = function callback_error() {
              return console.log("Model could not be loaded. You can pass a callback to handle this error.");
            };
          } // Parse path


          lst = path.split("/");
          file_name = lst.pop();

          if (lst[0] === "") {
            lst.splice(0, 1);
          }

          path = lst.join("/"); // Absolute paths are not allowed

          return fs.load_or_make_dir(FileSystem._home_dir + path, function (current_dir, err) {
            var file;

            if (err) {
              return callback_error();
            } else {
              file = current_dir.detect(function (x) {
                return x.name.get() === file_name;
              });

              if (file != null) {
                return file.load(function (data, err) {
                  if (err) {
                    return callback_error();
                  } else {
                    return callback_success(data, err);
                  }
                });
              } else {
                return callback_error();
              }
            }
          });
        } // loads all the models of a specific type

      }, {
        key: "load_type",
        value: function load_type(fs, type, callback_success, callback_error) {
          if (typeof callback_error === "undefined") {
            callback_error = function callback_error() {
              return console.log("Model of this type could not be loaded. " + "You can pass a callback to handle this error.");
            };
          }

          return fs.load_type(type, function (data, err) {
            if (err) {
              return callback_error();
            } else {
              return callback_success(data, err);
            }
          });
        }
      }, {
        key: "load_right",
        value: function load_right(fs, ptr, callback_success, callback_error) {
          if (typeof callback_error === "undefined") {
            callback_error = function callback_error() {
              return console.log("Model Right could not be loaded." + " You can pass a callback to handle this error.");
            };
          }

          return fs.load_right(ptr, function (data, err) {
            if (err) {
              return callback_error();
            } else {
              return callback_success(data, err);
            }
          });
        }
      }, {
        key: "share_model",
        value: function share_model(fs, ptr, file_name, right_flag, targetName) {
          return fs.share_model(ptr, file_name, right_flag, targetName);
        } // "static" method: extend one object as a class, using the same 'class' concept as coffeescript

      }, {
        key: "extend",
        value: function extend(child, parent) {
          var child_name, ctor, key, value;

          for (key in parent) {
            value = parent[key];
            child[key] = value;
          }

          ctor = function ctor() {
            this.constructor = child;
          };

          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
          child.__super__ = parent.prototype;

          child.super = function () {
            var args = [];

            for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
            }

            child.__super__.constructor.apply(arguments[0], args); // using embedded javascript because the word 'super' is reserved

          };

          root = typeof global !== "undefined" && global !== null ? global : window;
          child_name = /^(function|class)\s+([\w\$]+)\s*\(/.exec(child.toString())[1];
          return root[child_name] = child;
        }
      }]);

      return spinalCore;
    }();

    ;
    spinalCore._def = {};
    spinalCore.version = "2.4.0";
    spinalCore.right_flag = {
      AD: 1,
      WR: 2,
      RD: 4
    };
    return spinalCore;
  }.call(this);

  module.exports = spinalCore; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // scalar

  root = typeof _root_obj === "undefined" ? global : window;

  root.ModelProcessManager = function () {
    var ModelProcessManager =
    /*#__PURE__*/
    function () {
      function ModelProcessManager() {
        _classCallCheck(this, ModelProcessManager);
      }

      _createClass(ModelProcessManager, null, [{
        key: "new_from_state",
        // modify state according to str. str can be the result of a previous @get_state
        value: function new_from_state(str) {
          var l, len, lst, map, mid, q, s;
          map = {};
          lst = str.split("\n");
          mid = lst.shift();

          for (q = 0, len = lst.length; q < len; q++) {
            l = lst[q];

            if (!l.length) {
              continue;
            }

            s = l.split(" ");
            map[s[0]] = {
              type: s[1],
              data: s[2],
              buff: void 0
            };
          } // fill / update this with data in map[ mid ]


          eval("var __new__ = new ".concat(map[mid].type, ";"));

          __new__._set_state(map[mid].data, map);

          return __new__;
        }
      }, {
        key: "load",
        value: function load(filename, func) {
          if (!ModelProcessManager.synchronizer) {
            ModelProcessManager._synchro = new Synchronizer();
          }

          return ModelProcessManager._synchro.load(filename, func);
        } // If v is a Model, return v. Else, return a Model of guessed right type

      }, {
        key: "conv",
        value: function conv(v) {
          if (v instanceof Model) {
            return v;
          }

          if (v instanceof Array) {
            return new Lst(v);
          }

          if (typeof v === "string") {
            return new Str(v);
          }

          if (typeof v === "number") {
            return new Val(v);
          }

          if (typeof v === "boolean") {
            return new Bool(v);
          }

          if (v instanceof Object) {
            return new Model(v);
          }

          return new Obj(v);
        } // return the type of obj

      }, {
        key: "get_object_class",
        value: function get_object_class(obj) {
          var arr;

          if (obj && obj.constructor && obj.constructor.name) {
            return obj.constructor.name;
          }

          if (obj && obj.constructor && obj.constructor.toString) {
            arr = obj.constructor.toString().match(/function\s*(\w+)/);

            if (!arr) {
              arr = obj.constructor.toString().match(/class\s*(\w+)/);
            }

            if (arr && arr.length === 2) {
              return arr[1];
            }
          }
        }
      }, {
        key: "_get_attribute_names",
        value: function _get_attribute_names(m) {
          var key, results, val;

          if (m instanceof Model) {
            return m._attribute_names;
          } else {
            results = [];

            for (key in m) {
              val = m[key];
              results.push(key);
            }

            return results;
          }
        } // create a Model using a line of get_state (using .type, .data, ...)

      }, {
        key: "_new_model_from_state",
        value: function _new_model_from_state(mid, map) {
          var info;
          info = map[mid];
          eval("info.buff = new ".concat(info.type, ";"));

          info.buff._set_state(info.data, map);

          return info.buff;
        } // say that something will need a call
        // to ModelProcessManager._sync_processes during the next round

      }, {
        key: "_need_sync_processes",
        value: function _need_sync_processes() {
          if (ModelProcessManager._timeout == null) {
            return ModelProcessManager._timeout = setTimeout(ModelProcessManager._sync_processes, 1);
          }
        } // the function that is called after a very short timeout,
        // when at least one object has been modified

      }, {
        key: "_sync_processes",
        value: function _sync_processes() {
          var id, len, model, process, processes, q, ref, ref1, ref2;
          processes = {};
          ref = ModelProcessManager._modlist;

          for (id in ref) {
            model = ref[id];
            ref1 = model._processes;

            for (q = 0, len = ref1.length; q < len; q++) {
              process = ref1[q];
              processes[process.process_id] = {
                value: process,
                force: false
              };
            }
          }

          ref2 = ModelProcessManager._n_processes;

          for (id in ref2) {
            process = ref2[id];
            processes[id] = {
              value: process,
              force: true
            };
          }

          ModelProcessManager._timeout = void 0;
          ModelProcessManager._modlist = {};
          ModelProcessManager._n_processes = {};
          ModelProcessManager._counter += 2;

          for (id in processes) {
            process = processes[id];
            ModelProcessManager._force_m = process.force;
            process.value.onchange();
          }

          return ModelProcessManager._force_m = false;
        }
      }]);

      return ModelProcessManager;
    }();

    ; // nb "change rounds" since the beginning ( * 2 to differenciate direct and indirect changes )

    ModelProcessManager._counter = 0; // changed models (current round)

    ModelProcessManager._modlist = {}; // new processes (that will need a first onchange call in "force" mode)

    ModelProcessManager._n_processes = {}; // current model id (used to create new ids)

    ModelProcessManager._cur_mid = 0; // current process id (used to create new ids)

    ModelProcessManager._cur_process_id = 0; // timer used to create a new "round"

    ModelProcessManager._timeout = void 0; // if _force_m == true, every has_been_modified function will return true

    ModelProcessManager._force_m = false; // synchronizer (link to the server that will store files)

    ModelProcessManager._synchro = void 0;
    return ModelProcessManager;
  }.call(this); // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // scalar


  root = typeof _root_obj === "undefined" ? global : window;

  root.SpinalUserManager =
  /*#__PURE__*/
  function () {
    function SpinalUserManager() {
      _classCallCheck(this, SpinalUserManager);
    }

    _createClass(SpinalUserManager, null, [{
      key: "get_user_id",
      value: function get_user_id(options, user_name, password, success_callback) {
        var error_callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var get_cmd; // Access: /get_user_id?u=<user>&p=<password>

        get_cmd = '/get_user_id?u=' + user_name + '&p=' + password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_user_id', response);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_user_id', status);
        });
      }
    }, {
      key: "get_admin_id",
      value: function get_admin_id(options, admin_name, password, success_callback) {
        var error_callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var get_cmd; // Access: /get_user_id?u=<user>&p=<password>

        get_cmd = '/get_admin_id?u=' + admin_name + '&p=' + password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_admin_id', response);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_admin_id', status);
        });
      }
    }, {
      key: "new_account",
      value: function new_account(options, user_name, password, success_callback) {
        var error_callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var get_cmd; // Access: /get_new_account?e=<user>&p=<password>&cp=<confirm_password>

        get_cmd = '/get_new_account?e=' + user_name + '&p=' + password + '&cp=' + password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_new_account', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_new_account', status);
        });
      }
    }, {
      key: "change_password",
      value: function change_password(options, user_id, password, new_password, success_callback) {
        var error_callback = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
        var get_cmd; // Access: /get_change_user_password?e=<user>&op=<old_pass>&np=<newpass>&cp=<confim_pass>

        get_cmd = '/get_change_user_password?e=' + user_id + '&op=' + password + '&np=' + new_password + '&cp=' + new_password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_change_user_password', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_change_user_password', status);
        });
      }
    }, {
      key: "delete_account",
      value: function delete_account(options, user_id, password, success_callback) {
        var error_callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var get_cmd; // Access: /get_delete_account?e=<user>&i=<id>&p=<password>

        get_cmd = '/get_delete_account?e=' + user_name + '&i=' + user_id + '&p=' + password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_delete_account', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_delete_account', status);
        });
      }
    }, {
      key: "change_password_by_admin",
      value: function change_password_by_admin(options, username, password, admin_id, admin_password, success_callback) {
        var error_callback = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
        var get_cmd; // Access: ?u=<username>&np=<newpass>&a=<admin_id>&ap=<adminPass>
        // admin == 644(root) or 168(admin)

        get_cmd = '/get_change_user_password_by_admin?u=' + username + '&np=' + password + '&a=' + admin_id + '&ap=' + admin_password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_change_user_password_by_admin', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_change_user_password_by_admin', status);
        });
      }
    }, {
      key: "delete_account_by_admin",
      value: function delete_account_by_admin(options, username, admin_id, admin_password, success_callback) {
        var error_callback = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
        var get_cmd; // Access: /get_delete_account_by_admin?u=<username>&a=<admin_id>&ap=<adminPassword>
        // admin == 644(root) or 168(admin)

        get_cmd = '/get_delete_account_by_admin?u=' + username + '&a=' + admin_id + '&ap=' + admin_password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_delete_account_by_admin', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_delete_account_by_admin', status);
        });
      }
    }, {
      key: "change_account_rights_by_admin",
      value: function change_account_rights_by_admin(options, username, right, admin_id, admin_password, success_callback) {
        var error_callback = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
        var get_cmd; // Access: ?u=<username>&ri=<rights>&a=<admin_id>&ap=<adminPass>
        // admin == 644(root) or 168(admin)

        get_cmd = '/get_change_account_rights_by_admin?u=' + username + '&ri=' + right + '&a=' + admin_id + '&ap=' + admin_password;
        return this.send_xhr(options, get_cmd, function (response) {
          if (parseInt(response) === -1) {
            return SpinalUserManager._if_error(error_callback, 'get_change_account_rights_by_admin', status);
          } else {
            return success_callback(response);
          }
        }, function (status) {
          return SpinalUserManager._if_error(error_callback, 'get_change_account_rights_by_admin', status);
        });
      }
    }, {
      key: "send_xhr",
      value: function send_xhr(options, get_cmd, success_callback, error_callback) {
        var path, xhr_object;
        path = "";

        if (typeof options === 'string') {
          options = url.parse(options);
        }

        FileSystem._url = options.hostname;
        FileSystem._port = options.port;

        if (FileSystem.CONNECTOR_TYPE === "Node" || FileSystem.is_cordova) {
          if (FileSystem._port) {
            path = "http://" + FileSystem._url + ":" + FileSystem._port + get_cmd;
          } else {
            path = "http://" + FileSystem._url + get_cmd;
          }
        } else if (FileSystem.CONNECTOR_TYPE === "Browser") {
          path = get_cmd;
        }

        xhr_object = FileSystem._my_xml_http_request();
        xhr_object.open('GET', path, true);

        xhr_object.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            return success_callback(this.responseText);
          } else if (this.readyState === 4) {
            return error_callback(this.status);
          }
        };

        return xhr_object.send();
      }
    }, {
      key: "_if_error",
      value: function _if_error(error_callback, fun, response) {
        if (error_callback !== null) {
          return error_callback(response);
        } else {
          return console.log('Error on ' + fun + ' and the error_callback was not set.');
        }
      }
    }]);

    return SpinalUserManager;
  }(); // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.


  root = typeof _root_obj === "undefined" ? global : window;

  Model =
  /*#__PURE__*/
  function () {
    function Model(attr) {
      _classCallCheck(this, Model);

      // registered attribute names (in declaration order)
      this._attribute_names = []; // id of the model

      this.model_id = ModelProcessManager._cur_mid;
      ModelProcessManager._cur_mid += 1; // synchronized processes

      this._processes = []; // parent models (depending on this)

      this._parents = []; // "date" of previous change. We start at + 2 because
      // we consider that an initialisation is a modification.

      this._date_last_modification = ModelProcessManager._counter + 2; // init

      if (attr != null) {
        this._set(attr);
      }
    }

    _createClass(Model, [{
      key: "destructor",
      value: function destructor() {} // return true if this (or a child of this) has changed since the previous synchronisation

    }, {
      key: "has_been_modified",
      value: function has_been_modified() {
        return this._date_last_modification > ModelProcessManager._counter - 2 || ModelProcessManager._force_m;
      } // return true if this has changed since previous synchronisation due to
      //  a direct modification (not from a child one)

    }, {
      key: "has_been_directly_modified",
      value: function has_been_directly_modified() {
        return this._date_last_modification > ModelProcessManager._counter - 1 || ModelProcessManager._force_m;
      } // if this has been modified during the preceding round, f will be called
      // If f is a process:
      //  process.onchange will be called each time this (or a child of this) will be modified.
      //  process.destructor will be called if this is destroyed.
      //  ...
      //  can be seen as a bind with an object
      // onchange_construction true means that onchange will be automatically called after the bind

    }, {
      key: "bind",
      value: function bind(f) {
        var onchange_construction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (f instanceof Process) {
          this._processes.push(f);

          f._models.push(this);

          if (onchange_construction) {
            ModelProcessManager._n_processes[f.process_id] = f;
            return ModelProcessManager._need_sync_processes();
          }
        } else {
          return new BindProcess(this, onchange_construction, f);
        }
      } //  ...

    }, {
      key: "unbind",
      value: function unbind(f) {
        var len, q, ref, results, v;

        if (f instanceof Process) {
          this._processes.splice(this._processes.indexOf(f), 1);

          return f._models.splice(f._models.indexOf(this), 1);
        } else {
          ref = this._processes;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            v = ref[q];

            if (v instanceof BindProcess && v.f === f) {
              results.push(this.unbind(v));
            }
          }

          return results;
        }
      } // return a copy of data in a "standard" representation (e.g. string, number, objects, ...)
      // users are encouraged to use Models as much as possible
      // (meaning that get should not be called for every manipulation),
      // adding methods for manipulation of data if necessary
      // (e.g. toggle, find, ... in Lst, Str, ...).
      // May be redefined for specific types (e.g. Str, Lst, ...)

    }, {
      key: "get",
      value: function get() {
        var len, name, q, ref, res;
        res = {};
        ref = this._attribute_names;

        for (q = 0, len = ref.length; q < len; q++) {
          name = ref[q];
          res[name] = this[name].get();
        }

        return res;
      } // modify data, using another values, or Model instances.
      // Should not be redefined (but _set should be)
      // returns true if object os modified

    }, {
      key: "set",
      value: function set(value) {
        if (this._set(value)) {
          // change internal data
          this._signal_change();

          return true;
        }

        return false;
      } // modify state according to str. str can be the result of a previous @get_state

    }, {
      key: "set_state",
      value: function set_state(str) {
        var l, len, lst, map, mid, q, s;
        map = {};
        lst = str.split("\n");
        mid = lst.shift();

        for (q = 0, len = lst.length; q < len; q++) {
          l = lst[q];

          if (!l.length) {
            continue;
          }

          s = l.split(" ");
          map[s[0]] = {
            type: s[1],
            data: s[2],
            buff: void 0
          };
        } // fill / update this with data in map[ mid ]


        map[mid].buff = this;
        return this._set_state(map[mid].data, map);
      } // return a string which describes the changes in this and children since date

    }, {
      key: "get_state",
      value: function get_state() {
        var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
        var fmm, id, obj, res; // get sub models

        fmm = {};

        this._get_flat_model_map(fmm, date);

        res = this.model_id.toString();

        if (this._date_last_modification > date) {
          for (id in fmm) {
            obj = fmm[id];
            res += "\n" + obj.model_id + " " + ModelProcessManager.get_object_class(obj) + " " + obj._get_state();
          }
        }

        return res;
      } // add attribute (p.values must contain models)
      // can be called with
      //  - name, instance of Model (two arguments)
      //  - { name_1: instance_1, name_2: instance_2, ... } (only one argument)

    }, {
      key: "add_attr",
      value: function add_attr(n, p) {
        var signal_change = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var key, results, val; // name, model

        if (p != null) {
          if (typeof p === "function") {
            return this[n] = p;
          } else {
            if (this[n] != null) {
              console.error("attribute ".concat(n, " already exists in ") + "".concat(ModelProcessManager.get_object_class(this)));
            }

            p = ModelProcessManager.conv(p);

            if (indexOf.call(p._parents, this) < 0) {
              p._parents.push(this);
            }

            this._attribute_names.push(n);

            this[n] = p;

            if (signal_change) {
              return this._signal_change();
            }
          }
        } else {
          // else, asuming { name_1: instance_1, name_2: instance_2, ... }
          results = [];

          for (key in n) {
            val = n[key];

            if (val != null) {
              results.push(this.add_attr(key, val, signal_change));
            }
          }

          return results;
        }
      } // remove attribute named name

    }, {
      key: "rem_attr",
      value: function rem_attr(name) {
        var signal_change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var c, i;
        c = this[name];

        if (c) {
          i = c._parents.indexOf(this);

          if (i >= 0) {
            c._parents.splice(i, 1);

            if (c._parents.length === 0) {
              c.destructor();
            }
          }

          delete this[name];
          i = this._attribute_names.indexOf(name);

          if (i >= 0) {
            this._attribute_names.splice(i, 1);
          }

          if (signal_change) {
            return this._signal_change();
          }
        }
      } // change attribute named n to p (use references for comparison)

    }, {
      key: "mod_attr",
      value: function mod_attr(n, p) {
        if (this[n] !== p) {
          this.rem_attr(n);
          return this.add_attr(n, p);
        }
      } // add / mod / rem attr to get the same data than o
      //  (assumed to be something like { key: val, ... })

    }, {
      key: "set_attr",
      value: function set_attr(o) {
        var k, len, q, r, results, to_rem, v; // new ones / updates

        for (k in o) {
          v = o[k];
          this.mod_attr(k, v);
        } // remove


        to_rem = function () {
          var len, q, ref, results;
          ref = this._attribute_names;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            k = ref[q];

            if (o[k] == null) {
              results.push(k);
            }
          }

          return results;
        }.call(this);

        results = [];

        for (q = 0, len = to_rem.length; q < len; q++) {
          r = to_rem[q];
          results.push(this.rem_attr(r));
        }

        return results;
      } // dimension of the object -> [] for a scalar, [ length ] for a vector,
      //  [ nb_row, nb_cols ] for a matrix...

    }, {
      key: "size",
      value: function size() {
        var for_display = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return [];
      } // dimensionnality of the object -> 0 for a scalar, 1 for a vector, ...

    }, {
      key: "dim",
      value: function dim() {
        var for_display = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return this.size(for_display).length;
      }
    }, {
      key: "equals",
      value: function equals(m) {
        var key, len, len1, q, ref, ref1, u, val, y;

        if (this === m) {
          return true;
        }

        if (m._attribute_names != null) {
          u = {};
          ref = m._attribute_names;

          for (q = 0, len = ref.length; q < len; q++) {
            key = ref[q];
            val = m[key];

            if (this[key] == null) {
              return false;
            }

            if (!this[key].equals(val)) {
              return false;
            }

            u[key] = true;
          }

          ref1 = this._attribute_names;

          for (y = 0, len1 = ref1.length; y < len1; y++) {
            key = ref1[y];

            if (u[key] == null) {
              return false;
            }
          }
        }

        return false;
      } // get first parents that checks func_to_check

    }, {
      key: "get_parents_that_check",
      value: function get_parents_that_check(func_to_check) {
        var res, visited;
        res = [];
        visited = {};

        this._get_parents_that_check_rec(res, visited, func_to_check);

        return res;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        var key, len, o, q, ref;
        o = {};
        ref = this._attribute_names;

        for (q = 0, len = ref.length; q < len; q++) {
          key = ref[q];
          o[key] = this[key].deep_copy();
        }

        eval("var __new__ = new ".concat(ModelProcessManager.get_object_class(this), ";"));

        __new__.set_attr(o);

        return __new__;
      } // returns true if change is not "cosmetic"

    }, {
      key: "real_change",
      value: function real_change() {
        var a, len, q, ref;

        if (this.has_been_directly_modified() && !this._attribute_names.length) {
          return true;
        }

        ref = this._attribute_names;

        for (q = 0, len = ref.length; q < len; q++) {
          a = ref[q];

          if (typeof this.cosmetic_attribute === "function" ? this.cosmetic_attribute(a) : void 0) {
            continue;
          }

          if (this[a].real_change()) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "cosmetic_attribute",
      value: function cosmetic_attribute(name) {
        return false;
      } // may be redefined

    }, {
      key: "_get_state",
      value: function _get_state() {
        var name, str;

        str = function () {
          var len, q, ref, results;
          ref = this._attribute_names;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            name = ref[q];
            results.push(name + ":" + this[name].model_id);
          }

          return results;
        }.call(this);

        return str.join(",");
      } // send data to server

    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        var name, obj, str;
        FileSystem.set_server_id_if_necessary(out, this);

        str = function () {
          var len, q, ref, results;
          ref = this._attribute_names;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            name = ref[q];
            obj = this[name];
            FileSystem.set_server_id_if_necessary(out, obj);
            results.push(name + ":" + obj._server_id);
          }

          return results;
        }.call(this);

        return out.mod += "C ".concat(this._server_id, " ").concat(str.join(","), " ");
      } // may be redefined.
      // by default, add attributes using keys and values (and remove old unused values)
      // must return true if data is changed

    }, {
      key: "_set",
      value: function _set(value) {
        var change, key, len, len1, q, ref, ref1, used, val, y;
        change = false; // rem

        used = {};
        ref = ModelProcessManager._get_attribute_names(value);

        for (q = 0, len = ref.length; q < len; q++) {
          key = ref[q];
          used[key] = true;
        }

        ref1 = function () {
          var len1, ref1, results, z;
          ref1 = this._attribute_names;
          results = [];

          for (z = 0, len1 = ref1.length; z < len1; z++) {
            key = ref1[z];

            if (!used[key]) {
              results.push(key);
            }
          }

          return results;
        }.call(this);

        for (y = 0, len1 = ref1.length; y < len1; y++) {
          key = ref1[y];
          change = true;
          this.rem_attr(key, false);
        } // mod / add


        for (key in value) {
          val = value[key];

          if (val != null) {
            if (this[key] != null) {
              if (this[key].constructor === val.constructor) {
                change |= this[key].set(val);
              } else {
                change = true;
                this.mod_attr(key, val, false);
              }
            } else {
              this.add_attr(key, val, false);
            }
          }
        }

        return change;
      } // called by set. change_level should not be defined by the user
      //  (it permits to != change from child of from this)

    }, {
      key: "_signal_change",
      value: function _signal_change() {
        var change_level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
        var len, p, q, ref;

        if (change_level === 2 && this._server_id != null) {
          FileSystem.signal_change(this);
        } // register this as a modified model


        ModelProcessManager._modlist[this.model_id] = this; // do the same thing for the parents

        if (this._date_last_modification <= ModelProcessManager._counter) {
          this._date_last_modification = ModelProcessManager._counter + change_level;
          ref = this._parents;

          for (q = 0, len = ref.length; q < len; q++) {
            p = ref[q];

            p._signal_change(1);
          }
        } // start if not done a timer


        return ModelProcessManager._need_sync_processes();
      } // generic definition of _set_state. ( called by _use_state )

    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        var attr, inr, k_id, len, len1, q, ref, ref1, results, spl, u, y;
        u = {}; // used attributes. Permits to know what to destroy

        if (str.length) {
          ref = str.split(",");

          for (q = 0, len = ref.length; q < len; q++) {
            spl = ref[q];
            inr = spl.split(":");
            attr = inr[0];
            k_id = inr[1];
            u[attr] = true; // if already defined in the map

            if (map[k_id].buff != null) {
              if (this[attr] == null) {
                this.add_attr(attr, map[k_id].buff);
              } else if (map[k_id].buff !== this[attr]) {
                this.mod_attr(attr, map[k_id].buff);
              } // else, if the attribute does not exist, we create if

            } else if (this[attr] == null) {
              this.add_attr(attr, ModelProcessManager._new_model_from_state(k_id, map)); // else, we already have an attribute and map has not been already explored
            } else if (!this[attr]._set_state_if_same_type(k_id, map)) {
              this.mod_attr(attr, ModelProcessManager._new_model_from_state(k_id, map));
            }
          }
        }

        ref1 = this._attribute_names;
        results = [];

        for (y = 0, len1 = ref1.length; y < len1; y++) {
          attr = ref1[y];

          if (!u[attr]) {
            results.push(this.rem_attr(attr));
          } else {
            results.push(void 0);
          }
        }

        return results;
      } // see get_parents_that_check

    }, {
      key: "_get_parents_that_check_rec",
      value: function _get_parents_that_check_rec(res, visited, func_to_check) {
        var len, p, q, ref, results;

        if (visited[this.model_id] == null) {
          visited[this.model_id] = true;

          if (func_to_check(this)) {
            return res.push(this);
          } else {
            ref = this._parents;
            results = [];

            for (q = 0, len = ref.length; q < len; q++) {
              p = ref[q];
              results.push(p._get_parents_that_check_rec(res, visited, func_to_check));
            }

            return results;
          }
        }
      } // return true if info from map[ mid ] if compatible with this.
      // If it's the case, use this information to update data

    }, {
      key: "_set_state_if_same_type",
      value: function _set_state_if_same_type(mid, map) {
        var dat;
        dat = map[mid];

        if (ModelProcessManager.get_object_class(this) === dat.type) {
          dat.buff = this;

          this._set_state(dat.data, map);

          return true;
        }

        return false;
      } // map[ id ] = obj for each objects starting from this recursively

    }, {
      key: "_get_flat_model_map",
      value: function _get_flat_model_map(map, date) {
        var len, name, obj, q, ref, results;
        map[this.model_id] = this;
        ref = this._attribute_names;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          name = ref[q];
          obj = this[name];

          if (map[obj.model_id] == null) {
            if (obj._date_last_modification > date) {
              results.push(obj._get_flat_model_map(map, date));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }

        return results;
      }
    }]);

    return Model;
  }();

  spinalCore.register_models(Model);
  root.Model = Model; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // generic object with data

  root = typeof _root_obj === "undefined" ? global : window;

  Obj =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode) {
    _inherits(Obj, _spinalCore$_def$Mode);

    function Obj(data) {
      var _this;

      _classCallCheck(this, Obj);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Obj).call(this));

      if (data != null) {
        _this._set(data);
      }

      return _this;
    }

    _createClass(Obj, [{
      key: "toString",
      value: function toString() {
        var ref;
        return (ref = this._data) != null ? ref.toString() : void 0;
      }
    }, {
      key: "equals",
      value: function equals(obj) {
        if (obj instanceof Obj) {
          return this._data === obj._data;
        }

        return this._data === obj;
      }
    }, {
      key: "get",
      value: function get() {
        return this._data;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);
        return out.mod += "C ".concat(this._server_id, " ").concat(this.toString(), " ");
      }
    }, {
      key: "_set",
      value: function _set(value) {
        if (this._data !== value) {
          this._data = value;
          return true;
        }

        return false;
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        return this._data;
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        return this.set(str);
      }
    }]);

    return Obj;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Obj);
  root.Obj = Obj; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // value choosen from a list
  // get() will give the value
  // num is the number of the choosen value in the list
  // lst contains the posible choices

  root = typeof _root_obj === "undefined" ? global : window;

  Choice =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode2) {
    _inherits(Choice, _spinalCore$_def$Mode2);

    function Choice(data) {
      var _this2;

      var initial_list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      _classCallCheck(this, Choice);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Choice).call(this)); // default

      _this2.add_attr({
        num: 0,
        lst: initial_list
      }); // init


      if (data != null) {
        _this2.num.set(data);
      }

      return _this2;
    }

    _createClass(Choice, [{
      key: "filter",
      value: function filter(obj) {
        return true;
      }
    }, {
      key: "item",
      value: function item() {
        return this._nlst()[this.num.get()];
      }
    }, {
      key: "get",
      value: function get() {
        var ref;
        return (ref = this.item()) != null ? ref.get() : void 0;
      }
    }, {
      key: "toString",
      value: function toString() {
        var ref;
        return (ref = this.item()) != null ? ref.toString() : void 0;
      }
    }, {
      key: "equals",
      value: function equals(a) {
        if (a instanceof Choice) {
          return _get(_getPrototypeOf(Choice.prototype), "equals", this).call(this, a);
        } else {
          return this._nlst()[this.num.get()].equals(a);
        }
      }
    }, {
      key: "_set",
      value: function _set(value) {
        var i, j, len, q, ref;
        ref = this._nlst();

        for (j = q = 0, len = ref.length; q < len; j = ++q) {
          i = ref[j];

          if (i.equals(value)) {
            return this.num.set(j);
          }
        }

        return this.num.set(value);
      }
    }, {
      key: "_nlst",
      value: function _nlst() {
        var l, len, q, ref, results;
        ref = this.lst;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          l = ref[q];

          if (this.filter(l)) {
            results.push(l);
          }
        }

        return results;
      }
    }]);

    return Choice;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Choice);
  root.Choice = Choice; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // false by default

  root = typeof _root_obj === "undefined" ? global : window;

  Bool =
  /*#__PURE__*/
  function (_spinalCore$_def$Obj) {
    _inherits(Bool, _spinalCore$_def$Obj);

    function Bool(data) {
      var _this3;

      _classCallCheck(this, Bool);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(Bool).call(this));
      _this3._data = false; // default values

      if (data != null) {
        _this3._set(data);
      }

      return _this3;
    } // toggle true / false ( 1 / 0 )


    _createClass(Bool, [{
      key: "toggle",
      value: function toggle() {
        return this.set(!this._data);
      }
    }, {
      key: "toBoolean",
      value: function toBoolean() {
        return this._data;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new Bool(this._data);
      } // we do not take _set from Obj because we want a conversion if value is not a boolean

    }, {
      key: "_set",
      value: function _set(value) {
        var n;

        if (n instanceof Model) {
          n = value.toBoolean();
        } else if (value === "false") {
          n = false;
        } else if (value === "true") {
          n = true;
        } else {
          n = Boolean(value);
        }

        if (this._data !== n) {
          this._data = n;
          return true;
        }

        return false;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);
        return out.mod += "C ".concat(this._server_id, " ").concat(1 * Boolean(this._data), " ");
      }
    }]);

    return Bool;
  }(spinalCore._def["Obj"]);

  spinalCore.register_models(Bool);
  root.Bool = Bool; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  ConstOrNotModel =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode3) {
    _inherits(ConstOrNotModel, _spinalCore$_def$Mode3);

    function ConstOrNotModel(bool, model) {
      var _this4;

      var check_disabled = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      _classCallCheck(this, ConstOrNotModel);

      _this4 = _possibleConstructorReturn(this, _getPrototypeOf(ConstOrNotModel).call(this)); // default

      _this4.add_attr({
        bool: bool,
        model: model,
        check_disabled: check_disabled
      });

      return _this4;
    }

    _createClass(ConstOrNotModel, [{
      key: "get",
      value: function get() {
        var ref;
        return (ref = this.model) != null ? ref.get() : void 0;
      }
    }, {
      key: "set",
      value: function set(value) {
        var ref;
        return (ref = this.model) != null ? ref.set(value) : void 0;
      }
    }, {
      key: "toString",
      value: function toString() {
        var ref;
        return (ref = this.model) != null ? ref.toString() : void 0;
      }
    }]);

    return ConstOrNotModel;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(ConstOrNotModel);
  root.ConstOrNotModel = ConstOrNotModel; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // scalar

  root = typeof _root_obj === "undefined" ? global : window;

  ConstrainedVal =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode4) {
    _inherits(ConstrainedVal, _spinalCore$_def$Mode4);

    function ConstrainedVal(value) {
      var _this5;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, ConstrainedVal);

      _this5 = _possibleConstructorReturn(this, _getPrototypeOf(ConstrainedVal).call(this));

      _this5.add_attr({
        val: value || 0,
        _min: params.min != null ? params.min : 0,
        _max: params.max != null ? params.max : 100
      });

      _this5.add_attr({
        _div: params.div != null ? params.div : _this5._max - _this5._min
      });

      return _this5;
    }

    _createClass(ConstrainedVal, [{
      key: "get",
      value: function get() {
        return this.val.get();
      }
    }, {
      key: "ratio",
      value: function ratio() {
        return (this.val.get() - this._min.get()) / this.delta();
      }
    }, {
      key: "delta",
      value: function delta() {
        return this._max.get() - this._min.get();
      }
    }, {
      key: "set_params",
      value: function set_params(params) {
        this._min.set(params.min != null ? params.min : 0);

        this._max.set(params.max != null ? params.max : 100);

        return this._div.set(params.div != null ? params.div : this._max - this._min);
      }
    }, {
      key: "_set",
      value: function _set(value) {
        var res;

        if (value instanceof ConstrainedVal) {
          return this.val._set(value.get());
        }

        res = this.val.set(value);

        this._check_val();

        return res;
      }
    }, {
      key: "_check_val",
      value: function _check_val() {
        var d, m, n, r, s, v;
        v = this.val.get();
        m = this._min.get();
        n = this._max.get();
        d = this._div.get();

        if (v < m) {
          this.val.set(m);
        }

        if (v > n) {
          this.val.set(n);
        }

        if (d) {
          s = (n - m) / d;
          r = m + Math.round((this.val.get() - m) / s) * s;
          return this.val.set(r);
        }
      }
    }]);

    return ConstrainedVal;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(ConstrainedVal);
  root.ConstrainedVal = ConstrainedVal; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // vector of objects inherited from Model

  root = typeof _root_obj === "undefined" ? global : window;

  Lst =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode5) {
    _inherits(Lst, _spinalCore$_def$Mode5);

    function Lst(data) {
      var _this6;

      _classCallCheck(this, Lst);

      var d, i, q, ref, s;
      _this6 = _possibleConstructorReturn(this, _getPrototypeOf(Lst).call(this)); // default

      _this6.length = 0; // static length case

      s = _this6.static_length();

      if (s >= 0) {
        d = _this6.default_value();

        for (i = q = 0, ref = s; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          _this6.push(d, true);
        }
      } // init


      if (data != null) {
        _this6._set(data);
      }

      return _this6;
    } // if static_length < 0, length is dynamic (push, pop, ... are allowed)
    // else, length = static_length
    // may be redefined


    _createClass(Lst, [{
      key: "static_length",
      value: function static_length() {
        return -1;
      } // used for initialisation of for resize
      // may be redefined

    }, {
      key: "default_value",
      value: function default_value() {
        return 0;
      } // if base_type is defined, all values must be of this type

    }, {
      key: "base_type",
      value: function base_type() {
        return void 0;
      }
    }, {
      key: "get",
      value: function get() {
        var i, len, q, ref, results;
        ref = this;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];
          results.push(i.get());
        }

        return results;
      } // tensorial size (see models)

    }, {
      key: "size",
      value: function size() {
        return [length];
      }
    }, {
      key: "toString",
      value: function toString() {
        var l, x;

        if (this.length) {
          l = function () {
            var len, q, ref, results;
            ref = this;
            results = [];

            for (q = 0, len = ref.length; q < len; q++) {
              x = ref[q];
              results.push(x.toString());
            }

            return results;
          }.call(this);

          return l.join();
        } else {
          return "";
        }
      }
    }, {
      key: "equals",
      value: function equals(lst) {
        var i, q, ref;

        if (this.length !== lst.length) {
          return false;
        }

        for (i = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          if (!this[i].equals(lst[i])) {
            return false;
          }
        }

        return true;
      } // append value at the end of the list

    }, {
      key: "push",
      value: function push(value) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var b;

        if (this._static_size_check(force)) {
          return;
        }

        b = this.base_type();

        if (b != null) {
          if (!(value instanceof b)) {
            value = new b(value);
          }
        } else {
          value = ModelProcessManager.conv(value);
        }

        if (indexOf.call(value._parents, this) < 0) {
          value._parents.push(this);
        }

        this[this.length] = value;
        this.length += 1;
        return this._signal_change();
      } // remove and return the last element

    }, {
      key: "pop",
      value: function pop() {
        var old;

        if (this._static_size_check(false)) {
          return;
        }

        if (this.length <= 0) {
          return;
        }

        this.length -= 1;
        old = this[this.length];
        this.rem_attr(this.length);
        return old;
      }
    }, {
      key: "clear",
      value: function clear() {
        var results;
        results = [];

        while (this.length) {
          results.push(this.pop());
        }

        return results;
      } // add an element to the beginning of an array, return the new length

    }, {
      key: "unshift",
      value: function unshift(element) {
        var b, i, q, ref;

        if (this._static_size_check(false)) {
          return;
        }

        b = this.base_type();

        if (b != null) {
          if (!(element instanceof b)) {
            element = new b(element);
          }
        } else {
          element = ModelProcessManager.conv(element);
        }

        if (indexOf.call(element._parents, this) < 0) {
          element._parents.push(this);
        }

        if (this.length) {
          for (i = q = ref = this.length - 1; ref <= 0 ? q <= 0 : q >= 0; i = ref <= 0 ? ++q : --q) {
            this[i + 1] = this[i];
          }
        }

        this[0] = element;
        this.length += 1;

        this._signal_change();

        return this.length;
      } // remove and return the first element

    }, {
      key: "shift",
      value: function shift() {
        var r;
        r = this[0];
        this.splice(0, 1);
        return r;
      } // remove item from the list id present

    }, {
      key: "remove",
      value: function remove(item) {
        var i;
        i = this.indexOf(item);

        if (i >= 0) {
          return this.splice(i, 1);
        }
      } // remove item from the list id present, based on ref comparison

    }, {
      key: "remove_ref",
      value: function remove_ref(item) {
        var i;
        i = this.indexOf_ref(item);

        if (i >= 0) {
          return this.splice(i, 1);
        }
      } // return a list with item such as f( item ) is true

    }, {
      key: "filter",
      value: function filter(f) {
        var i, len, q, ref, results;
        ref = this;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];

          if (f(i)) {
            results.push(i);
          }
        }

        return results;
      } // return the first item such as f( item ) is true. If not item, return undefined

    }, {
      key: "detect",
      value: function detect(f) {
        var i, len, q, ref;
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];

          if (f(i)) {
            return i;
          }
        }

        return void 0;
      } // sort item depending function and return a new Array

    }, {
      key: "sorted",
      value: function sorted(fun_sort) {
        var it, len, new_array, q, ref; // lst to array

        new_array = new Array();
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          it = ref[q];
          new_array.push(it);
        } //sort array


        new_array.sort(fun_sort);
        return new_array;
      } // return true if there is an item that checks f( item )

    }, {
      key: "has",
      value: function has(f) {
        var i, len, q, ref;
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];

          if (f(i)) {
            return true;
          }
        }

        return false;
      } // returns index of v if v is present in the list. Else, return -1

    }, {
      key: "indexOf",
      value: function indexOf(v) {
        var i, q, ref;

        for (i = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          if (this[i].equals(v)) {
            return i;
          }
        }

        return -1;
      } // returns index of v if v is present in the list, based on ref comparison. Else, return -1

    }, {
      key: "indexOf_ref",
      value: function indexOf_ref(v) {
        var i, q, ref;

        for (i = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          if (this[i] === v) {
            return i;
          }
        }

        return -1;
      }
    }, {
      key: "contains",
      value: function contains(v) {
        return this.indexOf(v) >= 0;
      }
    }, {
      key: "contains_ref",
      value: function contains_ref(v) {
        return this.indexOf_ref(v) >= 0;
      } // toggle presence of v. return true if added

    }, {
      key: "toggle",
      value: function toggle(v) {
        var i;
        i = this.indexOf(v);

        if (i >= 0) {
          this.splice(i);
          return false;
        } else {
          this.push(v);
          return true;
        }
      } // toggle presence of v, base on ref comparison

    }, {
      key: "toggle_ref",
      value: function toggle_ref(v) {
        var i;
        i = this.indexOf_ref(v);

        if (i >= 0) {
          this.splice(i);
          return false;
        } else {
          this.push(v);
          return true;
        }
      } //return a new lst between begin and end index

    }, {
      key: "slice",
      value: function slice(begin) {
        var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.length;
        var i, q, ref, ref1, tab;

        if (begin < 0) {
          begin = 0;
        }

        if (end > this.length) {
          end = this.length;
        }

        tab = new Lst();

        for (i = q = ref = begin, ref1 = end; ref <= ref1 ? q < ref1 : q > ref1; i = ref <= ref1 ? ++q : --q) {
          tab.push(this[i].get());
        }

        return tab;
      } //return list with new_tab after

    }, {
      key: "concat",
      value: function concat(new_tab) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var el, len, q;

        if (this._static_size_check(force)) {
          return;
        }

        if (new_tab.length) {
          for (q = 0, len = new_tab.length; q < len; q++) {
            el = new_tab[q];
            this.push(el);
          }

          return this;
        }
      } // remove n items from index

    }, {
      key: "splice",
      value: function splice(index) {
        var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var i, q, ref, ref1, ref2, ref3, ref4, ref5, y, z;

        if (this._static_size_check(false)) {
          return;
        }

        for (i = q = ref = index, ref1 = Math.min(index + n, this.length); ref <= ref1 ? q < ref1 : q > ref1; i = ref <= ref1 ? ++q : --q) {
          this.rem_attr(i);
        }

        for (i = y = ref2 = index, ref3 = this.length - n; ref2 <= ref3 ? y < ref3 : y > ref3; i = ref2 <= ref3 ? ++y : --y) {
          this[i] = this[i + n];
        }

        for (i = z = ref4 = this.length - n, ref5 = this.length; ref4 <= ref5 ? z < ref5 : z > ref5; i = ref4 <= ref5 ? ++z : --z) {
          delete this[i];
        }

        this.length -= n;
        return this._signal_change();
      } // remove n items before index

    }, {
      key: "insert",
      value: function insert(index, list) {
        var i, l, len, len1, o, q, results, y;

        if (list.length) {
          l = Math.max(this.length - index, 0);

          o = function () {
            var q, ref, results;
            results = [];

            for (i = q = 0, ref = l; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
              results.push(this.pop());
            }

            return results;
          }.call(this);

          o.reverse();

          for (q = 0, len = list.length; q < len; q++) {
            l = list[q];
            this.push(l);
          }

          results = [];

          for (y = 0, len1 = o.length; y < len1; y++) {
            l = o[y];
            results.push(this.push(l));
          }

          return results;
        }
      } // permits to set an item or to grow the list if index == @length

    }, {
      key: "set_or_push",
      value: function set_or_push(index, val) {
        if (index < this.length) {
          return this.mod_attr(index, val);
        } else if (index === this.length) {
          return this.push(val);
        }
      } // permits to reduce the size (resize is allowed only if we known how to create new items)

    }, {
      key: "trim",
      value: function trim(size) {
        var results;
        results = [];

        while (this.length > size) {
          results.push(this.pop());
        }

        return results;
      } // return a string with representation of items, separated by sep

    }, {
      key: "join",
      value: function join(sep) {
        return this.get().join(sep);
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        var i, q, ref, res;
        res = new Lst();

        for (i = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
          res.push(this[i].deep_copy());
        }

        return res;
      } // last element

    }, {
      key: "back",
      value: function back() {
        return this[this.length - 1];
      } // returns true if change is not "cosmetic"

    }, {
      key: "real_change",
      value: function real_change() {
        var a, len, q, ref;

        if (this.has_been_directly_modified()) {
          return true;
        }

        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          a = ref[q];

          if (a.real_change()) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "_set",
      value: function _set(value) {
        var change, p, q, ref, s;
        change = this.length !== value.length;
        s = this.static_length();

        if (s >= 0 && change) {
          console.error("resizing a static array (type " + "".concat(ModelProcessManager.get_object_class(this), ") is forbidden"));
        }

        for (p = q = 0, ref = value.length; 0 <= ref ? q < ref : q > ref; p = 0 <= ref ? ++q : --q) {
          if (p < this.length) {
            change |= this[p].set(value[p]);
          } else if (s < 0) {
            this.push(value[p]);
          }
        }

        if (s < 0) {
          while (this.length > value.length) {
            this.pop();
          }

          this.length = value.length;
        }

        return change;
      }
    }, {
      key: "_get_flat_model_map",
      value: function _get_flat_model_map(map, date) {
        var len, obj, q, ref, results;
        map[this.model_id] = this;
        ref = this;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          obj = ref[q];

          if (map[obj.model_id] == null) {
            if (obj._date_last_modification > date) {
              results.push(obj._get_flat_model_map(map, date));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }

        return results;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        var obj, str;
        FileSystem.set_server_id_if_necessary(out, this);

        str = function () {
          var len, q, ref, results;
          ref = this;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            obj = ref[q];
            FileSystem.set_server_id_if_necessary(out, obj);
            results.push(obj._server_id);
          }

          return results;
        }.call(this);

        return out.mod += "C ".concat(this._server_id, " ").concat(str.join(","), " ");
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        var obj, str;

        str = function () {
          var len, q, ref, results;
          ref = this;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            obj = ref[q];
            results.push(obj.model_id);
          }

          return results;
        }.call(this);

        return str.join(",");
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        var attr, k_id, l_id, q, ref, ref1, ref2, results, y;
        l_id = str.split(",").filter(function (x) {
          return x.length;
        });

        while (this.length > l_id.length) {
          this.pop();
        }

        for (attr = q = 0, ref = this.length; 0 <= ref ? q < ref : q > ref; attr = 0 <= ref ? ++q : --q) {
          k_id = l_id[attr]; //             if not map[ k_id ]?
          //                 console.log map, k_id

          if (map[k_id].buff != null) {
            if (map[k_id].buff !== this[attr]) {
              this.mod_attr(attr, map[k_id].buff);
            }
          } else if (!this[attr]._set_state_if_same_type(k_id, map)) {
            this.mod_attr(attr, ModelProcessManager._new_model_from_state(k_id, map));
          }
        }

        results = [];

        for (attr = y = ref1 = this.length, ref2 = l_id.length; ref1 <= ref2 ? y < ref2 : y > ref2; attr = ref1 <= ref2 ? ++y : --y) {
          k_id = l_id[attr];

          if (map[k_id].buff != null) {
            results.push(this.push(map[k_id].buff));
          } else {
            results.push(this.push(ModelProcessManager._new_model_from_state(k_id, map)));
          }
        }

        return results;
      }
    }, {
      key: "_static_size_check",
      value: function _static_size_check(force) {
        if (this.static_length() >= 0 && !force) {
          console.error("resizing a static array (type " + "".concat(ModelProcessManager.get_object_class(this), ") is forbidden"));
          return true;
        }

        return false;
      }
    }]);

    return Lst;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Lst);
  root.Lst = Lst; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // scalar

  root = typeof _root_obj === "undefined" ? global : window;

  Val =
  /*#__PURE__*/
  function (_spinalCore$_def$Obj2) {
    _inherits(Val, _spinalCore$_def$Obj2);

    function Val(data) {
      var _this7;

      _classCallCheck(this, Val);

      _this7 = _possibleConstructorReturn(this, _getPrototypeOf(Val).call(this));
      _this7._data = 0; // default values

      if (data != null) {
        _this7._set(data);
      }

      return _this7;
    } // toggle true / false ( 1 / 0 )


    _createClass(Val, [{
      key: "toggle",
      value: function toggle() {
        return this.set(!this._data);
      }
    }, {
      key: "toBoolean",
      value: function toBoolean() {
        return Boolean(this._data);
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new Val(this._data);
      }
    }, {
      key: "add",
      value: function add(v) {
        if (v) {
          this._data += v;
          return this._signal_change();
        }
      } // we do not take _set from Obj because we want a conversion if value is not a number

    }, {
      key: "_set",
      value: function _set(value) {
        var n; // console.log value

        if (typeof value === "string") {
          if (value.slice(0, 2) === "0x") {
            n = parseInt(value, 16);
          } else {
            n = parseFloat(value);

            if (isNaN(n)) {
              n = parseInt(value);
            }

            if (isNaN(n)) {
              console.log("Don't know how to transform ".concat(value, " to a Val"));
            }
          }
        } else if (typeof value === "boolean") {
          n = 1 * value;
        } else if (value instanceof Val) {
          n = value._data; // assuming a number
        } else {
          n = value;
        }

        if (this._data !== n) {
          this._data = n;
          return true;
        }

        return false;
      }
    }]);

    return Val;
  }(spinalCore._def["Obj"]);

  spinalCore.register_models(Val);
  root.Val = Val; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  Vec =
  /*#__PURE__*/
  function (_spinalCore$_def$Lst) {
    _inherits(Vec, _spinalCore$_def$Lst);

    function Vec(data) {
      _classCallCheck(this, Vec);

      return _possibleConstructorReturn(this, _getPrototypeOf(Vec).call(this, data));
    }

    _createClass(Vec, [{
      key: "base_type",
      value: function base_type() {
        return Val;
      }
    }, {
      key: "_underlying_fs_type",
      value: function _underlying_fs_type() {
        return "Lst";
      }
    }]);

    return Vec;
  }(spinalCore._def["Lst"]);

  spinalCore.register_models(Vec);
  root.Vec = Vec; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // String

  root = typeof _root_obj === "undefined" ? global : window;

  Str =
  /*#__PURE__*/
  function (_spinalCore$_def$Obj3) {
    _inherits(Str, _spinalCore$_def$Obj3);

    function Str(data) {
      var _this8;

      _classCallCheck(this, Str);

      _this8 = _possibleConstructorReturn(this, _getPrototypeOf(Str).call(this)); // default value

      _this8._data = "";
      _this8.length = 0; // init if possible

      if (data != null) {
        _this8._set(data);
      }

      return _this8;
    } // toggle presence of str in this


    _createClass(Str, [{
      key: "toggle",
      value: function toggle(str) {
        var space = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : " ";
        var i, l;
        l = this._data.split(space);
        i = l.indexOf(str);

        if (i < 0) {
          l.push(str);
        } else {
          l.splice(i, 1);
        }

        return this.set(l.join(" "));
      } // true if str is contained in this

    }, {
      key: "contains",
      value: function contains(str) {
        return this._data.indexOf(str) >= 0;
      }
    }, {
      key: "equals",
      value: function equals(str) {
        return this._data === str.toString();
      }
    }, {
      key: "ends_with",
      value: function ends_with(str) {
        var l;
        l = this._data.match(str + "$");
        return (l != null ? l.length : void 0) && l[0] === str;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new Str(this._data + "");
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);
        return out.mod += "C ".concat(this._server_id, " ").concat(encodeURI(this._data), " ");
      }
    }, {
      key: "_set",
      value: function _set(value) {
        var n;

        if (value == null) {
          return this._set("");
        }

        n = value.toString();

        if (this._data !== n) {
          this._data = n;
          this.length = this._data.length;
          return true;
        }

        return false;
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        return encodeURI(this._data);
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        return this.set(decodeURIComponent(str));
      }
    }]);

    return Str;
  }(spinalCore._def["Obj"]);

  spinalCore.register_models(Str);
  root.Str = Str; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  TypedArray =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode6) {
    _inherits(TypedArray, _spinalCore$_def$Mode6);

    // size can be
    //  - a number
    //  - a list of number
    function TypedArray(size, data) {
      var _this9;

      _classCallCheck(this, TypedArray);

      var B;
      _this9 = _possibleConstructorReturn(this, _getPrototypeOf(TypedArray).call(this)); // size

      if (size == null) {
        size = [];
      }

      if (!size.length) {
        size = [size];
      }

      _this9._size = size; // data

      if (data == null) {
        B = _this9.base_type();
        data = new B(_this9.nb_items());
      }

      _this9._data = data;
      return _this9;
    }

    _createClass(TypedArray, [{
      key: "base_type",
      value: function base_type() {} // -> to be defined by children

    }, {
      key: "dim",
      value: function dim() {
        return this._size.length;
      }
    }, {
      key: "size",
      value: function size(d) {
        if (d != null) {
          return this._size[d];
        } else {
          return this._size;
        }
      }
    }, {
      key: "set_val",
      value: function set_val(index, value) {
        index = this._get_index(index);

        if (this._data[index] !== value) {
          this._data[index] = value;
          return this._signal_change();
        }
      }
    }, {
      key: "nb_items",
      value: function nb_items() {
        var i, len, q, ref, tot;
        tot = this._size[0] || 0;
        ref = this._size.slice(1);

        for (q = 0, len = ref.length; q < len; q++) {
          i = ref[q];
          tot *= i;
        }

        return tot;
      }
    }, {
      key: "toString",
      value: function toString() {
        var i, j, l, len, m, o, q, ref, ref1, res, s, v, y;
        m = 1;
        res = "";

        l = function () {
          var len, q, ref, results;
          ref = this._size;
          results = [];

          for (q = 0, len = ref.length; q < len; q++) {
            s = ref[q];
            o = m;
            m *= s;
            results.push(o);
          }

          return results;
        }.call(this);

        ref = this._data;

        for (i = q = 0, len = ref.length; q < len; i = ++q) {
          v = ref[i];
          res += v;

          for (j = y = ref1 = l.length - 1; ref1 <= 0 ? y <= 0 : y >= 0; j = ref1 <= 0 ? ++y : --y) {
            if (i % l[j] === l[j] - 1) {
              res += [" ", "\n", "\n\n"][j];
              break;
            }
          }
        }

        return res;
      }
    }, {
      key: "equals",
      value: function equals(obj) {
        var i, len, q, ref, v;

        if (obj instanceof TypedArray) {
          if (this._size.length !== obj._size.length) {
            return false;
          }

          ref = this._size;

          for (i = q = 0, len = ref.length; q < len; i = ++q) {
            v = ref[i];

            if (v !== obj._size[i]) {
              return false;
            }
          }

          return this._data === obj._data;
        }

        return this._data === obj;
      }
    }, {
      key: "get",
      value: function get(index) {
        if (index != null) {
          return this._data[this._get_index(index)];
        } else {
          return this._data;
        }
      }
    }, {
      key: "resize",
      value: function resize(new_size) {
        var B, len, n, q, s, tot;
        tot = 1;

        for (q = 0, len = new_size.length; q < len; q++) {
          s = new_size[q];
          tot *= s;
        }

        B = this.base_type();
        n = new B(tot);
        n.set(this._data);
        this._data = n;
        this._size = new_size;
        return this._signal_change();
      }
    }, {
      key: "_set",
      value: function _set(str) {
        var B;

        if (typeof str === "string") {
          // TODO optimize
          this._set_state(str, {});

          return true;
        }

        if (this._data !== str || this._size.length !== 1 || this._size[0] !== str.length) {
          B = this.base_type();
          this._data = new B(str);
          this._size = [str.length];
          return true;
        }

        return false;
      }
    }, {
      key: "_get_index",
      value: function _get_index(index) {
        var i, m, o, q, ref;

        if (index.length) {
          o = 0;
          m = 1;

          for (i = q = 0, ref = index.length; 0 <= ref ? q < ref : q > ref; i = 0 <= ref ? ++q : --q) {
            o += m * index[i];
            m *= this._size[i];
          }

          return o;
        }

        return index;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);
        return out.mod += "C ".concat(this._server_id, " ").concat(this._get_state(), " ");
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        var d, len, len1, q, ref, ref1, res, s, y;
        res = "";
        res += this._size.length;
        ref = this._size;

        for (q = 0, len = ref.length; q < len; q++) {
          s = ref[q];
          res += "," + s;
        }

        ref1 = this._data;

        for (y = 0, len1 = ref1.length; y < len1; y++) {
          d = ref1[y];
          res += "," + d;
        }

        return res;
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        var B, l, n, q, ref, results, s, v;
        l = str.split(",");
        s = parseInt(l[0]);

        this._size = function () {
          var q, ref, results;
          results = [];

          for (v = q = 0, ref = s; 0 <= ref ? q < ref : q > ref; v = 0 <= ref ? ++q : --q) {
            results.push(parseInt(l[v + 1]));
          }

          return results;
        }();

        B = this.base_type();
        n = this.nb_items();
        this._data = new B(n);
        results = [];

        for (v = q = 0, ref = n; 0 <= ref ? q < ref : q > ref; v = 0 <= ref ? ++q : --q) {
          results.push(this._data[v] = parseFloat(l[s + 1 + v]));
        }

        return results;
      }
    }]);

    return TypedArray;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(TypedArray);
  root.TypedArray = TypedArray; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  TypedArray_Float64 =
  /*#__PURE__*/
  function (_spinalCore$_def$Type) {
    _inherits(TypedArray_Float64, _spinalCore$_def$Type);

    function TypedArray_Float64() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var data = arguments.length > 1 ? arguments[1] : undefined;

      _classCallCheck(this, TypedArray_Float64);

      return _possibleConstructorReturn(this, _getPrototypeOf(TypedArray_Float64).call(this, size, data));
    }

    _createClass(TypedArray_Float64, [{
      key: "base_type",
      value: function base_type() {
        return Float64Array;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new TypedArray_Float64(this._size, this._data);
      }
    }]);

    return TypedArray_Float64;
  }(spinalCore._def["TypedArray"]);

  spinalCore.register_models(TypedArray_Float64);
  root.TypedArray_Float64 = TypedArray_Float64; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  TypedArray_Int32 =
  /*#__PURE__*/
  function (_spinalCore$_def$Type2) {
    _inherits(TypedArray_Int32, _spinalCore$_def$Type2);

    function TypedArray_Int32() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var data = arguments.length > 1 ? arguments[1] : undefined;

      _classCallCheck(this, TypedArray_Int32);

      return _possibleConstructorReturn(this, _getPrototypeOf(TypedArray_Int32).call(this, size, data));
    }

    _createClass(TypedArray_Int32, [{
      key: "base_type",
      value: function base_type() {
        return Int32Array;
      }
    }, {
      key: "deep_copy",
      value: function deep_copy() {
        return new TypedArray_Int32(this._size, this._data);
      }
    }]);

    return TypedArray_Int32;
  }(spinalCore._def["TypedArray"]);

  spinalCore.register_models(TypedArray_Int32);
  root.TypedArray_Int32 = TypedArray_Int32; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a session.

  User =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode7) {
    _inherits(User, _spinalCore$_def$Mode7);

    function User() {
      _classCallCheck(this, User);

      return _possibleConstructorReturn(this, _getPrototypeOf(User).call(this));
    }

    return User;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(User);
  root.User = User; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // data from changed object are sent if not activity since 100ms

  root = typeof _root_obj === "undefined" ? global : window;

  FileSystem = function () {
    var XMLHttpRequest_node;

    var FileSystem =
    /*#__PURE__*/
    function () {
      function FileSystem() {
        _classCallCheck(this, FileSystem);

        // default values
        this._data_to_send = ""; // -1 means that we are waiting for a session id after a first request.

        this._session_num = -2;
        this._num_inst = FileSystem._nb_insts++;
        this.make_channel_error_timer = 0; // register this in FileSystem instances

        FileSystem._insts[this._num_inst] = this; // first, we need a session id fom the server

        if (FileSystem._userid != null) {
          this.send("U ".concat(FileSystem._userid, " ").concat(FileSystem._password, " "));
        }

        this.send("S ".concat(this._num_inst, " "));
      } // load object in $path and call $callback with the corresponding model ref


      _createClass(FileSystem, [{
        key: "load",
        value: function load(path, callback) {
          FileSystem._send_chan();

          this.send("L ".concat(FileSystem._nb_callbacks, " ").concat(encodeURI(path), " "));
          FileSystem._callbacks[FileSystem._nb_callbacks] = callback;
          return FileSystem._nb_callbacks++;
        } // load all the objects of $type

      }, {
        key: "load_type",
        value: function load_type(type, callback) {
          FileSystem._send_chan();

          this.send("R 0 ".concat(type, " "));
          return FileSystem._type_callbacks.push([type, callback]);
        } // make dir if not already present in the server. Call callback
        // as in the @load proc -- when done (i.e. when loaded or created)

      }, {
        key: "load_or_make_dir",
        value: function load_or_make_dir(dir, callback) {
          var _this10 = this;

          return this.load(dir, function (res, err) {
            var lst, nir, oir, v;

            if (err) {
              if (dir === "/") {
                return callback(0, err);
              } else {
                lst = function () {
                  var len, q, ref, results;
                  ref = dir.split('/');
                  results = [];

                  for (q = 0, len = ref.length; q < len; q++) {
                    v = ref[q];

                    if (v.length) {
                      results.push(v);
                    }
                  }

                  return results;
                }();

                nir = lst.pop();
                oir = "/" + lst.join("/");
                return _this10.load_or_make_dir(oir, function (n_res, n_err) {
                  var n_dir;

                  if (n_err) {
                    return callback(0, n_err);
                  } else {
                    n_dir = new Directory();
                    n_res.add_file(nir, n_dir);
                    return callback(n_dir, n_err);
                  }
                });
              }
            } else {
              return callback(res, err);
            }
          });
        } // load an object using is pointer and call $callback with the corresponding ref

      }, {
        key: "load_ptr",
        value: function load_ptr(ptr, callback) {
          FileSystem._send_chan();

          this.send("l ".concat(FileSystem._nb_callbacks, " ").concat(ptr, " "));
          FileSystem._callbacks[FileSystem._nb_callbacks] = callback;
          return FileSystem._nb_callbacks++;
        }
      }, {
        key: "load_right",
        value: function load_right(ptr, callback) {
          FileSystem._send_chan();

          this.send("r ".concat(ptr, " ").concat(FileSystem._nb_callbacks, " "));
          FileSystem._callbacks[FileSystem._nb_callbacks] = callback;
          return FileSystem._nb_callbacks++;
        }
      }, {
        key: "share_model",
        value: function share_model(ptr, file_name, share_type, targetName) {
          FileSystem._send_chan();

          return this.send("h ".concat(ptr._server_id, " ").concat(share_type, " ").concat(encodeURI(targetName), " ").concat(encodeURI(file_name), " "));
        } // explicitly send a command

      }, {
        key: "send",
        value: function send(data) {
          this._data_to_send += data;

          if (FileSystem._timer_send == null) {
            return FileSystem._timer_send = setTimeout(FileSystem._timeout_send_func, 1);
          }
        } // send a request for a "push" channel

      }, {
        key: "make_channel",
        value: function make_channel() {
          var path, xhr_object;
          path = "";

          if (FileSystem.CONNECTOR_TYPE === "Node" || FileSystem.is_cordova) {
            if (FileSystem._port) {
              path = "http://" + FileSystem._url + ":" + FileSystem._port + FileSystem.url_com + "?s=".concat(this._session_num);
            } else {
              path = "http://" + FileSystem._url + FileSystem.url_com + "?s=".concat(this._session_num);
            }
          } else if (FileSystem.CONNECTOR_TYPE === "Browser") {
            path = FileSystem.url_com + "?s=".concat(this._session_num);
          }

          xhr_object = FileSystem._my_xml_http_request();
          xhr_object.open('GET', path, true);

          xhr_object.onreadystatechange = function () {
            var _fs, _w;

            if (this.readyState === 4 && this.status === 200) {
              _fs = FileSystem.get_inst();

              if (_fs.make_channel_error_timer !== 0) {
                _fs.onConnectionError(0);
              }

              _fs.make_channel_error_timer = 0;

              if (FileSystem._disp) {
                console.log("chan ->", this.responseText);
              }

              _w = function _w(sid, obj) {
                var _obj, c, len, mod_R, q, ref, results;

                _obj = FileSystem._create_model_by_name(obj);

                if (sid != null && _obj != null) {
                  _obj._server_id = sid;
                  FileSystem._objects[sid] = _obj;
                  ref = FileSystem._type_callbacks;
                  results = [];

                  for (q = 0, len = ref.length; q < len; q++) {
                    c = ref[q];
                    mod_R = root[c[0]] || spinalCore._def[c[0]];

                    if (_obj instanceof mod_R) {
                      results.push(c[1](_obj));
                    } else {
                      results.push(void 0);
                    }
                  }

                  return results;
                }
              };

              FileSystem._sig_server = false;
              eval(this.responseText);
              return FileSystem._sig_server = true;
            } else if (this.readyState === 4 && this.status === 0) {
              console.error("Disconnected from the server with request : ".concat(path, "."));
              _fs = FileSystem.get_inst();

              if (_fs.make_channel_error_timer === 0) {
                //first disconnect
                console.log("Trying to reconnect.");
                _fs.make_channel_error_timer = new Date();
                setTimeout(_fs.make_channel.bind(_fs), 1000);
                return _fs.onConnectionError(1);
              } else if (new Date() - _fs.make_channel_error_timer < FileSystem._timeout_reconnect) {
                // under timeout
                return setTimeout(_fs.make_channel.bind(_fs), 1000); // timeout reached
              } else {
                return _fs.onConnectionError(2);
              }
            } else if (this.readyState === 4 && this.status === 500) {
              return FileSystem.get_inst().onConnectionError(3);
            }
          };

          return xhr_object.send();
        } // default callback on make_channel error after the timeout disconnected reached
        // This method can be surcharged.
        // error_code :
        // 0 = Error resolved
        // 1 = 1st disconnection
        // 2 = disconnection timeout
        // 3 = Server went down Reinit everything
        // 4 = Server down on connection

      }, {
        key: "onConnectionError",
        value: function onConnectionError(error_code) {
          var msg;
          msg = "";

          if (error_code === 0) {
            // Error resolved
            if (FileSystem.CONNECTOR_TYPE === "Browser" || FileSystem.is_cordova) {
              FileSystem.popup.hide();
            } else {
              console.log("Reconnected to the server.");
            }
          } else if (error_code === 1) {
            // 1st disconnection
            if (FileSystem.CONNECTOR_TYPE === "Browser" || FileSystem.is_cordova) {
              msg = "Disconnected from the server, trying to reconnect...";
            } else {
              console.error("Disconnected from the server, trying to reconnect...");
            }
          } else if (error_code === 2 || error_code === 3 || error_code === 4) {
            if (FileSystem.CONNECTOR_TYPE === "Browser" || FileSystem.is_cordova) {
              msg = "Disconnected from the server, please refresh the window.";
            } else if (FileSystem.CONNECTOR_TYPE === "Node") {
              console.error("Disconnected from the server.");
              process.exit();
            } else {
              console.error("Disconnected from the server.");
            }
          }

          if (msg !== "") {
            if (FileSystem.popup === 0) {
              FileSystem.popup = new new_alert_msg({
                parent: document.getElementsByTagName("BODY")[0],
                msg: msg,
                btn: [{
                  txt: 'reload page',
                  click: window.location.reload.bind(window.location),
                  backgroundColor: '#ff5b57'
                }, {
                  txt: 'close',
                  backgroundColor: '#348fe2',
                  click: function click() {
                    return FileSystem.popup.hide();
                  }
                }]
              });
            } else {
              FileSystem.popup.show();
            }

            if (error_code === 2 || error_code === 3 || error_code === 4) {
              FileSystem.popup.show_btn();
            } else {
              FileSystem.popup.hide_btn();
            }

            return FileSystem.popup.setMsg(msg);
          }
        } // get the first running inst

      }], [{
        key: "get_inst",
        value: function get_inst() {
          var i, k, ref;
          ref = FileSystem._insts;

          for (k in ref) {
            i = ref[k];
            return i;
          }

          return new FileSystem();
        }
      }, {
        key: "set_server_id_if_necessary",
        value: function set_server_id_if_necessary(out, obj) {
          var ncl;

          if (obj._server_id == null) {
            // registering
            obj._server_id = FileSystem._get_new_tmp_server_id();
            FileSystem._tmp_objects[obj._server_id] = obj; // new object

            ncl = ModelProcessManager.get_object_class(obj);

            if (obj._underlying_fs_type != null) {
              out.mod += "T ".concat(obj._server_id, " ").concat(ncl, " ");
              ncl = obj._underlying_fs_type();
            }

            out.cre += "N ".concat(obj._server_id, " ").concat(ncl, " "); // data

            return obj._get_fs_data(out);
          }
        } // send changes of m to instances.

      }, {
        key: "signal_change",
        value: function signal_change(m) {
          if (FileSystem._sig_server) {
            FileSystem._objects_to_send[m.model_id] = m;

            if (FileSystem._timer_chan != null) {
              clearTimeout(FileSystem._timer_chan);
            }

            return FileSystem._timer_chan = setTimeout(FileSystem._timeout_chan_func, 250);
          }
        }
      }, {
        key: "_tmp_id_to_real",
        value: function _tmp_id_to_real(tmp_id, res) {
          var fs, path, ptr, tmp, xhr_object;
          tmp = FileSystem._tmp_objects[tmp_id];

          if (tmp == null) {
            console.log(tmp_id);
          }

          FileSystem._objects[res] = tmp;
          tmp._server_id = res;
          delete FileSystem._tmp_objects[tmp_id];
          ptr = FileSystem._ptr_to_update[tmp_id];

          if (ptr != null) {
            delete FileSystem._ptr_to_update[tmp_id];
            ptr.data.value = res;
          }

          if (FileSystem._files_to_upload[tmp_id] != null && tmp.file != null) {
            delete FileSystem._files_to_upload[tmp_id]; // send the file

            fs = FileSystem.get_inst();
            path = "";

            if (FileSystem.CONNECTOR_TYPE === "Node" || FileSystem.is_cordova) {
              if (FileSystem._port) {
                path = "http://" + FileSystem._url + ":" + FileSystem._port + FileSystem.url_com + "?s=".concat(fs._session_num, "&p=").concat(tmp._server_id);
              } else {
                path = "http://" + FileSystem._url + FileSystem.url_com + "?s=".concat(fs._session_num, "&p=").concat(tmp._server_id);
              }
            } else if (FileSystem.CONNECTOR_TYPE === "Browser") {
              path = FileSystem.url_com + "?s=".concat(fs._session_num, "&p=").concat(tmp._server_id);
            }

            xhr_object = FileSystem._my_xml_http_request();
            xhr_object.open('PUT', path, true);

            xhr_object.onreadystatechange = function () {
              var _w;

              if (this.readyState === 4 && this.status === 200) {
                _w = function _w(sid, obj) {
                  var _obj;

                  _obj = FileSystem._create_model_by_name(obj);

                  if (sid != null && _obj != null) {
                    _obj._server_id = sid;
                    return FileSystem._objects[sid] = _obj;
                  }
                };

                return eval(this.responseText);
              }
            };

            xhr_object.send(tmp.file);
            delete tmp.file;
          }

          return FileSystem.signal_change(FileSystem._objects[res]);
        }
      }, {
        key: "_create_model_by_name",
        value: function _create_model_by_name(name) {
          if (typeof name !== "string") {
            return name;
          }

          if (typeof spinalCore._def[name] !== 'undefined') {
            return new spinalCore._def[name]();
          }

          if (typeof root[name] === 'undefined') {
            if (FileSystem.debug === true) {
              console.warn("Got Model type \"".concat(name, "\" from hub but not registered."));
            }

            root[name] = new Function("return class ".concat(name, " extends spinalCore._def[\"Model\"] {}"))();
          }

          return new root[name]();
        }
      }, {
        key: "extend",
        value: function extend(child, parent) {
          var child_name, ctor, key, value;

          for (key in parent) {
            value = parent[key];
            child[key] = value;
          }

          ctor = function ctor() {
            this.constructor = child;
          };

          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
          child.__super__ = parent.prototype;

          child.super = function () {
            var args = [];

            for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
            }

            child.__super__.constructor.apply(arguments[0], args); // using embedded javascript because the word 'super' is reserved

          };

          root = typeof global !== "undefined" && global !== null ? global : window;
          child_name = /^(function|class)\s+([\w\$]+)\s*\(/.exec(child.toString())[1];
          return root[child_name] = child;
        }
      }, {
        key: "_get_new_tmp_server_id",
        value: function _get_new_tmp_server_id() {
          FileSystem._cur_tmp_server_id++;

          if (FileSystem._cur_tmp_server_id % 4 === 0) {
            FileSystem._cur_tmp_server_id++;
          }

          return FileSystem._cur_tmp_server_id;
        } // send changes

      }, {
        key: "_send_chan",
        value: function _send_chan() {
          var f, k, out, ref, results;
          out = FileSystem._get_chan_data();
          ref = FileSystem._insts;
          results = [];

          for (k in ref) {
            f = ref[k];
            results.push(f.send(out));
          }

          return results;
        } // timeout for at least one changed object

      }, {
        key: "_timeout_chan_func",
        value: function _timeout_chan_func() {
          FileSystem._send_chan();

          return delete FileSystem._timer_chan;
        } // get data of objects to send

      }, {
        key: "_get_chan_data",
        value: function _get_chan_data() {
          var model, n, out, ref;
          out = {
            cre: "",
            mod: ""
          };
          ref = FileSystem._objects_to_send;

          for (n in ref) {
            model = ref[n];

            model._get_fs_data(out);
          }

          FileSystem._objects_to_send = {};
          return out.cre + out.mod;
        }
      }, {
        key: "_timeout_send_func",
        value: function _timeout_send_func() {
          var f, k, out, path, ref, ref1, xhr_object; // if some model have changed, we have to send the changes now

          out = FileSystem._get_chan_data();
          ref = FileSystem._insts;

          for (k in ref) {
            f = ref[k];
            f._data_to_send += out;
          }

          ref1 = FileSystem._insts; // send data

          for (k in ref1) {
            f = ref1[k];

            if (!f._data_to_send.length) {
              continue;
            } // if we are waiting for a session id, do not send the data
            // (@responseText will contain another call to @_timeout_send with the session id)


            if (f._session_num === -1) {
              continue;
            } // for first call, do not add the session id (but say that we are waiting for one)


            if (f._session_num === -2) {
              f._session_num = -1;
            } else {
              f._data_to_send = "s ".concat(f._session_num, " ") + f._data_to_send;
            } // request


            path = "";

            if (FileSystem.CONNECTOR_TYPE === "Node" || FileSystem.is_cordova) {
              if (FileSystem._port) {
                path = "http://" + FileSystem._url + ":" + FileSystem._port + FileSystem.url_com;
              } else {
                path = "http://" + FileSystem._url + FileSystem.url_com;
              }
            } else if (FileSystem.CONNECTOR_TYPE === "Browser") {
              path = FileSystem.url_com;
            }

            xhr_object = FileSystem._my_xml_http_request();
            xhr_object.open('POST', path, true);

            xhr_object.onreadystatechange = function () {
              var _c, _w, c, len, q, results;

              if (this.readyState === 4 && this.status === 200) {
                if (FileSystem._disp) {
                  console.log("resp ->", this.responseText);
                }

                _c = []; // callbacks

                _w = function _w(sid, obj) {
                  var _obj, c, len, mod_R, q, ref2, results;

                  _obj = FileSystem._create_model_by_name(obj);

                  if (sid != null && _obj != null) {
                    _obj._server_id = sid;
                    FileSystem._objects[sid] = _obj;
                    ref2 = FileSystem._type_callbacks;
                    results = [];

                    for (q = 0, len = ref2.length; q < len; q++) {
                      c = ref2[q];
                      mod_R = root[c[0]] || spinalCore._def[c[0]];

                      if (_obj instanceof mod_R) {
                        results.push(c[1](_obj));
                      } else {
                        results.push(void 0);
                      }
                    }

                    return results;
                  }
                };

                FileSystem._sig_server = false;
                eval(this.responseText);
                FileSystem._sig_server = true;
                results = [];

                for (q = 0, len = _c.length; q < len; q++) {
                  c = _c[q];
                  results.push(FileSystem._callbacks[c[0]](FileSystem._objects[c[1]], c[2]));
                }

                return results;
              } else if (this.readyState === 4 && (this.status === 0 || this.status === 500)) {
                return FileSystem.get_inst().onConnectionError(4);
              }
            };

            if (FileSystem._disp) {
              console.log("sent ->", f._data_to_send + "E ");
            }

            xhr_object.setRequestHeader('Content-Type', 'text/plain');
            xhr_object.send(f._data_to_send + "E "); //console.log "-> ", f._data_to_send

            f._data_to_send = "";
          }

          FileSystem._objects_to_send = {};
          return delete FileSystem._timer_send;
        }
      }, {
        key: "_my_xml_http_request",
        value: function _my_xml_http_request() {
          if (FileSystem.CONNECTOR_TYPE === "Browser") {
            if (window.XMLHttpRequest) {
              return new XMLHttpRequest();
            }

            if (window.ActiveXObject) {
              return new ActiveXObject('Microsoft.XMLHTTP');
            }

            return alert('Your browser does not seem to support XMLHTTPRequest objects...');
          } else if (FileSystem.CONNECTOR_TYPE === "Node") {
            return new FileSystem._XMLHttpRequest();
          } else {
            return console.log("you must define CONNECTOR_TYPE");
          }
        }
      }]);

      return FileSystem;
    }();

    ; // when object are saved, their _server_id is assigned to a tmp value

    FileSystem.popup = 0;
    FileSystem.debug = false;
    FileSystem._cur_tmp_server_id = 0;
    FileSystem._sig_server = true; // if changes has to be sent

    FileSystem._disp = false;
    FileSystem._userid = "644";
    FileSystem._timeout_reconnect = 30000;

    if (typeof document !== "undefined") {
      FileSystem.is_cordova = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    } else {
      FileSystem.is_cordova = false;
    } //     if ( @is_cordova )
    //         // PhoneGap application
    //     else
    //         // Web page
    // TODO: Hardcoded: review this


    if (typeof global !== 'undefined') {
      XMLHttpRequest_node = require('xhr2');
      FileSystem._XMLHttpRequest = XMLHttpRequest_node;
    } // data are sent after a timeout (and are concatened before)


    FileSystem._objects_to_send = {};
    FileSystem._timer_send = void 0;
    FileSystem._timer_chan = void 0; // functions to be called after an answer

    FileSystem._nb_callbacks = 0;
    FileSystem._callbacks = {};
    FileSystem._type_callbacks = []; // list of callbacks associated to a type: [ [ "type", function ], ... ]
    // instances of FileSystem

    FileSystem._nb_insts = 0;
    FileSystem._insts = {}; // ..._server_id -> object

    FileSystem._files_to_upload = {}; // ref to Path waiting to be registered before sending data

    FileSystem._ptr_to_update = {}; // Ptr objects that need an update, associated with @_tmp_objects

    FileSystem._tmp_objects = {}; // objects waiting for a real _server_id

    FileSystem._objects = {}; // _server_id -> object
    // url and port of the server

    FileSystem._url = "127.0.0.1";
    FileSystem._port = "8888";
    FileSystem.url_com = "/sceen/_";
    FileSystem.url_upload = "/sceen/upload"; // conector type : Browser or Node

    if (typeof global !== 'undefined') {
      FileSystem.CONNECTOR_TYPE = "Node";
    } else {
      FileSystem.CONNECTOR_TYPE = "Browser";
    }

    return FileSystem;
  }.call(this);

  spinalCore.register_models(FileSystem);
  root.FileSystem = FileSystem; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // List of files
  // _underlying_fs_type is not needed ()

  root = typeof _root_obj === "undefined" ? global : window;

  Directory =
  /*#__PURE__*/
  function (_spinalCore$_def$Lst2) {
    _inherits(Directory, _spinalCore$_def$Lst2);

    function Directory() {
      _classCallCheck(this, Directory);

      return _possibleConstructorReturn(this, _getPrototypeOf(Directory).call(this));
    }

    _createClass(Directory, [{
      key: "base_type",
      value: function base_type() {
        return File;
      }
    }, {
      key: "find",
      value: function find(name) {
        var f, len, q, ref;
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          f = ref[q];

          if (f.name.equals(name)) {
            return f;
          }
        }

        return void 0;
      }
    }, {
      key: "load",
      value: function load(name, callback) {
        var f;
        f = this.find(name);

        if (f) {
          return f.load(callback);
        } else {
          return callback(void 0, "file does not exist");
        }
      }
    }, {
      key: "has",
      value: function has(name) {
        var f, len, q, ref;
        ref = this;

        for (q = 0, len = ref.length; q < len; q++) {
          f = ref[q];

          if (f.name.equals(name)) {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "add_file",
      value: function add_file(name, obj) {
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var o, res;
        o = this.find(name);

        if (o != null) {
          return o;
        }

        res = new File(name, obj, params);
        this.push(res);
        return res;
      }
    }, {
      key: "add_tiff_file",
      value: function add_tiff_file(name, obj, tiff_obj) {
        var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var o, res;
        o = this.find(name);

        if (o != null) {
          return o;
        }

        res = new TiffFile(name, obj, tiff_obj, params);
        this.push(res);
        return res;
      }
    }, {
      key: "force_add_file",
      value: function force_add_file(name, obj) {
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var name_file, num, o, res;
        num = 0;
        name_file = name;
        o = this.find(name_file);

        if (o != null) {
          while (true) {
            name_file = name + "_" + num;
            o = this.find(name_file);

            if (o != null) {
              num += 1;
            } else {
              break;
            }
          }
        }

        res = new File(name_file, obj, params);
        this.push(res);
        return res;
      }
    }, {
      key: "get_file_info",
      value: function get_file_info(info) {
        return info.icon = "folder";
      }
    }]);

    return Directory;
  }(spinalCore._def["Lst"]);

  spinalCore.register_models(Directory);
  root.Directory = Directory; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  File =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode8) {
    _inherits(File, _spinalCore$_def$Mode8);

    function File() {
      var _this11;

      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var ptr_or_model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var info = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      _classCallCheck(this, File);

      var cp_info, key, val;
      _this11 = _possibleConstructorReturn(this, _getPrototypeOf(File).call(this));
      cp_info = {};

      for (key in info) {
        val = info[key];
        cp_info[key] = val;
      }

      if (ptr_or_model instanceof Model) {
        if (cp_info.model_type == null) {
          cp_info.model_type = ModelProcessManager.get_object_class(ptr_or_model);
        }

        if (typeof ptr_or_model.get_file_info === "function") {
          ptr_or_model.get_file_info(cp_info);
        }
      }

      _this11.add_attr({
        name: name,
        admins: new Lst(),
        users: new Lst(),
        _created_at: new Date(),
        _ptr: new Ptr(ptr_or_model),
        _info: cp_info
      });

      return _this11;
    } // -> img: "data/base64...."
    // -> icon: "toto"
    // -> model_type: "Directory"...
    // -> remaining
    // -> to_upload


    _createClass(File, [{
      key: "load",
      value: function load(callback) {
        return this._ptr.load(callback);
      }
    }]);

    return File;
  }(spinalCore._def["Model"]); //     drop: ( evt, info ) ->
  //         @handleFiles evt, info
  //         evt.returnValue = false
  //         evt.stopPropagation()
  //         evt.preventDefault()
  //         return false
  //     handleFiles: (event, info, files) ->
  //         if typeof files == "undefined" #Drag and drop
  //             event.stopPropagation()
  //             event.returnValue = false
  //             event.preventDefault()
  //             files = event.dataTransfer.files
  //         if event.dataTransfer.files.length > 0
  //             for file in files
  //                 format = file.type.indexOf "image"
  //                 if format isnt -1
  //                     pic = new ImgItem file.name
  //                     accept_child = info.item.accept_child pic
  //                     if accept_child == true
  //                         info.item.add_child pic
  //                         info.item.img_collection.push pic
  //             @sendFiles()
  // TreeView.default_types.push ( evt, info ) ->
  //     d = new Directory
  //     d.drop evt, info


  spinalCore.register_models(File);
  root.File = File; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // contains (privately on the server) a path to data on the server

  root = typeof _root_obj === "undefined" ? global : window;

  Path =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode9) {
    _inherits(Path, _spinalCore$_def$Mode9);

    // @file is optionnal. Must be a javascript File object
    function Path(file1) {
      var _this12;

      _classCallCheck(this, Path);

      var size;
      _this12 = _possibleConstructorReturn(this, _getPrototypeOf(Path).call(this));
      _this12.file = file1;
      size = _this12.file != null ? _this12.file.fileSize != null ? _this12.file.fileSize : _this12.file.size : 0;

      _this12.add_attr({
        remaining: size,
        to_upload: size
      });

      return _this12;
    }

    _createClass(Path, [{
      key: "get_file_info",
      value: function get_file_info(info) {
        info.remaining = this.remaining;
        return info.to_upload = this.to_upload;
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        _get(_getPrototypeOf(Path.prototype), "_get_fs_data", this).call(this, out); // permit to send the data after the server's answer


        if (this.file != null && this._server_id & 3) {
          return FileSystem._files_to_upload[this._server_id] = this;
        }
      }
    }]);

    return Path;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Path);
  root.Path = Path; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // contains an id of a model on the server

  root = typeof _root_obj === "undefined" ? global : window;

  Ptr =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode10) {
    _inherits(Ptr, _spinalCore$_def$Mode10);

    // model may be a number (the pointer)
    function Ptr(model) {
      var _this13;

      _classCallCheck(this, Ptr);

      _this13 = _possibleConstructorReturn(this, _getPrototypeOf(Ptr).call(this));
      _this13.data = {};

      _this13._set(model);

      return _this13;
    }

    _createClass(Ptr, [{
      key: "load",
      value: function load(callback) {
        var ref;

        if (this.data.model != null) {
          return callback(this.data.model, false);
        } else {
          return (ref = FileSystem.get_inst()) != null ? ref.load_ptr(this.data.value, callback) : void 0;
        }
      }
    }, {
      key: "_get_fs_data",
      value: function _get_fs_data(out) {
        FileSystem.set_server_id_if_necessary(out, this);

        if (this.data.model != null) {
          FileSystem.set_server_id_if_necessary(out, this.data.model);
          out.mod += "C ".concat(this._server_id, " ").concat(this.data.model._server_id, " ");
          this.data.value = this.data.model._server_id;

          if (this.data.model._server_id & 3) {
            return FileSystem._ptr_to_update[this.data.model._server_id] = this;
          }
        } else {
          return out.mod += "C ".concat(this._server_id, " ").concat(this.data.value, " ");
        }
      }
    }, {
      key: "_set",
      value: function _set(model) {
        var res;

        if (typeof model === "number") {
          res = this.data.value !== model;
          this.data = {
            value: model
          };
          return res;
        }

        if (model instanceof Model) {
          res = this.data.value !== model._server_id;
          this.data = {
            model: model,
            value: model._server_id
          };
          return res;
        }

        return false;
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        return this._data;
      }
    }, {
      key: "_set_state",
      value: function _set_state(str, map) {
        return this.set(str);
      }
    }]);

    return Ptr;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(Ptr);
  root.Ptr = Ptr; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // contains an id of a model on the server

  root = typeof _root_obj === "undefined" ? global : window;

  Pbr =
  /*#__PURE__*/
  function (_spinalCore$_def$Ptr) {
    _inherits(Pbr, _spinalCore$_def$Ptr);

    function Pbr(model) {
      _classCallCheck(this, Pbr);

      return _possibleConstructorReturn(this, _getPrototypeOf(Pbr).call(this, model));
    }

    return Pbr;
  }(spinalCore._def["Ptr"]);

  spinalCore.register_models(Pbr);
  root.Pbr = Pbr; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a RightsItem.

  RightsItem =
  /*#__PURE__*/
  function (_spinalCore$_def$Lst3) {
    _inherits(RightsItem, _spinalCore$_def$Lst3);

    function RightsItem() {
      _classCallCheck(this, RightsItem);

      return _possibleConstructorReturn(this, _getPrototypeOf(RightsItem).call(this));
    }

    return RightsItem;
  }(spinalCore._def["Lst"]);

  spinalCore.register_models(RightsItem);
  root.RightsItem = RightsItem; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a session.

  SessionModel =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode11) {
    _inherits(SessionModel, _spinalCore$_def$Mode11);

    function SessionModel() {
      _classCallCheck(this, SessionModel);

      return _possibleConstructorReturn(this, _getPrototypeOf(SessionModel).call(this));
    }

    return SessionModel;
  }(spinalCore._def["Model"]); // default
  // @add_attr
  //   id : 0                # user_id
  //   timestamp: 0          # timestamp of the last change or make_channel
  //   type: "Session type"  # type of the session e.g. HTTTP_JavaScript
  //   actif: true           # state of the session true/false


  spinalCore.register_models(SessionModel);
  root.SessionModel = SessionModel; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window;

  TiffFile =
  /*#__PURE__*/
  function (_spinalCore$_def$File) {
    _inherits(TiffFile, _spinalCore$_def$File);

    function TiffFile() {
      var _this14;

      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var ptr_or_model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var ptr_tiff = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var info = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      _classCallCheck(this, TiffFile);

      _this14 = _possibleConstructorReturn(this, _getPrototypeOf(TiffFile).call(this, name, ptr_or_model, info));

      _this14.add_attr({
        _ptr_tiff: new Ptr(ptr_tiff),
        _has_been_converted: 0
      });

      return _this14;
    }

    _createClass(TiffFile, [{
      key: "load_tiff",
      value: function load_tiff(callback) {
        return this._ptr_tiff.load(callback);
      }
    }]);

    return TiffFile;
  }(spinalCore._def["File"]);

  spinalCore.register_models(TiffFile);
  root.TiffFile = TiffFile; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a UserRight.

  UserRight =
  /*#__PURE__*/
  function (_spinalCore$_def$Mode12) {
    _inherits(UserRight, _spinalCore$_def$Mode12);

    function UserRight() {
      _classCallCheck(this, UserRight);

      return _possibleConstructorReturn(this, _getPrototypeOf(UserRight).call(this));
    }

    _createClass(UserRight, [{
      key: "set",
      value: function set() {
        return console.log("Set a UserRight is not allowed.");
      }
    }]);

    return UserRight;
  }(spinalCore._def["Model"]);

  spinalCore.register_models(UserRight);
  root.UserRight = UserRight; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.

  root = typeof _root_obj === "undefined" ? global : window; // Model representing a RightSetList.

  RightSetList =
  /*#__PURE__*/
  function (_spinalCore$_def$Lst4) {
    _inherits(RightSetList, _spinalCore$_def$Lst4);

    function RightSetList() {
      _classCallCheck(this, RightSetList);

      return _possibleConstructorReturn(this, _getPrototypeOf(RightSetList).call(this));
    }

    return RightSetList;
  }(spinalCore._def["Lst"]);

  spinalCore.register_models(RightSetList);
  root.RightSetList = RightSetList; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // something which has to be synchronized with one or several model(s)
  // Each process has an uniquer id called "process_id"

  root = typeof _root_obj === "undefined" ? global : window;

  Process =
  /*#__PURE__*/
  function () {
    // m can be a model or a list of models
    function Process(m) {
      var onchange_construction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      _classCallCheck(this, Process);

      var i, len, q;
      this.process_id = ModelProcessManager._cur_process_id;
      ModelProcessManager._cur_process_id += 1; // what this is observing

      this._models = []; // bind

      if (m instanceof Model) {
        m.bind(this, onchange_construction);
      } else if (m.length != null) {
        for (q = 0, len = m.length; q < len; q++) {
          i = m[q];
          i.bind(this, onchange_construction);
        }
      } else if (m != null) {
        console.error("Process constructor doesn't know what to do with", m);
      }
    }

    _createClass(Process, [{
      key: "destructor",
      value: function destructor() {
        var i, len, m, q, ref, results;
        ref = this._models;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          m = ref[q];
          i = m._processes.indexOf(this);

          if (i >= 0) {
            results.push(m._processes.splice(i, 1));
          } else {
            results.push(void 0);
          }
        }

        return results;
      } // called if at least one of the corresponding models has changed in the previous round

    }, {
      key: "onchange",
      value: function onchange() {}
    }]);

    return Process;
  }(); // bind model or list of model to function or process f
  // (simply call the bind method of Model)


  root.bind = function (m, f) {
    var i, len, q, results;

    if (m instanceof Model) {
      return m.bind(f);
    } else {
      results = [];

      for (q = 0, len = m.length; q < len; q++) {
        i = m[q];
        results.push(i.bind(f));
      }

      return results;
    }
  };

  spinalCore.register_models(Process);
  root.Process = Process; // Copyright 2015 SpinalCom - www.spinalcom.com
  // This file is part of SpinalCore.
  // Please read all of the following terms and conditions
  // of the Free Software license Agreement ("Agreement")
  // carefully.
  // This Agreement is a legally binding contract between
  // the Licensee (as defined below) and SpinalCom that
  // sets forth the terms and conditions that govern your
  // use of the Program. By installing and/or using the
  // Program, you agree to abide by all the terms and
  // conditions stated or referenced herein.
  // If you do not agree to abide by these terms and
  // conditions, do not demonstrate your acceptance and do
  // not install or use the Program.
  // You should have received a copy of the license along
  // with this file. If not, see
  // <http://resources.spinalcom.com/licenses.pdf>.
  // permits to bind a function to a model
  // f is the function which has to be binded
  // onchange_construction true means that onchange will be automatically called after after the bind

  root = typeof _root_obj === "undefined" ? global : window;

  BindProcess =
  /*#__PURE__*/
  function (_spinalCore$_def$Proc) {
    _inherits(BindProcess, _spinalCore$_def$Proc);

    function BindProcess(model, onchange_construction, f1) {
      var _this15;

      _classCallCheck(this, BindProcess);

      _this15 = _possibleConstructorReturn(this, _getPrototypeOf(BindProcess).call(this, model, onchange_construction));
      _this15.f = f1;
      return _this15;
    }

    _createClass(BindProcess, [{
      key: "onchange",
      value: function onchange() {
        return this.f();
      }
    }]);

    return BindProcess;
  }(spinalCore._def["Process"]);

  spinalCore.register_models(BindProcess);
  root.BindProcess = BindProcess; // Copyright 2015 SpinalCom  www.spinalcom.com
  // This file is part of SpinalCore.
  // SpinalCore is free software: you can redistribute it and/or modify
  // it under the terms of the GNU Lesser General Public License as published by
  // the Free Software Foundation, either version 3 of the License, or
  // (at your option) any later version.
  // SpinalCore is distributed in the hope that it will be useful,
  // but WITHOUT ANY WARRANTY; without even the implied warranty of
  // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  // GNU Lesser General Public License for more details.
  // You should have received a copy of the GNU General Public License
  // along with SpinalCore. If not, see <http://www.gnu.org/licenses/>.

  root = typeof _root_obj === "undefined" ? global : window; // create a new dom element
  //  nodeName to specify kind (div by default)
  //  parentNode to specify a parent
  //  style { ... }
  //  txt for a text node as a child
  //  other paramers are used to set directly set attributes

  root.new_dom_element = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var nodeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "div";
    var k, n, name, v, val;
    n = document.createElement(params.nodeName || nodeName);

    for (name in params) {
      val = params[name];

      switch (name) {
        case "parentNode":
          val.appendChild(n);
          break;

        case "nodeName":
          void 0;
          break;

        case "style":
          for (k in val) {
            v = val[k];
            n.style[k] = v;
          }

          break;

        case "txt":
          //r = new RegExp " ", "g"
          //n.appendChild document.createTextNode val.replace r, "\u00a0"
          n.innerHTML = val;
          break;

        default:
          n[name] = val;
      }
    }

    return n;
  }; // obj is a DOM object. src is a string or an array of
  //  string containing one or several classNames separated with spaces


  root.add_class = function (obj, src) {
    var old, p_1;

    if (typeof src === "string") {
      return add_class(obj, src.split(" "));
    }

    old = (obj.className || "").split(" ");
    p_1 = src.filter(function (x) {
      return indexOf.call(old, x) < 0;
    });
    return obj.className = old.concat(p_1).filter(function (x) {
      return x;
    }).join(" ");
  }; // obj is a DOM object. src is a string or an array of string
  //  containing one or several classNames separated with spaces


  root.rem_class = function (obj, src) {
    var old;

    if (typeof src === "string") {
      return rem_class(obj, src.split(" "));
    }

    old = (obj.className || "").split(" ");
    return obj.className = old.filter(function (x) {
      return indexOf.call(src, x) < 0;
    }).join(" ");
  }; // real position of an object


  root.get_left = function (l) {
    if (l.offsetParent != null) {
      return l.offsetLeft + get_left(l.offsetParent);
    } else {
      return l.offsetLeft;
    }
  }; // real position of an object


  root.get_top = function (l) {
    if (l.offsetParent != null) {
      return l.offsetTop + get_top(l.offsetParent);
    } else {
      return l.offsetTop;
    }
  }; // make msg popup
  // params:
  //   parent
  //   onclose
  //   title
  //   msg


  root.new_alert_msg =
  /*#__PURE__*/
  function () {
    function new_alert_msg() {
      var params1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, new_alert_msg);

      this.create_footer = this.create_footer.bind(this);
      this.params = params1;
      this.rotatating = true;
      this.deg = 40;
      this.in_rotation = false;
      this.background = new_dom_element({
        nodeName: 'div',
        style: {
          position: 'fixed',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(36, 42, 48, 0.38)',
          zIndex: 100000,
          textAlign: 'center'
        },
        onclick: function onclick(evt) {
          if (evt.target !== this.background) {
            return;
          }

          if (this.params.onclose != null) {
            this.params.onClose();
          }

          this.hide();

          if (typeof evt.stopPropagation === "function") {
            evt.stopPropagation();
          }

          if (typeof evt.preventDefault === "function") {
            evt.preventDefault();
          }

          if (typeof evt.stopImmediatePropagation === "function") {
            evt.stopImmediatePropagation();
          }

          return false;
        }
      });

      if (this.params.parent != null) {
        this.params.parent.appendChild(this.background);
      }

      this.popup = new_dom_element({
        nodeName: 'div',
        style: {
          marginTop: '30px',
          display: 'inline-block',
          width: '80%',
          backgroundColor: '#FFF',
          zIndex: 100001,
          borderRadius: '30px'
        }
      });
      this.background.appendChild(this.popup); // @create_header()

      this.create_content();
      this.create_footer();
    } // @content = new_dom_element()
    // @footer = new_dom_element()


    _createClass(new_alert_msg, [{
      key: "create_header",
      value: function create_header() {
        var _this16 = this;

        this.header = new_dom_element({
          style: {
            width: '100%',
            backgroundColor: "#1a2229",
            color: '#fff'
          }
        });
        this.popup.appendChild(this.header);
        this.title = new_dom_element({
          nodeName: 'span'
        });

        if (this.params.title != null) {
          this.title.innerHTML = this.params.title;
        }

        this.title_close = new_dom_element({
          nodeName: 'span',
          innerHTML: 'x',
          style: {
            display: 'block',
            float: 'right',
            position: 'relative',
            right: '10px',
            cursor: 'pointer'
          },
          onclick: function onclick(evt) {
            if (evt.target !== _this16.title_close) {
              return;
            }

            if (_this16.params.onclose != null) {
              _this16.params.onClose();
            }

            _this16.hide();

            if (typeof evt.stopPropagation === "function") {
              evt.stopPropagation();
            }

            if (typeof evt.preventDefault === "function") {
              evt.preventDefault();
            }

            if (typeof evt.stopImmediatePropagation === "function") {
              evt.stopImmediatePropagation();
            }

            return false;
          }
        });
        this.header.appendChild(this.title);
        return this.header.appendChild(this.title_close);
      }
    }, {
      key: "create_content",
      value: function create_content() {
        this.content = new_dom_element({
          style: {
            width: '100%',
            // backgroundColor: "#FFF"
            color: '#000',
            position: 'relative',
            padding: '15px',
            fontSize: 'xx-large'
          }
        });
        this.popup.appendChild(this.content);
        this.img = new_dom_element({
          nodeName: 'img',
          src: "data:image/gif;base64,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",
          style: {
            height: '35px',
            marginRight: '20px'
          }
        });

        this._loop_spinner_();

        this.content.appendChild(this.img);
        this.msg = new_dom_element({
          nodeName: 'span'
        }); // backgroundColor: "#FFF"
        // color: '#000'
        // position: 'relative'
        // padding: '15px'
        // height: 'calc(100vh - 270px)'
        // overflowY: 'auto'

        return this.content.appendChild(this.msg);
      }
    }, {
      key: "_loop_spinner_",
      value: function _loop_spinner_() {
        if (this.in_rotation === true) {
          return;
        }

        this.in_rotation = true;
        this.deg = this.deg + 360 + 1;
        this.img.style.WebkitTransitionDuration = '2.2s';
        this.img.style.webkitTransform = "rotate(".concat(this.deg, "deg)");
        this.img.style.transitionTimingFunction = 'linear';

        if (this.rotatating === true) {
          return setTimeout(function () {
            this.in_rotation = false;
            return this._loop_spinner_();
          }, 2000);
        } else {
          return this.in_rotation = false;
        }
      }
    }, {
      key: "create_footer",
      value: function create_footer() {
        var b, btn, d, len, q, ref, results;
        this.footer = new_dom_element({
          style: {
            width: '100%',
            // backgroundColor: "#FFF"
            color: '#000',
            position: 'relative',
            padding: '15px',
            height: '100px'
          }
        });
        this.popup.appendChild(this.footer);
        ref = this.params.btn;
        results = [];

        for (q = 0, len = ref.length; q < len; q++) {
          btn = ref[q];
          d = new_dom_element({
            style: {
              width: "".concat(100 / this.params.btn.length, "%"),
              paddingRight: '5px',
              paddingLeft: '5px',
              float: 'left'
            }
          });
          b = new_dom_element({
            nodeName: 'button',
            innerHTML: btn.txt,
            onclick: btn.click,
            style: {
              display: "inline-block",
              padding: "6px 12px",
              marginBottom: "0",
              fontSize: "x-large",
              fontWeight: "400",
              height: '70px',
              lineHeight: "1.42857143",
              textAlign: "center",
              whiteSpace: "nowrap",
              verticalAlign: "middle",
              touchAction: "manipulation",
              cursor: "pointer",
              userSelect: "none",
              border: "1px solid transparent",
              borderRadius: "4px",
              width: "100%",
              backgroundColor: btn.backgroundColor,
              color: "#fff"
            }
          });
          this.footer.appendChild(d);
          results.push(d.appendChild(b));
        }

        return results;
      }
    }, {
      key: "hide_btn",
      value: function hide_btn() {
        this.footer.style.display = 'none';
        return this.img.style.display = 'inline';
      }
    }, {
      key: "show_btn",
      value: function show_btn() {
        this.footer.style.display = 'block';
        return this.img.style.display = 'none';
      }
    }, {
      key: "hide",
      value: function hide() {
        this.background.style.display = 'none';
        return this.rotatating = false;
      }
    }, {
      key: "show",
      value: function show() {
        this.background.style.display = 'block';
        this.rotatating = true;
        return this._loop_spinner_();
      }
    }, {
      key: "setMsg",
      value: function setMsg(msg) {
        return this.msg.innerHTML = msg;
      }
    }]);

    return new_alert_msg;
  }(); // setTile: (msg) ->
  //   @popup.innerHTML = msg
  // make a popup window.
  // returns the creted "inside" div
  // clicking outside closes the window.
  // drag title permits to move he window
  // class names:
  //  - PopupTitle
  //  - PopupWindow
  // Possible params:
  //  - fixed_opacity (for the fixed background)
  //  - fixed_background (for the fixed background)
  //  - width
  //  - height
  //  - event
  //  - child -> child of the main div
  //  - onclose -> callback function


  _index_current_popup = 10000;

  spinal_new_popup = function spinal_new_popup(title) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _drag_end_func2, _drag_evt_func, b, clientX, clientY, close_element, extention, height, old_x, old_y, repos, res, t, top_x, top_y, w, width;

    if (params.popup_closer == null) {
      b = new_dom_element({
        parentNode: document.body,
        id: "popup_closer",
        onmousedown: function onmousedown() {
          if (typeof params.onclose === "function") {
            params.onclose();
          }

          document.body.removeChild(b);
          return document.body.removeChild(w);
        },
        ondrop: function ondrop(evt) {
          if (!evt) {
            evt = window.event;
          }

          evt.cancelBubble = true;

          if (typeof evt.stopPropagation === "function") {
            evt.stopPropagation();
          }

          if (typeof evt.preventDefault === "function") {
            evt.preventDefault();
          }

          if (typeof evt.stopImmediatePropagation === "function") {
            evt.stopImmediatePropagation();
          }

          return false;
        },
        style: {
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: params.fixed_opacity || "#000",
          opacity: params.fixed_opacity || 0,
          zIndex: _index_current_popup
        }
      });
    }

    if (params.event != null && params.event.clientX) {
      //testing clientX to differenciate keyboards event
      clientX = params.event.clientX;
      clientY = params.event.clientY;
    } else {
      clientX = window.innerWidth / 2 - 10;
      clientY = window.innerHeight / 2 - 10;
    }

    top_x = params.top_x || -1000;
    top_y = params.top_y || -1000;
    old_x = 0;
    old_y = 0;
    w = void 0;

    if (params.width != null) {
      width = params.width;
    }

    if (params.height != null) {
      height = params.height;
    } //alert "top: " + top_y + " left: " + top_x + " width: " +  width + " height: " + height


    repos = function repos() {
      top_x = clientX - w.clientWidth / 2;
      top_y = clientY - w.clientHeight / 2;

      if (top_x + w.clientWidth > window.innerWidth) {
        top_x = window.innerWidth - w.clientWidth - 50;
      }

      if (top_y + w.clientHeight > window.innerHeight) {
        top_y = window.innerHeight - w.clientHeight + 50;
      }

      if (top_x < 50) {
        top_x = 50;
      }

      if (top_y < 50) {
        top_y = 50;
      }

      w.style.left = top_x;
      return w.style.top = top_y;
    }; //alert "top: " + top_y + " left: " + top_x + " width: " +  width + " height: " + height


    _drag_evt_func = function _drag_evt_func(evt) {
      top_x += evt.clientX - old_x;
      top_y += evt.clientY - old_y;
      w.style.left = top_x;
      w.style.top = top_y;
      old_x = evt.clientX;
      old_y = evt.clientY;
      return typeof evt.preventDefault === "function" ? evt.preventDefault() : void 0;
    };

    _drag_end_func2 = function _drag_end_func(evt) {
      if (typeof document.detachEvent === "function") {
        document.detachEvent("onmousemove", _drag_evt_func);
      }

      if (typeof document.detachEvent === "function") {
        document.detachEvent("onmouseup", _drag_end_func2);
      }

      if (typeof document.removeEventListener === "function") {
        document.removeEventListener("mousemove", _drag_evt_func, true);
      }

      return typeof document.removeEventListener === "function" ? document.removeEventListener("mouseup", _drag_end_func2, true) : void 0;
    };

    extention = "px";

    if (!params.top_x) {
      setTimeout(repos, 1);
      extention = "%";
    }

    w = new_dom_element({
      parentNode: document.body,
      className: "Popup",
      style: {
        position: "absolute",
        left: top_x,
        top: top_y,
        width: width + extention,
        height: height + extention,
        zIndex: _index_current_popup + 1,
        border: 'thin solid black',
        background: '#e5e5e5',
        resize: 'both',
        overflow: 'auto',
        paddingBottom: '8px'
      }
    });
    _index_current_popup += 2;
    close_element = new_dom_element({
      parentNode: w,
      className: "PopupClose",
      txt: "Close",
      style: {
        float: 'right',
        marginRight: '4px',
        marginTop: '4px',
        cursor: 'pointer'
      },
      onmousedown: function onmousedown(evt) {
        if (typeof params.onclose === "function") {
          params.onclose();
        }

        if (b != null) {
          document.body.removeChild(b);
        }

        return document.body.removeChild(w);
      }
    });

    if (title) {
      t = new_dom_element({
        parentNode: w,
        className: "PopupTitle",
        innerHTML: title,
        style: {
          background: '#262626',
          padding: '5 10 3 10',
          height: '22px',
          fontSize: '12px',
          borderBottom: 'thin solid black',
          cursor: 'pointer',
          color: 'white'
        },
        onmousedown: function onmousedown(evt) {
          old_x = evt.clientX;
          old_y = evt.clientY;
          top_x = parseInt(w.style.left);
          top_y = parseInt(w.style.top);
          document.addEventListener("mousemove", _drag_evt_func, true);
          document.addEventListener("mouseup", _drag_end_func2, true);
          return typeof evt.preventDefault === "function" ? evt.preventDefault() : void 0;
        }
      });
    }

    res = new_dom_element({
      parentNode: w,
      className: "PopupWindow",
      style: {
        padding: "6px",
        height: '100%',
        color: '#262626'
      }
    });

    if (params.child != null) {
      res.appendChild(params.child);
    }

    return res;
  };
}).call(this);

},{"url":"../node_modules/url/url.js","xhr2":"../node_modules/xhr2/lib/browser.js","process":"../node_modules/process/browser.js"}],"../node_modules/spinal-core-connectorjs_type/dist/connectorTS.js":[function(require,module,exports) {
/* tslint:disable:variable-name  class-name */

},{}],"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js":[function(require,module,exports) {
var global = arguments[3];
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("./connectorTS");
const spinalCore = require("spinal-core-connectorjs");
exports.spinalCore = spinalCore;
/// <reference types="typescript" />
/* tslint:disable:variable-name  class-name */
const Model = spinalCore._def.Model;
exports.Model = Model;
const Str = spinalCore._def.Str;
exports.Str = Str;
const Bool = spinalCore._def.Bool;
exports.Bool = Bool;
const Val = spinalCore._def.Val;
exports.Val = Val;
const Lst = spinalCore._def.Lst;
exports.Lst = Lst;
const Directory = spinalCore._def.Directory;
exports.Directory = Directory;
const Vec = spinalCore._def.Vec;
exports.Vec = Vec;
const Path = spinalCore._def.Path;
exports.Path = Path;
const File = spinalCore._def.File;
exports.File = File;
const Ptr = spinalCore._def.Ptr;
exports.Ptr = Ptr;
const Choice = spinalCore._def.Choice;
exports.Choice = Choice;
const TypedArray = spinalCore._def.TypedArray;
exports.TypedArray = TypedArray;
const TypedArray_Int32 = spinalCore._def.TypedArray_Int32;
exports.TypedArray_Int32 = TypedArray_Int32;
const TypedArray_Float64 = spinalCore._def.TypedArray_Float64;
exports.TypedArray_Float64 = TypedArray_Float64;
const Process = spinalCore._def.Process;
exports.Process = Process;
const BindProcess = spinalCore._def.BindProcess;
exports.BindProcess = BindProcess;
const globalAny = typeof window === 'undefined' ? global : window;
const FileSystem = globalAny.FileSystem;
exports.FileSystem = FileSystem;
const Pbr = spinalCore._def.Pbr;
exports.Pbr = Pbr;
exports.default = spinalCore;

},{"./connectorTS":"../node_modules/spinal-core-connectorjs_type/dist/connectorTS.js","spinal-core-connectorjs":"../node_modules/spinal-core-connectorjs/lib/spinalcore.node.js"}],"../node_modules/spinal-model-graph/dist/src/Utilities.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/**
 * Generates a random number and returns in a string.
 * @returns {String} Random number in a string
 */
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
/**
 * Creates a unique id based on a name.
 * @param {string} name Name from wich the id is generated
 * @returns {string} Generated id
 */
function guid(name) {
    return name + "-" + (s4() + s4()) + "-" + s4() + "-" + s4() + "-" + s4() + "-" + (s4() + s4() + s4()) + "-" + Date.now().toString(16);
}
exports.guid = guid;
function loadRelation(spinalNodePointer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, spinalNodePointer.load().then(function (relation) {
                    return relation.parent.load();
                })];
        });
    });
}
exports.loadRelation = loadRelation;

},{}],"../node_modules/spinal-model-graph/dist/src/SpinalMap.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
// tslint:disable:function-name
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
/**
 * @class SpinalMap
 * @extends {Model}
 * @template T
 */
var SpinalMap = /** @class */ (function (_super) {
    __extends(SpinalMap, _super);
    /**
     * Constructor for the SpinalMap class.
     * @param {Array<ArrayPairStringAny>} [init] Array of arrays of key-value pairs
     * @throws {TypeError} If init is not iterable
     * @throws {TypeError} If init[Symbol.iterator] doesn't return iterators
     * @throws {TypeError} If the values of the iterators are not arrays of key values
     * @throws {TypeError} If the keys of the values of the iterators are not strings
     * @memberof SpinalMap
     */
    function SpinalMap(init) {
        var e_1, _a;
        var _this = _super.call(this) || this;
        if (init !== undefined) {
            try {
                for (var init_1 = __values(init), init_1_1 = init_1.next(); !init_1_1.done; init_1_1 = init_1.next()) {
                    var _b = __read(init_1_1.value, 2), key = _b[0], value = _b[1];
                    _this.setElement(key, value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (init_1_1 && !init_1_1.done && (_a = init_1["return"])) _a.call(init_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return _this;
    }
    /**
     * Sets the value corresponding to the key.
     * @param {string} key Key to the value
     * @param {T} value New value
     * @throws {TypeError} If the key is not a string
     * @memberof SpinalMap
     */
    SpinalMap.prototype.setElement = function (key, value) {
        var _a;
        if (typeof key !== 'string' && typeof key !== 'number') {
            throw TypeError('The key must be a string or a number');
        }
        this.rem_attr(key);
        var attribute = (_a = {},
            _a[key] = value,
            _a);
        this.add_attr(attribute);
    };
    /**
     * Returns the value associated to the key, or undefined if there is none.
     * @param {string} key Key to the value
     * @returns {T} Value corresponding to the key
     * @memberof SpinalMap
     */
    SpinalMap.prototype.getElement = function (key) {
        return this[key];
    };
    /**
     * Returns a boolean asserting whether a value has been associated to the key or not.
     * @param {string} key
     * @returns {boolean} Return true if the key exists
     * @throws {TypeError} If the key is not a string
     * @memberof SpinalMap
     */
    SpinalMap.prototype.has = function (key) {
        if (typeof key !== 'string' && typeof key !== 'number') {
            throw TypeError('The key must be a string or a number');
        }
        return this._attribute_names.includes(key);
    };
    /**
     * Returns a boolean asserting whether the map contains any key.
     * @returns {boolean} Return true if the map contains at least one key
     * @memberof SpinalMap
     */
    SpinalMap.prototype.hasKey = function () {
        return this._attribute_names.length > 0;
    };
    /**
     * Returns an array that contains the keys for each element in the map in insertion order.
     * @returns {string[]} Array containing all the keys in the map
     * @memberof SpinalMap
     */
    SpinalMap.prototype.keys = function () {
        return this._attribute_names;
    };
    /**
     * Returns an array that contains the keys and the values
     * for each element in the map in insertion order.
     * @returns {Array<Array<string,T>>} Array containing all the keys and values in the map
     * @memberof SpinalMap
     */
    SpinalMap.prototype.entries = function () {
        var e_2, _a;
        var arr = [];
        try {
            for (var _b = __values(this.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                arr.push([key, this.getElement(key)]);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return arr;
    };
    /**
     * Deletes an element.
     * @param {string} key Key of the element
     * @throws {TypeError} If the key is not a string
     * @throws {Error} If the key is not in the map
     * @memberof SpinalMap
     */
    SpinalMap.prototype["delete"] = function (key) {
        if (!this.has(key)) {
            throw Error("The key doesn't exist");
        }
        this.rem_attr(key);
    };
    /**
     * Deletes all elements.
     * @memberof SpinalMap
     */
    SpinalMap.prototype.clear = function () {
        var keys = this.keys();
        while (keys[0]) {
            this["delete"](keys[0]);
        }
    };
    /**
     * Applies a function to each of the values in the map.
     * @param {SpinalMapForEachFunc<T>} fun Funcion to apply
     * @memberof SpinalMap
     */
    SpinalMap.prototype.forEach = function (fun) {
        var e_3, _a;
        if (typeof fun !== 'function') {
            throw TypeError('The callback must be a function');
        }
        try {
            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                fun(value, key);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    /**
     * Function to iterate over the map object.
     * @returns {IterableIterator<T>}
     * @memberof SpinalMap
     */
    SpinalMap.prototype[Symbol.iterator] = function () {
        var keys, keys_1, keys_1_1, key, e_4_1;
        var e_4, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    keys = this.keys();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    keys_1 = __values(keys), keys_1_1 = keys_1.next();
                    _b.label = 2;
                case 2:
                    if (!!keys_1_1.done) return [3 /*break*/, 5];
                    key = keys_1_1.value;
                    return [4 /*yield*/, [key, this[key]]];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    keys_1_1 = keys_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_4_1 = _b.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (keys_1_1 && !keys_1_1.done && (_a = keys_1["return"])) _a.call(keys_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    };
    return SpinalMap;
}(spinal_core_connectorjs_type_1.Model));
exports.SpinalMap = SpinalMap;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalMap]);
exports["default"] = SpinalMap;

},{"spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js"}],"../node_modules/spinal-model-graph/dist/src/Relations/BaseSpinalRelation.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
// tslint:disable:function-name
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var Utilities_1 = require("../Utilities");
var __1 = require("..");
var SpinalNodePointer_1 = require("../SpinalNodePointer");
var SpinalMap_1 = require("../SpinalMap");
/**
 * Base for all relation in a SpinalGraph.
 * @extends Model
 * @abstract
 * @property {spinal.Str} name
 * @property {spinal.Str} id
 * @property {SpinalNodePointer<SpinalNode>} parent
 * @property {SpinalMap<spinal.Val>} contextIds
 */
var BaseSpinalRelation = /** @class */ (function (_super) {
    __extends(BaseSpinalRelation, _super);
    /**
     * Constructor for the BaseSpinalRelation class.
     * @param {SpinalNode<spinal.Model>} parent Parent of the relation
     * @param {string} name Name of the relation
     * @throws {TypeError} If the parent is not a node
     * @throws {TypeError} If the name is not a string
     */
    function BaseSpinalRelation(parent, name) {
        var _this = _super.call(this) || this;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return _this;
        // instanceof doesn't work here
        if (!__1.SpinalNode.prototype.isPrototypeOf(parent)) {
            throw TypeError('parent must be a node');
        }
        if (typeof name !== 'string') {
            throw TypeError('name must be a string');
        }
        _this.add_attr({
            name: name,
            id: Utilities_1.guid(name),
            parent: new SpinalNodePointer_1.SpinalNodePointer(parent, true),
            contextIds: new SpinalMap_1.SpinalMap()
        });
        return _this;
    }
    /**
     * Shortcut to id.
     * @returns {spinal.Str} Id of the relation
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype.getId = function () {
        return this.id;
    };
    /**
     * Returns the name of the relation.
     * @returns {spinal.Str} Name of the relation
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype.getName = function () {
        return this.name;
    };
    /**
     * Returns the parent of the relation.
     * @returns {Promise<SpinalNode<spinal.Model>>} Returns a promise where the resolve is the parent
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype.getParent = function () {
        return this.parent.load();
    };
    /**
     * Adds an id to the context ids of the relation.
     * @param {string} id Id of the context
     * @throws {TypeError} If the id is not a string
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype.addContextId = function (id) {
        if (typeof id !== 'string') {
            throw TypeError('id must be a string');
        }
        if (!this.contextIds.has(id)) {
            this.contextIds.setElement(id, new spinal_core_connectorjs_type_1.Val(0));
        }
    };
    /**
     * Returns a list of the contexts the relation is associated to.
     * @returns {Array<string>} A list of ids of the associated contexts
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype.getContextIds = function () {
        return this.contextIds.keys();
    };
    /**
     * Returns true if the relation belongs to the context.
     * @param {SpinalContext<T>} context The context that might own the node
     * @returns {boolean} A boolean
     * @throws {TypeError} If the context is not a SpinalContext
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype.belongsToContext = function (context) {
        if (!(context instanceof __1.SpinalContext)) {
            throw TypeError('context must be a SpinalContext');
        }
        return this.contextIds.has(context.getId().get());
    };
    /**
     * Removes children from the relation.
     * @param {Array<SpinalNode<spinal.Model>>} [nodesToDelete=[]] Childs to remove
     * @returns {Promise<void>} An empty promise
     * @throws {TypeError} If nodes is not an array or omitted
     * @throws {Error} If one of the nodes is not a child
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype.removeChildren = function (nodesToDelete) {
        if (nodesToDelete === void 0) { nodesToDelete = []; }
        return __awaiter(this, void 0, void 0, function () {
            var nodes, promises, nodes_1, nodes_1_1, node, _a;
            var e_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        nodes = nodesToDelete;
                        promises = [];
                        if (!Array.isArray(nodes)) {
                            throw TypeError('node must be an array');
                        }
                        if (!(nodes.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getChildren()];
                    case 1:
                        nodes = _c.sent();
                        _c.label = 2;
                    case 2:
                        try {
                            for (nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                                node = nodes_1_1.value;
                                promises.push(this.removeChild(node));
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (nodes_1_1 && !nodes_1_1.done && (_b = nodes_1["return"])) _b.call(nodes_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, Promise.all(promises)];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _c.sent();
                        throw Error('Could not remove all nodes');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes the relation from the graph.
     * @returns {Promise<void>} An empty promise
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype.removeFromGraph = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this._removeFromParent(),
                            this.removeChildren(),
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes the relation from the parent.
     * @returns {Promise<void>} An empty promise
     * @private
     * @memberof BaseSpinalRelation
     */
    BaseSpinalRelation.prototype._removeFromParent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var parent, relationMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getParent()];
                    case 1:
                        parent = _a.sent();
                        relationMap = parent._getChildrenType(this.getType());
                        relationMap["delete"](this.getName().get());
                        this.parent.unset();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BaseSpinalRelation;
}(spinal_core_connectorjs_type_1.Model));
exports.BaseSpinalRelation = BaseSpinalRelation;
spinal_core_connectorjs_type_1.spinalCore.register_models([BaseSpinalRelation]);
exports["default"] = BaseSpinalRelation;

},{"spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js","../Utilities":"../node_modules/spinal-model-graph/dist/src/Utilities.js","..":"../node_modules/spinal-model-graph/dist/src/index.js","../SpinalNodePointer":"../node_modules/spinal-model-graph/dist/src/SpinalNodePointer.js","../SpinalMap":"../node_modules/spinal-model-graph/dist/src/SpinalMap.js"}],"../node_modules/spinal-model-graph/dist/src/SpinalNodePointer.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var SpinalNode_1 = require("./Nodes/SpinalNode");
var BaseSpinalRelation_1 = require("./Relations/BaseSpinalRelation");
/**
 * Wrapper over SpinalNodePointer containing some information about the pointed element
 * @class SpinalNodePointer
 * @extends {Model}
 * @template T extends spinal.Model
 */
var SpinalNodePointer = /** @class */ (function (_super) {
    __extends(SpinalNodePointer, _super);
    /**
     * Constructor for the SpinalNodePointer class.
     * @param {T} element Element to wich the SpinalNodePointer will point
     * @param blockRights determine if the pointer is a pbr
     * @memberof SpinalNodePointer
     */
    function SpinalNodePointer(element, blockRights) {
        if (blockRights === void 0) { blockRights = false; }
        var _this = _super.call(this) || this;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return _this;
        _this.add_attr({
            ptr: blockRights ? new spinal_core_connectorjs_type_1.Pbr() : new spinal_core_connectorjs_type_1.Ptr(),
            info: {}
        });
        _this.setElement(element);
        return _this;
    }
    /**
     * Sets pointer to point to an element.
     * @param {T} element Element to point to
     * @throws {TypeError} If the element is not a Model
     * @memberof SpinalNodePointer
     */
    SpinalNodePointer.prototype.setElement = function (element) {
        if (!(element instanceof spinal_core_connectorjs_type_1.Model)) {
            throw TypeError('The pointed value must be a Model');
        }
        if (element instanceof SpinalNode_1.SpinalNode || element instanceof BaseSpinalRelation_1.BaseSpinalRelation) {
            this.info.mod_attr('pointedId', element.getId());
            this.info.mod_attr('pointedType', element.getType());
        }
        this.ptr.set(element);
    };
    /**
     * Loads the model to which the pointer is pointing.
     * @returns {Promise<T>} The model to which the pointer is pointing
     * @memberof SpinalNodePointer
     */
    SpinalNodePointer.prototype.load = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.ptr) {
                if (_this.ptr.data.model)
                    return resolve(_this.ptr.data.model);
                if (_this.ptr.data.value) {
                    if (typeof spinal_core_connectorjs_type_1.FileSystem._objects[_this.ptr.data.value] !== 'undefined') {
                        return resolve(spinal_core_connectorjs_type_1.FileSystem._objects[_this.ptr.data.value]);
                    }
                    if (typeof spinal_core_connectorjs_type_1.FileSystem._tmp_objects[_this.ptr.data.value] !== 'undefined') {
                        return resolve(spinal_core_connectorjs_type_1.FileSystem._tmp_objects[_this.ptr.data.value]);
                    }
                }
            }
            _this.ptr.load(resolve);
        });
    };
    /**
     * Unsets the pointer. The pointer shouldn't be used after that.
     * @memberof SpinalNodePointer
     */
    SpinalNodePointer.prototype.unset = function () {
        this.info.rem_attr('pointedId');
        this.info.rem_attr('pointedType');
        this.ptr.set(0);
    };
    /**
     * Returns the id of the pointed element.
     * @returns {spinal.Str}  Id of the pointed element
     * @memberof SpinalNodePointer
     */
    SpinalNodePointer.prototype.getId = function () {
        return this.info.pointedId;
    };
    /**
     * This function returns the type of the pointed element.
     * @returns {spinal.Str} Type of the pointed element
     * @memberof SpinalNodePointer
     */
    SpinalNodePointer.prototype.getType = function () {
        return this.info.pointedType;
    };
    return SpinalNodePointer;
}(spinal_core_connectorjs_type_1.Model));
exports.SpinalNodePointer = SpinalNodePointer;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalNodePointer]);
exports["default"] = SpinalNodePointer;

},{"spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js","./Nodes/SpinalNode":"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalNode.js","./Relations/BaseSpinalRelation":"../node_modules/spinal-model-graph/dist/src/Relations/BaseSpinalRelation.js"}],"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationRef.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var BaseSpinalRelation_1 = require("./BaseSpinalRelation");
var SpinalRelationFactory_1 = require("./SpinalRelationFactory");
var index_1 = require("../index");
/**
 * Relation where the children are in a Lst.
 * @class SpinalRelationRef
 * @extends {BaseSpinalRelation}
 * @property {spinal.Str} name
 * @property {spinal.Str} id
 * @property {SpinalNodePointer<SpinalNode>} parent
 * @property {SpinalMap<spinal.Val>} contextIds
 * @property {spinal.Lst<SpinalNode>} children
 */
var SpinalRelationRef = /** @class */ (function (_super) {
    __extends(SpinalRelationRef, _super);
    /**
     * Constructor for the SpinalRelationRef class.
     * @param {SpinalNode} parent Parent of the relation
     * @param {string} name Name of the relation
     * @throws {TypeError} If the parent is not a node
     * @throws {TypeError} If the name is not a string
     * @memberof SpinalRelationRef
     */
    function SpinalRelationRef(parent, name) {
        var _this = _super.call(this, parent, name) || this;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return _this;
        _this.add_attr({
            children: new spinal_core_connectorjs_type_1.Lst()
        });
        return _this;
    }
    /**
     * Retrieves all the ids of the children of the relation and return them inside an array.
     * @returns {String[]} Array containing all the children ids of the relation
     * @memberof SpinalRelationRef
     */
    SpinalRelationRef.prototype.getChildrenIds = function () {
        var res = [];
        for (var i = 0; i < this.children.length; i += 1) {
            res.push(this.children[i].getId().get());
        }
        return res;
    };
    /**
   * returns the number of children of the relation.
   * @returns {number}
   * @memberof SpinalRelationRef
   */
    SpinalRelationRef.prototype.getNbChildren = function () {
        return this.children.length;
    };
    /**
     * Return all the children of the relation.
     * @returns {Promise<Array<SpinalNodeAny>>} The children of the relation
     * @memberof SpinalRelationRef
     */
    SpinalRelationRef.prototype.getChildren = function () {
        var children = [];
        for (var i = 0; i < this.children.length; i += 1) {
            children.push(this.children[i]);
        }
        return Promise.resolve(children);
    };
    /**
     * Return all the children of the relation associated to a certain context.
     * @param {SpinalContext} context The context to use for the search
     * @returns {Promise<SpinalNode[]>} The children of the relation associated to the context
     * @throws {TypeError} If the context is not a SpinalContext
     * @memberof SpinalRelationRef
     */
    SpinalRelationRef.prototype.getChildrenInContext = function (context) {
        var children = [];
        if (!(context instanceof index_1.SpinalContext)) {
            return Promise.reject(TypeError('context must be a SpinalContext'));
        }
        for (var i = 0; i < this.children.length; i += 1) {
            var child = this.children[i];
            if (child.belongsToContext(context)) {
                children.push(child);
            }
        }
        return Promise.resolve(children);
    };
    /**
     * Returns the type of the relation.
     * @returns {string} Type of the relation
     * @memberof SpinalRelationRef
     */
    SpinalRelationRef.prototype.getType = function () {
        return SpinalRelationFactory_1.SPINAL_RELATION_TYPE;
    };
    /**
     * Adds a child to the relation.
     * @template T extends spinal.Model = Node Element Type
     * @param {(T|SpinalNode<T>)} node Node or model to add
     * @throws {TypeError} If the node is not a Model
     * @throws {Error} If the node is already a child of the relation
     * @returns {Promise<SpinalNode<T>>} Promise containing the node that was added
     * @memberof SpinalRelationRef
     */
    SpinalRelationRef.prototype.addChild = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeCreate, tmpNodeCreate;
            return __generator(this, function (_a) {
                nodeCreate = node;
                if (!(node instanceof spinal_core_connectorjs_type_1.Model)) {
                    throw new TypeError('Cannot add a child witch is not an instance of SpinalNode or Model.');
                }
                else if (!(node instanceof index_1.SpinalNode)) {
                    nodeCreate = new index_1.SpinalNode(undefined, undefined, node);
                }
                tmpNodeCreate = nodeCreate;
                if (this.getChildrenIds().indexOf(tmpNodeCreate.getId().get()) !== -1) {
                    throw new Error('Cannot add a child twice to the same relation.');
                }
                this.children.push(tmpNodeCreate);
                tmpNodeCreate._addParent(this);
                return [2 /*return*/, tmpNodeCreate];
            });
        });
    };
    /**
     * Removes a child from the relation.
     * @param {SpinalNode} node Child to remove
     * @returns {Promise<void>} An empty promise
     * @throws {Error} If the given node is not a child
     * @memberof SpinalRelationRef
     */
    SpinalRelationRef.prototype.removeChild = function (node) {
        if (!this.children.contains(node)) {
            return Promise.reject(Error('The node is not a child'));
        }
        node._removeParent(this);
        this.children.remove(node);
        return Promise.resolve();
    };
    return SpinalRelationRef;
}(BaseSpinalRelation_1.BaseSpinalRelation));
exports.SpinalRelationRef = SpinalRelationRef;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalRelationRef]);
exports["default"] = SpinalRelationRef;

},{"spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js","./BaseSpinalRelation":"../node_modules/spinal-model-graph/dist/src/Relations/BaseSpinalRelation.js","./SpinalRelationFactory":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationFactory.js","../index":"../node_modules/spinal-model-graph/dist/src/index.js"}],"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationLstPtr.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var BaseSpinalRelation_1 = require("./BaseSpinalRelation");
var SpinalRelationFactory_1 = require("./SpinalRelationFactory");
var index_1 = require("../index");
var SpinalNodePointer_1 = require("../SpinalNodePointer");
/**
 * Relation where the children are in Lst of Ptr.
 * @extends BaseSpinalRelation
 * @property {spinal.Str} name
 * @property {spinal.Str} id
 * @property {SpinalNodePointer<SpinalNode>} parent
 * @property {SpinalMap<spinal.Val>} contextIds
 * @property {spinal.Lst<SpinalNodePointer<SpinalNode>>} children
 */
var SpinalRelationLstPtr = /** @class */ (function (_super) {
    __extends(SpinalRelationLstPtr, _super);
    /**
     * Constructor for the SpinalRelationLstPtr class.
     * @param {SpinalNodeAny} parent Parent of the relation
     * @param {string} name Name of the relation
     * @throws {TypeError} If the parent is not a node
     * @throws {TypeError} If the name is not a string
     * @memberof SpinalRelationLstPtr
     */
    function SpinalRelationLstPtr(parent, name) {
        var _this = _super.call(this, parent, name) || this;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return _this;
        _this.add_attr({
            children: new spinal_core_connectorjs_type_1.Lst()
        });
        return _this;
    }
    /**
     * Retrieves all the ids of the children of the relation and return them inside an array.
     * @returns {string[]} Array containing all the children ids of the relation
     * @memberof SpinalRelationLstPtr
     */
    SpinalRelationLstPtr.prototype.getChildrenIds = function () {
        var res = [];
        for (var i = 0; i < this.children.length; i += 1) {
            res.push(this.children[i].getId().get());
        }
        return res;
    };
    /**
   * returns the number of children of the relation.
   * @returns {number}
   * @memberof SpinalRelationLstPtr
   */
    SpinalRelationLstPtr.prototype.getNbChildren = function () {
        return this.children.length;
    };
    /**
     * Return all the children of the relation.
     * @returns {Promise<SpinalNode[]>} The children of the relation
     * @memberof SpinalRelationLstPtr
     */
    SpinalRelationLstPtr.prototype.getChildren = function () {
        var promises = [];
        for (var i = 0; i < this.children.length; i += 1) {
            var ptr = this.children[i];
            promises.push(ptr.load());
        }
        return Promise.all(promises);
    };
    /**
     * Return all the children of the relation associated to a certain context.
     * @returns {Promise<SpinalNodeAny[]>} The children of the relation
     * @throws {TypeError} If the context is not a SpinalContext
     * @memberof SpinalRelationLstPtr
     */
    SpinalRelationLstPtr.prototype.getChildrenInContext = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, i, ptr, children;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        if (!(context instanceof index_1.SpinalContext)) {
                            return [2 /*return*/, Promise.reject(TypeError('context must be a SpinalContext'))];
                        }
                        for (i = 0; i < this.children.length; i += 1) {
                            ptr = this.children[i];
                            promises.push(ptr.load());
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        children = _a.sent();
                        return [2 /*return*/, children.filter(function (child) { return child.belongsToContext(context); })];
                }
            });
        });
    };
    /**
     * Returns the type of the relation.
     * @returns {string} Type of the relation
     * @memberof SpinalRelationLstPtr
     */
    SpinalRelationLstPtr.prototype.getType = function () {
        return SpinalRelationFactory_1.SPINAL_RELATION_LST_PTR_TYPE;
    };
    /**
     * Adds a child to the relation.
     * @template T extends spinal.Model = Node Element Type
     * @param {(T|SpinalNode<T>)} node Node or model to add
     * @throws {TypeError} If the node is not a Model
     * @throws {Error} If the node is already a child of the relation
     * @returns {Promise<SpinalNode<T>>} Promise containing the node that was added
     * @memberof SpinalRelationLstPtr
     */
    SpinalRelationLstPtr.prototype.addChild = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeCreate, tmpNodeCreate;
            return __generator(this, function (_a) {
                nodeCreate = node;
                if (!(node instanceof spinal_core_connectorjs_type_1.Model)) {
                    throw new Error('Cannot add a child witch is not an instance of SpinalNode or Model.');
                }
                else if (!(node instanceof index_1.SpinalNode)) {
                    nodeCreate = new index_1.SpinalNode(undefined, undefined, node);
                }
                if (this.getChildrenIds().indexOf(nodeCreate.getId().get()) !== -1) {
                    throw new Error('Cannot add a child twice to the same relation.');
                }
                tmpNodeCreate = nodeCreate;
                tmpNodeCreate._addParent(this);
                this.children.push(new SpinalNodePointer_1.SpinalNodePointer(tmpNodeCreate));
                return [2 /*return*/, tmpNodeCreate];
            });
        });
    };
    /**
     * Removes a child from the relation.
     * @param {SpinalNodeAny} node Child to remove
     * @returns {Promise<void>} An empty promise
     * @throws {Error} If the given node is not a child
     * @memberof SpinalRelationLstPtr
     */
    SpinalRelationLstPtr.prototype.removeChild = function (node) {
        var found = false;
        for (var i = 0; i < this.children.length; i += 1) {
            if (this.children[i].getId() === node.getId()) {
                this.children.splice(i, 1);
                found = true;
                break;
            }
        }
        if (!found) {
            return Promise.reject(Error('The node is not a child'));
        }
        node._removeParent(this);
        return Promise.resolve();
    };
    return SpinalRelationLstPtr;
}(BaseSpinalRelation_1.BaseSpinalRelation));
exports.SpinalRelationLstPtr = SpinalRelationLstPtr;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalRelationLstPtr]);
exports["default"] = SpinalRelationLstPtr;

},{"spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js","./BaseSpinalRelation":"../node_modules/spinal-model-graph/dist/src/Relations/BaseSpinalRelation.js","./SpinalRelationFactory":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationFactory.js","../index":"../node_modules/spinal-model-graph/dist/src/index.js","../SpinalNodePointer":"../node_modules/spinal-model-graph/dist/src/SpinalNodePointer.js"}],"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationPtrLst.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var BaseSpinalRelation_1 = require("./BaseSpinalRelation");
var SpinalRelationFactory_1 = require("./SpinalRelationFactory");
var index_1 = require("../index");
var SpinalNodePointer_1 = require("../SpinalNodePointer");
/**
 * Relation where the children are in Ptr to a Lst.
 * @class SpinalRelationPtrLst
 * @extends {BaseSpinalRelation}
 * @property {spinal.Str} name
 * @property {spinal.Str} id
 * @property {SpinalNodePointer<SpinalNodeAny>} parent
 * @property {SpinalMap<spinal.Val>} contextIds
 * @property {SpinalRelationPtrLstNodePointer} children
 */
var SpinalRelationPtrLst = /** @class */ (function (_super) {
    __extends(SpinalRelationPtrLst, _super);
    /**
     * Constructor for the SpinalRelationPtrLst class.
     * @param {SpinalNode} parent Parent of the relation
     * @param {string} name Name of the relation
     * @throws {TypeError} If the parent is not a node
     * @throws {TypeError} If the name is not a string
     */
    function SpinalRelationPtrLst(parent, name) {
        var _this = _super.call(this, parent, name) || this;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return _this;
        _this.add_attr({
            children: new SpinalNodePointer_1.SpinalNodePointer(new spinal_core_connectorjs_type_1.Lst())
        });
        _this.children.info.add_attr('ids', new spinal_core_connectorjs_type_1.Lst());
        return _this;
    }
    /**
     * Retrieves all the ids of the children of the relation and return them inside an array.
     * @returns {String[]} Array containing all the children ids of the relation
     * @memberof SpinalRelationPtrLst
     */
    SpinalRelationPtrLst.prototype.getChildrenIds = function () {
        var idLst = this.children.info.ids;
        var ids = [];
        for (var i = 0; i < idLst.length; i += 1) {
            ids.push(idLst[i].get());
        }
        return ids;
    };
    /**
     * returns the number of children of the relation.
     * @returns {number}
     * @memberof SpinalRelationPtrLst
     */
    SpinalRelationPtrLst.prototype.getNbChildren = function () {
        return this.children.info.ids.length;
    };
    /**
     * Return all the children of the relation.
     * @returns {Promise<SpinalNodeAny[]>} The children of the relation
     * @memberof SpinalRelationPtrLst
     */
    SpinalRelationPtrLst.prototype.getChildren = function () {
        return __awaiter(this, void 0, void 0, function () {
            var childrenLst, children, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.children.load()];
                    case 1:
                        childrenLst = _a.sent();
                        children = [];
                        for (i = 0; i < childrenLst.length; i += 1) {
                            children.push(childrenLst[i]);
                        }
                        return [2 /*return*/, children];
                }
            });
        });
    };
    /**
     * Return all the children of the relation associated to a certain context.
     * @param {SpinalContext} context Context to use for the search
     * @returns {Promise<Array<SpinalNodeAny>>} The children associated to the context
     * @throws {TypeError} If the context is not a SpinalContext
     * @memberof SpinalRelationPtrLst
     */
    SpinalRelationPtrLst.prototype.getChildrenInContext = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var childrenLst, children, i, child;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.children.load()];
                    case 1:
                        childrenLst = _a.sent();
                        children = [];
                        if (!(context instanceof index_1.SpinalContext)) {
                            throw TypeError('context must be a SpinalContext');
                        }
                        for (i = 0; i < childrenLst.length; i += 1) {
                            child = childrenLst[i];
                            if (child.belongsToContext(context)) {
                                children.push(child);
                            }
                        }
                        return [2 /*return*/, children];
                }
            });
        });
    };
    /**
     * Returns the type of the relation.
     * @returns {string} Type of the relation
     * @memberof SpinalRelationPtrLst
     */
    SpinalRelationPtrLst.prototype.getType = function () {
        return SpinalRelationFactory_1.SPINAL_RELATION_PTR_LST_TYPE;
    };
    /**
     * Adds a child to the relation.
     * @template T extends spinal.Model = Node Element Type
     * @param {(T|SpinalNode<T>)} node Node or model to add
     * @throws {TypeError} If the node is not a Model
     * @throws {Error} If the node is already a child of the relation
     * @returns {Promise<SpinalNode<T>>} Promise containing the node that was added
     * @memberof SpinalRelationPtrLst
     */
    SpinalRelationPtrLst.prototype.addChild = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeCreate, tmpNodeCreate;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nodeCreate = node;
                        if (!(node instanceof spinal_core_connectorjs_type_1.Model)) {
                            throw new Error('Cannot add a child witch is not an instance of SpinalNode or Model.');
                        }
                        else if (!(node instanceof index_1.SpinalNode)) {
                            nodeCreate = new index_1.SpinalNode(undefined, undefined, node);
                        }
                        tmpNodeCreate = nodeCreate;
                        if (this.getChildrenIds().indexOf(tmpNodeCreate.getId().get()) !== -1) {
                            throw new Error('Cannot add a child twice to the same relation.');
                        }
                        return [4 /*yield*/, this.children.load().then(function (children) {
                                _this.children.info.ids.push(tmpNodeCreate.getId());
                                tmpNodeCreate._addParent(_this);
                                children.push(tmpNodeCreate);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, tmpNodeCreate];
                }
            });
        });
    };
    /**
     * Removes a child from the relation.
     * @param {SpinalNodeAny} node Child to remove
     * @returns {Promise<void>} An empty promise
     * @throws {Error} If the given node is not a child
     * @memberof SpinalRelationPtrLst
     */
    SpinalRelationPtrLst.prototype.removeChild = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var childrenLst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.children.load()];
                    case 1:
                        childrenLst = _a.sent();
                        if (!childrenLst.contains(node)) {
                            throw Error('The node is not a child');
                        }
                        childrenLst.remove(node);
                        this.children.info.ids.remove(node.getId());
                        node._removeParent(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes children from the relation.
     * @override
     * @param {SpinalNodeAny[]} [nodes=[]] Childs to remove
     * @returns {Promise<void>} An empty promise
     * @throws {TypeError} If nodes is not an array or omitted
     * @throws {Error} If one of the nodes is not a child
     * @memberof SpinalRelationPtrLst
     */
    SpinalRelationPtrLst.prototype.removeChildren = function (nodes) {
        if (nodes === void 0) { nodes = []; }
        return __awaiter(this, void 0, void 0, function () {
            var childrenLst, error, nodes_1, nodes_1_1, node, index;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!Array.isArray(nodes)) {
                            throw TypeError('node must be an array');
                        }
                        return [4 /*yield*/, this.children.load()];
                    case 1:
                        childrenLst = _b.sent();
                        error = false;
                        if (nodes.length === 0) {
                            childrenLst.clear();
                            this.children.info.ids.clear();
                            return [2 /*return*/];
                        }
                        try {
                            for (nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                                node = nodes_1_1.value;
                                index = childrenLst.indexOf(node);
                                if (index !== -1) {
                                    childrenLst.remove(node);
                                    this.children.info.ids.remove(node.getId());
                                    node._removeParent(this);
                                }
                                else {
                                    error = true;
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1["return"])) _a.call(nodes_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        if (error) {
                            throw Error('Could not remove all nodes');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return SpinalRelationPtrLst;
}(BaseSpinalRelation_1.BaseSpinalRelation));
exports.SpinalRelationPtrLst = SpinalRelationPtrLst;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalRelationPtrLst]);
exports["default"] = SpinalRelationPtrLst;

},{"spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js","./BaseSpinalRelation":"../node_modules/spinal-model-graph/dist/src/Relations/BaseSpinalRelation.js","./SpinalRelationFactory":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationFactory.js","../index":"../node_modules/spinal-model-graph/dist/src/index.js","../SpinalNodePointer":"../node_modules/spinal-model-graph/dist/src/SpinalNodePointer.js"}],"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationFactory.js":[function(require,module,exports) {
"use strict";
exports.__esModule = true;
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var SpinalRelationRef_1 = require("./SpinalRelationRef");
var SpinalRelationLstPtr_1 = require("./SpinalRelationLstPtr");
var SpinalRelationPtrLst_1 = require("./SpinalRelationPtrLst");
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var SPINAL_RELATION_TYPE = 'Ref';
exports.SPINAL_RELATION_TYPE = SPINAL_RELATION_TYPE;
var SPINAL_RELATION_LST_PTR_TYPE = 'LstPtr';
exports.SPINAL_RELATION_LST_PTR_TYPE = SPINAL_RELATION_LST_PTR_TYPE;
var SPINAL_RELATION_PTR_LST_TYPE = 'PtrLst';
exports.SPINAL_RELATION_PTR_LST_TYPE = SPINAL_RELATION_PTR_LST_TYPE;
var RELATION_TYPE_LIST = [
    SPINAL_RELATION_TYPE,
    SPINAL_RELATION_LST_PTR_TYPE,
    SPINAL_RELATION_PTR_LST_TYPE,
];
exports.RELATION_TYPE_LIST = RELATION_TYPE_LIST;
/**
 * Namespace for general relation functions.
 * @abstract
 */
var SpinalRelationFactory = /** @class */ (function () {
    function SpinalRelationFactory() {
    }
    /**
     * Create a new relation of relationType with the relationName.
     * @param {SpinalNode} parent Parent of the relation
     * @param {string} relationName Name of the relation
     * @param {string} relationType Type of the relation
     * @returns {SpinalRelationRef | SpinalRelationLstPtr | SpinalRelationPtrLst} A new SpinalRelation
     * @static
     * @memberof SpinalRelationFactory
     */
    SpinalRelationFactory.getNewRelation = function (parent, relationName, relationType) {
        var relation;
        switch (relationType) {
            case SPINAL_RELATION_TYPE:
                relation = new SpinalRelationRef_1.SpinalRelationRef(parent, relationName);
                break;
            case SPINAL_RELATION_LST_PTR_TYPE:
                relation = new SpinalRelationLstPtr_1.SpinalRelationLstPtr(parent, relationName);
                break;
            case SPINAL_RELATION_PTR_LST_TYPE:
                relation = new SpinalRelationPtrLst_1.SpinalRelationPtrLst(parent, relationName);
                break;
            default:
                throw new Error('Unknown relationType');
        }
        return relation;
    };
    return SpinalRelationFactory;
}());
exports.SpinalRelationFactory = SpinalRelationFactory;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalRelationFactory]);

},{"./SpinalRelationRef":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationRef.js","./SpinalRelationLstPtr":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationLstPtr.js","./SpinalRelationPtrLst":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationPtrLst.js","spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js"}],"../node_modules/spinal-model-graph/dist/src/SpinalSet.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
// tslint:disable:function-name
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
/**
 * @class SpinalSet
 * @extends {Model}
 */
var SpinalSet = /** @class */ (function (_super) {
    __extends(SpinalSet, _super);
    /**
     * Constructor for the SpinalSet class.
     * @param {(string[]|IterableIterator<string>)} [init] Array of values
     * @throws {TypeError} If init is not iterable
     * @throws {TypeError} If init[Symbol.iterator] doesn't return iterators
     * @throws {TypeError} If the values of the iterators are not strings
     * @memberof SpinalSet
     */
    function SpinalSet(init) {
        var e_1, _a;
        var _this = _super.call(this) || this;
        if (init !== undefined) {
            try {
                for (var init_1 = __values(init), init_1_1 = init_1.next(); !init_1_1.done; init_1_1 = init_1.next()) {
                    var value = init_1_1.value;
                    _this.add(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (init_1_1 && !init_1_1.done && (_a = init_1["return"])) _a.call(init_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return _this;
    }
    /**
     * Appends a new element with the given value to the set.
     * @param {String} value Value to store in the set
     * @throws {TypeError} If the value is not a string
     * @memberof SpinalSet
     */
    SpinalSet.prototype.add = function (value) {
        if (typeof value !== 'string') {
            throw TypeError('The value must be a string');
        }
        this.mod_attr(value, 0);
    };
    /**
     * Returns a boolean asserting whether the value is in the set or not.
     * @param {string} value Value
     * @returns {boolean} Return true if the value exists
     * @throws {TypeError} If the value is not a string
     * @memberof SpinalSet
     */
    SpinalSet.prototype.has = function (value) {
        if (typeof value !== 'string') {
            throw TypeError('The value must be a string');
        }
        return this.hasOwnProperty(value);
    };
    /**
     * Returns an array that contains all the values of the set.
     * @returns {string[]} Array containing all the values in the set
     * @memberof SpinalSet
     */
    SpinalSet.prototype.values = function () {
        return this._attribute_names;
    };
    /**
     * Deletes an element.
     * @param {string} value Value to delete
     * @throws {TypeError} If the value is not a string
     * @throws {Error} If the value is not in the map
     * @memberof SpinalSet
     */
    SpinalSet.prototype["delete"] = function (value) {
        if (!this.has(value)) {
            throw Error("The value doesn't exist");
        }
        this.rem_attr(value);
    };
    /**
     * Deletes all values in the set.
     * @memberof SpinalSet
     */
    SpinalSet.prototype.clear = function () {
        var values = this.values();
        while (values[0]) {
            this["delete"](values[0]);
        }
    };
    /**
     * Returns the number of values in the set.
     * @returns {number} Number of values in the set
     * @memberof SpinalSet
     */
    SpinalSet.prototype.size = function () {
        return this._attribute_names.length;
    };
    /**
     * Applies a function to each of the values in the set.
     * @param {SpinalSetForEachFunc} fun Funcion to apply
     * @memberof SpinalSet
     */
    SpinalSet.prototype.forEach = function (fun) {
        if (typeof fun !== 'function') {
            throw TypeError('The callback must be a function');
        }
        var values = this.values();
        for (var i = 0; i < this.size(); i += 1) {
            fun(values[i], i);
        }
    };
    /**
     * Function to iterate over the set object.
     * @returns {IterableIterator<string>}
     * @memberof SpinalSet
     */
    SpinalSet.prototype[Symbol.iterator] = function () {
        var values, values_1, values_1_1, value, e_2_1;
        var e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    values = this._attribute_names;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    values_1 = __values(values), values_1_1 = values_1.next();
                    _b.label = 2;
                case 2:
                    if (!!values_1_1.done) return [3 /*break*/, 5];
                    value = values_1_1.value;
                    return [4 /*yield*/, value];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    values_1_1 = values_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (values_1_1 && !values_1_1.done && (_a = values_1["return"])) _a.call(values_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    };
    return SpinalSet;
}(spinal_core_connectorjs_type_1.Model));
exports.SpinalSet = SpinalSet;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalSet]);
exports["default"] = SpinalSet;

},{"spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js"}],"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalNode.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var Utilities_1 = require("../Utilities");
var index_1 = require("../index");
var SpinalNodePointer_1 = require("../SpinalNodePointer");
var SpinalRelationFactory_1 = require("../Relations/SpinalRelationFactory");
var SpinalMap_1 = require("../SpinalMap");
var SpinalSet_1 = require("../SpinalSet");
var DEFAULT_PREDICATE = function () { return true; };
/**
 * Node of a graph.
 * @extends Model
 * @template T extends spinal.Model = ElementType
 */
var SpinalNode = /** @class */ (function (_super) {
    __extends(SpinalNode, _super);
    /**
     * Constructor for the SpinalNode class.
     * @param {string} [name="undefined"] Name of the node
     * @param {string} [type="undefined"] Type of the node
     * @param {spinal.Model} [element] Element of the node
     * @throws {TypeError} If the element is not a Model
     */
    function SpinalNode(name, type, element) {
        if (name === void 0) { name = 'undefined'; }
        if (type === void 0) { type = 'SpinalNode'; }
        var _this = _super.call(this) || this;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return _this;
        _this.add_attr({
            info: {
                name: name,
                type: type,
                id: Utilities_1.guid(_this.constructor.name)
            },
            parents: new SpinalMap_1.SpinalMap(),
            children: new SpinalMap_1.SpinalMap(),
            element: element !== undefined ? new SpinalNodePointer_1.SpinalNodePointer(element) : undefined,
            contextIds: new SpinalSet_1.SpinalSet()
        });
        return _this;
    }
    /**
     * Returns the id.
     * @returns {spinal.Str} Id of the node
     */
    SpinalNode.prototype.getId = function () {
        return this.info.id;
    };
    /**
     * Returns the name.
     * @returns {spinal.Str} Name of the node
     */
    SpinalNode.prototype.getName = function () {
        return this.info.name;
    };
    /**
     * Returns the type.
     * @returns {spinal.Str} Type of the node
     */
    SpinalNode.prototype.getType = function () {
        return this.info.type;
    };
    /**
     * Returns the element.
     * @returns {Promise<T>} A promise where the parameter of the resolve method is the element
     */
    SpinalNode.prototype.getElement = function () {
        if (this.element === undefined) {
            var model = new spinal_core_connectorjs_type_1.Model();
            this.add_attr('element', (new SpinalNodePointer_1.SpinalNodePointer(model)));
            return new Promise(model);
        }
        return this.element.load();
    };
    /**
     * Returns all the children ids in an array.
     * @returns {string[]} Ids of the children
     */
    SpinalNode.prototype.getChildrenIds = function () {
        var e_1, _a, e_2, _b;
        var nodeChildrenIds = [];
        try {
            for (var _c = __values(this.children), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), relationMap = _e[1];
                try {
                    for (var relationMap_1 = (e_2 = void 0, __values(relationMap)), relationMap_1_1 = relationMap_1.next(); !relationMap_1_1.done; relationMap_1_1 = relationMap_1.next()) {
                        var _f = __read(relationMap_1_1.value, 2), relation = _f[1];
                        var relChildrenIds = relation.getChildrenIds();
                        for (var i = 0; i < relChildrenIds.length; i += 1) {
                            nodeChildrenIds.push(relChildrenIds[i]);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (relationMap_1_1 && !relationMap_1_1.done && (_b = relationMap_1["return"])) _b.call(relationMap_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return nodeChildrenIds;
    };
    /**
     * Computes and returns the number of children of the node.
     * @returns {number} The number of children
     */
    SpinalNode.prototype.getNbChildren = function () {
        var e_3, _a, e_4, _b;
        var count = 0;
        try {
            for (var _c = __values(this.children), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), relationMap = _e[1];
                try {
                    for (var relationMap_2 = (e_4 = void 0, __values(relationMap)), relationMap_2_1 = relationMap_2.next(); !relationMap_2_1.done; relationMap_2_1 = relationMap_2.next()) {
                        var _f = __read(relationMap_2_1.value, 2), relation = _f[1];
                        count += relation.getNbChildren();
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (relationMap_2_1 && !relationMap_2_1.done && (_b = relationMap_2["return"])) _b.call(relationMap_2);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return count;
    };
    /**
     * Adds an id to the context ids of the node.
     * @param {string} id Id of the context
     * @throws {TypeError} If the id is not a string
     */
    SpinalNode.prototype.addContextId = function (id) {
        if (typeof id !== 'string') {
            throw TypeError('id must be a string');
        }
        if (!this.contextIds.has(id)) {
            this.contextIds.add(id);
        }
    };
    /**
     * Returns a list of the contexts the node is associated to.
     * @returns {string[]} An array of ids of the associated contexts
     */
    SpinalNode.prototype.getContextIds = function () {
        return this.contextIds.values();
    };
    /**
     * Returns true if the node belongs to the context.
     * @param {SpinalContext} context The context that might own the node
     * @returns {boolean} A boolean
     * @throws {TypeError} If context is not a SpinalContext
     */
    SpinalNode.prototype.belongsToContext = function (context) {
        if (!(context instanceof index_1.SpinalContext)) {
            throw TypeError('context must be a SpinalContext');
        }
        return this.contextIds.has(context.getId().get());
    };
    /**
     * Verify if the node contains the relation name.
     * @param {string} relationName Name of the relation
     * @param {string} relationType Type of the relation
     * @returns {boolean} Return true is the relation is contained in the node and false otherwise.
     * @throws {TypeError} If the relation name is not a string
     * @throws {Error} If the relation type doesn't exist
     */
    SpinalNode.prototype.hasRelation = function (relationName, relationType) {
        if (typeof relationName !== 'string') {
            throw TypeError('the relation name must be a string');
        }
        if (SpinalRelationFactory_1.RELATION_TYPE_LIST.indexOf(relationType) === -1) {
            throw Error('invalid relation type');
        }
        var typeMap = this._getChildrenType(relationType);
        if (typeof typeMap === 'undefined') {
            return false;
        }
        return typeMap.has(relationName);
    };
    /**
     * Verify if the node contains all the relation names.
     * @param {string[]} relationNames Array containing all the relation name
     * @param {string} relationType Type of the relations
     * @returns {boolean} Return true if the node contains
     * all the relations in relationNames,false otherwise.
     * @throws {TypeError} If the relation names are not in an array
     * @throws {TypeError} If one of the relation names is not a string
     * @throws {Error} If the relation type doesn't exist
     */
    SpinalNode.prototype.hasRelations = function (relationNames, relationType) {
        var e_5, _a;
        if (!Array.isArray(relationNames)) {
            throw TypeError('The relation names must be in an array');
        }
        if (SpinalRelationFactory_1.RELATION_TYPE_LIST.indexOf(relationType) === -1) {
            throw Error('invalid relation type');
        }
        try {
            for (var relationNames_1 = __values(relationNames), relationNames_1_1 = relationNames_1.next(); !relationNames_1_1.done; relationNames_1_1 = relationNames_1.next()) {
                var relationName = relationNames_1_1.value;
                if (!this.hasRelation(relationName, relationType)) {
                    return false;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (relationNames_1_1 && !relationNames_1_1.done && (_a = relationNames_1["return"])) _a.call(relationNames_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return true;
    };
    /**
     * Returns all the relation names of the node.
     * @returns {string[]} The names of the relations of the node
     */
    SpinalNode.prototype.getRelationNames = function () {
        var e_6, _a;
        var names = [];
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), relationMap = _d[1];
                names.push.apply(names, __spread(relationMap.keys()));
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        // Removes all duplicates
        return Array.from(new Set(names));
    };
    /**
     * Add the node as child of the relation.
     * @param {T|SpinalNode<T>} child Element to add as child
     * @param {string} relationName Name of the relation
     * @param {string} relationType Type of the relation
     * @returns {Promise<SpinalNode>} The child node in a promise
     * @throws {TypeError} If the child is not a model
     * @throws {TypeError} If the relation name is not a string
     * @throws {Error} If the relation type is invalid
     */
    SpinalNode.prototype.addChild = function (child, relationName, relationType) {
        return __awaiter(this, void 0, void 0, function () {
            var relation;
            return __generator(this, function (_a) {
                if (!(child instanceof spinal_core_connectorjs_type_1.Model)) {
                    throw TypeError('Cannot add a child witch is not an instance of SpinalNode or Model.');
                }
                if (!this.hasRelation(relationName, relationType)) {
                    relation = this._createRelation(relationName, relationType);
                }
                else {
                    relation = this._getRelation(relationName, relationType);
                }
                return [2 /*return*/, relation.addChild(child)];
            });
        });
    };
    /**
     * Adds a child and notices the context if a new relation was created.
     * @param {SpinalNode | Model} child Node to add as child
     * @param {string} relationName Name of the relation
     * @param {string} relationType Type of the relation
     * @param {SpinalContext} context Context to update
     * @returns {Promise<SpinalNode>} The child node in a promise
     * @throws {TypeError} If the child is not a model
     * @throws {TypeError} If the relation name is not a string
     * @throws {TypeError} If the context is not a SpinalContext
     * @throws {Error} If the relation type is invalid
     */
    SpinalNode.prototype.addChildInContext = function (child, relationName, relationType, context) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, childCreate, tmpchildCreate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        childCreate = child;
                        if (!(context instanceof index_1.SpinalContext)) {
                            throw TypeError('context must be a SpinaContext');
                        }
                        if (!(child instanceof spinal_core_connectorjs_type_1.Model)) {
                            throw TypeError('Cannot add a child witch is not an instance of SpinalNode or Model.');
                        }
                        else if (!(child instanceof SpinalNode)) {
                            childCreate = new SpinalNode(undefined, undefined, child);
                        }
                        tmpchildCreate = childCreate;
                        if (!this.hasRelation(relationName, relationType)) {
                            relation = this._createRelation(relationName, relationType);
                        }
                        else {
                            relation = this._getRelation(relationName, relationType);
                        }
                        tmpchildCreate.addContextId(context.getId().get());
                        relation.addContextId(context.getId().get());
                        return [4 /*yield*/, relation.addChild(tmpchildCreate)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, tmpchildCreate];
                }
            });
        });
    };
    /**
     * Removes the node from the relation children.
     * @param {SpinalNode} node Node to remove
     * @param {string} relationName Name of the relation to wich the node belongs
     * @param {string} relationType Type of the relation to wich the node belongs
     * @returns {Promise<void>} An empty promise
     * @throws {TypeError} If relation name is not a string
     * @throws {Error} If relation type is invalid
     * @throws {Error} If relation doesn't exist
     * @throws {Error} If the child doesn't exist
     */
    SpinalNode.prototype.removeChild = function (node, relationName, relationType) {
        if (!this.hasRelation(relationName, relationType)) {
            throw Error("The relation doesn't exist");
        }
        var rel = this._getRelation(relationName, relationType);
        return rel.removeChild(node);
    };
    /**
     * Removes children in the given relation.
     * @param {SpinalNode[]} nodes Nodes to delete
     * @param {string} relationName Name of the relation
     * @param {string} relationType Type of the relation
     * @returns {Promise<void>} An empty promise
     * @throws {TypeError} If nodes is not an array
     * @throws {TypeError} If an element of nodes is not a SpinalNode
     * @throws {TypeError} If relation name is not a string
     * @throws {Error} If relation type is invalid
     * @throws {Error} If the relation doesn't exist
     * @throws {Error} If one of the nodes is not a child
     */
    SpinalNode.prototype.removeChildren = function (nodes, relationName, relationType) {
        if (!Array.isArray(nodes)) {
            throw TypeError('nodes must be an array');
        }
        if (!this.hasRelation(relationName, relationType)) {
            throw Error("The relation doesn't exist");
        }
        var rel = this._getRelation(relationName, relationType);
        return rel.removeChildren(nodes);
    };
    /**
     * Removes a child relation of the node.
     * @param {string} relationName Name of the relation to remove
     * @param {string} relationType Type of the relation to remove
     * @returns {Promise<void>} An empty promise
     * @throws {TypeError} If the relationName is not a string
     * @throws {Error} If the relationType is invalid
     * @throws {Error} If the relation doesn't exist
     */
    SpinalNode.prototype.removeRelation = function (relationName, relationType) {
        if (!this.hasRelation(relationName, relationType)) {
            throw Error("The relation doesn't exist");
        }
        var rel = this._getRelation(relationName, relationType);
        return rel.removeFromGraph();
    };
    /**
     * Remove the node from the graph
     * i.e remove the node from all the parent relations and remove all the children relations.
     * This operation might delete all the sub-graph under this node.
     * After this operation the node can be deleted without fear.
     * @returns {Promise<void>} An empty promise
     */
    SpinalNode.prototype.removeFromGraph = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this._removeFromParents(),
                            this._removeFromChildren(),
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the first child in the given relation for which the predicate is true.
     * @param {SpinalNodeFindPredicateFunc} predicate
     * Functions that takes a node and returns a boolean
     * @param {string} relationName Name of the relation
     * @param {string} relationType Type of the relation
     * @returns {Promise<SpinalNode<any>>}
     * The first child for which the predicate is true or undefined
     * @throws {TypeError} If predicate is not a function
     * @throws {TypeError} If relation name is not a string
     * @throws {Error} If relation type is invalid
     * @throws {Error} If relation doesn't exist
     */
    SpinalNode.prototype.getChild = function (predicate, relationName, relationType) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, children, children_1, children_1_1, child;
            var e_7, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof predicate !== 'function') {
                            throw TypeError('the predicate must be a function');
                        }
                        if (!this.hasRelation(relationName, relationType)) {
                            throw Error("The relation doesn't exist");
                        }
                        relation = this._getRelation(relationName, relationType);
                        return [4 /*yield*/, relation.getChildren()];
                    case 1:
                        children = _b.sent();
                        try {
                            for (children_1 = __values(children), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
                                child = children_1_1.value;
                                if (predicate(child)) {
                                    return [2 /*return*/, child];
                                }
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (children_1_1 && !children_1_1.done && (_a = children_1["return"])) _a.call(children_1);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the children of the node for the relation names.
     * @param {string[]} [relationNames=[]]
     * Array containing the relation names of the desired children
     * @returns {Promise<SpinalNode[]>} The children that were found
     * @throws {TypeError} If relationNames is neither an array, a string or omitted
     * @throws {TypeError} If an element of relationNames is not a string
     */
    SpinalNode.prototype.getChildren = function (relationNames) {
        if (relationNames === void 0) { relationNames = []; }
        return __awaiter(this, void 0, void 0, function () {
            var relName, promises, tmpRelName, _a, _b, _c, relationMap, j, relation, childrenLst, res, children, childrenLst_1, childrenLst_1_1, i;
            var e_8, _d, e_9, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        relName = this._getValidRelations(relationNames);
                        promises = [];
                        tmpRelName = relName;
                        try {
                            for (_a = __values(this.children), _b = _a.next(); !_b.done; _b = _a.next()) {
                                _c = __read(_b.value, 2), relationMap = _c[1];
                                for (j = 0; j < tmpRelName.length; j += 1) {
                                    if (relationMap.has(tmpRelName[j])) {
                                        relation = relationMap.getElement(tmpRelName[j]);
                                        promises.push(relation.getChildren());
                                    }
                                }
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_d = _a["return"])) _d.call(_a);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        childrenLst = _f.sent();
                        res = [];
                        try {
                            for (childrenLst_1 = __values(childrenLst), childrenLst_1_1 = childrenLst_1.next(); !childrenLst_1_1.done; childrenLst_1_1 = childrenLst_1.next()) {
                                children = childrenLst_1_1.value;
                                for (i = 0; i < children.length; i += 1) {
                                    res.push(children[i]);
                                }
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (childrenLst_1_1 && !childrenLst_1_1.done && (_e = childrenLst_1["return"])) _e.call(childrenLst_1);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    /**
     * Return the children of the node that are registered in the context
     * @param {SpinalContext} context Context to use for the search
     * @returns {Promise<SpinalNode[]>} The children that were found
     * @throws {TypeError} If the context is not a SpinalContext
     */
    SpinalNode.prototype.getChildrenInContext = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, _a, _b, _c, relationMap, relationMap_3, relationMap_3_1, _d, relation, childrenLst, res, childrenLst_2, childrenLst_2_1, children, i;
            var e_10, _e, e_11, _f, e_12, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!(context instanceof index_1.SpinalContext)) {
                            throw TypeError('context must be a SpinalContext');
                        }
                        promises = [];
                        try {
                            for (_a = __values(this.children), _b = _a.next(); !_b.done; _b = _a.next()) {
                                _c = __read(_b.value, 2), relationMap = _c[1];
                                try {
                                    for (relationMap_3 = (e_11 = void 0, __values(relationMap)), relationMap_3_1 = relationMap_3.next(); !relationMap_3_1.done; relationMap_3_1 = relationMap_3.next()) {
                                        _d = __read(relationMap_3_1.value, 2), relation = _d[1];
                                        if (relation.belongsToContext(context)) {
                                            promises.push(relation.getChildrenInContext(context));
                                        }
                                    }
                                }
                                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                                finally {
                                    try {
                                        if (relationMap_3_1 && !relationMap_3_1.done && (_f = relationMap_3["return"])) _f.call(relationMap_3);
                                    }
                                    finally { if (e_11) throw e_11.error; }
                                }
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_e = _a["return"])) _e.call(_a);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        childrenLst = _h.sent();
                        res = [];
                        try {
                            for (childrenLst_2 = __values(childrenLst), childrenLst_2_1 = childrenLst_2.next(); !childrenLst_2_1.done; childrenLst_2_1 = childrenLst_2.next()) {
                                children = childrenLst_2_1.value;
                                for (i = 0; i < children.length; i += 1) {
                                    res.push(children[i]);
                                }
                            }
                        }
                        catch (e_12_1) { e_12 = { error: e_12_1 }; }
                        finally {
                            try {
                                if (childrenLst_2_1 && !childrenLst_2_1.done && (_g = childrenLst_2["return"])) _g.call(childrenLst_2);
                            }
                            finally { if (e_12) throw e_12.error; }
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    // /**
    //  * Return all parents for the relation names no matter the type of relation
    //  * @param {String[]} [relationNames=[]] Array containing the relation names of the desired parents
    //  * @returns {Promise<Array<SpinalNode<any>>>} Promise containing the parents that were found
    //  * @throws {TypeError} If the relationNames are neither an array, a string or omitted
    //  * @throws {TypeError} If an element of relationNames is not a string
    //  */
    // getParents(relationNames: string | string[] = []): Promise<SpinalNode<any>[]> {
    //   let relNames: string | string[] = relationNames;
    //   if (Array.isArray(relationNames)) {
    //     if (relationNames.length === 0) {
    //       relNames = this.parents.keys();
    //     }
    //   } else if (typeof relationNames === 'string') {
    //     relNames = [relationNames];
    //   } else {
    //     throw TypeError('relationNames must be an array, a string or omitted');
    //   }
    //   const promises: Promise<SpinalNode<any>>[] = [];
    //   const tmpRelNames = <string[]>relNames;
    //   for (const name of tmpRelNames) {
    //     const list: spinal.Lst<SpinalNodePointer<AnySpinalRelation>> = this.parents.getElement(name);
    //     if (typeof list !== "undefined" && list !== null) {
    //       for (let i: number = 0; i < list.length; i += 1) {
    //         promises.push(
    //           list[i].load().then(
    //             (relation: AnySpinalRelation) => {
    //               return relation.getParent();
    //             },
    //           ),
    //         );
    //       }
    //     }
    //   }
    //   return Promise.all(promises);
    // }
    /**
    //  * Return all parents for the relation names no matter the type of relation
    //  * @param {String[]} [relationNames=[]] Array containing the relation names of the desired parents
    //  * @returns {Promise<Array<SpinalNode<any>>>} Promise containing the parents that were found
    //  * @throws {TypeError} If the relationNames are neither an array, a string or omitted
    //  * @throws {TypeError} If an element of relationNames is not a string
    //  */
    SpinalNode.prototype.getParents = function (relationNames) {
        var e_13, _a, e_14, _b;
        if (relationNames === void 0) { relationNames = []; }
        var relNames = this._getValidRelations(relationNames);
        var prom = [];
        try {
            for (var _c = __values(this.parents._attribute_names), _d = _c.next(); !_d.done; _d = _c.next()) {
                var nodeRelation = _d.value;
                try {
                    for (var relNames_1 = (e_14 = void 0, __values(relNames)), relNames_1_1 = relNames_1.next(); !relNames_1_1.done; relNames_1_1 = relNames_1.next()) {
                        var searchRelation = relNames_1_1.value;
                        if (nodeRelation === searchRelation) {
                            var lst = this.parents[nodeRelation];
                            for (var i = 0; i < lst.length; i++) {
                                prom.push(Utilities_1.loadRelation(lst[i]));
                            }
                        }
                    }
                }
                catch (e_14_1) { e_14 = { error: e_14_1 }; }
                finally {
                    try {
                        if (relNames_1_1 && !relNames_1_1.done && (_b = relNames_1["return"])) _b.call(relNames_1);
                    }
                    finally { if (e_14) throw e_14.error; }
                }
            }
        }
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_13) throw e_13.error; }
        }
        return Promise.all(prom);
    };
    /**
   * Recursively finds and return the FIRST FOUND parent nodes for which the predicate is true
   * @param {string[]} relationNames Arry of relation
   * @param {(node)=> boolean} predicate function stop search if return true
   */
    SpinalNode.prototype.findOneParent = function (relationNames, predicate) {
        if (relationNames === void 0) { relationNames = []; }
        if (predicate === void 0) { predicate = DEFAULT_PREDICATE; }
        return __awaiter(this, void 0, void 0, function () {
            var relNames, seen, promises, nextGen, currentGen, currentGen_1, currentGen_1_1, node, childrenArrays, childrenArrays_1, childrenArrays_1_1, children, children_2, children_2_1, child;
            var e_15, _a, e_16, _b, e_17, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        relNames = this._getValidRelations(relationNames);
                        if (predicate(this)) {
                            return [2 /*return*/, this];
                        }
                        seen = new Set([this]);
                        promises = [];
                        nextGen = [this];
                        currentGen = [];
                        _d.label = 1;
                    case 1:
                        if (!nextGen.length) return [3 /*break*/, 3];
                        currentGen = nextGen;
                        promises = [];
                        nextGen = [];
                        try {
                            for (currentGen_1 = (e_15 = void 0, __values(currentGen)), currentGen_1_1 = currentGen_1.next(); !currentGen_1_1.done; currentGen_1_1 = currentGen_1.next()) {
                                node = currentGen_1_1.value;
                                promises.push(node.getParents(relNames));
                                if (predicate(node)) {
                                    return [2 /*return*/, node];
                                }
                            }
                        }
                        catch (e_15_1) { e_15 = { error: e_15_1 }; }
                        finally {
                            try {
                                if (currentGen_1_1 && !currentGen_1_1.done && (_a = currentGen_1["return"])) _a.call(currentGen_1);
                            }
                            finally { if (e_15) throw e_15.error; }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        childrenArrays = _d.sent();
                        try {
                            for (childrenArrays_1 = (e_16 = void 0, __values(childrenArrays)), childrenArrays_1_1 = childrenArrays_1.next(); !childrenArrays_1_1.done; childrenArrays_1_1 = childrenArrays_1.next()) {
                                children = childrenArrays_1_1.value;
                                try {
                                    for (children_2 = (e_17 = void 0, __values(children)), children_2_1 = children_2.next(); !children_2_1.done; children_2_1 = children_2.next()) {
                                        child = children_2_1.value;
                                        if (!seen.has(child)) {
                                            nextGen.push(child);
                                            seen.add(child);
                                        }
                                    }
                                }
                                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                                finally {
                                    try {
                                        if (children_2_1 && !children_2_1.done && (_c = children_2["return"])) _c.call(children_2);
                                    }
                                    finally { if (e_17) throw e_17.error; }
                                }
                            }
                        }
                        catch (e_16_1) { e_16 = { error: e_16_1 }; }
                        finally {
                            try {
                                if (childrenArrays_1_1 && !childrenArrays_1_1.done && (_b = childrenArrays_1["return"])) _b.call(childrenArrays_1);
                            }
                            finally { if (e_16) throw e_16.error; }
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
   * Recursively finds all the parent nodes for which the predicate is true
   * @export
   * @param {string[]} relationNames Arry of relation
   * @param {(node)=> boolean} predicate Function returning true if the node needs to be returned
   */
    SpinalNode.prototype.findParents = function (relationNames, predicate) {
        if (relationNames === void 0) { relationNames = []; }
        if (predicate === void 0) { predicate = DEFAULT_PREDICATE; }
        return __awaiter(this, void 0, void 0, function () {
            var relNames, found, seen, promises, nextGen, currentGen, currentGen_2, currentGen_2_1, node, childrenArrays, childrenArrays_2, childrenArrays_2_1, children, children_3, children_3_1, child;
            var e_18, _a, e_19, _b, e_20, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        relNames = this._getValidRelations(relationNames);
                        found = [];
                        if (predicate(this)) {
                            found.push(this);
                        }
                        seen = new Set([this]);
                        promises = [];
                        nextGen = [this];
                        currentGen = [];
                        _d.label = 1;
                    case 1:
                        if (!nextGen.length) return [3 /*break*/, 3];
                        currentGen = nextGen;
                        promises = [];
                        nextGen = [];
                        try {
                            for (currentGen_2 = (e_18 = void 0, __values(currentGen)), currentGen_2_1 = currentGen_2.next(); !currentGen_2_1.done; currentGen_2_1 = currentGen_2.next()) {
                                node = currentGen_2_1.value;
                                promises.push(node.getParents(node, relNames));
                                if (predicate(node)) {
                                    found.push(node);
                                }
                            }
                        }
                        catch (e_18_1) { e_18 = { error: e_18_1 }; }
                        finally {
                            try {
                                if (currentGen_2_1 && !currentGen_2_1.done && (_a = currentGen_2["return"])) _a.call(currentGen_2);
                            }
                            finally { if (e_18) throw e_18.error; }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        childrenArrays = _d.sent();
                        try {
                            for (childrenArrays_2 = (e_19 = void 0, __values(childrenArrays)), childrenArrays_2_1 = childrenArrays_2.next(); !childrenArrays_2_1.done; childrenArrays_2_1 = childrenArrays_2.next()) {
                                children = childrenArrays_2_1.value;
                                try {
                                    for (children_3 = (e_20 = void 0, __values(children)), children_3_1 = children_3.next(); !children_3_1.done; children_3_1 = children_3.next()) {
                                        child = children_3_1.value;
                                        if (!seen.has(child)) {
                                            nextGen.push(child);
                                            seen.add(child);
                                        }
                                    }
                                }
                                catch (e_20_1) { e_20 = { error: e_20_1 }; }
                                finally {
                                    try {
                                        if (children_3_1 && !children_3_1.done && (_c = children_3["return"])) _c.call(children_3);
                                    }
                                    finally { if (e_20) throw e_20.error; }
                                }
                            }
                        }
                        catch (e_19_1) { e_19 = { error: e_19_1 }; }
                        finally {
                            try {
                                if (childrenArrays_2_1 && !childrenArrays_2_1.done && (_b = childrenArrays_2["return"])) _b.call(childrenArrays_2);
                            }
                            finally { if (e_19) throw e_19.error; }
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, found];
                }
            });
        });
    };
    /**
     * Recursively finds all the children nodes for which the predicate is true.
     * @param {string|string[]} relationNames Array containing the relation names to follow
     * @param {SpinalNodeFindPredicateFunc} predicate
     * Function returning true if the node needs to be returned
     * @returns {Promise<Array<SpinalNode<any>>>} The nodes that were found
     * @throws {TypeError} If the relationNames are neither an array, a string or omitted
     * @throws {TypeError} If an element of relationNames is not a string
     * @throws {TypeError} If the predicate is not a function
     */
    SpinalNode.prototype.find = function (relationNames, predicate) {
        if (predicate === void 0) { predicate = DEFAULT_PREDICATE; }
        return __awaiter(this, void 0, void 0, function () {
            var seen, promises, nextGen, currentGen, found, currentGen_3, currentGen_3_1, node, childrenArrays, childrenArrays_3, childrenArrays_3_1, children, children_4, children_4_1, child;
            var e_21, _a, e_22, _b, e_23, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!Array.isArray(relationNames) &&
                            relationNames !== undefined &&
                            typeof relationNames !== 'string') {
                            throw TypeError('relationNames must be an array, a string or omitted');
                        }
                        if (typeof predicate !== 'function') {
                            throw TypeError('predicate must be a function');
                        }
                        seen = new Set([this]);
                        promises = [];
                        nextGen = [this];
                        currentGen = [];
                        found = [];
                        _d.label = 1;
                    case 1:
                        if (!nextGen.length) return [3 /*break*/, 3];
                        currentGen = nextGen;
                        promises = [];
                        nextGen = [];
                        try {
                            for (currentGen_3 = (e_21 = void 0, __values(currentGen)), currentGen_3_1 = currentGen_3.next(); !currentGen_3_1.done; currentGen_3_1 = currentGen_3.next()) {
                                node = currentGen_3_1.value;
                                promises.push(node.getChildren(relationNames));
                                if (predicate(node)) {
                                    found.push(node);
                                }
                            }
                        }
                        catch (e_21_1) { e_21 = { error: e_21_1 }; }
                        finally {
                            try {
                                if (currentGen_3_1 && !currentGen_3_1.done && (_a = currentGen_3["return"])) _a.call(currentGen_3);
                            }
                            finally { if (e_21) throw e_21.error; }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        childrenArrays = _d.sent();
                        try {
                            for (childrenArrays_3 = (e_22 = void 0, __values(childrenArrays)), childrenArrays_3_1 = childrenArrays_3.next(); !childrenArrays_3_1.done; childrenArrays_3_1 = childrenArrays_3.next()) {
                                children = childrenArrays_3_1.value;
                                try {
                                    for (children_4 = (e_23 = void 0, __values(children)), children_4_1 = children_4.next(); !children_4_1.done; children_4_1 = children_4.next()) {
                                        child = children_4_1.value;
                                        if (!seen.has(child)) {
                                            nextGen.push(child);
                                            seen.add(child);
                                        }
                                    }
                                }
                                catch (e_23_1) { e_23 = { error: e_23_1 }; }
                                finally {
                                    try {
                                        if (children_4_1 && !children_4_1.done && (_c = children_4["return"])) _c.call(children_4);
                                    }
                                    finally { if (e_23) throw e_23.error; }
                                }
                            }
                        }
                        catch (e_22_1) { e_22 = { error: e_22_1 }; }
                        finally {
                            try {
                                if (childrenArrays_3_1 && !childrenArrays_3_1.done && (_b = childrenArrays_3["return"])) _b.call(childrenArrays_3);
                            }
                            finally { if (e_22) throw e_22.error; }
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, found];
                }
            });
        });
    };
    /**
     * Recursively finds all the children nodes with type "nodeType".
     * @param {string|string[]} relationNames Array containing the relation names to follow
     * @param {string} nodeType Type of node to find in children
     * @returns {Promise<Array<SpinalNode<any>>>} The nodes that were found
     * @throws {TypeError} If the relationNames are neither an array, a string or omitted
     * @throws {TypeError} If an element of relationNames is not a string
     * @throws {TypeError} If the predicate is not a function
     */
    SpinalNode.prototype.findByType = function (relationNames, nodeType) {
        return this.find(relationNames, function (node) {
            return node.getType().get() === nodeType;
        });
    };
    /**
    * Recursively finds all the children nodes and classify them by type.
    * @param {string|string[]} relationNames Array containing the relation names to follow
    * @returns {Object<{types : string[], data : Object<string : SpinalNode[]>}>}
    * @throws {TypeError} If the relationNames are neither an array, a string or omitted
    * @throws {TypeError} If an element of relationNames is not a string
    * @throws {TypeError} If the predicate is not a function
    */
    SpinalNode.prototype.browseAnClassifyByType = function (relationNames) {
        return __awaiter(this, void 0, void 0, function () {
            var dataStructure;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataStructure = {
                            types: [],
                            data: {}
                        };
                        return [4 /*yield*/, this.find(relationNames, function (node) {
                                var type = node.getType().get();
                                if (dataStructure.types.indexOf(type) === -1) {
                                    dataStructure.types.push(type);
                                }
                                if (typeof dataStructure.data[type] === "undefined") {
                                    dataStructure.data[type] = [];
                                }
                                dataStructure.data[type].push(node);
                                return false;
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, dataStructure];
                }
            });
        });
    };
    /**
     * Recursively finds all the children nodes in the context for which the predicate is true..
     * @param {SpinalContext} context Context to use for the search
     * @param {findPredicate} predicate Function returning true if the node needs to be returned
     * @returns {Promise<Array<SpinalNode>>} The nodes that were found
     * @throws {TypeError} If context is not a SpinalContext
     * @throws {TypeError} If the predicate is not a function
     */
    SpinalNode.prototype.findInContext = function (context, predicate) {
        if (predicate === void 0) { predicate = DEFAULT_PREDICATE; }
        return __awaiter(this, void 0, void 0, function () {
            var seen, promises, nextGen, currentGen, found, currentGen_4, currentGen_4_1, node, childrenArrays, childrenArrays_4, childrenArrays_4_1, children, children_5, children_5_1, child;
            var e_24, _a, e_25, _b, e_26, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (typeof predicate !== 'function') {
                            throw new Error('The predicate function must be a function');
                        }
                        seen = new Set([this]);
                        promises = [];
                        nextGen = [this];
                        currentGen = [];
                        found = [];
                        _d.label = 1;
                    case 1:
                        if (!nextGen.length) return [3 /*break*/, 3];
                        currentGen = nextGen;
                        promises = [];
                        nextGen = [];
                        try {
                            for (currentGen_4 = (e_24 = void 0, __values(currentGen)), currentGen_4_1 = currentGen_4.next(); !currentGen_4_1.done; currentGen_4_1 = currentGen_4.next()) {
                                node = currentGen_4_1.value;
                                promises.push(node.getChildrenInContext(context));
                                if (predicate(node)) {
                                    found.push(node);
                                }
                            }
                        }
                        catch (e_24_1) { e_24 = { error: e_24_1 }; }
                        finally {
                            try {
                                if (currentGen_4_1 && !currentGen_4_1.done && (_a = currentGen_4["return"])) _a.call(currentGen_4);
                            }
                            finally { if (e_24) throw e_24.error; }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        childrenArrays = _d.sent();
                        try {
                            for (childrenArrays_4 = (e_25 = void 0, __values(childrenArrays)), childrenArrays_4_1 = childrenArrays_4.next(); !childrenArrays_4_1.done; childrenArrays_4_1 = childrenArrays_4.next()) {
                                children = childrenArrays_4_1.value;
                                try {
                                    for (children_5 = (e_26 = void 0, __values(children)), children_5_1 = children_5.next(); !children_5_1.done; children_5_1 = children_5.next()) {
                                        child = children_5_1.value;
                                        if (!seen.has(child)) {
                                            nextGen.push(child);
                                            seen.add(child);
                                        }
                                    }
                                }
                                catch (e_26_1) { e_26 = { error: e_26_1 }; }
                                finally {
                                    try {
                                        if (children_5_1 && !children_5_1.done && (_c = children_5["return"])) _c.call(children_5);
                                    }
                                    finally { if (e_26) throw e_26.error; }
                                }
                            }
                        }
                        catch (e_25_1) { e_25 = { error: e_25_1 }; }
                        finally {
                            try {
                                if (childrenArrays_4_1 && !childrenArrays_4_1.done && (_b = childrenArrays_4["return"])) _b.call(childrenArrays_4);
                            }
                            finally { if (e_25) throw e_25.error; }
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, found];
                }
            });
        });
    };
    /**
     * Recursively finds all the children nodes in the context for which the predicate is true..
     * @param {SpinalContext} context Context to use for the search
     * @param {string} nodeType Type of node to find in children
     * @returns {Promise<Array<SpinalNode>>} The nodes that were found
     * @throws {TypeError} If context is not a SpinalContext
     * @throws {TypeError} If the predicate is not a function
     */
    SpinalNode.prototype.findInContextByType = function (context, nodeType) {
        return this.findInContext(context, function (node) {
            return node.getType().get() === nodeType;
        });
    };
    /**
   * Recursively finds all the children nodes in the context and classify them by type.
   * @param {SpinalContext} context Context to use for the search
   * @returns {Object<{types : string[], data : Object<string : SpinalNode[]>}>}
   * @throws {TypeError} If the relationNames are neither an array, a string or omitted
   * @throws {TypeError} If an element of relationNames is not a string
   * @throws {TypeError} If the predicate is not a function
   */
    SpinalNode.prototype.browseAndClassifyByTypeInContext = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var dataStructure;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataStructure = {
                            types: [],
                            data: {}
                        };
                        return [4 /*yield*/, this.findInContext(context, function (node) {
                                var type = node.getType().get();
                                if (dataStructure.types.indexOf(type) === -1) {
                                    dataStructure.types.push(type);
                                }
                                if (typeof dataStructure.data[type] === "undefined") {
                                    dataStructure.data[type] = [];
                                }
                                dataStructure.data[type].push(node);
                                return false;
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, dataStructure];
                }
            });
        });
    };
    /**
     * Recursively applies a function to all the children nodes.
     * @param {string|string[]} relationNames Array containing the relation names to follow
     * @param {SpinalNodeForEachFunc<SpinalNode<any>>} callback Function to apply to the nodes
     * @throws {TypeError} If the relationNames are neither an array, a string or omitted
     * @throws {TypeError} If an element of relationNames is not a string
     * @throws {TypeError} If the callback is not a function
     */
    SpinalNode.prototype.forEach = function (relationNames, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, nodes_1, nodes_1_1, node;
            var e_27, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof callback !== 'function') {
                            throw TypeError('callback must be a function');
                        }
                        return [4 /*yield*/, this.find(relationNames)];
                    case 1:
                        nodes = _b.sent();
                        try {
                            for (nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                                node = nodes_1_1.value;
                                callback(node);
                            }
                        }
                        catch (e_27_1) { e_27 = { error: e_27_1 }; }
                        finally {
                            try {
                                if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1["return"])) _a.call(nodes_1);
                            }
                            finally { if (e_27) throw e_27.error; }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Recursively applies a function to all the children nodes in the context.
     * @param {SpinalContext} context Context to use for the search
     * @param {forEachCallback} callback Function to apply to the nodes
     * @throws {TypeError} If context is not a SpinalContext
     * @throws {TypeError} If the callback is not a function
     */
    SpinalNode.prototype.forEachInContext = function (context, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, nodes_2, nodes_2_1, node;
            var e_28, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof callback !== 'function') {
                            throw TypeError('callback must be a function');
                        }
                        return [4 /*yield*/, this.findInContext(context)];
                    case 1:
                        nodes = _b.sent();
                        try {
                            for (nodes_2 = __values(nodes), nodes_2_1 = nodes_2.next(); !nodes_2_1.done; nodes_2_1 = nodes_2.next()) {
                                node = nodes_2_1.value;
                                callback(node);
                            }
                        }
                        catch (e_28_1) { e_28 = { error: e_28_1 }; }
                        finally {
                            try {
                                if (nodes_2_1 && !nodes_2_1.done && (_a = nodes_2["return"])) _a.call(nodes_2);
                            }
                            finally { if (e_28) throw e_28.error; }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Recursively applies a function to all the children nodes and returns the results in an array.
     * @param {string|string[]} relationNames Array containing the relation names to follow
     * @param {SpinalNodeMapFunc} callback Function to apply to the nodes
     * @returns {Promise<any[]>} The results of the callback for each node
     * @throws {TypeError} If the relationNames are neither an array, a string or omitted
     * @throws {TypeError} If an element of relationNames is not a string
     * @throws {TypeError} If the callback is not a function
     */
    SpinalNode.prototype.map = function (relationNames, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, results, nodes_3, nodes_3_1, node;
            var e_29, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof callback !== 'function') {
                            throw TypeError('The callback function must be a function');
                        }
                        return [4 /*yield*/, this.find(relationNames)];
                    case 1:
                        nodes = _b.sent();
                        results = [];
                        try {
                            for (nodes_3 = __values(nodes), nodes_3_1 = nodes_3.next(); !nodes_3_1.done; nodes_3_1 = nodes_3.next()) {
                                node = nodes_3_1.value;
                                results.push(callback(node));
                            }
                        }
                        catch (e_29_1) { e_29 = { error: e_29_1 }; }
                        finally {
                            try {
                                if (nodes_3_1 && !nodes_3_1.done && (_a = nodes_3["return"])) _a.call(nodes_3);
                            }
                            finally { if (e_29) throw e_29.error; }
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Recursively applies a function to all the children nodes in the context
     * and returns the results in an array.
     * @param {SpinalContext} context Context to use for the search
     * @param {function} callback Function to apply to the nodes
     * @returns {Promise<Array<*>>} The results of the callback for each node
     * @throws {TypeError} If context is not a SpinalContext
     * @throws {TypeError} If the callback is not a function
     */
    SpinalNode.prototype.mapInContext = function (context, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, results, nodes_4, nodes_4_1, node;
            var e_30, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof callback !== 'function') {
                            throw TypeError('The callback function must be a function');
                        }
                        return [4 /*yield*/, this.findInContext(context)];
                    case 1:
                        nodes = _b.sent();
                        results = [];
                        try {
                            for (nodes_4 = __values(nodes), nodes_4_1 = nodes_4.next(); !nodes_4_1.done; nodes_4_1 = nodes_4.next()) {
                                node = nodes_4_1.value;
                                results.push(callback(node));
                            }
                        }
                        catch (e_30_1) { e_30 = { error: e_30_1 }; }
                        finally {
                            try {
                                if (nodes_4_1 && !nodes_4_1.done && (_a = nodes_4["return"])) _a.call(nodes_4);
                            }
                            finally { if (e_30) throw e_30.error; }
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Return the relation list corresponding to the relation type.
     * @param {string} relationType Type of the relation
     * @returns {SpinalMap} Return the relation list corresponding to the relation type
     * @private
     */
    SpinalNode.prototype._getChildrenType = function (relationType) {
        return this.children.getElement(relationType);
    };
    /**
     * Return the relation corresponding.
     * @param {string} relationName Name of the relation
     * @param {string} relationType Type of the relation
     * @returns {SpinalRelation} The relation corresponding
     * @protected
     */
    SpinalNode.prototype._getRelation = function (relationName, relationType) {
        return this._getChildrenType(relationType).getElement(relationName);
    };
    /**
     * Removes a parent relation of the node.
     * @param {AnySpinalRelation} relation Relation to remove
     * @protected
     */
    SpinalNode.prototype._removeParent = function (relation) {
        var parentLst = this.parents.getElement(relation.getName().get());
        for (var i = 0; i < parentLst.length; i += 1) {
            if (parentLst[i].getId().get() === relation.getId().get()) {
                parentLst.splice(i);
                break;
            }
        }
    };
    /**
     * Removes the node from all parent relation the property parents.
     * @protected
     */
    SpinalNode.prototype._removeFromParents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, _a, _b, _c, parent, i;
            var e_31, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        promises = [];
                        try {
                            for (_a = __values(this.parents), _b = _a.next(); !_b.done; _b = _a.next()) {
                                _c = __read(_b.value, 2), parent = _c[1];
                                for (i = 0; i < parent.length; i += 1) {
                                    parent[i].load().then(function (parentRel) {
                                        promises.push(parentRel.removeChild(_this));
                                    });
                                }
                            }
                        }
                        catch (e_31_1) { e_31 = { error: e_31_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_d = _a["return"])) _d.call(_a);
                            }
                            finally { if (e_31) throw e_31.error; }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Adds the relation as parent of the node.
     * @param {AnySpinalRelation} relation Parent relation
     * @protected
     */
    SpinalNode.prototype._addParent = function (relation) {
        var relationName = relation.getName().get();
        if (this.parents.has(relationName)) {
            this.parents
                .getElement(relationName)
                .push(new SpinalNodePointer_1.SpinalNodePointer(relation, true));
        }
        else {
            var list = new spinal_core_connectorjs_type_1.Lst();
            list.push(new SpinalNodePointer_1.SpinalNodePointer(relation, true));
            this.parents.setElement(relationName, list);
        }
    };
    /**
     * Create a new relation for this node.
     * @param {string} relationName Name of the relation
     * @param {string} relationType Type of the relation
     * @protected
     */
    SpinalNode.prototype._createRelation = function (relationName, relationType) {
        var relation = SpinalRelationFactory_1.SpinalRelationFactory.getNewRelation(this, relationName, relationType);
        if (!this.children.has(relationType)) {
            this.children.setElement(relationType, new SpinalMap_1.SpinalMap());
        }
        this._getChildrenType(relationType).setElement(relationName, relation);
        return relation;
    };
    /**
     * Remove all children relation from the graph.
     * @returns {Promise<void>} An empty promise
     * @protected
     */
    SpinalNode.prototype._removeFromChildren = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, _a, _b, _c, relationMap, relationMap_4, relationMap_4_1, _d, relation;
            var e_32, _e, e_33, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        promises = [];
                        try {
                            for (_a = __values(this.children), _b = _a.next(); !_b.done; _b = _a.next()) {
                                _c = __read(_b.value, 2), relationMap = _c[1];
                                try {
                                    for (relationMap_4 = (e_33 = void 0, __values(relationMap)), relationMap_4_1 = relationMap_4.next(); !relationMap_4_1.done; relationMap_4_1 = relationMap_4.next()) {
                                        _d = __read(relationMap_4_1.value, 2), relation = _d[1];
                                        promises.push(relation.removeFromGraph());
                                    }
                                }
                                catch (e_33_1) { e_33 = { error: e_33_1 }; }
                                finally {
                                    try {
                                        if (relationMap_4_1 && !relationMap_4_1.done && (_f = relationMap_4["return"])) _f.call(relationMap_4);
                                    }
                                    finally { if (e_33) throw e_33.error; }
                                }
                            }
                        }
                        catch (e_32_1) { e_32 = { error: e_32_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_e = _a["return"])) _e.call(_a);
                            }
                            finally { if (e_32) throw e_32.error; }
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param relationNames
     */
    SpinalNode.prototype._getValidRelations = function (relationNames) {
        // let relName: string | string[] = relationNames;
        // if (Array.isArray(relationNames)) {
        //   if (relationNames.length === 0) {
        //     relName = this.getRelationNames();
        //   }
        // } else if (typeof relationNames === 'string') {
        //   relName = [relationNames];
        // } else {
        //   throw TypeError('relationNames must be an array, a string or omitted');
        // }
        if (relationNames === void 0) { relationNames = []; }
        var nodeRelations = this.getRelationNames();
        if (!Array.isArray(relationNames)) {
            if (relationNames instanceof RegExp) {
                return nodeRelations.filter(function (relationName) {
                    return relationName.match(relationNames);
                });
            }
            return [relationNames];
        }
        else if (Array.isArray(relationNames) && relationNames.length === 0) {
            return nodeRelations;
        }
        else if (Array.isArray(relationNames) && relationNames.length > 0) {
            return nodeRelations.filter(function (relationName) {
                for (var index = 0; index < relationNames.length; index++) {
                    var regex = relationNames[index];
                    if (relationName.match(regex)) {
                        return true;
                    }
                }
                return false;
            });
        }
    };
    return SpinalNode;
}(spinal_core_connectorjs_type_1.Model));
exports.SpinalNode = SpinalNode;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalNode]);
exports["default"] = SpinalNode;

},{"spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js","../Utilities":"../node_modules/spinal-model-graph/dist/src/Utilities.js","../index":"../node_modules/spinal-model-graph/dist/src/index.js","../SpinalNodePointer":"../node_modules/spinal-model-graph/dist/src/SpinalNodePointer.js","../Relations/SpinalRelationFactory":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationFactory.js","../SpinalMap":"../node_modules/spinal-model-graph/dist/src/SpinalMap.js","../SpinalSet":"../node_modules/spinal-model-graph/dist/src/SpinalSet.js"}],"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalContext.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var SpinalNode_1 = require("./SpinalNode");
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var __1 = require("..");
var Utilities_1 = require("../Utilities");
/**
 * A SpinalContext is the statring node of a part of the graph.
 * @class SpinalContext
 * @extends {SpinalNode<T>}
 * @template T
 */
var SpinalContext = /** @class */ (function (_super) {
    __extends(SpinalContext, _super);
    /**
     * Constructor for the SpinalContext class.
     * @param {String} [name="undefined"] Name of the context
     * @param {String} [type="SpinalContext"] Type of the context, usually unused
     * @param {SpinalNode | Model} [element] Element of the context
     * @throws {TypeError} If the element is not a Model
     */
    function SpinalContext(name, type, element) {
        if (name === void 0) { name = 'undefined'; }
        if (type === void 0) { type = 'SpinalContext'; }
        var _this = _super.call(this, name, type, element) || this;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return _this;
        _this.info.id.set(Utilities_1.guid(_this.constructor.name));
        return _this;
    }
    /**
     * Adds a child with a SpinalRelationLstPtrType.
     * @override
     * @param {SpinalNode | Model} child Node to add as child
     * @param {String} relationName Name of the relation
     * @param {String} [relationType=SPINAL_RELATION_PTR_LST_TYPE]
     * This parameter is here only to properly override the parent method
     * @returns {Promise<SpinalNode>} The child node in a promise
     * @throws {TypeError} If the child is not a model
     * @throws {TypeError} If the relation name is not a string
     */
    SpinalContext.prototype.addChild = function (child, relationName, relationType) {
        if (relationType === void 0) { relationType = __1.SPINAL_RELATION_PTR_LST_TYPE; }
        return _super.prototype.addChild.call(this, child, relationName, __1.SPINAL_RELATION_PTR_LST_TYPE);
    };
    /**
     * Adds a child with a SpinalRelationLstPtrType and notices
     * the context if a new relation was created.
     * @override
     * @param {SpinalNode | Model} child Node to add as child
     * @param {String} relationName Name of the relation
     * @param {String} [relationType=SPINAL_RELATION_PTR_LST_TYPE]
     * This parameter is here only to properly override the parent method
     * @param {SpinalContext} context Context to update, usually unused
     * @returns {Promise<SpinalNode>} The child node in a promise
     */
    SpinalContext.prototype.addChildInContext = function (child, relationName, relationType, context) {
        if (relationType === void 0) { relationType = __1.SPINAL_RELATION_PTR_LST_TYPE; }
        if (context === void 0) { context = this; }
        return _super.prototype.addChildInContext.call(this, child, relationName, __1.SPINAL_RELATION_PTR_LST_TYPE, context);
    };
    /**
     * Return the children of the node that are registered in the context
     * @override
     * @param {SpinalContext} [context=this] Context to use for the search, this by default
     * @returns {Promise<Array<SpinalNode>>} The children that were found
     */
    SpinalContext.prototype.getChildrenInContext = function (context) {
        if (context === void 0) { context = this; }
        return _super.prototype.getChildrenInContext.call(this, context);
    };
    return SpinalContext;
}(SpinalNode_1.SpinalNode));
exports.SpinalContext = SpinalContext;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalContext]);
exports["default"] = SpinalContext;

},{"./SpinalNode":"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalNode.js","spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js","..":"../node_modules/spinal-model-graph/dist/src/index.js","../Utilities":"../node_modules/spinal-model-graph/dist/src/Utilities.js"}],"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalGraph.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var SpinalNode_1 = require("./SpinalNode");
var spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
var __1 = require("..");
var Utilities_1 = require("../Utilities");
var SpinalContext_1 = require("./SpinalContext");
var HAS_CONTEXT_RELATION_NAME = 'hasContext';
/**
 * Starting node of a graph.
 * @extends SpinalNode
 */
var SpinalGraph = /** @class */ (function (_super) {
    __extends(SpinalGraph, _super);
    /**
     * Constructor for the SpinalGraph class.
     * @param {String} [name="undefined"] Name of the graph, usually unused
     * @param {String} [type="SpinalGraph"] Type of the graph, usually unused
     * @param {SpinalNode | Model} [element] Element of the graph
     * @throws {TypeError} If the element is not a Model
     */
    function SpinalGraph(name, type, element) {
        if (name === void 0) { name = 'undefined'; }
        if (type === void 0) { type = 'SpinalGraph'; }
        var _this = _super.call(this, name, type, element) || this;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return _this;
        _this.info.id.set(Utilities_1.guid(_this.constructor.name));
        return _this;
    }
    /**
     * Adds a context to the graph.
     * @param {SpinalContext} context Context to be added
     * @returns {Promise<SpinalContext>} The added context
     * @throws {TypeError} If the context is not a context
     */
    SpinalGraph.prototype.addContext = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!(context instanceof SpinalContext_1.SpinalContext)) {
                    throw new TypeError('context must be a context');
                }
                return [2 /*return*/, this.addChild(context, HAS_CONTEXT_RELATION_NAME, __1.SPINAL_RELATION_TYPE)];
            });
        });
    };
    /**
     * Searches for a context using its name.
     * @param {String} name Name of the context
     * @returns {SpinalContext | undefined} The wanted context or undefined
     * @throws {TypeError} If name is not a string
     */
    SpinalGraph.prototype.getContext = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var children;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof name !== 'string') {
                            throw TypeError('name must be string');
                        }
                        return [4 /*yield*/, this.getChildren([HAS_CONTEXT_RELATION_NAME])];
                    case 1:
                        children = _a.sent();
                        return [2 /*return*/, children.find(function (child) { return child.info.name.get() === name; })];
                }
            });
        });
    };
    /**
     * Empty override of the SpinalNode method.
     * @override
     * @returns {Promise<nothing>} An empty promise
     */
    SpinalGraph.prototype.removeFromGraph = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return SpinalGraph;
}(SpinalNode_1.SpinalNode));
exports.SpinalGraph = SpinalGraph;
spinal_core_connectorjs_type_1.spinalCore.register_models([SpinalGraph]);
exports["default"] = SpinalGraph;

},{"./SpinalNode":"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalNode.js","spinal-core-connectorjs_type":"../node_modules/spinal-core-connectorjs_type/dist/SpinalModel.js","..":"../node_modules/spinal-model-graph/dist/src/index.js","../Utilities":"../node_modules/spinal-model-graph/dist/src/Utilities.js","./SpinalContext":"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalContext.js"}],"../node_modules/spinal-model-graph/dist/src/index.js":[function(require,module,exports) {
"use strict";
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
exports.__esModule = true;
var SpinalGraph_1 = require("./Nodes/SpinalGraph");
exports.SpinalGraph = SpinalGraph_1.SpinalGraph;
var SpinalNode_1 = require("./Nodes/SpinalNode");
exports.SpinalNode = SpinalNode_1.SpinalNode;
var SpinalContext_1 = require("./Nodes/SpinalContext");
exports.SpinalContext = SpinalContext_1.SpinalContext;
var SpinalRelationRef_1 = require("./Relations/SpinalRelationRef");
exports.SpinalRelationRef = SpinalRelationRef_1.SpinalRelationRef;
var SpinalRelationLstPtr_1 = require("./Relations/SpinalRelationLstPtr");
exports.SpinalRelationLstPtr = SpinalRelationLstPtr_1.SpinalRelationLstPtr;
var SpinalRelationPtrLst_1 = require("./Relations/SpinalRelationPtrLst");
exports.SpinalRelationPtrLst = SpinalRelationPtrLst_1.SpinalRelationPtrLst;
var SpinalRelationFactory_1 = require("./Relations/SpinalRelationFactory");
exports.SpinalRelationFactory = SpinalRelationFactory_1.SpinalRelationFactory;
exports.SPINAL_RELATION_TYPE = SpinalRelationFactory_1.SPINAL_RELATION_TYPE;
exports.SPINAL_RELATION_LST_PTR_TYPE = SpinalRelationFactory_1.SPINAL_RELATION_LST_PTR_TYPE;
exports.SPINAL_RELATION_PTR_LST_TYPE = SpinalRelationFactory_1.SPINAL_RELATION_PTR_LST_TYPE;
var SpinalMap_1 = require("./SpinalMap");
exports.SpinalMap = SpinalMap_1.SpinalMap;
var SpinalNodePointer_1 = require("./SpinalNodePointer");
exports.SpinalNodePointer = SpinalNodePointer_1.SpinalNodePointer;
var SpinalSet_1 = require("./SpinalSet");
exports.SpinalSet = SpinalSet_1.SpinalSet;

},{"./Nodes/SpinalGraph":"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalGraph.js","./Nodes/SpinalNode":"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalNode.js","./Nodes/SpinalContext":"../node_modules/spinal-model-graph/dist/src/Nodes/SpinalContext.js","./Relations/SpinalRelationRef":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationRef.js","./Relations/SpinalRelationLstPtr":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationLstPtr.js","./Relations/SpinalRelationPtrLst":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationPtrLst.js","./Relations/SpinalRelationFactory":"../node_modules/spinal-model-graph/dist/src/Relations/SpinalRelationFactory.js","./SpinalMap":"../node_modules/spinal-model-graph/dist/src/SpinalMap.js","./SpinalNodePointer":"../node_modules/spinal-model-graph/dist/src/SpinalNodePointer.js","./SpinalSet":"../node_modules/spinal-model-graph/dist/src/SpinalSet.js"}],"spinal.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Spinal = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var config = {
  spinalConnector: {
    user: 168,
    password: 'IZEnMGgpUZxm',
    host: 'localhost',
    port: 8080,
    protocol: 'http'
  },
  file: {
    path: '/__users__/admin/Digital_twin'
  }
};

var spinalCore = require('spinal-core-connectorjs');

var spinalgraph = require('spinal-model-graph');

var Spinal =
/*#__PURE__*/
function () {
  function Spinal() {
    _classCallCheck(this, Spinal);

    var connect_opt = "http://".concat(config.spinalConnector.user, ":").concat(config.spinalConnector.password, "@").concat(config.spinalConnector.host, ":").concat(config.spinalConnector.port, "/");
    this.conn = spinalCore.connect(connect_opt);
    FileSystem.CONNECTOR_TYPE = "Browser";
  }

  _createClass(Spinal, [{
    key: "load",
    value: function load() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        spinalCore.load(_this.conn, config.file.path, function (model) {
          // on success
          resolve(model);
        }, function () {
          // on error
          alert("error model not found.");
          reject();
        });
      });
    }
  }, {
    key: "nodeToJson",
    value: function nodeToJson(id) {}
  }, {
    key: "haveChildren",
    value: function haveChildren(node) {
      return true;
    }
  }, {
    key: "getChildren",
    value: function () {
      var _getChildren = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(node) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", true);

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getChildren(_x) {
        return _getChildren.apply(this, arguments);
      }

      return getChildren;
    }()
  }]);

  return Spinal;
}();

exports.Spinal = Spinal;
},{"spinal-core-connectorjs":"../node_modules/spinal-core-connectorjs/lib/spinalcore.node.js","spinal-model-graph":"../node_modules/spinal-model-graph/dist/src/index.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "36767" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","spinal.js"], null)
//# sourceMappingURL=/html/graph/spinal.fe25b3a1.js.map