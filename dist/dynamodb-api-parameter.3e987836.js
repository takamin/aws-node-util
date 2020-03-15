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
})({"../node_modules/uuid/lib/rng-browser.js":[function(require,module,exports) {
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],"../node_modules/uuid/lib/bytesToUuid.js":[function(require,module,exports) {
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;

},{}],"../node_modules/uuid/v4.js":[function(require,module,exports) {
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/rng":"../node_modules/uuid/lib/rng-browser.js","./lib/bytesToUuid":"../node_modules/uuid/lib/bytesToUuid.js"}],"../node_modules/base64-js/index.js":[function(require,module,exports) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],"../node_modules/ieee754/index.js":[function(require,module,exports) {
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"../node_modules/isarray/index.js":[function(require,module,exports) {
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],"../node_modules/buffer/index.js":[function(require,module,exports) {

var global = arguments[3];
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":"../node_modules/base64-js/index.js","ieee754":"../node_modules/ieee754/index.js","isarray":"../node_modules/isarray/index.js","buffer":"../node_modules/buffer/index.js"}],"../node_modules/clone/clone.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
var clone = function () {
  'use strict';

  function _instanceof(obj, type) {
    return type != null && obj instanceof type;
  }

  var nativeMap;

  try {
    nativeMap = Map;
  } catch (_) {
    // maybe a reference error because no `Map`. Give it a dummy value that no
    // value will ever be an instanceof.
    nativeMap = function () {};
  }

  var nativeSet;

  try {
    nativeSet = Set;
  } catch (_) {
    nativeSet = function () {};
  }

  var nativePromise;

  try {
    nativePromise = Promise;
  } catch (_) {
    nativePromise = function () {};
  }
  /**
   * Clones (copies) an Object using deep copying.
   *
   * This function supports circular references by default, but if you are certain
   * there are no circular references in your object, you can save some CPU time
   * by calling clone(obj, false).
   *
   * Caution: if `circular` is false and `parent` contains circular references,
   * your program may enter an infinite loop and crash.
   *
   * @param `parent` - the object to be cloned
   * @param `circular` - set to true if the object to be cloned may contain
   *    circular references. (optional - true by default)
   * @param `depth` - set to a number if the object is only to be cloned to
   *    a particular depth. (optional - defaults to Infinity)
   * @param `prototype` - sets the prototype to be used when cloning an object.
   *    (optional - defaults to parent prototype).
   * @param `includeNonEnumerable` - set to true if the non-enumerable properties
   *    should be cloned as well. Non-enumerable properties on the prototype
   *    chain will be ignored. (optional - false by default)
  */


  function clone(parent, circular, depth, prototype, includeNonEnumerable) {
    if (typeof circular === 'object') {
      depth = circular.depth;
      prototype = circular.prototype;
      includeNonEnumerable = circular.includeNonEnumerable;
      circular = circular.circular;
    } // maintain two arrays for circular references, where corresponding parents
    // and children have the same index


    var allParents = [];
    var allChildren = [];
    var useBuffer = typeof Buffer != 'undefined';
    if (typeof circular == 'undefined') circular = true;
    if (typeof depth == 'undefined') depth = Infinity; // recurse this function so we don't reset allParents and allChildren

    function _clone(parent, depth) {
      // cloning null always returns null
      if (parent === null) return null;
      if (depth === 0) return parent;
      var child;
      var proto;

      if (typeof parent != 'object') {
        return parent;
      }

      if (_instanceof(parent, nativeMap)) {
        child = new nativeMap();
      } else if (_instanceof(parent, nativeSet)) {
        child = new nativeSet();
      } else if (_instanceof(parent, nativePromise)) {
        child = new nativePromise(function (resolve, reject) {
          parent.then(function (value) {
            resolve(_clone(value, depth - 1));
          }, function (err) {
            reject(_clone(err, depth - 1));
          });
        });
      } else if (clone.__isArray(parent)) {
        child = [];
      } else if (clone.__isRegExp(parent)) {
        child = new RegExp(parent.source, __getRegExpFlags(parent));
        if (parent.lastIndex) child.lastIndex = parent.lastIndex;
      } else if (clone.__isDate(parent)) {
        child = new Date(parent.getTime());
      } else if (useBuffer && Buffer.isBuffer(parent)) {
        if (Buffer.allocUnsafe) {
          // Node.js >= 4.5.0
          child = Buffer.allocUnsafe(parent.length);
        } else {
          // Older Node.js versions
          child = new Buffer(parent.length);
        }

        parent.copy(child);
        return child;
      } else if (_instanceof(parent, Error)) {
        child = Object.create(parent);
      } else {
        if (typeof prototype == 'undefined') {
          proto = Object.getPrototypeOf(parent);
          child = Object.create(proto);
        } else {
          child = Object.create(prototype);
          proto = prototype;
        }
      }

      if (circular) {
        var index = allParents.indexOf(parent);

        if (index != -1) {
          return allChildren[index];
        }

        allParents.push(parent);
        allChildren.push(child);
      }

      if (_instanceof(parent, nativeMap)) {
        parent.forEach(function (value, key) {
          var keyChild = _clone(key, depth - 1);

          var valueChild = _clone(value, depth - 1);

          child.set(keyChild, valueChild);
        });
      }

      if (_instanceof(parent, nativeSet)) {
        parent.forEach(function (value) {
          var entryChild = _clone(value, depth - 1);

          child.add(entryChild);
        });
      }

      for (var i in parent) {
        var attrs;

        if (proto) {
          attrs = Object.getOwnPropertyDescriptor(proto, i);
        }

        if (attrs && attrs.set == null) {
          continue;
        }

        child[i] = _clone(parent[i], depth - 1);
      }

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(parent);

        for (var i = 0; i < symbols.length; i++) {
          // Don't need to worry about cloning a symbol because it is a primitive,
          // like a number or string.
          var symbol = symbols[i];
          var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);

          if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
            continue;
          }

          child[symbol] = _clone(parent[symbol], depth - 1);

          if (!descriptor.enumerable) {
            Object.defineProperty(child, symbol, {
              enumerable: false
            });
          }
        }
      }

      if (includeNonEnumerable) {
        var allPropertyNames = Object.getOwnPropertyNames(parent);

        for (var i = 0; i < allPropertyNames.length; i++) {
          var propertyName = allPropertyNames[i];
          var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);

          if (descriptor && descriptor.enumerable) {
            continue;
          }

          child[propertyName] = _clone(parent[propertyName], depth - 1);
          Object.defineProperty(child, propertyName, {
            enumerable: false
          });
        }
      }

      return child;
    }

    return _clone(parent, depth);
  }
  /**
   * Simple flat clone using prototype, accepts only objects, usefull for property
   * override on FLAT configuration object (no nested props).
   *
   * USE WITH CAUTION! This may not behave as you wish if you do not know how this
   * works.
   */


  clone.clonePrototype = function clonePrototype(parent) {
    if (parent === null) return null;

    var c = function () {};

    c.prototype = parent;
    return new c();
  }; // private utility functions


  function __objToStr(o) {
    return Object.prototype.toString.call(o);
  }

  clone.__objToStr = __objToStr;

  function __isDate(o) {
    return typeof o === 'object' && __objToStr(o) === '[object Date]';
  }

  clone.__isDate = __isDate;

  function __isArray(o) {
    return typeof o === 'object' && __objToStr(o) === '[object Array]';
  }

  clone.__isArray = __isArray;

  function __isRegExp(o) {
    return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
  }

  clone.__isRegExp = __isRegExp;

  function __getRegExpFlags(re) {
    var flags = '';
    if (re.global) flags += 'g';
    if (re.ignoreCase) flags += 'i';
    if (re.multiline) flags += 'm';
    return flags;
  }

  clone.__getRegExpFlags = __getRegExpFlags;
  return clone;
}();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}
},{"buffer":"../node_modules/buffer/index.js"}],"../lib/dynamodb-data-type.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
"use strict"; //https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function DynamoDbDataType() {
  this._is = {
    BufferSet: true,
    NumberSet: true,
    StringSet: true,
    List: true
  };
}

DynamoDbDataType.primaryTypeOf = function (value) {
  if (value === null) {
    return "null";
  }

  if (Buffer.isBuffer(value)) {
    return "Buffer";
  }

  if (Array.isArray(value)) {
    return "Array";
  }

  return _typeof(value);
};

DynamoDbDataType.type2id = {
  "Buffer": "B",
  "BufferSet": "BS",
  "boolean": "BOOL",
  "List": "L",
  "object": "M",
  "number": "N",
  "NumberSet": "NS",
  "string": "S",
  "StringSet": "SS"
};

DynamoDbDataType.prototype.countPossibleType = function () {
  var count = 0;
  Object.keys(this._is).forEach(function (key) {
    if (this._is[key]) {
      count++;
    }
  }.bind(this));
  return count;
};

DynamoDbDataType.prototype.getPossibleType = function () {
  var type = null;
  var count = 0;
  Object.keys(this._is).forEach(function (key) {
    if (this._is[key]) {
      type = key;
      count++;
    }
  }.bind(this));

  if (count > 1) {
    type = false;
  }

  return type;
};

DynamoDbDataType.prototype.getPredictedType = function () {
  var count = this.countPossibleType();

  if (count > 1 && this._is.List) {
    this._is.List = false;
    count--;
  }

  var type = null;

  switch (count) {
    case 0:
      type = null;
      break;

    case 1:
      type = this.getPossibleType();
      break;

    default:
      type = false;
      break;
  }

  return type;
};

DynamoDbDataType.prototype.checkElementType = function (element) {
  switch (DynamoDbDataType.primaryTypeOf(element)) {
    case "Buffer":
      this._is.NumberSet = false;
      this._is.StringSet = false;
      break;

    case "number":
      this._is.BufferSet = false;
      this._is.StringSet = false;
      break;

    case "string":
      this._is.BufferSet = false;
      this._is.NumberSet = false;
      break;

    default:
      this._is.BufferSet = false;
      this._is.StringSet = false;
      this._is.NumberSet = false;
      break;
  }

  return this.getPossibleType();
};

DynamoDbDataType.detect = function (value) {
  var type = DynamoDbDataType.primaryTypeOf(value);

  if (type == "Array") {
    var detector = new DynamoDbDataType();
    var arrtype = false;
    var len = value.length;

    for (var i = 0; i < len && arrtype === false; i++) {
      arrtype = detector.checkElementType(value[i]);
    }

    if (arrtype == false || arrtype == null) {
      arrtype = detector.getPredictedType();
    }

    type = arrtype;
  }

  return type;
};

module.exports = DynamoDbDataType;
},{"buffer":"../node_modules/buffer/index.js"}],"../lib/dynamodb-data-models.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
"use strict";

var DynamoDbDataType = require("./dynamodb-data-type.js");

function DynamoDbDataModels() {}

DynamoDbDataModels.obj2map = function (value) {
  if (value == "null") {
    throw new Error("Cannot convert null");
  }

  var type = DynamoDbDataType.detect(value);
  var typeid = DynamoDbDataType.type2id[type];
  var map = {};

  switch (type) {
    case "Buffer":
      if (typeof value == "string") {
        map[typeid] = Buffer.from(value, "base64");
      } else {
        map[typeid] = value;
      }

      break;

    case "boolean":
      map[typeid] = value ? "true" : "false";
      break;

    case "object":
      {
        var obj = {};
        Object.keys(value).forEach(function (key) {
          obj[key] = DynamoDbDataModels.obj2map(value[key]);
        });
        map[typeid] = obj;
      }
      break;

    case "List":
      {
        var _obj = [];
        value.forEach(function (element) {
          _obj.push(DynamoDbDataModels.obj2map(element));
        });
        map[typeid] = _obj;
      }
      break;

    case "BufferSet":
    case "StringSet":
      {
        var _obj2 = [];
        value.forEach(function (element) {
          _obj2.push(element);
        });
        map[typeid] = _obj2;
      }
      break;

    case "NumberSet":
      {
        var _obj3 = [];
        value.forEach(function (element) {
          _obj3.push("" + element);
        });
        map[typeid] = _obj3;
      }
      break;

    case "number":
      map[typeid] = "" + value;
      break;

    case "undefined":
      throw new Error("Cannot convert undefind");

    default:
      map[typeid] = value;
      break;
  }

  return map;
};

DynamoDbDataModels.map2obj = function (map) {
  var obj = {};
  Object.keys(map).forEach(function (key) {
    Object.keys(map[key]).forEach(function (type) {
      var value = map[key][type];

      switch (type) {
        case "S":
          obj[key] = value;
          break;

        case "N":
          obj[key] = parseInt(value);
          break;

        case "BOOL":
          obj[key] = value == "true";
          break;

        case "M":
          obj[key] = DynamoDbDataModels.map2obj(value);
          break;
      }
    });
  });
  return obj;
};

