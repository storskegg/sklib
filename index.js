/* global document */

const inViewPort = function (selector) {
  const el = document.querySelector(selector);

  function getBoundingRect(el) {
    const { bottom, height, left, right, top, width } = el.getBoundingClientRect();

    return {
      bottom: Math.floor(bottom),
      height: Math.ceil(height),
      left: Math.ceil(left),
      right: Math.ceil(right),
      top: Math.ceil(top),
      width: Math.ceil(width)
    };
  }

  console.debug('body', getBoundingRect(document.body));
  console.debug('innerHeight', window.innerHeight, 'innerWidth', window.innerWidth);
  console.debug(el.id, getBoundingRect(el));

  if (el === null) { return false; }

  const { bottom, height, left, right, top, width } = getBoundingRect(el);
  const winH = window.innerHeight;
  const winW = window.innerWidth;

  const hasArea = !!height && !!width;
  const hView = left > 0 ? left < winW : right > 1;
  const vView = top  > 0 ? top  < winH : bottom > 1;

  return hasArea && hView && vView;
};

// Returns the requested cookie or undefined, or if no
// cookie specified, all cookies in key:val hash,
// empty hash if there are no cookies
const getCookie = function(name) {
  let cookies = {};
  document.cookie.split(';')
    .map(pair => {
      pair = pair.split('=');
      return pair.length === 2 ?
        { [pair[0].trim()] : pair[1].trim() }
        : undefined;
    }).forEach(s => {
      cookies = Object.assign({}, cookies, s);
    });
  return name === undefined ? cookies : cookies[name];
};

// Returns GET parameters as key:val hash, or empty {} if there are none.
const getQueries = function() {
  const queryString = window.location.search
    .split('?')
    .slice(1)
    .shift() || '';

  return Object.assign({},
    ...(queryString.split('&')
      .map(q => {
        const [key, val] = q.split('=');
        if (!key) {
          return undefined;
        }
        return {
          [key]: val !== undefined ?
          	val    // key is set, val is set; retain original value
            : true // key is set, but val is undefined; treat as boolean true
        };
      })
      .filter(a => a !== undefined)
    ));
};

// Split a string sequence by n
// i.e. given n = 2, str = "aabbcc", returns ['aa', 'bb', 'cc']
//      given n = 3, str = ^^^^^^^^, returns ['aab', 'bcc']
//      given n = 4, str = ^^^^^^^^, throws an error, because the
//          provided string is not evenly divisible by n
const splitByN = function(n, str) {
	if (typeof n !== 'number' || isNaN(n) || n % 1 !== 0) {
		throw new Error('n must be a valid integer');
	}
	str = (str || '').trim();
	const len = str.length;

  // ensure
	if (len % n === 0) {
		let i = n;
		const seqArray = [];

		while (i <= len) {
			seqArray.push(str.slice(i-n, i));
			i += n;
		}

		return seqArray;
	} else {
		throw new Error('Potentially malformed string sequence. The string sequence length must be evenly divisible by n.');
	}
};

// U.S. Telephone Validation
const validateTelephone = function(str) {
  const regex = /^(\d{10}|[+]?\d{11}|([+]?1([-\.]{1}|[ ]?))?\(?\d{3}(\)[ ]?|[-\.]){1}\d{3}[-\.]{1}\d{4})$/;
  return regex.test(str);
};

// Two stack classes, FILO and FIFO. They're generic, but intended for integration
// into an IO loop, such as to manage simultaneous (up|down)loads, (web|service) worker
// jobs, etc.
class FILO {
  constructor(ary = [], maxSize = Infinity) {
    if (!Array.isArray(ary)) {
      console.warn('Cannot instantiate FILO with non-array. Defaulting to empty.');
      ary = [];
    }

    if (maxSize !== Infinity && (typeof maxSize !== 'number' || isNaN(maxSize))) {
      console.warn('Expecting maxSize to be a number. Defaulting to Infinity.');
      maxSize = Infinity;
    }

    this.maxSize = maxSize;
    this.length = 0;
    this._stack = ary.slice(0, maxSize);
    this._pull = function*() {
      while (this.size())
        yield this._stack.shift();
    };
    this._next = this._pull();
  }

  size() {
    return this._stack.length;
  }

  put(obj) {
    if (this.size() >= this.maxSize) {
      this._stack.shift();
    }

    this._stack.push(obj);
  }

  next() {
    const _ret = this._next.next();
    return _ret.done ? undefined : _ret.value;
  }

  toArray() {
    return this._stack.slice();
  }
}

class FIFO {
  constructor(ary = [], maxSize = Infinity) {
    if (!Array.isArray(ary)) {
      console.warn('Cannot instantiate FILO with non-array. Defaulting to empty.');
      ary = [];
    }

    if (maxSize !== Infinity && (typeof maxSize !== 'number' || isNaN(maxSize))) {
      console.warn('Expecting maxSize to be a number. Defaulting to Infinity.');
      maxSize = Infinity;
    }

    this.length = 0;
    this._stack = ary.slice(0, maxSize);
    this._pull = function*() {
      while (this.size())
        yield this._stack.pop();
    };
    this._next = this._pull();
  }

  size() {
    return this._stack.length;
  }

  put(obj) {
    this._stack.push(obj);
  }

  next() {
    const _ret = this._next.next();
    return _ret.done ? undefined : _ret.value;
  }

  toArray() {
    return this._stack.slice();
  }
}

export FIFO;
export FILO;

export inViewPort;
export getCookie;
export getQueries;
export splitByN;
export validateTelephone;