module.exports = DynamoDbDataModels;
},{"./dynamodb-data-type.js":"../lib/dynamodb-data-type.js","buffer":"../node_modules/buffer/index.js"}],"../node_modules/ms/index.js":[function(require,module,exports) {
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

},{}],"../node_modules/debug/src/common.js":[function(require,module,exports) {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = require('ms');

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;

},{"ms":"../node_modules/ms/index.js"}],"../node_modules/process/browser.js":[function(require,module,exports) {

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
},{}],"../node_modules/debug/src/browser.js":[function(require,module,exports) {
var process = require("process");
/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
/**
 * Colors.
 */

exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
// eslint-disable-next-line complexity

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  } // Internet Explorer and Edge do not support colors.


  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  } // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  const c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into

  let index = 0;
  let lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, match => {
    if (match === '%%') {
      return;
    }

    index++;

    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}
/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */


function log(...args) {
  // This hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return typeof console === 'object' && console.log && console.log(...args);
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  let r;

  try {
    r = exports.storage.getItem('debug');
  } catch (error) {} // Swallow
  // XXX (@Qix-) should we be logging these?
  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = undefined;
  }

  return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */


function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

module.exports = require('./common')(exports);
const {
  formatters
} = module.exports;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};
},{"./common":"../node_modules/debug/src/common.js","process":"../node_modules/process/browser.js"}],"../node_modules/object-keys/isArguments.js":[function(require,module,exports) {
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
  var str = toStr.call(value);
  var isArgs = str === '[object Arguments]';

  if (!isArgs) {
    isArgs = str !== '[object Array]' && value !== null && typeof value === 'object' && typeof value.length === 'number' && value.length >= 0 && toStr.call(value.callee) === '[object Function]';
  }

  return isArgs;
};
},{}],"../node_modules/object-keys/implementation.js":[function(require,module,exports) {
'use strict';

var keysShim;

if (!Object.keys) {
  // modified from https://github.com/es-shims/es5-shim
  var has = Object.prototype.hasOwnProperty;
  var toStr = Object.prototype.toString;

  var isArgs = require('./isArguments'); // eslint-disable-line global-require


  var isEnumerable = Object.prototype.propertyIsEnumerable;
  var hasDontEnumBug = !isEnumerable.call({
    toString: null
  }, 'toString');
  var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
  var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];

  var equalsConstructorPrototype = function (o) {
    var ctor = o.constructor;
    return ctor && ctor.prototype === o;
  };

  var excludedKeys = {
    $applicationCache: true,
    $console: true,
    $external: true,
    $frame: true,
    $frameElement: true,
    $frames: true,
    $innerHeight: true,
    $innerWidth: true,
    $onmozfullscreenchange: true,
    $onmozfullscreenerror: true,
    $outerHeight: true,
    $outerWidth: true,
    $pageXOffset: true,
    $pageYOffset: true,
    $parent: true,
    $scrollLeft: true,
    $scrollTop: true,
    $scrollX: true,
    $scrollY: true,
    $self: true,
    $webkitIndexedDB: true,
    $webkitStorageInfo: true,
    $window: true
  };

  var hasAutomationEqualityBug = function () {
    /* global window */
    if (typeof window === 'undefined') {
      return false;
    }

    for (var k in window) {
      try {
        if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
          try {
            equalsConstructorPrototype(window[k]);
          } catch (e) {
            return true;
          }
        }
      } catch (e) {
        return true;
      }
    }

    return false;
  }();

  var equalsConstructorPrototypeIfNotBuggy = function (o) {
    /* global window */
    if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
      return equalsConstructorPrototype(o);
    }

    try {
      return equalsConstructorPrototype(o);
    } catch (e) {
      return false;
    }
  };

  keysShim = function keys(object) {
    var isObject = object !== null && typeof object === 'object';
    var isFunction = toStr.call(object) === '[object Function]';
    var isArguments = isArgs(object);
    var isString = isObject && toStr.call(object) === '[object String]';
    var theKeys = [];

    if (!isObject && !isFunction && !isArguments) {
      throw new TypeError('Object.keys called on a non-object');
    }

    var skipProto = hasProtoEnumBug && isFunction;

    if (isString && object.length > 0 && !has.call(object, 0)) {
      for (var i = 0; i < object.length; ++i) {
        theKeys.push(String(i));
      }
    }

    if (isArguments && object.length > 0) {
      for (var j = 0; j < object.length; ++j) {
        theKeys.push(String(j));
      }
    } else {
      for (var name in object) {
        if (!(skipProto && name === 'prototype') && has.call(object, name)) {
          theKeys.push(String(name));
        }
      }
    }

    if (hasDontEnumBug) {
      var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

      for (var k = 0; k < dontEnums.length; ++k) {
        if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
          theKeys.push(dontEnums[k]);
        }
      }
    }

    return theKeys;
  };
}

module.exports = keysShim;
},{"./isArguments":"../node_modules/object-keys/isArguments.js"}],"../node_modules/object-keys/index.js":[function(require,module,exports) {
'use strict';

var slice = Array.prototype.slice;

var isArgs = require('./isArguments');

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) {
  return origKeys(o);
} : require('./implementation');
var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
  if (Object.keys) {
    var keysWorksWithArguments = function () {
      // Safari 5.0 bug
      var args = Object.keys(arguments);
      return args && args.length === arguments.length;
    }(1, 2);

    if (!keysWorksWithArguments) {
      Object.keys = function keys(object) {
        // eslint-disable-line func-name-matching
        if (isArgs(object)) {
          return originalKeys(slice.call(object));
        }

        return originalKeys(object);
      };
    }
  } else {
    Object.keys = keysShim;
  }

  return Object.keys || keysShim;
};

module.exports = keysShim;
},{"./isArguments":"../node_modules/object-keys/isArguments.js","./implementation":"../node_modules/object-keys/implementation.js"}],"../node_modules/is-arguments/index.js":[function(require,module,exports) {
'use strict';

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var toStr = Object.prototype.toString;

var isStandardArguments = function isArguments(value) {
  if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
    return false;
  }

  return toStr.call(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
  if (isStandardArguments(value)) {
    return true;
  }

  return value !== null && typeof value === 'object' && typeof value.length === 'number' && value.length >= 0 && toStr.call(value) !== '[object Array]' && toStr.call(value.callee) === '[object Function]';
};

var supportsStandardArguments = function () {
  return isStandardArguments(arguments);
}();

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
},{}],"../node_modules/object-is/index.js":[function(require,module,exports) {
"use strict";
/* https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is */

var NumberIsNaN = function (value) {
  return value !== value;
};

module.exports = function is(a, b) {
  if (a === 0 && b === 0) {
    return 1 / a === 1 / b;
  } else if (a === b) {
    return true;
  } else if (NumberIsNaN(a) && NumberIsNaN(b)) {
    return true;
  }

  return false;
};
},{}],"../node_modules/function-bind/implementation.js":[function(require,module,exports) {
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],"../node_modules/function-bind/index.js":[function(require,module,exports) {
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":"../node_modules/function-bind/implementation.js"}],"../node_modules/has/src/index.js":[function(require,module,exports) {
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);
},{"function-bind":"../node_modules/function-bind/index.js"}],"../node_modules/is-regex/index.js":[function(require,module,exports) {
'use strict';

var has = require('has');

var regexExec = RegExp.prototype.exec;
var gOPD = Object.getOwnPropertyDescriptor;

var tryRegexExecCall = function tryRegexExec(value) {
  try {
    var lastIndex = value.lastIndex;
    value.lastIndex = 0;
    regexExec.call(value);
    return true;
  } catch (e) {
    return false;
  } finally {
    value.lastIndex = lastIndex;
  }
};

var toStr = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isRegex(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (!hasToStringTag) {
    return toStr.call(value) === regexClass;
  }

  var descriptor = gOPD(value, 'lastIndex');
  var hasLastIndexDataProperty = descriptor && has(descriptor, 'value');

  if (!hasLastIndexDataProperty) {
    return false;
  }

  return tryRegexExecCall(value);
};
},{"has":"../node_modules/has/src/index.js"}],"../node_modules/define-properties/index.js":[function(require,module,exports) {
'use strict';

var keys = require('object-keys');

var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';
var toStr = Object.prototype.toString;
var concat = Array.prototype.concat;
var origDefineProperty = Object.defineProperty;

var isFunction = function (fn) {
  return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
  var obj = {};

  try {
    origDefineProperty(obj, 'x', {
      enumerable: false,
      value: obj
    }); // eslint-disable-next-line no-unused-vars, no-restricted-syntax

    for (var _ in obj) {
      // jscs:ignore disallowUnusedVariables
      return false;
    }

    return obj.x === obj;
  } catch (e) {
    /* this is IE 8. */
    return false;
  }
};

var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
  if (name in object && (!isFunction(predicate) || !predicate())) {
    return;
  }

  if (supportsDescriptors) {
    origDefineProperty(object, name, {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    });
  } else {
    object[name] = value;
  }
};

var defineProperties = function (object, map) {
  var predicates = arguments.length > 2 ? arguments[2] : {};
  var props = keys(map);

  if (hasSymbols) {
    props = concat.call(props, Object.getOwnPropertySymbols(map));
  }

  for (var i = 0; i < props.length; i += 1) {
    defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
  }
};

defineProperties.supportsDescriptors = !!supportsDescriptors;
module.exports = defineProperties;
},{"object-keys":"../node_modules/object-keys/index.js"}],"../node_modules/regexp.prototype.flags/implementation.js":[function(require,module,exports) {
'use strict';

var toObject = Object;
var TypeErr = TypeError;

module.exports = function flags() {
  if (this != null && this !== toObject(this)) {
    throw new TypeErr('RegExp.prototype.flags getter called on non-object');
  }

  var result = '';

  if (this.global) {
    result += 'g';
  }

  if (this.ignoreCase) {
    result += 'i';
  }

  if (this.multiline) {
    result += 'm';
  }

  if (this.dotAll) {
    result += 's';
  }

  if (this.unicode) {
    result += 'u';
  }

  if (this.sticky) {
    result += 'y';
  }

  return result;
};
},{}],"../node_modules/regexp.prototype.flags/polyfill.js":[function(require,module,exports) {
'use strict';

var implementation = require('./implementation');

var supportsDescriptors = require('define-properties').supportsDescriptors;

var gOPD = Object.getOwnPropertyDescriptor;
var TypeErr = TypeError;

module.exports = function getPolyfill() {
  if (!supportsDescriptors) {
    throw new TypeErr('RegExp.prototype.flags requires a true ES5 environment that supports property descriptors');
  }

  if (/a/mig.flags === 'gim') {
    var descriptor = gOPD(RegExp.prototype, 'flags');

    if (descriptor && typeof descriptor.get === 'function' && typeof /a/.dotAll === 'boolean') {
      return descriptor.get;
    }
  }

  return implementation;
};
},{"./implementation":"../node_modules/regexp.prototype.flags/implementation.js","define-properties":"../node_modules/define-properties/index.js"}],"../node_modules/regexp.prototype.flags/shim.js":[function(require,module,exports) {
'use strict';

var supportsDescriptors = require('define-properties').supportsDescriptors;

var getPolyfill = require('./polyfill');

var gOPD = Object.getOwnPropertyDescriptor;
var defineProperty = Object.defineProperty;
var TypeErr = TypeError;
var getProto = Object.getPrototypeOf;
var regex = /a/;

module.exports = function shimFlags() {
  if (!supportsDescriptors || !getProto) {
    throw new TypeErr('RegExp.prototype.flags requires a true ES5 environment that supports property descriptors');
  }

  var polyfill = getPolyfill();
  var proto = getProto(regex);
  var descriptor = gOPD(proto, 'flags');

  if (!descriptor || descriptor.get !== polyfill) {
    defineProperty(proto, 'flags', {
      configurable: true,
      enumerable: false,
      get: polyfill
    });
  }

  return polyfill;
};
},{"define-properties":"../node_modules/define-properties/index.js","./polyfill":"../node_modules/regexp.prototype.flags/polyfill.js"}],"../node_modules/regexp.prototype.flags/index.js":[function(require,module,exports) {

'use strict';

var define = require('define-properties');

var implementation = require('./implementation');

var getPolyfill = require('./polyfill');

var shim = require('./shim');

var flagsBound = Function.call.bind(implementation);
define(flagsBound, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});
module.exports = flagsBound;
},{"define-properties":"../node_modules/define-properties/index.js","./implementation":"../node_modules/regexp.prototype.flags/implementation.js","./polyfill":"../node_modules/regexp.prototype.flags/polyfill.js","./shim":"../node_modules/regexp.prototype.flags/shim.js"}],"../node_modules/is-date-object/index.js":[function(require,module,exports) {
'use strict';

var getDay = Date.prototype.getDay;

var tryDateObject = function tryDateObject(value) {
  try {
    getDay.call(value);
    return true;
  } catch (e) {
    return false;
  }
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};
},{}],"../node_modules/deep-equal/index.js":[function(require,module,exports) {
var objectKeys = require('object-keys');
var isArguments = require('is-arguments');
var is = require('object-is');
var isRegex = require('is-regex');
var flags = require('regexp.prototype.flags');
var isDate = require('is-date-object');

var getTime = Date.prototype.getTime;

function deepEqual(actual, expected, options) {
  var opts = options || {};

  // 7.1. All identical values are equivalent, as determined by ===.
  if (opts.strict ? is(actual, expected) : actual === expected) {
    return true;
  }

  // 7.3. Other pairs that do not both pass typeof value == 'object', equivalence is determined by ==.
  if (!actual || !expected || (typeof actual !== 'object' && typeof expected !== 'object')) {
    return opts.strict ? is(actual, expected) : actual == expected;
  }

  /*
   * 7.4. For all other Object pairs, including Array objects, equivalence is
   * determined by having the same number of owned properties (as verified
   * with Object.prototype.hasOwnProperty.call), the same set of keys
   * (although not necessarily the same order), equivalent values for every
   * corresponding key, and an identical 'prototype' property. Note: this
   * accounts for both named and indexed properties on Arrays.
   */
  // eslint-disable-next-line no-use-before-define
  return objEquiv(actual, expected, opts);
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer(x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') {
    return false;
  }
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') {
    return false;
  }
  return true;
}

function objEquiv(a, b, opts) {
  /* eslint max-statements: [2, 50] */
  var i, key;
  if (typeof a !== typeof b) { return false; }
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) { return false; }

  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) { return false; }

  if (isArguments(a) !== isArguments(b)) { return false; }

  var aIsRegex = isRegex(a);
  var bIsRegex = isRegex(b);
  if (aIsRegex !== bIsRegex) { return false; }
  if (aIsRegex || bIsRegex) {
    return a.source === b.source && flags(a) === flags(b);
  }

  if (isDate(a) && isDate(b)) {
    return getTime.call(a) === getTime.call(b);
  }

  var aIsBuffer = isBuffer(a);
  var bIsBuffer = isBuffer(b);
  if (aIsBuffer !== bIsBuffer) { return false; }
  if (aIsBuffer || bIsBuffer) { // && would work too, because both are true or both false here
    if (a.length !== b.length) { return false; }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { return false; }
    }
    return true;
  }

  if (typeof a !== typeof b) { return false; }

  try {
    var ka = objectKeys(a);
    var kb = objectKeys(b);
  } catch (e) { // happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates hasOwnProperty)
  if (ka.length !== kb.length) { return false; }

  // the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  // ~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i]) { return false; }
  }
  // equivalent values for every corresponding key, and ~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) { return false; }
  }

  return true;
}

module.exports = deepEqual;

},{"object-keys":"../node_modules/object-keys/index.js","is-arguments":"../node_modules/is-arguments/index.js","object-is":"../node_modules/object-is/index.js","is-regex":"../node_modules/is-regex/index.js","regexp.prototype.flags":"../node_modules/regexp.prototype.flags/index.js","is-date-object":"../node_modules/is-date-object/index.js"}],"../node_modules/lex-bnf/lib/token.js":[function(require,module,exports) {
"use strict";
/**
 * Token class.
 * @constructor
 */
function Token() {
    this._charbuf = [];
    this._term = "";
    this._type = null;
    this._lineNumber = 0;
    this._col = 0;
}

/**
 * A getter for the term.
 * @returns {string} a term.
 */
Token.prototype.getTerm = function() {
    return this._term;
};

/**
 * A setter for the term.
 * @param {string} term a term to be set.
 * @returns {undefined}
 */
Token.prototype.setTerm = function(term) {
    this._term = term;
    this._charbuf = [];
};

/**
 * Set the token position.
 * @param {number} lineNumber A line number.
 * @param {number} col A column position.
 * @returns {undefined}
 */
Token.prototype.setPos = function(lineNumber, col) {
    this._lineNumber = lineNumber;
    this._col = col;
};

/**
 * Get a line number of this token.
 * @returns {number} A line number.
 */
Token.prototype.getLineNumber = function() {
    return this._lineNumber;
};

/**
 * Get a column position of this token.
 * @returns {number} A line number.
 */
Token.prototype.getColumn = function() {
    return this._col;
};

/**
 * A setter for this type.
 * @param {string} type A type name of this token.
 * @returns {undefined}
 */
Token.prototype.setType = function(type) {
    this._type = type;
};

/**
 * A getter for this type.
 * @returns {string} A type name of this token.
 */
Token.prototype.getType = function() {
    return this._type;
};

/**
 * Push a character to unfixed term buffer.
 * @param {string} c A character.
 * @returns {undefined}
 */
Token.prototype.pushChar  = function(c) {
    this._charbuf.push(c);
};

/**
 * Fix a term buffer.
 * @returns {undefined}
 */
Token.prototype.fixTerm = function() {
    this._term = this._charbuf.join('');
    this._charbuf = [];
};

/**
 * Test if this term is a kind of white-spaces.
 * @returns {boolean} The test result.
 */
Token.prototype.isWhiteSpace = function() {
    var t = this.getType();
    return t === "WS" || t === "WS-LINCMT" || t === "WS-BLKCMT";
};

module.exports = Token;

},{}],"../node_modules/lex-bnf/lib/lexana.js":[function(require,module,exports) {
"use strict";
const Token = require("./token.js");

/**
 * Lexical essentially tokenizer.
 * @constructor
 */
function LexAnalyzer() {
    this._mode = "";
    this._tokenList = [];
    this._token = null;
    this._source = "";
    this._lineNum = 1;
    this._columnPos = 1;
    this._i = 0;
    this._c = null;
}

/**
 * Parse lexical tokesn.
 * @param {string} source The source text to be parse.
 * @returns {Array<Token>} The result of parsing.
 */
LexAnalyzer.parse = function(source) {
    let tokenizer = new LexAnalyzer();
    return tokenizer.parse(source);
};

/**
 * Test if the character is a kind of white-spaces.
 * @param {string} c a character.
 * @returns {boolean} the test result.
 */
LexAnalyzer.isWhite = function(c) {
    return c.match(/^\s/);
};

/**
 * Test if the character is a kind of punctuaters.
 * @param {string} c a character.
 * @returns {boolean} the test result.
 */
LexAnalyzer.isPunct = function(c) {
    return c.match(/^[!"#$%&'()-=^~\\|@[{;+:*\]},<.>/?_]/);
};

/**
 * Test if the character is a kind of alphabet.
 * @param {string} c a character.
 * @returns {boolean} the test result.
 */
LexAnalyzer.isAlpha = function(c) {
    return c.match(/^[_a-z]/i);
};

/**
 * Test if the character is a kind of alphabet or number.
 * @param {string} c a character.
 * @returns {boolean} the test result.
 */
LexAnalyzer.isAlnum = function(c) {
    return c.match(/^[_a-z0-9]/i);
};

/**
 * Test if the character is a kind of digits.
 * @param {string} c a character.
 * @returns {boolean} the test result.
 */
LexAnalyzer.isDigit = function(c) {
    return c.match(/^[0-9]/);
};

/**
 * Parse lexical tokesn.
 * @param {string} source The source text to be parse.
 * @returns {Array<Token>} The result of parsing.
 */
LexAnalyzer.prototype.parse = function(source) {
    this._mode = "";
    this._tokenList = [];
    this._token = null;
    this._lineNum = 1;
    this._columnPos = 1;
    this._i = 0;
    this._c = null;
    this._source = source;
    while(this._i < this._source.length) {
        this._c = this._source.charAt(this._i);
        switch(this._mode) {
            case "":
                this.parseDefault();
                break;
            case "WS":
                this.parseWhiteSpace();
                break;
            case "IDENT":
                this.parseIdentifier();
                break;
            case "NUMLIT":
                this.parseNumberLiteral();
                break;
        }
        ++this._i;
        ++this._columnPos;
    }
    if(this._token != null) {
        this.finishToken();
    }
    return this._tokenList;
};

/**
 * Parse in initial state.
 * @returns {undefined}
 */
LexAnalyzer.prototype.parseDefault = function() {
    this._token = new Token();
    this._token.setPos(this._lineNum, this._columnPos);
    if(LexAnalyzer.isWhite(this._c)) {
        this._token.pushChar(this._c);
        this._mode = "WS";
    } else if(LexAnalyzer.isAlpha(this._c)) {
        this._token.pushChar(this._c);
        this._mode = "IDENT";
    } else if(LexAnalyzer.isDigit(this._c)) {
        this._token.pushChar(this._c);
        this._mode = "NUMLIT";
    } else if(LexAnalyzer.isPunct(this._c)) {
        this._token.pushChar(this._c);
        this.finishToken("PUNCT");
    }
};

/**
 * Parse white-spaces.
 * @returns {undefined}
 */
LexAnalyzer.prototype.parseWhiteSpace = function() {
    if(LexAnalyzer.isWhite(this._c)) {
        this._token.pushChar(this._c);
        if(this._c == "\n") {
            this._columnPos = 0;
            this._lineNum++;
        }
    } else {
        this.finishToken();
        this.ungetChar();
    }
};

/**
 * Parse an identifier.
 * @returns {undefined}
 */
LexAnalyzer.prototype.parseIdentifier = function() {
    if(LexAnalyzer.isAlnum(this._c)) {
        this._token.pushChar(this._c);
    } else {
        this.finishToken();
        this.ungetChar();
    }
};

/**
 * Parse a number literal.
 * @returns {undefined}
 */
LexAnalyzer.prototype.parseNumberLiteral = function() {
    if(this._c.match(/^[0-9a-z]$/i)) {
        this._token.pushChar(this._c);
    } else {
        this.finishToken();
        this.ungetChar();
    }
};

/**
 * Finish the token parsing.
 * @param {string} mode A mode name to be set to the token finally.
 * If this parameter is null, the tokenizer's currently mode is used.
 * @returns {undefined}
 */
LexAnalyzer.prototype.finishToken = function(mode) {
    this._token.setType(mode || this._mode);
    this._token.fixTerm();
    this._tokenList.push(this._token);
    this._token = null;
    this._mode = "";
};

/**
 * Push back the parsing char.
 * @returns {undefined}
 */
LexAnalyzer.prototype.ungetChar = function() {
    --this._i;
    --this._columnPos;
};

module.exports = LexAnalyzer;

},{"./token.js":"../node_modules/lex-bnf/lib/token.js"}],"../node_modules/lex-bnf/lib/bnf-result.js":[function(require,module,exports) {
"use strict";
const debug = require("debug")("BnfResult");

/**
 * BNF parsing result object.
 * @constructor
 */
function BnfResult() {
    this._syntaxError = false;
    this.terms = [];
    this.lexCount = 0;
}

BnfResult.prototype.existsTerm = function(name) {
    let term = this.getTerm(name);
    if(term !== false) {
        return term.match;
    }
    return false;
};

BnfResult.prototype.getTerm = function(name) {
    let n = this.terms.length;
    for(let i = 0; i < n; i++) {
        if(this.terms[i].term === name) {
            return this.terms[i];
        }
    }
    return false;
};

BnfResult.prototype.getWordsList = function(termName, indent) {
    termName = termName || "*";
    indent = indent || 0;
    let words = [];
    this.terms.forEach(function(term) {
        if(term.match) {
            if(termName === "*" || term.term === termName) {
                let subWords = term.getTermsList();
                words.push(subWords);
            } else {
                let subWords = term.getWordsList(termName, indent + 1);
                subWords.forEach((subWord)=>{
                    words.push(subWord);
                });
            }
        }
    });
    return words;
};

BnfResult.prototype.getTermsList = function(indent) {
    indent = indent || 0;
    let s = [];
    this.terms.forEach(function(term) {
        if(term.terms.length == 0) {
            if(term.lex) {
                s.push(term.lex.getTerm());
            }
        } else {
            term.getTermsList(indent+1).forEach(function(term) {
                s.push(term);
            });
        }
    });
    return s;
};

/**
 * Search parsed language elements having specified name.
 * @param {string} name definition name to search
 * @returns {Array<BnfResult>} found elements
 * @deprecated Use BnfResult#enumerate(name)
 */
BnfResult.prototype.getTermListOf = function(name) {
    debug(`BnfResult.getTermListOf(${name})`);
    debug(`this: ${this.toString()}`);
    const list = [];
    this.enumerate(name, result => list.push(result));
    debug(`BnfResult.getTermListOf returns:`);
    debug(`${list.map(e=>e.toString()).join("\n")}`);
    return list;
};

/**
 * Enumerate parsed language elements having specified name.
 * @param {string} name definition name to search
 * @param {Function} callback function that takes one parameter which is
 *  instance of BnfResult enumerated.
 * @returns {undefined}
 */
BnfResult.prototype.enumerate = function(name, callback) {
    debug(`BnfResult.enumerate(${name})`);
    debug(`this: ${this.toString()}`);
    const enumerate = result => {
        if(result.term === name) {
            debug(`BnfResult.enumerate callback ${result.toString()}`);
            callback(result);
        } else {
            result.terms.forEach(term => enumerate(term));
        }
    };
    enumerate(this);
};

/**
 * Bind descendent terms to one token.
 * @param {string} type A type name for the result token.
 * @returns {Token} The result token.
 */
BnfResult.prototype.buildWord = function(type) {
    let lex = null;
    let s = [];
    this.terms.forEach( term => {
        let subLex = null;
        if(term.lex != null) {
            subLex = term.lex;
        } else {
            subLex = term.buildWord( type );
        }
        if(subLex != null) {
            if(lex == null) {
                lex = subLex;
            }
            s.push(subLex.getTerm());
        }
    });
    if(lex != null) {
        lex.setType(type);
        lex.setTerm(s.join(""));
    }
    return lex;
};

/**
 * Get token list that the type name of all terms is rewritten by the rule of
 * specified parameters.
 * @param {Array<string>} termsOfWord The type names that should be rewrited.
 * @param {object} linkedWordTokenTypeMap The new type names pointed by old name.
 * @returns {Array<Token>} The list of tokens that the type was replaced
 */
BnfResult.prototype.rebuildWords = function(
        termsOfWord, linkedWordTokenTypeMap)
{
    let lexList = [];
    this.terms.forEach( childTerm => {
        if(childTerm.match) {
            let term = childTerm.term;
            if(typeof(term) === "string"
                && termsOfWord.indexOf(term) >= 0)
            {
                let lexType = linkedWordTokenTypeMap[term];
                let lex = childTerm.buildWord(lexType);
                lexList.push(lex);
            } else {
                let childLex = childTerm.lex;
                if(childLex != null) {
                    lexList.push(childLex);
                }
                childTerm.rebuildWords(
                    termsOfWord, linkedWordTokenTypeMap
                ).forEach( lex => { lexList.push(lex); });
            }
        }
    });
    return lexList;
};

/**
 * Stringify this object.
 * @returns {string} representing the content recursively.
 */
BnfResult.prototype.toString = function() {
    const _toString = (result, i) => {
        const indent = " ".repeat(i*4);
        if(!Array.isArray(result.terms) || result.terms.length == 0) {
            const lex = result.lex;
            if(lex == null) {
                return `${indent}! lex is null`;
            } else {
                return `${indent}- (${lex._lineNumber},${lex._col}) : ${JSON.stringify(lex._term)} : ${lex._type}`;
            }
        } else {
            return `${indent}+ [${result.term}]\n${result.terms.map( term => _toString(term, i+1) ).join("\n")}`;
        }
    };
    return _toString(this, 0);
};

module.exports = BnfResult;

},{"debug":"../node_modules/debug/src/browser.js"}],"../node_modules/lex-bnf/lib/bnf.js":[function(require,module,exports) {
"use strict";
const debug = require("debug")("BNF");
const deepEqual = require("deep-equal");
const LexAnalyzer = require("./lexana.js");
const BnfResult = require("./bnf-result.js");

/**
 * BNF processor.
 * @constructor
 * @param {string} root The root term name that must be in bnf object as a key.
 * @param {object} bnf The BNF definition object.
 * @param {object} linkedWordTokenTypeMap The word definition.
 */
function BNF(root, bnf, linkedWordTokenTypeMap) {
    this._root = root;
    this._bnf = bnf;
    this._linkedWordTokenTypeMap = linkedWordTokenTypeMap;
    this._termsOfWord =
        (linkedWordTokenTypeMap == null ? [] :
            Object.keys(linkedWordTokenTypeMap));
}

BNF.literal = function(value) {
    return {
        role: "lit",
        value: value,
        inverse: false,
    };
};

BNF.literalUntil = function(value) {
    return {
        role: "lit",
        value: value,
        inverse: true,
    };
};

BNF.lex = function(value) {
    return {
        role: "lex",
        value: value,
        inverse: false,
    };
};

BNF.lexTypeUntil = function(value) {
    return {
        role: "lex",
        value: value,
        inverse: true,
    };
};

BNF.ident = BNF.lex("IDENT");
BNF.numlit = BNF.lex("NUMLIT");
BNF.strlitDQ = BNF.lex("STRLIT-DQ");
BNF.strlitSQ = BNF.lex("STRLIT-SQ");
BNF.comma = BNF.literal(",");

/**
 * Parse the source text with this BNF definition.
 * @param {string} source the input text.
 * @param {BNF} tokenizer the tokenizer defining words.
 * @returns {Array<BnfResult>} the result of parsing.
 * @deprecated Use BNF.tokenize and BNF#parseTokens
 */
BNF.prototype.parse = function(source, tokenizer) {
    debug(`BNF.parse source: ${source}`);
    let tokens = BNF.tokenize(source, tokenizer);
    if(tokens != null && !Array.isArray(tokens) && !tokens.match) {
        debug(`BNF.parse returns ${tokens.constructor.name} ${JSON.stringify(tokens, null, 2)}`);
        return tokens; // tokens is BnfResult object.
    }
    debug(`BNF.parse tokens:\n${tokens.map(t=>JSON.stringify(t)).join("\n")}`);
    const result = this.parseSentence(this._root, tokens, 0, 0);
    //debug(`BNF.parse returns ${result.constructor.name}\n${JSON.stringify(result, null, 4)}`);
    debug(`${result.constructor.name}\n${result.toString()}`);
    //debug(`BNF.parse returns ${result.map(item=>JSON.stringify(item)).join("\n")}`);
    return result;
};

/**
 * Tokenize the source text.
 *
 * TOKENIZE
 * --------
 *
 * At first, `source` is converted to a token list by `LexAnalyzer.parse`.
 *
 * BINDING TOKENS
 * --------------
 *
 * And if the parameter `tokenizer` is a BNF object, `tokenizer.buildWords`
 * binds the specific tokens in the list and converts it to a new token.
 *
 * REMOVING WHITE SPACES
 * ---------------------
 *
 * By default, all the white space tokens in the list are removed.
 * But if the `tokenizer` is `false`, the binding words and removing the tokens
 * are not done.
 *
 * @param {string} source the input text.
 * @param {BNF|boolean|undefined} tokenizer the tokenizer defining words
 *  binding or false not to invoke buildWords and remove the white spaces
 *  from tokens.
 * @returns {Array<BnfResult>} the word list.
 */
BNF.tokenize = function(source, tokenizer) {
    debug(`BNF.tokenize source: ${source}`);
    let tokens = LexAnalyzer.parse(source);
    if(tokenizer != null && tokenizer.constructor === BNF) {
        debug(`BNF.tokenize tokenizer is NOT null. About to build words`);
        tokens = tokenizer.buildWords(tokens);
    }
    //Remove whitespaces
    if(Array.isArray(tokens) && tokenizer !== false) {
        debug(`BNF.tokenize tokens is Array. About to Remove white spaces`);
        tokens = tokens.filter(
            lex => lex != null && !lex.isWhiteSpace());
    }
    debug(`BNF.parse returns ${tokens.constructor.name} ${JSON.stringify(tokens, null, 2)}`);
    return tokens;
};

/**
 * Build a word list with this BNF definition from given lexical tokens.
 * @param {Array<BnfResult>} tokens lexical tokens.
 * @returns {Array<BnfResult>} the word list.
 */
BNF.prototype.buildWords = function(tokens) {
    for(;;) {
        let result = this.parseSentence(this._root, tokens, 0, 0);
        if(!result.match || result._error) {
            return result;
        }
        let tokens2 = result.rebuildWords(
                this._termsOfWord,
                this._linkedWordTokenTypeMap);
        if(deepEqual(tokens2, tokens)) {
            break;
        } else {
            tokens = tokens2;
        }
    }
    return tokens;
};

/**
 * Parse the token list with this BNF definition.
 * @param {Array<BnfResult>} tokens the token list.
 * @returns {Array<BnfResult>} the result of parsing.
 */
BNF.prototype.parseTokens = function(tokens) {
    let result = this.parseSentence(this._root, tokens, 0, 0);
    return result;
};

BNF.prototype.parseSentence = function(root, lexList, lexIndex, indent) {
    if(!(root in this._bnf)) {
        throw new Error(root + " is not declared in BNF");
    }
    let declaration = this._bnf[root];
    let nDecl = declaration.length;
    declaration.forEach((d,i) => {
        debug(`${"==".repeat(indent)}> BNF.parseSentence ${root}[${i}] ${d.map(item=>JSON.stringify(item)).join(" => ")}`);
    });

    let sentenceResult = new BnfResult();
    sentenceResult.match = false;
    sentenceResult.term = root;

    for(let iDecl = 0; iDecl < nDecl; iDecl++) {
        let termList = declaration[iDecl];
        debug(`${"==".repeat(indent)}> ${root}[${iDecl}] ${termList.map(item=>JSON.stringify(item)).join(" => ")}`);
        let termListResult = this.parseTermList(termList, lexList, lexIndex, indent + 1);
        if(termListResult._error) {
            debug(`BNF.parseSentence ERROR: ${JSON.stringify({ iDecl, nDecl, termList })}`);
            debug(`BNF.parseSentence(${JSON.stringify({ root, lex: lexList[lexIndex]._term, lexIndex, indent })}`);
            sentenceResult.match = termListResult.match;
            sentenceResult.lexCount += termListResult.lexCount;
            sentenceResult._error = true;
            break;
        } else if(termListResult.match) {
            sentenceResult.match = true;
            sentenceResult.lexCount += termListResult.lexCount;
            sentenceResult.terms = termListResult.terms;
            debug(`${"==".repeat(indent)}> parseSentence MATCH term:${root}: ${JSON.stringify(lexList.slice(lexIndex, lexIndex + sentenceResult.lexCount).map(L=>L._term).join(" "))}`);
            debug(`${"==".repeat(indent)}> parseSentence termList: ${JSON.stringify(termList)}`);
            break;
        }
    }
    if(!sentenceResult.match) {
        debug(`${"==".repeat(indent)}> parseSentence UNMATCH term:${root}`);
        debug(`${"==".repeat(indent)}> parseSentence declaration: ${JSON.stringify(declaration)}`);
    }
    return sentenceResult;
};

BNF.prototype.parseTermList = function(termList, lexList, lexIndex, indent) {
    if(termList == null) {
        throw new Error("Illegal termList is entried in BNF --- " + JSON.stringify(termList));
    }
    let nTerm = termList.length;

    let termListResult = new BnfResult();
    termListResult.match = true;

    for(let iTerm = 0; iTerm < nTerm; iTerm++) {
        debug(`${"--".repeat(indent)}> parseTermList Loop: ${iTerm}/${nTerm} ${JSON.stringify(termList[iTerm])}`);
        let term = termList[iTerm];
        if(term == null) {
            throw new Error("null term is entried at " + iTerm);
        }
        let termResult = new BnfResult();
        termResult.match = false;
        termResult.lex = null;
        termResult.optional = false;
        termResult.term = term;

        let termType = typeof(term);
        if(termType != "string" && termType !== "object" || Array.isArray(term)) {
            throw new Error("Illegal BNF definition at " + JSON.stringify(term));
        }
        if(termType === "string") {
            termResult.optional = (term.match(/^\[.*\]$/) ? true : false);
            term = term.replace(/^\[(.*)\]$/, "$1");
            termResult.term = term;
            if(lexIndex < lexList.length) {
                let sentenceResult = this.parseSentence(term, lexList, lexIndex, indent);
                termResult.match = sentenceResult.match;
                termResult._error = sentenceResult._error;
                termResult.terms = sentenceResult.terms;
                if(termResult.match) {
                    termListResult.lexCount += sentenceResult.lexCount;
                    lexIndex += sentenceResult.lexCount;
                }
            }
        } else {
            // term is an object
            if(lexIndex < lexList.length) {
                termResult.lex = lexList[lexIndex];
                let lexValue = null;
                switch(termResult.term.role) {
                    case "lit": lexValue = termResult.lex.getTerm(); break;
                    case "lex": lexValue = termResult.lex.getType(); break;
                }

                termResult.match = (lexValue.toUpperCase() === termResult.term.value.toUpperCase());
                debug(`${"--".repeat(indent)}> ${termResult.match} ${JSON.stringify(termResult.lex)} ${JSON.stringify(termResult.term)}`);
                debug(`${"  ".repeat(indent)}> ${lexValue} <=> ${termResult.term.value}`);
                if(termResult.match) {
                    if(!termResult.term.inverse) {
                        termListResult.lexCount++;
                        lexIndex++;
                    } else {
                        termResult.match = true;
                        termListResult.lexCount++;
                        lexIndex++;
                    }
                } else if(termResult.term.inverse) {
                    if(lexIndex < lexList.length - 1) {
                        termResult.match = true;
                        termListResult.lexCount++;
                        lexIndex++;
                        iTerm--;
                    } else {
                        termResult.match = false;
                        termResult._error = true;
                        termListResult.lexCount++;
                        lexIndex++;
                    }
                }
                debug(`${"--".repeat(indent)}> BNF.parseTermList test match:${termResult.match} lexValue:${lexValue} == termValue:${termResult.term.value}`);
            }
        }
        termListResult.terms.push(termResult);
        if(termResult._error) {
            debug(`BNF.parseTermList ERROR: ${JSON.stringify({ iTerm, nTerm, term, termType })}`);
            debug(`BNF.parseTermList(${JSON.stringify({ term: termList[0], lex: lexList[0]._term, lexIndex, indent })}`);
            termListResult.match = false;
            termListResult.terms = [];
            termListResult.lexCount = 0;
            termListResult._error = termResult._error;
            break;
        } else if(!termResult.optional && !termResult.match) {
            debug(`BNF.parseTermList NOT MATCH: ${JSON.stringify({ iTerm, nTerm, term, termType })}`);
            debug(`BNF.parseTermList(${JSON.stringify({ term: termList[0], lex: lexList[0]._term, lexIndex, indent })}`);
            termListResult.match = false;
            termListResult.terms = [];
            termListResult.lexCount = 0;
            termListResult._error = termResult._error;
            break;
        }
    }
    return termListResult;
};

module.exports = BNF;

},{"debug":"../node_modules/debug/src/browser.js","deep-equal":"../node_modules/deep-equal/index.js","./lexana.js":"../node_modules/lex-bnf/lib/lexana.js","./bnf-result.js":"../node_modules/lex-bnf/lib/bnf-result.js"}],"../node_modules/lex-bnf/index.js":[function(require,module,exports) {
"use strict";
module.exports = require("./lib/bnf.js");

},{"./lib/bnf.js":"../node_modules/lex-bnf/lib/bnf.js"}],"../lib/dynamodb-keywords.js":[function(require,module,exports) {
"use strict"; //
// ref https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/ReservedWords.html
//

var keywords = ["ABORT", "ABSOLUTE", "ACTION", "ADD", "AFTER", "AGENT", "AGGREGATE", "ALL", "ALLOCATE", "ALTER", "ANALYZE", "AND", "ANY", "ARCHIVE", "ARE", "ARRAY", "AS", "ASC", "ASCII", "ASENSITIVE", "ASSERTION", "ASYMMETRIC", "AT", "ATOMIC", "ATTACH", "ATTRIBUTE", "AUTH", "AUTHORIZATION", "AUTHORIZE", "AUTO", "AVG", "BACK", "BACKUP", "BASE", "BATCH", "BEFORE", "BEGIN", "BETWEEN", "BIGINT", "BINARY", "BIT", "BLOB", "BLOCK", "BOOLEAN", "BOTH", "BREADTH", "BUCKET", "BULK", "BY", "BYTE", "CALL", "CALLED", "CALLING", "CAPACITY", "CASCADE", "CASCADED", "CASE", "CAST", "CATALOG", "CHAR", "CHARACTER", "CHECK", "CLASS", "CLOB", "CLOSE", "CLUSTER", "CLUSTERED", "CLUSTERING", "CLUSTERS", "COALESCE", "COLLATE", "COLLATION", "COLLECTION", "COLUMN", "COLUMNS", "COMBINE", "COMMENT", "COMMIT", "COMPACT", "COMPILE", "COMPRESS", "CONDITION", "CONFLICT", "CONNECT", "CONNECTION", "CONSISTENCY", "CONSISTENT", "CONSTRAINT", "CONSTRAINTS", "CONSTRUCTOR", "CONSUMED", "CONTINUE", "CONVERT", "COPY", "CORRESPONDING", "COUNT", "COUNTER", "CREATE", "CROSS", "CUBE", "CURRENT", "CURSOR", "CYCLE", "DATA", "DATABASE", "DATE", "DATETIME", "DAY", "DEALLOCATE", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DEFINE", "DEFINED", "DEFINITION", "DELETE", "DELIMITED", "DEPTH", "DEREF", "DESC", "DESCRIBE", "DESCRIPTOR", "DETACH", "DETERMINISTIC", "DIAGNOSTICS", "DIRECTORIES", "DISABLE", "DISCONNECT", "DISTINCT", "DISTRIBUTE", "DO", "DOMAIN", "DOUBLE", "DROP", "DUMP", "DURATION", "DYNAMIC", "EACH", "ELEMENT", "ELSE", "ELSEIF", "EMPTY", "ENABLE", "END", "EQUAL", "EQUALS", "ERROR", "ESCAPE", "ESCAPED", "EVAL", "EVALUATE", "EXCEEDED", "EXCEPT", "EXCEPTION", "EXCEPTIONS", "EXCLUSIVE", "EXEC", "EXECUTE", "EXISTS", "EXIT", "EXPLAIN", "EXPLODE", "EXPORT", "EXPRESSION", "EXTENDED", "EXTERNAL", "EXTRACT", "FAIL", "FALSE", "FAMILY", "FETCH", "FIELDS", "FILE", "FILTER", "FILTERING", "FINAL", "FINISH", "FIRST", "FIXED", "FLATTERN", "FLOAT", "FOR", "FORCE", "FOREIGN", "FORMAT", "FORWARD", "FOUND", "FREE", "FROM", "FULL", "FUNCTION", "FUNCTIONS", "GENERAL", "GENERATE", "GET", "GLOB", "GLOBAL", "GO", "GOTO", "GRANT", "GREATER", "GROUP", "GROUPING", "HANDLER", "HASH", "HAVE", "HAVING", "HEAP", "HIDDEN", "HOLD", "HOUR", "IDENTIFIED", "IDENTITY", "IF", "IGNORE", "IMMEDIATE", "IMPORT", "IN", "INCLUDING", "INCLUSIVE", "INCREMENT", "INCREMENTAL", "INDEX", "INDEXED", "INDEXES", "INDICATOR", "INFINITE", "INITIALLY", "INLINE", "INNER", "INNTER", "INOUT", "INPUT", "INSENSITIVE", "INSERT", "INSTEAD", "INT", "INTEGER", "INTERSECT", "INTERVAL", "INTO", "INVALIDATE", "IS", "ISOLATION", "ITEM", "ITEMS", "ITERATE", "JOIN", "KEY", "KEYS", "LAG", "LANGUAGE", "LARGE", "LAST", "LATERAL", "LEAD", "LEADING", "LEAVE", "LEFT", "LENGTH", "LESS", "LEVEL", "LIKE", "LIMIT", "LIMITED", "LINES", "LIST", "LOAD", "LOCAL", "LOCALTIME", "LOCALTIMESTAMP", "LOCATION", "LOCATOR", "LOCK", "LOCKS", "LOG", "LOGED", "LONG", "LOOP", "LOWER", "MAP", "MATCH", "MATERIALIZED", "MAX", "MAXLEN", "MEMBER", "MERGE", "METHOD", "METRICS", "MIN", "MINUS", "MINUTE", "MISSING", "MOD", "MODE", "MODIFIES", "MODIFY", "MODULE", "MONTH", "MULTI", "MULTISET", "NAME", "NAMES", "NATIONAL", "NATURAL", "NCHAR", "NCLOB", "NEW", "NEXT", "NO", "NONE", "NOT", "NULL", "NULLIF", "NUMBER", "NUMERIC", "OBJECT", "OF", "OFFLINE", "OFFSET", "OLD", "ON", "ONLINE", "ONLY", "OPAQUE", "OPEN", "OPERATOR", "OPTION", "OR", "ORDER", "ORDINALITY", "OTHER", "OTHERS", "OUT", "OUTER", "OUTPUT", "OVER", "OVERLAPS", "OVERRIDE", "OWNER", "PAD", "PARALLEL", "PARAMETER", "PARAMETERS", "PARTIAL", "PARTITION", "PARTITIONED", "PARTITIONS", "PATH", "PERCENT", "PERCENTILE", "PERMISSION", "PERMISSIONS", "PIPE", "PIPELINED", "PLAN", "POOL", "POSITION", "PRECISION", "PREPARE", "PRESERVE", "PRIMARY", "PRIOR", "PRIVATE", "PRIVILEGES", "PROCEDURE", "PROCESSED", "PROJECT", "PROJECTION", "PROPERTY", "PROVISIONING", "PUBLIC", "PUT", "QUERY", "QUIT", "QUORUM", "RAISE", "RANDOM", "RANGE", "RANK", "RAW", "READ", "READS", "REAL", "REBUILD", "RECORD", "RECURSIVE", "REDUCE", "REF", "REFERENCE", "REFERENCES", "REFERENCING", "REGEXP", "REGION", "REINDEX", "RELATIVE", "RELEASE", "REMAINDER", "RENAME", "REPEAT", "REPLACE", "REQUEST", "RESET", "RESIGNAL", "RESOURCE", "RESPONSE", "RESTORE", "RESTRICT", "RESULT", "RETURN", "RETURNING", "RETURNS", "REVERSE", "REVOKE", "RIGHT", "ROLE", "ROLES", "ROLLBACK", "ROLLUP", "ROUTINE", "ROW", "ROWS", "RULE", "RULES", "SAMPLE", "SATISFIES", "SAVE", "SAVEPOINT", "SCAN", "SCHEMA", "SCOPE", "SCROLL", "SEARCH", "SECOND", "SECTION", "SEGMENT", "SEGMENTS", "SELECT", "SELF", "SEMI", "SENSITIVE", "SEPARATE", "SEQUENCE", "SERIALIZABLE", "SESSION", "SET", "SETS", "SHARD", "SHARE", "SHARED", "SHORT", "SHOW", "SIGNAL", "SIMILAR", "SIZE", "SKEWED", "SMALLINT", "SNAPSHOT", "SOME", "SOURCE", "SPACE", "SPACES", "SPARSE", "SPECIFIC", "SPECIFICTYPE", "SPLIT", "SQL", "SQLCODE", "SQLERROR", "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "START", "STATE", "STATIC", "STATUS", "STORAGE", "STORE", "STORED", "STREAM", "STRING", "STRUCT", "STYLE", "SUB", "SUBMULTISET", "SUBPARTITION", "SUBSTRING", "SUBTYPE", "SUM", "SUPER", "SYMMETRIC", "SYNONYM", "SYSTEM", "TABLE", "TABLESAMPLE", "TEMP", "TEMPORARY", "TERMINATED", "TEXT", "THAN", "THEN", "THROUGHPUT", "TIME", "TIMESTAMP", "TIMEZONE", "TINYINT", "TO", "TOKEN", "TOTAL", "TOUCH", "TRAILING", "TRANSACTION", "TRANSFORM", "TRANSLATE", "TRANSLATION", "TREAT", "TRIGGER", "TRIM", "TRUE", "TRUNCATE", "TTL", "TUPLE", "TYPE", "UNDER", "UNDO", "UNION", "UNIQUE", "UNIT", "UNKNOWN", "UNLOGGED", "UNNEST", "UNPROCESSED", "UNSIGNED", "UNTIL", "UPDATE", "UPPER", "URL", "USAGE", "USE", "USER", "USERS", "USING", "UUID", "VACUUM", "VALUE", "VALUED", "VALUES", "VARCHAR", "VARIABLE", "VARIANCE", "VARINT", "VARYING", "VIEW", "VIEWS", "VIRTUAL", "VOID", "WAIT", "WHEN", "WHENEVER", "WHERE", "WHILE", "WINDOW", "WITH", "WITHIN", "WITHOUT", "WORK", "WRAPPED", "WRITE", "YEAR", "ZONE"];

var isKeyword = function isKeyword(name) {
  return keywords.indexOf(name.toUpperCase()) >= 0;
};

module.exports = {
  keywords: keywords,
  isKeyword: isKeyword
};
},{}],"../lib/dynamodb-sqlish-parser.js":[function(require,module,exports) {
"use strict";

var BNF = require("lex-bnf");

function DynamoDbSqlishParser() {} //
// Basic Terms
//


var CREATE = BNF.literal("CREATE");
var DROP = BNF.literal("DROP");
var TABLE = BNF.literal("TABLE");
var ALTER = BNF.literal("ALTER");
var SELECT = BNF.literal("SELECT");
var INSERT = BNF.literal("INSERT");
var UPDATE = BNF.literal("UPDATE");
var DELETE = BNF.literal("DELETE");
var SET = BNF.literal("SET");
var INTO = BNF.literal("INTO");
var VALUES = BNF.literal("VALUES");
var FROM = BNF.literal("FROM");
var WHERE = BNF.literal("WHERE");
var FILTER = BNF.literal("FILTER");
var LIMIT = BNF.literal("LIMIT");
var BETWEEN = BNF.literal("BETWEEN");
var AND = BNF.literal("AND");
var OR = BNF.literal("OR");
var NOT = BNF.literal("NOT");
var IN = BNF.literal("IN");
DynamoDbSqlishParser.BNF = {
  "sqlish": [["sqlish-create-table"], ["sqlish-update-table"], ["sqlish-delete-table"], [BNF.literal("SCAN"), "sqlish-scan"], [BNF.literal("QUERY"), "sqlish-query"], ["sqlish-put-item"], ["sqlish-set-item"], ["sqlish-delete-item"]],
  "sqlish-create-table": [[CREATE, TABLE, "table-name", BNF.literal("("), "key-schema-list", BNF.literal(")"), "[create-table-alter-clause]"]],
  "sqlish-update-table": [[ALTER, TABLE, "table-name", "alter-spec"]],
  "sqlish-delete-table": [[DROP, TABLE, "table-name"]],
  "sqlish-scan": [["[select-clause]", "from-clause", "[where-filter-clause]", "[limit-clause]"]],
  "sqlish-query": [["[select-clause]", "from-clause", "where-key-clause", "[filter-clause]", "[limit-clause]"]],
  "sqlish-put-item": [[INSERT, INTO, "table-name", BNF.literal("("), "attribute-list", BNF.literal(")"), VALUES, BNF.literal("("), "value-list", BNF.literal(")"), "[where-key-clause]"]],
  "sqlish-set-item": [[UPDATE, "table-name", SET, "key-value-set", "where-key-clause"]],
  "sqlish-delete-item": [[DELETE, FROM, "table-name", "[where-delete-key-clause]"]],
  "key-schema-list": [["key-schema", BNF.comma, "key-schema-list"], ["key-schema"]],
  "key-schema": [["attribute-name", "key-type", "key-attribute-type"]],
  "create-table-alter-clause": [[ALTER, "alter-spec"]],
  "alter-spec": [[BNF.literal("("), "alter-specifier-list", BNF.literal(")")], ["alter-specifier"]],
  "alter-specifier-list": [["alter-specifier", BNF.comma, "alter-specifier-list"], ["alter-specifier"]],
  "alter-specifier": [[SET, BNF.literal("readCapacityUnit"), BNF.literal("="), BNF.numlit], [SET, BNF.literal("writeCapacityUnit"), BNF.literal("="), BNF.numlit]],
  "attribute-list": [["attribute-name", BNF.comma, "attribute-list"], ["attribute-name"]],
  "key-value-set": [["key-value", BNF.comma, "key-value-set"], ["key-value"]],
  "key-value": [["attribute-name", BNF.literal("="), "value"]],
  "attribute-name": [[BNF.ident]],
  "select-clause": [[SELECT, "key-list"]],
  "key-list": [["column-name", BNF.comma, "key-list"], ["column-name"]],
  "column-name": [[BNF.ident]],
  "from-clause": [[FROM, "table-name"]],
  "table-name": [[BNF.ident]],
  "where-filter-clause": [[WHERE, "condition-expression"]],
  "where-key-clause": [[WHERE, "condition-expression"]],
  "where-delete-key-clause": [[WHERE, "and-expression"]],
  "filter-clause": [[FILTER, "condition-expression"]],
  "condition-expression": [["or-expression"]],
  "or-expression": [["and-expression", OR, "condition-expression"], ["and-expression"]],
  "and-expression": [["compare-expression", AND, "condition-expression"], ["compare-expression"]],
  "compare-expression": [[BNF.literal("("), "condition-expression", BNF.literal(")")], [BNF.ident, "comparator", "value"], [BNF.ident, BETWEEN, "between-range"], [BNF.ident, IN, BNF.literal("("), "value-list", BNF.literal(")")], ["function"], [NOT, "condition-expression"]],
  "comparator": [[BNF.literal("=")], [BNF.literal("<")], [BNF.literal("<=")], [BNF.literal(">")], [BNF.literal(">=")], [BNF.literal("<>")]],
  "function": [[BNF.literal("attribute_exists"), BNF.literal("("), "path", BNF.literal(")")], [BNF.literal("attribute_not_exists"), BNF.literal("("), "path", BNF.literal(")")], [BNF.literal("attribute_type"), BNF.literal("("), "path", BNF.comma, "attribute-type", BNF.literal(")")], [BNF.literal("begins_with"), BNF.literal("("), "path", BNF.comma, "value", BNF.literal(")")], [BNF.literal("contains"), BNF.literal("("), "path", BNF.comma, "value", BNF.literal(")")], [BNF.literal("size"), BNF.literal("("), "path", BNF.literal(")")]],
  "path": [[BNF.ident, BNF.literal("."), "path"], [BNF.ident]],
  "between-range": [["value", AND, "value"]],
  "value-list": [["value", BNF.comma, "value-list"], ["value"]],
  "value": [[BNF.numlit], [BNF.strlitDQ], [BNF.strlitSQ], [BNF.ident]],
  "limit-clause": [[LIMIT, "limit-count"]],
  "limit-count": [[BNF.numlit]],
  "key-type": [[BNF.literal("HASH")], [BNF.literal("RANGE")]],
  "key-attribute-type": [[BNF.literal("S")], [BNF.literal("N")], [BNF.literal("BOOL")]],
  "attribute-type": [[BNF.literal("S")], [BNF.literal("SS")], [BNF.literal("N")], [BNF.literal("NS")], [BNF.literal("B")], [BNF.literal("BS")], [BNF.literal("BOOL")], [BNF.literal("NULL")], [BNF.literal("L")], [BNF.literal("M")]]
};

var isKeyword = require("./dynamodb-keywords.js").isKeyword; //
// Expression parser
//


var Expression = function Expression() {}; //
// Lexical analysis
//


Expression.prototype.tokenize = function (expr) {
  var bnfWords = new BNF("words", {
    "words": [["word", "words"], ["word"]],
    "word": [["boolean-literal"], ["comparison-operator"], ["conditional-operator"], ["conditional-function"], ["string-literal"], ["number-literal"], ["identifier"], ["white-space"], ["delimitor"], [BNF.lex("bool")], [BNF.lex("comp")], [BNF.lex("oper")], [BNF.lex("deli")], [BNF.lex("func")], [BNF.lex("str")], [BNF.lex("num")], [BNF.lex("ident")]],
    "boolean-literal": [[BNF.literal("true")], [BNF.literal("false")]],
    "comparison-operator": [[BNF.literal("=")], [BNF.literal("<"), BNF.literal(">")], [BNF.literal("<"), BNF.literal("=")], [BNF.literal("<")], [BNF.literal(">"), BNF.literal("=")], [BNF.literal(">")]],
    "conditional-operator": [[BNF.literal("AND")], [BNF.literal("OR")], [BNF.literal("NOT")], [BNF.literal("BETWEEN")], [BNF.literal("IN")]],
    "white-space": [[BNF.lex("WS")]],
    "delimitor": [[BNF.literal(",")], [BNF.literal("(")], [BNF.literal(")")], [BNF.lex("PUNCT")]],
    "conditional-function": [[BNF.literal("attribute_exists")], [BNF.literal("attribute_not_exists")], [BNF.literal("attribute_type")], [BNF.literal("begins_with")], [BNF.literal("contains")], [BNF.literal("size")]],
    "string-literal": [["string-literal-dq"], ["string-literal-sq"]],
    "string-literal-dq": [[BNF.literal('"'), "string-literal-dq-end"]],
    "string-literal-dq-end": [[BNF.literalUntil('"')]],
    "string-literal-sq": [[BNF.literal("'"), "string-literal-sq-end"]],
    "string-literal-sq-end": [[BNF.literalUntil("'")]],
    "number-literal": [[BNF.literal("-"), "number-literal"], [BNF.lex("NUMLIT"), BNF.literal("."), BNF.lex("NUMLIT")], [BNF.lex("NUMLIT")]],
    "identifier": [[BNF.ident, BNF.literal("."), "identifier"], [BNF.literal(":"), BNF.ident], [BNF.ident]]
  }, {
    "boolean-literal": "bool",
    "comparison-operator": "comp",
    "conditional-operator": "oper",
    "delimitor": "deli",
    "conditional-function": "func",
    "string-literal": "str",
    "number-literal": "num",
    "identifier": "ident"
  });
  var bnfTokens = BNF.tokenize(expr, bnfWords);

  if (bnfTokens != null && !Array.isArray(bnfTokens) && !bnfTokens.match) {
    throw new Error("Could not tokenize " + expr);
  }

  bnfTokens.forEach(function (token) {
    var term = token.getTerm();

    if (token.getType() == "str") {
      switch (term.replace(/^(.).*(.)$/, "$1$2")) {
        case '""':
          token.setTerm(unescapeDQ(term.replace(/^"(.*)"$/, "$1")));
          break;

        case "''":
          token.setTerm(unescapeSQ(term.replace(/^'(.*)'$/, "$1")));
          break;

        default:
          throw new Error("Broken string-literal " + term);
      }
    }
  });
  this.tokens = bnfTokens.map(function (t) {
    return {
      "type": t.getType(),
      "lex": t.getTerm()
    };
  });
};

var ProjectionExpression = function ProjectionExpression() {};

ProjectionExpression.prototype = new Expression();

ProjectionExpression.prototype.parse = function (expr) {
  this.tokens = [];
  this.expression = [];
  this.names = {};
  this.tokenize(expr);
  this.tokens.forEach(function (token) {
    switch (token.type) {
      case "ident":
        this.expression.push(token.lex.split('.').map(function (ident) {
          if (isKeyword(ident)) {
            var alt = "#" + ident;
            this.names[alt] = ident;
            return alt;
          }

          return ident;
        }, this).join('.'));
        break;

      case 'deli':
        if (token.lex == ',') {
          this.expression.push(token.lex);
        } else {
          throw new Error("Invalid delimitor. " + expr);
        }

        break;

      default:
        throw new Error("R-Value cannot be included. " + expr);
    }
  }, this);
};

ProjectionExpression.prototype.getExpression = function () {
  return this.expression.join(" ");
};

ProjectionExpression.prototype.getAttributeNames = function () {
  if (Object.keys(this.names).length <= 0) {
    return null;
  }

  return this.names;
}; //
// Condition expression parser
//


var ConditionExpression = function ConditionExpression() {};

ConditionExpression.prototype = new Expression();

ConditionExpression.prototype.getExpression = function () {
  return this.expression.join(" ");
};

ConditionExpression.prototype.getAttributeNames = function () {
  if (Object.keys(this.names).length <= 0) {
    return null;
  }

  return this.names;
};

ConditionExpression.prototype.getAttributeValues = function () {
  if (Object.keys(this.values).length <= 0) {
    return null;
  }

  return this.values;
}; //
// Parse
//


ConditionExpression.prototype.parse = function (expr, vidx) {
  this.tokens = [];
  this.expression = [];
  this.names = {};
  this.values = {};
  this.tokenize(expr);
  vidx = vidx | 0;

  var setValuePlaceholder = function (value) {
    var phname;

    for (;;) {
      phname = ":v" + vidx;
      vidx++;

      if (!(phname in this.values)) {
        break;
      }
    }

    this.expression.push(phname);
    this.values[phname] = value;
  }.bind(this);

  this.tokens.forEach(function (token) {
    switch (token.type) {
      case "bool":
        setValuePlaceholder({
          "BOOL": token.lex == "true"
        });
        break;

      case "num":
        setValuePlaceholder({
          "N": "" + token.lex
        });
        break;

      case "str":
        setValuePlaceholder({
          "S": "" + token.lex
        });
        break;

      case "ident":
        if (token.lex.charAt(0) === ":") {
          if (token.lex in this.values && this.values[token.lex] != null) {
            throw new Error("the placeholder " + token.lex + " already has value");
          }

          this.expression.push(token.lex);
          this.values[token.lex] = null;
          break;
        }

        this.expression.push(token.lex.split('.').map(function (ident) {
          if (isKeyword(ident)) {
            var alt = "#" + ident;
            this.names[alt] = ident;
            return alt;
          }

          return ident;
        }, this).join('.'));
        break;

      default:
        this.expression.push(token.lex);
        break;
    }
  }, this);
}; //
// ItemList expression parser
//
// Parser class to convert a string of a comma separated assignment expression to
// DynamoDB map object representing its Item.
//
// EXAMPLE:
//
//  input string:
//      id="123",timestamp=145678900,test.name="foo",test.pass=true,value.version="0.6.6"
//
//  output object:
//      {
//          "id":       {"S": "123"},
//          "timestamp":{"N": "145678900"},
//          "test": {
//              "M": {
//                  "name": {"S": "foo"},
//                  "pass": {"BOOL": true}
//              }
//          },
//          "value" : {"M" : {"version": {"S": "0.6.6"}}}
//      }
//


var ItemListExpression = function ItemListExpression() {};

ItemListExpression.prototype = new Expression();

ItemListExpression.prototype.parse = function (itemList) {
  var map = {};
  this.tokens = [];
  this.tokenize(itemList);
  var attributeItems = [];
  var attributeItem = [];
  this.tokens.forEach(function (token) {
    if (token.type == "deli" && token.lex == ",") {
      attributeItems.push(attributeItem);
      attributeItem = [];
    } else {
      attributeItem.push(token);
    }
  });
  attributeItems.push(attributeItem);
  attributeItems.forEach(function (attributeItem) {
    var expr = attributeItem.map(function (token) {
      return token.lex;
    }).join(" ");

    if (attributeItem.length != 3) {
      throw new Error("Invalid format. " + expr);
    } else if (attributeItem[0].type != "ident") {
      throw new Error("Lvalue must be a item name or map path. " + expr);
    } else if (attributeItem[1].type != "comp" || attributeItem[1].lex != "=") {
      throw new Error("The expression must be an assignment. " + expr);
    } else if (attributeItem[2].type != "bool" && attributeItem[2].type != "str" && attributeItem[2].type != "num" && attributeItem[2].lex.charAt(0) !== ":") {
      throw new Error("Rvalue must be a value. " + expr);
    }

    var LTok = attributeItem[0];
    var RTok = attributeItem[2];
    var paths = LTok.lex.split('.');
    var obj = map;

    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];

      if (!(path in obj)) {
        if (i < paths.length - 1) {
          obj[path] = {
            "M": {}
          };
        } else {
          obj[path] = {
            /* T.B.D */
          };
        }
      }

      if ("M" in obj[path]) {
        obj = obj[path].M;
      } else {
        obj = obj[path];
      }
    }

    switch (RTok.type) {
      case "bool":
        obj["BOOL"] = RTok.lex == "true";
        break;

      case "num":
        obj["N"] = "" + RTok.lex;
        break;

      case "str":
        obj["S"] = "" + RTok.lex;
        break;

      default:
        break;
    }
  });
  return map;
};

DynamoDbSqlishParser.parseProjectionExpression = function (projectionExpression, expressionAttributeNames) {
  var parser = new ProjectionExpression();
  parser.parse(projectionExpression);
  var names = parser.getAttributeNames();

  if (names) {
    Object.keys(names).forEach(function (ph) {
      expressionAttributeNames[ph] = names[ph];
    });
  }

  return parser.getExpression();
};

DynamoDbSqlishParser.parseConditionExpression = function (conditionExpression, expressionAttributeNames, expressionAttributeValues) {
  var parser = new ConditionExpression();
  parser.parse(conditionExpression, Object.keys(expressionAttributeValues).length);
  var names = parser.getAttributeNames();

  if (names) {
    Object.keys(names).forEach(function (ph) {
      expressionAttributeNames[ph] = names[ph];
    });
  }

  var values = parser.getAttributeValues();

  if (values) {
    Object.keys(values).forEach(function (ph) {
      expressionAttributeValues[ph] = values[ph];
    });
  }

  return parser.getExpression();
}; //
// Parse ItemList expression and returns DynamoDB table item for put-item operation.
//
// EXAMPLE:
//
//  input string:
//      id="123",timestamp=145678900,test.name="foo",test.pass=true,value.version="0.6.6"
//
//  output object:
//      {
//          "id":       {"S": "123"},
//          "timestamp":{"N": "145678900"},
//          "test": {
//              "M": {
//                  "name": {"S": "foo"},
//                  "pass": {"BOOL": true}
//              }
//          },
//          "value" : {"M" : {"version": {"S": "0.6.6"}}}
//      }
//


DynamoDbSqlishParser.parseItemListToMap = function (itemList) {
  var parser = new ItemListExpression();
  return parser.parse(itemList);
};

DynamoDbSqlishParser.WordBuilder = new BNF("words", {
  "words": [["word", "words"], ["word"]],
  "word": [["num-literal"], ["comparison-operator"], ["attribute-value-placeholder"], ["attribute-path-name"], ["comment-mark"], ["escaped-char"], ["string-literal"], ["block-comment"], ["line-comment"], [BNF.ident], [BNF.lex("PUNCT")], [BNF.strlitDQ], [BNF.strlitSQ], [BNF.lex("WS")], [BNF.lex("WS-LINCMT")], [BNF.lex("WS-BLKCMT")]],
  "num-literal": [["fractional-literal"], ["int-literal"]],
  "int-literal": [["dec-num-literal"]],
  "dec-num-literal": [["[sign]", BNF.lex("NUMLIT")]],
  "sign": [[BNF.literal("+")], [BNF.literal("-")]],
  "fractional-literal": [["[sign]", BNF.lex("NUMLIT"), "fractional-part"]],
  "fractional-part": [[BNF.literal("."), BNF.lex("NUMLIT"), "[exp-part]"]],
  "exp-part": [[BNF.literal("E"), "[sign]", BNF.lex("NUMLIT")], [BNF.literal("e"), "[sign]", BNF.lex("NUMLIT")]],
  "comparison-operator": [[BNF.literal("<"), BNF.literal("=")], [BNF.literal("<"), BNF.literal(">")], [BNF.literal(">"), BNF.literal("=")], [BNF.literal(">")], [BNF.literal("=")], [BNF.literal("<")]],
  "attribute-value-placeholder": [[BNF.literal(":"), BNF.ident]],
  "attribute-path-name": [[BNF.ident, BNF.literal("."), "attribute-path-name"], [BNF.ident, BNF.literal("."), BNF.ident]],
  "block-comment": [[BNF.literal("/*"), BNF.literalUntil("*/")]],
  "line-comment": [[BNF.literal("//"), BNF.literalUntil("\n")], [BNF.literal("--"), BNF.literalUntil("\n")]],
  "comment-mark": [[BNF.literal("/"), BNF.literal("*")], [BNF.literal("*"), BNF.literal("/")], [BNF.literal("/"), BNF.literal("/")], [BNF.literal("-"), BNF.literal("-")]],
  "escaped-char": [[BNF.literal("\\"), BNF.literal("\\")], [BNF.literal("\\"), BNF.literal("\"")], [BNF.literal("\\"), BNF.literal("'")]],
  "string-literal": [["string-literal-dq"], ["string-literal-sq"]],
  "string-literal-dq": [[BNF.literal('"'), "string-literal-dq-end"]],
  "string-literal-dq-end": [[BNF.literalUntil('"')], [BNF.literal('"')]],
  "string-literal-sq": [[BNF.literal("'"), "string-literal-sq-end"]],
  "string-literal-sq-end": [[BNF.literalUntil("'")], [BNF.literal("'")]]
}, {
  "num-literal": "NUMLIT",
  "comparison-operator": "PUNCT",
  "attribute-value-placeholder": "IDENT",
  "attribute-path-name": "IDENT",
  "block-comment": "WS-BLKCMT",
  "line-comment": "WS-LINCMT",
  "comment-mark": "WS",
  "escaped-char": "PUNCT",
  "string-literal-dq": "STRLIT-DQ",
  "string-literal-sq": "STRLIT-SQ"
});
DynamoDbSqlishParser.bnfScan = new BNF("sqlish-scan", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfQuery = new BNF("sqlish-query", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfPutItem = new BNF("sqlish-put-item", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfSetItem = new BNF("sqlish-set-item", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfDeleteItem = new BNF("sqlish-delete-item", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfCreateTable = new BNF("sqlish-create-table", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfDeleteTable = new BNF("sqlish-delete-table", DynamoDbSqlishParser.BNF);
DynamoDbSqlishParser.bnfUpdateTable = new BNF("sqlish-update-table", DynamoDbSqlishParser.BNF);

DynamoDbSqlishParser.parse = function (source, bnf) {
  var tokens = BNF.tokenize(source, DynamoDbSqlishParser.WordBuilder); //var tokens = DynamoDbSqlishParser.WordBuilder.tokenize(source);

  if (tokens != null && !Array.isArray(tokens) && !tokens.match) {
    return tokens; // tokens is BNF.Result object.
  }

  tokens.forEach(function (token) {
    var term = token.getTerm();

    switch (token.getType()) {
      case "STRLIT-DQ":
        token.setTerm("\"" + unescapeDQ(term.replace(/^"(.*)"$/, "$1")) + "\"");
        break;

      case "STRLIT-SQ":
        token.setTerm("'" + unescapeSQ(term.replace(/^'(.*)'$/, "$1")) + "'");
        break;

      default:
        break;
    }
  });
  var result = bnf.parseTokens(tokens);
  return result;
};

function unescapeDQ(s) {
  s = strUnescape(s);
  var ss = "";
  var len = s.length;

  for (var i = 0; i < len; i++) {
    var c = s.charAt(i);

    if (c == "\"") {
      ss += "\\\"";
    } else {
      ss += c;
    }
  }

  return ss;
}

function unescapeSQ(s) {
  s = strUnescape(s);
  var ss = "";
  var len = s.length;

  for (var i = 0; i < len; i++) {
    var c = s.charAt(i);

    if (c == "'") {
      ss += "\\'";
    } else {
      ss += c;
    }
  }

  return ss;
}

function strUnescape(s) {
  var ss = "";
  var len = s.length;

  for (var i = 0; i < len; i++) {
    var c = s.charAt(i);
    var cc = c.charCodeAt(0);

    switch (c) {
      case "\t":
        ss += "\\t";
        break;

      case "\r":
        ss += "\\r";
        break;

      case "\n":
        ss += "\\n";
        break;

      default:
        if (0x20 <= cc && cc <= 0x7f || cc > 0xff) {
          ss += c;
        } else if (cc <= 0xff) {
          ss += "\\x" + parseInt(cc, 16);
        }

        break;
    }
  }

  return ss;
}

DynamoDbSqlishParser.parseCreateTable = function (source) {
  return DynamoDbSqlishParser.parse(source, DynamoDbSqlishParser.bnfCreateTable);
};

DynamoDbSqlishParser.parseDeleteTable = function (source) {
  return DynamoDbSqlishParser.parse(source, DynamoDbSqlishParser.bnfDeleteTable);
};

DynamoDbSqlishParser.parseUpdateTable = function (source) {
  return DynamoDbSqlishParser.parse(source, DynamoDbSqlishParser.bnfUpdateTable);
};

DynamoDbSqlishParser.parseScan = function (source) {
  return DynamoDbSqlishParser.parse(source, DynamoDbSqlishParser.bnfScan);
};

DynamoDbSqlishParser.parseQuery = function (source) {
  var result = DynamoDbSqlishParser.parse(source, DynamoDbSqlishParser.bnfQuery);
  return result;
};

DynamoDbSqlishParser.parsePutItem = function (source) {
  return DynamoDbSqlishParser.parse(source, DynamoDbSqlishParser.bnfPutItem);
};

DynamoDbSqlishParser.parseSetItem = function (source) {
  return DynamoDbSqlishParser.parse(source, DynamoDbSqlishParser.bnfSetItem);
};

DynamoDbSqlishParser.parseDeleteItem = function (source) {
  return DynamoDbSqlishParser.parse(source, DynamoDbSqlishParser.bnfDeleteItem);
};

module.exports = DynamoDbSqlishParser;
},{"lex-bnf":"../node_modules/lex-bnf/index.js","./dynamodb-keywords.js":"../lib/dynamodb-keywords.js"}],"../lib/dynamodb-statement.js":[function(require,module,exports) {
"use strict";

var clone = require("clone");

var DynamoDbDataModels = require("./dynamodb-data-models.js");

var parser = require('./dynamodb-sqlish-parser.js');
/**
 * Statement class
 * @constructor
 */


function Statement() {
  this._parser = parser;
  this.tableName = null;
  this.expressionAttributeNames = {};
  this.expressionAttributeValues = {};
}
/**
 * Run this statement.
 * @returns {undefined}
 */


Statement.prototype.run = function () {
  throw new Error("Fatal: run has no implementation");
};
/**
 * Set table name.
 * @param {string} tableName A table name
 * @returns {undefined}
 */


Statement.prototype.setTableName = function (tableName) {
  this.tableName = tableName;
};
/**
 * Parse ConditionExpression and translate the expr to use placeholders.
 * The attribute names or values are added to expressionAttributeNames/Values. 
 * @param {string} conditionExpr Expression
 * @returns {string} A translated expression. It might include placeholders.
 */


Statement.prototype.parseConditionExpression = function (conditionExpr) {
  return this._parser.parseConditionExpression(conditionExpr, this.expressionAttributeNames, this.expressionAttributeValues);
};
/**
 * Get a parameter as a result of this statement instance.
 * It is available to execute the DynamoDB API.
 * @param {object} args K-V which is an attribute name to the value.
 * @returns {object} A parameter for the DynamoDB API.
 */


Statement.prototype.getParameter = function (args) {
  var opt = {};

  if (this.tableName) {
    opt.TableName = this.tableName;
  } // Expression attribute names


  if (Object.keys(this.expressionAttributeNames).length > 0) {
    opt.ExpressionAttributeNames = this.expressionAttributeNames;
  } // Expression attribute values


  if (Object.keys(this.expressionAttributeValues).length > 0) {
    opt.ExpressionAttributeValues = this.expressionAttributeValues;
  }

  if (args) {
    opt = Statement.setParam(opt, args);
  }

  return opt;
};
/**
 * Set arguments to param.
 * @param {object} param API parameter
 * @param {object} args Key-Value. Attribute name to value.
 * @returns {object} result param. It is clone of the input param.
 */


Statement.setParam = function (param, args) {
  param = clone(param);

  if ("ExpressionAttributeValues" in param) {
    Object.keys(param.ExpressionAttributeValues).forEach(function (name) {
      if (param.ExpressionAttributeValues[name] === null && name in args) {
        param.ExpressionAttributeValues[name] = DynamoDbDataModels.obj2map(args[name]);
      }
    });
  }

  return param;
};
/**
 * Assert that all attribute values are specified.
 * @param {object} param K-V which has an attribute name to the value
 * @returns {undefined}
 */


Statement.assertAllParamSpecified = function (param) {
  if ("ExpressionAttributeValues" in param) {
    Object.keys(param.ExpressionAttributeValues).forEach(function (name) {
      if (param.ExpressionAttributeValues[name] === null) {
        throw new Error("The parameter " + name + " is not specified");
      }
    });
  }
};

module.exports = Statement;
},{"clone":"../node_modules/clone/clone.js","./dynamodb-data-models.js":"../lib/dynamodb-data-models.js","./dynamodb-sqlish-parser.js":"../lib/dynamodb-sqlish-parser.js"}],"../lib/dynamodb-read-item-statement.js":[function(require,module,exports) {
"use strict";

var Statement = require('./dynamodb-statement.js');
/**
 * An abstract base class for ScanStatement and QueryStatement.
 * @constructor
 */


function DynamoDbReadItemStatement() {
  Statement.apply(this, Array.from(arguments));
}

DynamoDbReadItemStatement.prototype = new Statement();
/**
 * Set LIMIT clause.
 * @param {number} limit A limit count to be read
 * @returns {undefined}
 */

DynamoDbReadItemStatement.prototype.setLimit = function (limit) {
  this.limit = limit;
};
/**
 * Set an exclusive start key that is used for `lastEvaluatedKey` parameter.
 * @param {string} lastEvaluatedKey A lastEvaluatedKey which was returned
 *  previous scan or query
 * @returns {undefined}
 */


DynamoDbReadItemStatement.prototype.setExclusiveStartKey = function (lastEvaluatedKey) {
  this.exclusiveStartKey = lastEvaluatedKey;
};
/**
 * Set ProjectionExpression.
 * @param {string} projexpr Comma separated attribute names to be selected
 * @returns {undefined}
 */


DynamoDbReadItemStatement.prototype.setProjectionExpression = function (projexpr) {
  this.projectionExpression = this._parser.parseProjectionExpression(projexpr, this.expressionAttributeNames);
};

module.exports = DynamoDbReadItemStatement;
},{"./dynamodb-statement.js":"../lib/dynamodb-statement.js"}],"../lib/dynamodb-query-statement.js":[function(require,module,exports) {
"use strict";

var DynamoDbReadItemStatement = require('./dynamodb-read-item-statement.js');
/**
 * SQL-ish Query statement class for AWS DynamoDB.
 *
 * SQL-ish Syntax:
 *
 * ```
 * [SELECT <projection-expression>]
 * FROM <table-name>
 * WHERE <key-condition-expression>
 * [FILTER <filter-expression>]
 * [LIMIT <limit>]
 * ```
 *
 * * `[]` is representing that can be ommited.
 * * `<projection-expression>` - The comma separated attribute names to select.
 * * `<table-name>` - DynamoDB table name.
 * * `<key-condition-expression>` - Primary key conditional expression.
 * * `<filter-expression>` - Filtering conditional expression.
 * * `<limit>` - The number of items to scan.
 *
 * @param {string|object} opt
 * SQL-ish Query statement as string or parameter object for Query API.
 *
 * @constructor
 */


function DynamoDbQueryStatement(opt) {
  DynamoDbReadItemStatement.apply(this, Array.from(arguments));
  this.limit = null;
  this.exclusiveStartKey = null;
  this.projectionExpression = null;
  this.keyConditionExpression = null;
  this.filterExpression = null;

  if (!opt) {
    return;
  }

  if (typeof opt === "string") {
    opt = this.parse(opt);
  }

  if (!("TableName" in opt)) {
    throw new Error("TableName required");
  }

  if (!("KeyConditionExpression" in opt)) {
    throw new Error("KeyConditionExpression required");
  }

  this.setTableName(opt.TableName);
  this.setKeyConditionExpression(opt.KeyConditionExpression);

  if ("FilterExpression" in opt) {
    this.setFilterExpression(opt.FilterExpression);
  }

  if ("ProjectionExpression" in opt) {
    this.setProjectionExpression(opt.ProjectionExpression);
  }

  if ("Limit" in opt) {
    this.setLimit(opt.Limit);
  }

  if ("LastEvaluatedKey" in opt) {
    this.setExclusiveStartKey(opt.LastEvaluatedKey);
  }
}

DynamoDbQueryStatement.prototype = new DynamoDbReadItemStatement();
/**
 * Parse the SQL-ish statement.
 * @param {string} sqlish SQL-ish statement
 * @returns {object} A parameter for DynamoDB query API.
 */

DynamoDbQueryStatement.prototype.parse = function (sqlish) {
  var opt = {};

  var st = this._parser.parseQuery(sqlish);

  var fromClause = st.getTerm("from-clause");

  if (!fromClause.match) {
    throw new Error("the from-clause not found");
  } else {
    opt.TableName = fromClause.getWordsList("table-name")[0].join("");
  }

  var whereClause = st.getTerm("where-key-clause");

  if (!whereClause.match) {
    throw new Error("the where clause not found");
  } else {
    opt.KeyConditionExpression = whereClause.getWordsList("condition-expression")[0].join(" ");
  }

  var selectClause = st.getTerm("select-clause");

  if (selectClause.match) {
    opt.ProjectionExpression = selectClause.getWordsList("key-list")[0].join("");
  }

  var filterClause = st.getTerm("filter-clause");

  if (filterClause.match) {
    opt.FilterExpression = filterClause.getWordsList("condition-expression")[0].join(" ");
  }

  var limitClause = st.getTerm("limit-clause");

  if (limitClause.match) {
    opt.Limit = limitClause.getWordsList("limit-count")[0].join(" ");
  }

  return opt;
};
/**
 * Get parameter to invoke the query API.
 * @param {object} args key-values for the expression to run the query.
 * @returns {object} A parameter for DynamoDB query API.
 */


DynamoDbQueryStatement.prototype.getParameter = function (args) {
  var opt = DynamoDbReadItemStatement.prototype.getParameter.call(this, args);

  if (this.keyConditionExpression) {
    opt.KeyConditionExpression = this.keyConditionExpression;
  }

  if (this.limit) {
    opt.Limit = this.limit;
  }

  if (this.exclusiveStartKey) {
    opt.ExclusiveStartKey = this.exclusiveStartKey;
  }

  if (this.projectionExpression) {
    opt.ProjectionExpression = this.projectionExpression;
  }

  if (this.filterExpression) {
    opt.FilterExpression = this.filterExpression;
  }

  return opt;
};
/**
 * Set KeyConditionExpression for query.
 * @param {string} keyConditionExpr expression
 * @returns {undefined}
 */


DynamoDbQueryStatement.prototype.setKeyConditionExpression = function (keyConditionExpr) {
  this.keyConditionExpression = this.parseConditionExpression(keyConditionExpr);
};
/**
 * Set FilterExpression for query.
 * @param {string} filterExpr expression
 * @returns {undefined}
 */


DynamoDbQueryStatement.prototype.setFilterExpression = function (filterExpr) {
  this.filterExpression = this.parseConditionExpression(filterExpr);
};

module.exports = DynamoDbQueryStatement;
},{"./dynamodb-read-item-statement.js":"../lib/dynamodb-read-item-statement.js"}],"jquery-uitext.js":[function(require,module,exports) {
/* global $ */
"use strict";

$.fn.uitext = function () {
  this.each(function () {
    $(this).addClass("ui-spinner-input").css({
      'margin-right': '.4em'
    }).appendTo($('<span/>').addClass("ui-spinner").addClass("ui-widget").addClass("ui-widget-content").addClass("ui-corner-all").insertBefore(this));
  });
};
},{}],"dynamodb-api-parameter.js":[function(require,module,exports) {
/* global window,document,$ */
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var uuid = require("uuid/v4");

var QueryStatement = require("../lib/dynamodb-query-statement.js");

require("./jquery-uitext.js"); //const ScanStatement = require("../lib/dynamodb-query-statement.js");
//const PutItemStatement = require("../lib/dynamodb-put-item-statement.js");
//const DeleteItemStatement = require("../lib/dynamodb-delete-item-statement.js");


var appId = uuid();

var id = function id(name) {
  return "".concat(name, "-").concat(appId);
};

function DynamoDbApiParameter(appFrame) {
  var _this = this;

  appFrame.addClass("ui-widget");
  this.txtProjectionExpression = $("<input type=\"text\" class=\"text\" id=\"".concat(id("txtProjectionExpression"), "\"/>")).val("name");
  this.txtTableName = $("<input type=\"text\" class=\"text\" id=\"".concat(id("txtTableName"), "\"/>")).val("stars");
  this.txtKeyConditionExpression = $("<input type=\"text\" class=\"text\" id=\"".concat(id("txtKeyConditionExpression"), "\"/>")).val("mainStar=\"SUN\"");
  this.txtFilterExpression = $("<input type=\"text\" class=\"text\" id=\"".concat(id("txtFilterExpression"), "\"/>")).val("radius < 100");
  this.txtLimit = $("<input type=\"text\" class=\"number\" id=\"".concat(id("txtLimit"), "\"/>")).css("text-align", "right").val(5);
  this.preResultParameter = $("<pre id=\"".concat(id("apiParameter"), "\"/>")).css("webkitUserSelect ", "auto").css("userSelect ", "auto").css("width", "100%");
  this.btnCopyParam = $("<button type=\"button\">Copy</button>").button();

  var inputLabel = function inputLabel(input, caption) {
    return $("<label for=\"".concat(input.attr("id"), "\">").concat(caption, "</label>")).css("display", "inline-block").css("width", "200px");
  }; //const remarkId = id =>
  //    `remark-of-${id}`;
  //const spanRemark = (input, remark) =>
  //    $(`<span id="${remarkId(input.attr("id"))}">${remark}</label>`)
  //    .css("display", "inline-block")
  //    .css("margin-left", "1em");


  var input = function input(mandatory, _input, caption, remark) {
    var checkboxId = function checkboxId(id) {
      return "enable-".concat(id);
    };

    var enableInput = function enableInput(input, state) {
      if (state) {
        input.prop("disabled", false);
        input.val(input.attr("latest"));
        input.focus();
      } else {
        input.attr("latest", input.val());
        input.val("");
        input.prop("disabled", true);
      }
    };

    var applyCheckbox = function applyCheckbox(cb, input) {
      if (cb.prop("checked")) {
        enableInput(input, true);
      } else {
        enableInput(input, false);
      }
    };

    var container = $("<div/>").css("margin-bottom", "1em").css("vertical-align", "base-line").attr("title", remark);

    if (mandatory) {
      container.append($("<span>*</span>").css("color", "red").css("margin", "3px 3px 3px 4px").css("text-align", "center").css("display", "inline-block").css("width", "30px"));
    } else {
      container.append($("<input type=\"checkbox\" class=\"optional\" id=\"".concat(checkboxId(_input.attr("id")), "\"/>")).css("width", "30px").bind("click", function () {
        applyCheckbox($("#".concat(checkboxId(_input.attr("id")))), _input);
      }));
      applyCheckbox($("#".concat(checkboxId(_input.attr("id")))), _input);
    }

    container.append(inputLabel(_input, caption)).append(_input);

    if (_input.hasClass("text")) {
      _input.uitext();
    }

    return container;
  };

  appFrame.append($("<h2>DynamoDB Query API Parameter Generator</h2>")).append($("<h3>Query Specification</h3>")).append(input(true, this.txtTableName, "TableName", "Table name (mandatory)")).append(input(true, this.txtKeyConditionExpression, "KeyConditionExpression", "Key condition (mandatory)")).append(input(false, this.txtFilterExpression, "FilterExpression", "Filter (applied after scanning)")).append(input(false, this.txtLimit, "Limit", "Number of result rows. zero means no limit.")).append(input(false, this.txtProjectionExpression, "ProjectionExpression", "List of attribute name")).append($("<h3>Query API Parameter</h3>")).append(this.preResultParameter).append($("<br/>")).append(this.btnCopyParam);
  appFrame.find("input[type=text]").bind("input", function () {
    return _this.convert();
  });
  appFrame.find("input[type=checkbox]").bind("input", function () {
    return _this.convert();
  });
  this.btnCopyParam.bind("click", function () {
    document.getSelection().selectAllChildren(_this.preResultParameter.get(0));
    var copy = document.execCommand("copy");
    console.log("".concat(copy));
  });
  this.txtLimit.spinner({
    min: 0,
    spin: function spin(event, ui) {
      _this.txtLimit.spinner("value", ui.value);

      _this.convert();
    },
    change: function change() {
      return _this.convert();
    }
  });
  this.preResultParameter.uitext();
  this.convert();
}

DynamoDbApiParameter.prototype.convert = function () {
  var projectionExpression = this.txtProjectionExpression.val().trim();
  var tableName = this.txtTableName.val().trim();
  var keyConditionExpression = this.txtKeyConditionExpression.val().trim();
  var FilterExpression = this.txtFilterExpression.val().trim();
  var Limit = this.txtLimit.spinner("value");

  try {
    if (!tableName) {
      throw new Error("TableName required");
    }

    if (!keyConditionExpression) {
      throw new Error("KeyConditionExpression required");
    }

    var sqlish = [];

    if (projectionExpression) {
      sqlish.push("SELECT ".concat(projectionExpression));
    }

    sqlish.push("FROM ".concat(tableName));
    sqlish.push("WHERE ".concat(keyConditionExpression));

    if (FilterExpression) {
      sqlish.push("Filter ".concat(FilterExpression));
    }

    if (Limit) {
      console.log("Limit:".concat(Limit, ":").concat(_typeof(Limit)));
      sqlish.push("LIMIT ".concat(Limit));
    }

    var apiParameter = this.convertQueryParam(sqlish.join(" "));
    console.log(JSON.stringify(apiParameter, null, 2));
    $("#".concat(id("apiParameter"))).empty().html(JSON.stringify(apiParameter, null, 2));
    $("#".concat(id("txtParameter"))).empty().html(JSON.stringify(apiParameter, null, 2));
    $("#".concat(id("message"))).html("OK");
  } catch (err) {
    $("#".concat(id("message"))).html(err.message);
  }
};

DynamoDbApiParameter.prototype.convertQueryParam = function (source) {
  var statement = new QueryStatement(source);
  return statement.getParameter();
};

DynamoDbApiParameter.initialize = function (appFrame) {
  console.log("DynamoDbParamConv.initialize");
  return new DynamoDbApiParameter(appFrame);
};

window.DynamoDbApiParameter = DynamoDbApiParameter;
},{"uuid/v4":"../node_modules/uuid/v4.js","../lib/dynamodb-query-statement.js":"../lib/dynamodb-query-statement.js","./jquery-uitext.js":"jquery-uitext.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "58994" + '/');

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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","dynamodb-api-parameter.js"], null)
//# sourceMappingURL=/dynamodb-api-parameter.3e987836.js.map