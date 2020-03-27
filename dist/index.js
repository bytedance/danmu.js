(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["danmu.js"] = factory();
	else
		root["danmu.js"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _domrecycle = __webpack_require__(26);

var _domrecycle2 = _interopRequireDefault(_domrecycle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var util = {};

util.domObj = new _domrecycle2.default();

util.createDom = function () {
  var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';
  var tpl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var cname = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  var dom = document.createElement(el);
  dom.className = cname;
  dom.innerHTML = tpl;
  Object.keys(attrs).forEach(function (item) {
    var key = item;
    var value = attrs[item];
    if (el === 'video' || el === 'audio') {
      if (value) {
        dom.setAttribute(key, value);
      }
    } else {
      dom.setAttribute(key, value);
    }
  });
  return dom;
};

util.hasClass = function (el, className) {
  if (el.classList) {
    return Array.prototype.some.call(el.classList, function (item) {
      return item === className;
    });
  } else {
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
  }
};

util.addClass = function (el, className) {
  if (el.classList) {
    className.replace(/(^\s+|\s+$)/g, '').split(/\s+/g).forEach(function (item) {
      item && el.classList.add(item);
    });
  } else if (!util.hasClass(el, className)) {
    el.className += ' ' + className;
  }
};

util.removeClass = function (el, className) {
  if (el.classList) {
    className.split(/\s+/g).forEach(function (item) {
      el.classList.remove(item);
    });
  } else if (util.hasClass(el, className)) {
    className.split(/\s+/g).forEach(function (item) {
      var reg = new RegExp('(\\s|^)' + item + '(\\s|$)');
      el.className = el.className.replace(reg, ' ');
    });
  }
};

util.toggleClass = function (el, className) {
  className.split(/\s+/g).forEach(function (item) {
    if (util.hasClass(el, item)) {
      util.removeClass(el, item);
    } else {
      util.addClass(el, item);
    }
  });
};

util.findDom = function () {
  var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  var sel = arguments[1];

  var dom = void 0;
  // fix querySelector IDs that start with a digit
  // https://stackoverflow.com/questions/37270787/uncaught-syntaxerror-failed-to-execute-queryselector-on-document
  try {
    dom = el.querySelector(sel);
  } catch (e) {
    if (sel.startsWith('#')) {
      dom = el.getElementById(sel.slice(1));
    }
  }
  return dom;
};

util.deepCopy = function (dst, src) {
  if (util.typeOf(src) === 'Object' && util.typeOf(dst) === 'Object') {
    Object.keys(src).forEach(function (key) {
      if (util.typeOf(src[key]) === 'Object' && !(src[key] instanceof Node)) {
        if (!dst[key]) {
          dst[key] = src[key];
        } else {
          util.deepCopy(dst[key], src[key]);
        }
      } else if (util.typeOf(src[key]) === 'Array') {
        dst[key] = util.typeOf(dst[key]) === 'Array' ? dst[key].concat(src[key]) : src[key];
      } else {
        dst[key] = src[key];
      }
    });
    return dst;
  }
};

util.typeOf = function (obj) {
  return Object.prototype.toString.call(obj).match(/([^\s.*]+)(?=]$)/g)[0];
};

util.copyDom = function (dom) {
  if (dom && dom.nodeType === 1) {
    var back = document.createElement(dom.tagName);
    Array.prototype.forEach.call(dom.attributes, function (node) {
      back.setAttribute(node.name, node.value);
    });
    if (dom.innerHTML) {
      back.innerHTML = dom.innerHTML;
    }
    return back;
  } else {
    return '';
  }
};

util.formatTime = function (time) {
  var s = Math.floor(time);
  var ms = time - s;
  return s * 1000 + ms;
};

exports.default = util;
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _undefined = __webpack_require__(18)(); // Support ES3 engines

module.exports = function (val) { return val !== _undefined && val !== null; };


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// ES3 safe
var _undefined = void 0;

module.exports = function (value) { return value !== _undefined && value !== null; };


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _danmu = __webpack_require__(5);

var _danmu2 = _interopRequireDefault(_danmu);

__webpack_require__(30);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _danmu2.default;
module.exports = exports['default'];

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = __webpack_require__(6);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _control = __webpack_require__(25);

var _control2 = _interopRequireDefault(_control);

var _util = __webpack_require__(0);

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DanmuJs = function () {
  function DanmuJs(options) {
    _classCallCheck(this, DanmuJs);

    var self = this;
    self.config = _util2.default.deepCopy({
      overlap: false,
      area: {
        start: 0,
        end: 1
      },
      live: false,
      comments: [],
      direction: 'r2l'
    }, options);
    self.hideArr = [];
    (0, _eventEmitter2.default)(self);
    self.config.comments.forEach(function (comment) {
      comment.duration = comment.duration < 5000 ? 5000 : comment.duration;
      if (!comment.mode) {
        comment.mode = 'scroll';
      }
    });
    if (self.config.container && self.config.container.nodeType === 1) {
      self.container = self.config.container;
    } else {
      self.emit('error', 'container id can\'t be empty');
      return false;
    }
    if (self.config.containerStyle) {
      var style = self.config.containerStyle;
      Object.keys(style).forEach(function (key) {
        self.container.style[key] = style[key];
      });
    }
    self.live = self.config.live;
    self.player = self.config.player;
    self.direction = self.config.direction;
    _util2.default.addClass(self.container, 'danmu');
    self.bulletBtn = new _control2.default(self);
    self.emit('ready');
  }

  _createClass(DanmuJs, [{
    key: 'start',
    value: function start() {
      this.bulletBtn.main.start();
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.bulletBtn.main.pause();
    }
  }, {
    key: 'play',
    value: function play() {
      this.bulletBtn.main.play();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.bulletBtn.main.stop();
    }
  }, {
    key: 'sendComment',
    value: function sendComment(comment) {
      if (!comment.duration) {
        comment.duration = 15000;
      }
      if (comment && comment.id && comment.duration && (comment.el || comment.txt)) {
        comment.duration = comment.duration < 5000 ? 5000 : comment.duration;
        // console.log(comment.style)
        if (comment.style) {
          if (this.opacity && this.opacity !== comment.style.opacity) {
            comment.style.opacity = this.opacity;
          }
          if (this.fontSize && this.fontSize !== comment.style.fontSize) {
            comment.style.fontSize = this.fontSize;
          }
          if (this.like) {
            comment.like = comment.like ? comment.like : this.like;
          }
        }
        if (comment.prior) {
          this.bulletBtn.main.data.unshift(comment);
        } else {
          this.bulletBtn.main.data.push(comment);
        }
      }
    }
  }, {
    key: 'setCommentID',
    value: function setCommentID(oldID, newID) {
      var _this = this;

      var containerPos_ = this.container.getBoundingClientRect();
      if (oldID && newID) {
        this.bulletBtn.main.data.some(function (data) {
          if (data.id === oldID) {
            data.id = newID;
            return true;
          } else {
            return false;
          }
        });
        this.bulletBtn.main.queue.some(function (item) {
          if (item.id === oldID) {
            item.id = newID;
            item.pauseMove(containerPos_);
            _this.bulletBtn.main.status !== 'paused' && item.startMove(containerPos_);
            return true;
          } else {
            return false;
          }
        });
      }
    }
  }, {
    key: 'setCommentDuration',
    value: function setCommentDuration(id, duration) {
      var _this2 = this;

      var containerPos_ = this.container.getBoundingClientRect();
      if (id && duration) {
        duration = duration < 5000 ? 5000 : duration;
        this.bulletBtn.main.data.some(function (data) {
          if (data.id === id) {
            data.duration = duration;
            return true;
          } else {
            return false;
          }
        });
        this.bulletBtn.main.queue.some(function (item) {
          if (item.id === id) {
            item.duration = duration;
            item.pauseMove(containerPos_);
            _this2.bulletBtn.main.status !== 'paused' && item.startMove(containerPos_);
            return true;
          } else {
            return false;
          }
        });
      }
    }
  }, {
    key: 'setCommentLike',
    value: function setCommentLike(id, like) {
      var containerPos_ = this.container.getBoundingClientRect();
      this.like = like;
      if (id && like) {
        this.bulletBtn.main.data.some(function (data) {
          if (data.id === id) {
            data.like = like;
            return true;
          } else {
            return false;
          }
        });
        this.bulletBtn.main.queue.some(function (item) {
          if (item.id === id) {
            item.pauseMove(containerPos_);
            item.setLikeDom(like.el, like.style);
            item.startMove(containerPos_);
            return true;
          } else {
            return false;
          }
        });
      }
    }
  }, {
    key: 'restartComment',
    value: function restartComment(id) {
      this.mouseControl = false;
      var pos = this.container.getBoundingClientRect();
      if (id) {
        this.bulletBtn.main.queue.some(function (item) {
          if (item.id === id) {
            if (item.danmu.bulletBtn.main.status !== 'paused') {
              item.startMove(pos, true);
            } else {
              item.status = 'paused';
            }
            return true;
          } else {
            return false;
          }
        });
      }
    }
  }, {
    key: 'freezeComment',
    value: function freezeComment(id) {
      this.mouseControl = true;
      var pos = this.container.getBoundingClientRect();
      if (id) {
        this.bulletBtn.main.queue.some(function (item) {
          if (item.id === id) {
            item.status = 'forcedPause';
            item.pauseMove(pos);
            if (item.el && item.el.style) {
              item.el.style.zIndex = 10;
            }
            return true;
          } else {
            return false;
          }
        });
      }
    }
  }, {
    key: 'removeComment',
    value: function removeComment(id) {
      if (!id) return;
      this.bulletBtn.main.queue.some(function (item) {
        if (item.id === id) {
          item.remove();
          return true;
        } else {
          return false;
        }
      });
    }
  }, {
    key: 'setAllDuration',
    value: function setAllDuration() {
      var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'scroll';
      var duration = arguments[1];

      var containerPos_ = this.container.getBoundingClientRect();
      if (duration) {
        duration = duration < 5000 ? 5000 : duration;
        this.bulletBtn.main.data.forEach(function (data) {
          if (mode === data.mode) {
            data.duration = duration;
          }
        });
        this.bulletBtn.main.queue.forEach(function (item) {
          if (mode === item.mode) {
            item.duration = duration;
            item.pauseMove(containerPos_);
            if (item.danmu.bulletBtn.main.status !== 'paused') {
              item.startMove(containerPos_);
            }
          }
        });
      }
    }
  }, {
    key: 'setOpacity',
    value: function setOpacity(opacity) {
      this.container.style.opacity = opacity;
    }
  }, {
    key: 'setFontSize',
    value: function setFontSize(size, fontSize) {
      var _this3 = this;

      this.fontSize = size + 'px';
      if (size) {
        this.bulletBtn.main.data.forEach(function (data) {
          if (data.style) {
            data.style.fontSize = _this3.fontSize;
          }
        });
        this.bulletBtn.main.queue.forEach(function (item) {
          if (!item.options.style) {
            item.options.style = {};
          }
          item.options.style.fontSize = _this3.fontSize;
          item.setFontSize(_this3.fontSize);
        });
      }
      if (fontSize) {
        this.config.fontSize = fontSize;
        this.bulletBtn.main.channel.resize(true);
      }
    }
  }, {
    key: 'setArea',
    value: function setArea(area) {
      this.config.area = area;
      this.bulletBtn.main.channel.resize(true);
    }
  }, {
    key: 'hide',
    value: function hide() {
      var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'scroll';

      if (this.hideArr.indexOf(mode) < 0) {
        this.hideArr.push(mode);
      }
      var arr = this.bulletBtn.main.queue.filter(function (item) {
        return mode === item.mode || mode === 'color' && item.color;
      });
      arr.forEach(function (item) {
        return item.remove();
      });
    }
  }, {
    key: 'show',
    value: function show() {
      var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'scroll';

      var index = this.hideArr.indexOf(mode);
      if (index > -1) {
        this.hideArr.splice(index, 1);
      }
    }
  }, {
    key: 'setDirection',
    value: function setDirection() {
      var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'r2l';

      this.emit('changeDirection', direction);
    }
  }]);

  return DanmuJs;
}();

exports.default = DanmuJs;
module.exports = exports['default'];

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var d        = __webpack_require__(7)
  , callable = __webpack_require__(24)

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue         = __webpack_require__(2)
  , isPlainFunction = __webpack_require__(8)
  , assign          = __webpack_require__(12)
  , normalizeOpts   = __webpack_require__(20)
  , contains        = __webpack_require__(21);

var d = (module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if (arguments.length < 2 || typeof dscr !== "string") {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (isValue(dscr)) {
		c = contains.call(dscr, "c");
		e = contains.call(dscr, "e");
		w = contains.call(dscr, "w");
	} else {
		c = w = true;
		e = false;
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
});

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== "string") {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (!isValue(get)) {
		get = undefined;
	} else if (!isPlainFunction(get)) {
		options = get;
		get = set = undefined;
	} else if (!isValue(set)) {
		set = undefined;
	} else if (!isPlainFunction(set)) {
		options = set;
		set = undefined;
	}
	if (isValue(dscr)) {
		c = contains.call(dscr, "c");
		e = contains.call(dscr, "e");
	} else {
		c = true;
		e = false;
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isFunction = __webpack_require__(9);

var classRe = /^\s*class[\s{/}]/, functionToString = Function.prototype.toString;

module.exports = function (value) {
	if (!isFunction(value)) return false;
	if (classRe.test(functionToString.call(value))) return false;
	return true;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isPrototype = __webpack_require__(10);

module.exports = function (value) {
	if (typeof value !== "function") return false;

	if (!hasOwnProperty.call(value, "length")) return false;

	try {
		if (typeof value.length !== "number") return false;
		if (typeof value.call !== "function") return false;
		if (typeof value.apply !== "function") return false;
	} catch (error) {
		return false;
	}

	return !isPrototype(value);
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObject = __webpack_require__(11);

module.exports = function (value) {
	if (!isObject(value)) return false;
	try {
		if (!value.constructor) return false;
		return value.constructor.prototype === value;
	} catch (error) {
		return false;
	}
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(2);

// prettier-ignore
var possibleTypes = { "object": true, "function": true, "undefined": true /* document.all */ };

module.exports = function (value) {
	if (!isValue(value)) return false;
	return hasOwnProperty.call(possibleTypes, typeof value);
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(13)() ? Object.assign : __webpack_require__(14);


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== "function") return false;
	obj = { foo: "raz" };
	assign(obj, { bar: "dwa" }, { trzy: "trzy" });
	return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys  = __webpack_require__(15)
  , value = __webpack_require__(19)
  , max   = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, length = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try {
			dest[key] = src[key];
		} catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < length; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(16)() ? Object.keys : __webpack_require__(17);


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	try {
		Object.keys("primitive");
		return true;
	} catch (e) {
		return false;
	}
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(1);

var keys = Object.keys;

module.exports = function (object) { return keys(isValue(object) ? Object(object) : object); };


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// eslint-disable-next-line no-empty-function
module.exports = function () {};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(1);

module.exports = function (value) {
	if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
	return value;
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(1);

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

// eslint-disable-next-line no-unused-vars
module.exports = function (opts1/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (!isValue(options)) return;
		process(Object(options), result);
	});
	return result;
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(22)() ? String.prototype.contains : __webpack_require__(23);


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var str = "razdwatrzy";

module.exports = function () {
	if (typeof str.contains !== "function") return false;
	return str.contains("dwa") === true && str.contains("foo") === false;
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (fn) {
	if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
	return fn;
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = __webpack_require__(0);

var _util2 = _interopRequireDefault(_util);

var _main = __webpack_require__(27);

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Control = function () {
  function Control(danmu) {
    _classCallCheck(this, Control);

    this.danmu = danmu;
    this.main = new _main2.default(danmu);
    if (!danmu.config.defaultOff) {
      this.main.start();
    }
  }

  _createClass(Control, [{
    key: 'createSwitch',
    value: function createSwitch() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.switchBtn = _util2.default.createDom('dk-switch', '<span class="txt">弹</span>', {}, 'danmu-switch ' + (state ? 'danmu-switch-active' : ''));
      return this.switchBtn;
    }
  }]);

  return Control;
}();

exports.default = Control;
module.exports = exports['default'];

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RecyclableDOMList = function () {
  function RecyclableDOMList(options) {
    _classCallCheck(this, RecyclableDOMList);

    options = {
      initDOM: function initDOM() {
        return document.createElement('div');
      },
      initSize: 10
    };
    this.init(options);
  }

  _createClass(RecyclableDOMList, [{
    key: 'init',
    value: function init(options) {
      this.idleList = [];
      this.usingList = [];
      this._id = 0;
      this.options = options;
      this._expand(options.initSize);
    }
  }, {
    key: 'use',
    value: function use() {
      if (!this.idleList.length) {
        this._expand(1);
      }
      var firseIdle = this.idleList.shift();
      this.usingList.push(firseIdle);
      return firseIdle;
    }
  }, {
    key: 'unuse',
    value: function unuse(dom) {
      var idx = this.usingList.indexOf(dom);
      if (idx < 0) {
        return;
      }
      this.usingList.splice(idx, 1);
      dom.innerHTML = '';
      dom.textcontent = '';
      dom.style = '';
      this.idleList.push(dom);
    }
  }, {
    key: '_expand',
    value: function _expand(size) {
      for (var i = 0; i < size; i++) {
        this.idleList.push(this.options.initDOM(this._id++));
      }
    }
  }]);

  return RecyclableDOMList;
}();

exports.default = RecyclableDOMList;
module.exports = exports['default'];

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _channel = __webpack_require__(28);

var _channel2 = _interopRequireDefault(_channel);

var _bullet = __webpack_require__(29);

var _bullet2 = _interopRequireDefault(_bullet);

var _util = __webpack_require__(0);

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * [Main 弹幕主进程]
 * @type {Class}
 */
var Main = function () {
  function Main(danmu) {
    _classCallCheck(this, Main);

    this.danmu = danmu;
    this.container = danmu.container;
    this.channel = new _channel2.default(danmu); // 弹幕轨道实例
    this.data = [].concat(danmu.config.comments);
    this.playedData = [];
    this.queue = []; // 等待播放的弹幕队列
    this.timer = null; // 弹幕动画定时器句柄
    this.retryTimer = null; // 弹幕更新重试定时器句柄
    this.interval = danmu.config.interval || 2000; // 弹幕队列缓存间隔
    this.status = 'idle'; // 当前弹幕正在闲置
    danmu.on('bullet_remove', this.updateQueue.bind(this));
    var self = this;
    this.danmu.on('changeDirection', function (direction) {
      self.danmu.direction = direction;
    });
    this.nums = 0;
  }
  // 在渲染队列中移除已经展示完的弹幕对象


  _createClass(Main, [{
    key: 'updateQueue',
    value: function updateQueue(rdata) {
      var self = this;
      self.queue.some(function (item, index) {
        if (item.id === rdata.bullet.id) {
          self.queue.splice(index, 1);
          return true;
        } else {
          return false;
        }
      });
    }
  }, {
    key: 'init',
    value: function init(bol, self) {
      if (!self) {
        self = this;
      }
      self.data.sort(function (a, b) {
        return a.start - b.start;
      });
      if (!self.retryTimer) {
        self.retryTimer = setInterval(function () {
          self.readData();
          self.dataHandle();
        }, self.interval - 1000);
      }
    }
    // 启动弹幕渲染主进程

  }, {
    key: 'start',
    value: function start() {
      var self = this;
      this.status = 'playing';
      this.queue = [];
      this.container.innerHTML = '';
      this.channel.resetWithCb(self.init, self);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var self = this;
      this.status = 'closed';
      clearInterval(self.retryTimer);
      self.retryTimer = null;
      self.channel.reset();
      this.queue = [];
      self.container.innerHTML = '';
    }
  }, {
    key: 'play',
    value: function play() {
      this.status = 'playing';
      var channels = this.channel.channels;
      var containerPos = this.danmu.container.getBoundingClientRect();
      if (channels && channels.length > 0) {
        ['scroll', 'top', 'bottom'].forEach(function (key) {
          for (var i = 0; i < channels.length; i++) {
            channels[i].queue[key].forEach(function (item) {
              if (!item.resized) {
                item.startMove(containerPos);
                item.resized = true;
              }
            });
          }
          for (var _i = 0; _i < channels.length; _i++) {
            channels[_i].queue[key].forEach(function (item) {
              item.resized = false;
            });
          }
        });
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.status = 'paused';
      var channels = this.channel.channels;
      var containerPos = this.danmu.container.getBoundingClientRect();
      if (channels && channels.length > 0) {
        ['scroll', 'top', 'bottom'].forEach(function (key) {
          for (var i = 0; i < channels.length; i++) {
            channels[i].queue[key].forEach(function (item) {
              item.pauseMove(containerPos);
            });
          }
        });
      }
    }
  }, {
    key: 'dataHandle',
    value: function dataHandle() {
      var self = this;
      if (this.status === 'paused' || this.status === 'closed') {
        return;
      }
      if (self.queue.length) {
        self.queue.forEach(function (item) {
          if (item.status === 'waiting' || item.status === 'paused') {
            // item.status = 'start'
            item.startMove(self.channel.containerPos);
          }
        });
      }
    }
  }, {
    key: 'readData',
    value: function readData() {
      var self = this,
          danmu = this.danmu;
      var currentTime = 0;
      if (danmu.player && danmu.player.currentTime) {
        currentTime = _util2.default.formatTime(danmu.player.currentTime);
      }
      var bullet = void 0,
          interval = self.interval,
          channel = self.channel,
          result = void 0;
      var list = void 0;
      if (danmu.player) {
        list = self.data.filter(function (item) {
          if (!item.start && self.danmu.hideArr.indexOf(item.mode) < 0) {
            if (!item.color || self.danmu.hideArr.indexOf('color') < 0) {
              item.start = currentTime;
            }
          }
          return self.danmu.hideArr.indexOf(item.mode) < 0 && (!item.color || self.danmu.hideArr.indexOf('color') < 0) && item.start - interval <= currentTime && currentTime <= item.start + interval;
        });
        if (danmu.live) {
          self.data = self.data.filter(function (item) {
            if (!item.start) {
              item.start = currentTime;
            }
            return item.start > currentTime - 3 * interval;
          });
        }
      } else {
        list = self.data.splice(0, 1);
        // self.data = []
        if (list.length === 0) list = self.playedData.splice(0, 1);
      }

      if (list.length > 0) {
        list.forEach(function (item) {
          bullet = new _bullet2.default(danmu, item);
          if (!item.hasAttached) {
            bullet.attach();
            item.hasAttach = true;
          }
          result = channel.addBullet(bullet);
          if (result.result) {
            self.queue.push(bullet);
            self.nums++;
            bullet.topInit();
          } else {
            bullet.detach();
            if (item.noDiscard) {
              if (item.prior) {
                self.data.unshift(item);
              } else {
                self.data.push(item);
              }
            }
          }
        });
      }
    }
  }]);

  return Main;
}();

exports.default = Main;
module.exports = exports['default'];

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * [Channel 弹幕轨道控制]
 * @type {Class}
 */
var Channel = function () {
  function Channel(danmu) {
    _classCallCheck(this, Channel);

    this.danmu = danmu;
    this.reset();
    var self = this;
    this.danmu.on('bullet_remove', function (r) {
      self.removeBullet(r.bullet);
    });
    this.direction = danmu.direction;
    this.danmu.on('changeDirection', function (direction) {
      self.direction = direction;
    });

    this.containerPos = this.danmu.container.getBoundingClientRect();
    this.containerWidth = this.containerPos.width;
    this.containerHeight = this.containerPos.height;
    this.containerLeft = this.containerPos.left;
    this.containerRight = this.containerPos.right;
    this.danmu.bulletResizeTimer = setInterval(function () {
      self.containerPos = self.danmu.container.getBoundingClientRect();
      if (self.resizeing) {
        return;
      }
      if (Math.abs(self.containerPos.width - self.containerWidth) >= 2 || Math.abs(self.containerPos.height - self.containerHeight) >= 2 || Math.abs(self.containerPos.left - self.containerLeft) >= 2 || Math.abs(self.containerPos.right - self.containerRight) >= 2) {
        self.containerWidth = self.containerPos.width;
        self.containerHeight = self.containerPos.height;
        self.containerLeft = self.containerPos.left;
        self.containerRight = self.containerPos.right;
        self.resize(true);
      }
    }, 50);
  }

  _createClass(Channel, [{
    key: 'resize',
    value: function resize() {
      var isFullscreen = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var container = this.danmu.container;
      var self = this;
      if (self.resizeing) {
        return;
      }
      self.resizeing = true;
      setTimeout(function () {
        var isDanmuPause = self.danmu.bulletBtn.main.status === 'paused';
        if (self.danmu.bulletBtn.main.data) {
          self.danmu.bulletBtn.main.data.forEach(function (item) {
            if (item.bookChannelId) {
              delete item['bookChannelId'];
              // console.log('resize导致' + item.id + '号优先弹幕预定取消')
            }
          });
        }
        // console.log('resize导致所有轨道恢复正常使用')
        var size = container.getBoundingClientRect();
        self.width = size.width;
        self.height = size.height;

        if (self.danmu.config.area && self.danmu.config.area.start >= 0 && self.danmu.config.area.end >= self.danmu.config.area.start) {
          if (self.direction === 'b2t') {
            self.width = self.width * (self.danmu.config.area.end - self.danmu.config.area.start);
          } else {
            self.height = self.height * (self.danmu.config.area.end - self.danmu.config.area.start);
          }
        }
        self.container = container;
        var fontSize = self.danmu.config.fontSize || (/mobile/ig.test(navigator.userAgent) ? 10 : 12);
        var channelSize = void 0;
        if (self.direction === 'b2t') {
          channelSize = Math.floor(self.width / fontSize);
        } else {
          channelSize = Math.floor(self.height / fontSize);
        }
        var channels = [];
        for (var i = 0; i < channelSize; i++) {
          channels[i] = {
            id: i,
            queue: {
              scroll: [],
              top: [],
              bottom: []
            },
            operating: {
              scroll: false,
              top: false,
              bottom: false
            },
            bookId: {}
          };
        }
        if (self.channels && self.channels.length <= channels.length) {
          var _loop = function _loop(_i) {
            channels[_i] = {
              id: _i,
              queue: {
                scroll: [],
                top: [],
                bottom: []
              },
              operating: {
                scroll: false,
                top: false,
                bottom: false
              },
              bookId: {}
            };
            ['scroll', 'top'].forEach(function (key) {
              self.channels[_i].queue[key].forEach(function (item) {
                if (item.el) {
                  channels[_i].queue[key].push(item);
                  if (!item.resized) {
                    item.pauseMove(self.containerPos, isFullscreen);
                    if (item.danmu.bulletBtn.main.status !== 'paused') {
                      item.startMove(self.containerPos);
                    }
                    item.resized = true;
                  }
                }
              });
            });
            self.channels[_i].queue['bottom'].forEach(function (item) {
              if (item.el) {
                channels[_i + channels.length - self.channels.length].queue['bottom'].push(item);
                if (item.channel_id[0] + item.channel_id[1] - 1 === _i) {
                  var channel_id = [].concat(item.channel_id);
                  item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]];
                  item.top = item.channel_id[0] * fontSize;
                  if (self.danmu.config.area && self.danmu.config.area.start) {
                    item.top += self.containerHeight * self.danmu.config.area.start;
                  }
                  item.topInit();
                }
                if (!item.resized) {
                  item.pauseMove(self.containerPos, isFullscreen);
                  if (item.danmu.bulletBtn.main.status !== 'paused') {
                    item.startMove(self.containerPos);
                  }
                  item.resized = true;
                }
              }
            });
          };

          for (var _i = 0; _i < self.channels.length; _i++) {
            _loop(_i);
          }

          var _loop2 = function _loop2(_i2) {
            ['scroll', 'top', 'bottom'].forEach(function (key) {
              channels[_i2].queue[key].forEach(function (item) {
                // console.log('resized 重置:' + item)
                item.resized = false;
              });
            });
          };

          for (var _i2 = 0; _i2 < channels.length; _i2++) {
            _loop2(_i2);
          }
          self.channels = channels;
          if (self.direction === 'b2t') {
            self.channelWidth = fontSize;
          } else {
            self.channelHeight = fontSize;
          }
        } else if (self.channels && self.channels.length > channels.length) {
          var _loop3 = function _loop3(_i3) {
            channels[_i3] = {
              id: _i3,
              queue: {
                scroll: [],
                top: [],
                bottom: []
              },
              operating: {
                scroll: false,
                top: false,
                bottom: false
              },
              bookId: {}
            };
            ['scroll', 'top', 'bottom'].forEach(function (key) {
              if (key === 'top' && _i3 > Math.floor(channels.length / 2)) {} else if (key === 'bottom' && _i3 <= Math.floor(channels.length / 2)) {} else {
                var num = key === 'bottom' ? _i3 - channels.length + self.channels.length : _i3;
                self.channels[num].queue[key].forEach(function (item, index) {
                  if (item.el) {
                    channels[_i3].queue[key].push(item);
                    if (key === 'bottom') {
                      if (item.channel_id[0] + item.channel_id[1] - 1 === num) {
                        var channel_id = [].concat(item.channel_id);
                        item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]];
                        item.top = item.channel_id[0] * fontSize;
                        if (self.danmu.config.area && self.danmu.config.area.start) {
                          item.top += self.containerHeight * self.danmu.config.area.start;
                        }
                        item.topInit();
                      }
                    }
                    item.pauseMove(self.containerPos, isFullscreen);
                    if (item.danmu.bulletBtn.main.status !== 'paused') {
                      item.startMove(self.containerPos);
                    }
                    if (!item.resized) {
                      item.resized = true;
                    }
                  }
                  self.channels[num].queue[key].splice(index, 1);
                });
              }
            });
          };

          for (var _i3 = 0; _i3 < channels.length; _i3++) {
            _loop3(_i3);
          }

          var _loop4 = function _loop4(_i4) {
            ['scroll', 'top', 'bottom'].forEach(function (key) {
              self.channels[_i4].queue[key].forEach(function (item) {
                item.pauseMove(self.containerPos);
                item.remove();
              });
            });
          };

          for (var _i4 = channels.length; _i4 < self.channels.length; _i4++) {
            _loop4(_i4);
          }

          var _loop5 = function _loop5(_i5) {
            ['scroll', 'top', 'bottom'].forEach(function (key) {
              channels[_i5].queue[key].forEach(function (item) {
                // console.log('resized 重置:' + item)
                item.resized = false;
              });
            });
          };

          for (var _i5 = 0; _i5 < channels.length; _i5++) {
            _loop5(_i5);
          }
          self.channels = channels;
          if (self.direction === 'b2t') {
            self.channelWidth = fontSize;
          } else {
            self.channelHeight = fontSize;
          }
        }
        self.resizeing = false;
      }, 10);
    }
  }, {
    key: 'addBullet',
    value: function addBullet(bullet) {
      // if (bullet.prior) {
      // console.log(bullet.id + '号优先弹幕请求注册')
      // }
      var self = this;
      var danmu = this.danmu;
      var channels = this.channels;
      var channelHeight = void 0,
          channelWidth = void 0,
          occupy = void 0;
      if (self.direction === 'b2t') {
        channelWidth = this.channelWidth;
        occupy = Math.ceil(bullet.width / channelWidth);
      } else {
        channelHeight = this.channelHeight;
        occupy = Math.ceil(bullet.height / channelHeight);
      }
      if (occupy > channels.length) {
        return {
          result: false,
          message: 'exceed channels.length, occupy=' + occupy + ',channelsSize=' + channels.length
        };
      } else {
        var flag = true,
            channel = void 0,
            pos = -1;
        for (var i = 0, max = channels.length; i < max; i++) {
          if (channels[i].queue[bullet.mode].some(function (item) {
            return item.id === bullet.id;
          })) {
            return {
              result: false,
              message: 'exsited, channelOrder=' + i + ',danmu_id=' + bullet.id
            };
          }
        }
        if (bullet.mode === 'scroll') {
          for (var _i6 = 0, _max = channels.length - occupy; _i6 <= _max; _i6++) {
            flag = true;
            for (var j = _i6; j < _i6 + occupy; j++) {
              channel = channels[j];
              if (channel.operating.scroll) {
                flag = false;
                break;
              }
              if ((channel.bookId.scroll || bullet.prior) && channel.bookId.scroll !== bullet.id) {
                flag = false;
                break;
              }
              channel.operating.scroll = true;
              var curBullet = channel.queue.scroll[0];
              if (curBullet) {
                var curBulletPos = curBullet.el.getBoundingClientRect();
                if (self.direction === 'b2t') {
                  if (curBulletPos.bottom > self.containerPos.bottom) {
                    flag = false;
                    channel.operating.scroll = false;
                    break;
                  }
                } else {
                  if (curBulletPos.right > self.containerPos.right) {
                    flag = false;
                    channel.operating.scroll = false;
                    break;
                  }
                }

                // Vcur * t + Scur已走 - Widthcur = Vnew * t
                // t = (Scur已走 - Widthcur) / (Vnew - Vcur)
                // Vnew * t < Widthplayer
                var curS = void 0,
                    curV = void 0,
                    curT = void 0,
                    newS = void 0,
                    newV = void 0,
                    newT = void 0;
                if (self.direction === 'b2t') {
                  curS = curBulletPos.top - self.containerPos.top + curBulletPos.height;

                  curV = (self.containerPos.height + curBulletPos.height) / curBullet.duration;
                  curT = curS / curV;

                  newS = self.containerPos.height;
                  newV = (self.containerPos.height + bullet.height) / bullet.duration;
                } else {
                  curS = curBulletPos.left - self.containerPos.left + curBulletPos.width;

                  curV = (self.containerPos.width + curBulletPos.width) / curBullet.duration;
                  curT = curS / curV;

                  newS = self.containerPos.width;
                  newV = (self.containerPos.width + bullet.width) / bullet.duration;
                }
                newT = newS / newV;
                if (!danmu.config.bOffset) {
                  danmu.config.bOffset = 0;
                }
                if (curV < newV && curT + danmu.config.bOffset > newT) {
                  flag = false;
                  channel.operating.scroll = false;
                  break;
                }
              }
              channel.operating.scroll = false;
            }
            if (flag) {
              pos = _i6;
              break;
            }
          }
        } else if (bullet.mode === 'top') {
          for (var _i7 = 0, _max2 = channels.length - occupy; _i7 <= _max2; _i7++) {
            flag = true;
            for (var _j = _i7; _j < _i7 + occupy; _j++) {
              if (_j > Math.floor(channels.length / 2)) {
                flag = false;
                break;
              }
              channel = channels[_j];
              if (channel.operating[bullet.mode]) {
                flag = false;
                break;
              }
              if ((channel.bookId[bullet.mode] || bullet.prior) && channel.bookId[bullet.mode] !== bullet.id) {
                flag = false;
                break;
              }
              channel.operating[bullet.mode] = true;
              if (channel.queue[bullet.mode].length > 0) {
                flag = false;
                channel.operating[bullet.mode] = false;
                break;
              }
              channel.operating[bullet.mode] = false;
            }
            if (flag) {
              pos = _i7;
              break;
            }
          }
        } else if (bullet.mode === 'bottom') {
          for (var _i8 = channels.length - occupy; _i8 >= 0; _i8--) {
            flag = true;
            for (var _j2 = _i8; _j2 < _i8 + occupy; _j2++) {
              if (_j2 <= Math.floor(channels.length / 2)) {
                flag = false;
                break;
              }
              channel = channels[_j2];
              if (channel.operating[bullet.mode]) {
                flag = false;
                break;
              }
              if ((channel.bookId[bullet.mode] || bullet.prior) && channel.bookId[bullet.mode] !== bullet.id) {
                flag = false;
                break;
              }
              channel.operating[bullet.mode] = true;
              if (channel.queue[bullet.mode].length > 0) {
                flag = false;
                channel.operating[bullet.mode] = false;
                break;
              }
              channel.operating[bullet.mode] = false;
            }
            if (flag) {
              pos = _i8;
              break;
            }
          }
        }

        if (pos !== -1) {
          for (var _i9 = pos, _max3 = pos + occupy; _i9 < _max3; _i9++) {
            channel = channels[_i9];
            channel.operating[bullet.mode] = true;
            channel.queue[bullet.mode].unshift(bullet);
            if (bullet.prior) {
              delete channel.bookId[bullet.mode];
              // console.log(i + '号轨道恢复正常使用')
            }
            channel.operating[bullet.mode] = false;
          }
          if (bullet.prior) {
            // console.log(bullet.id + '号优先弹幕运行完毕')
            delete bullet['bookChannelId'];
            if (danmu.player) {
              var dataList = danmu.bulletBtn.main.data;
              dataList.some(function (item) {
                if (item.id === bullet.id) {
                  delete item['bookChannelId'];
                  return true;
                } else {
                  return false;
                }
              });
            }
          }
          bullet.channel_id = [pos, occupy];

          if (self.direction === 'b2t') {
            bullet.top = pos * channelWidth;
            if (self.danmu.config.area && self.danmu.config.area.start) {
              bullet.top += self.containerWidth * self.danmu.config.area.start;
            }
          } else {
            bullet.top = pos * channelHeight;
            if (self.danmu.config.area && self.danmu.config.area.start) {
              bullet.top += self.containerHeight * self.danmu.config.area.start;
            }
          }
          return {
            result: bullet,
            message: 'success'
          };
        } else {
          if (bullet.prior) {
            if (!bullet.bookChannelId) {
              pos = -1;
              for (var _i10 = 0, _max4 = channels.length - occupy; _i10 <= _max4; _i10++) {
                flag = true;
                for (var _j3 = _i10; _j3 < _i10 + occupy; _j3++) {
                  if (channels[_j3].bookId[bullet.mode]) {
                    flag = false;
                    break;
                  }
                }
                if (flag) {
                  pos = _i10;
                  break;
                }
              }
              if (pos !== -1) {
                for (var _j4 = pos; _j4 < pos + occupy; _j4++) {
                  channels[_j4].bookId[bullet.mode] = bullet.id;
                  // console.log(j + '号轨道被' + bullet.id + '号优先弹幕预定')
                }
                var nextAddTime = 2;
                if (danmu.player) {
                  var _dataList = danmu.bulletBtn.main.data;
                  _dataList.some(function (item) {
                    if (item.id === bullet.id) {
                      // console.log(bullet.id + '号优先弹幕将于' + nextAddTime + '秒后再次请求注册')
                      item.start += nextAddTime * 1000;
                      item.bookChannelId = [pos, occupy];
                      // console.log(bullet.id + '号优先弹幕预定了' + pos + '~' + pos + occupy - 1 + '号轨道')
                      // console.log(`${bullet.id}号优先弹幕预定了${pos}~${pos + occupy - 1}号轨道`)
                      return true;
                    } else {
                      return false;
                    }
                  });
                }
              }
            } else {
              var _nextAddTime = 2;
              if (danmu.player) {
                var _dataList2 = danmu.bulletBtn.main.data;
                _dataList2.some(function (item) {
                  if (item.id === bullet.id) {
                    // console.log(bullet.id + '号优先弹幕将于' + nextAddTime + '秒后再次请求注册')
                    item.start += _nextAddTime * 1000;
                    return true;
                  } else {
                    return false;
                  }
                });
              }
            }
          }
          return {
            result: false,
            message: 'no surplus will right'
          };
        }
      }
    }
  }, {
    key: 'removeBullet',
    value: function removeBullet(bullet) {
      // console.log('removeBullet')
      var channels = this.channels;
      var channelId = bullet.channel_id;
      var channel = void 0;
      for (var i = channelId[0], max = channelId[0] + channelId[1]; i < max; i++) {
        channel = channels[i];
        if (channel) {
          channel.operating[bullet.mode] = true;
          var _i11 = -1;
          channel.queue[bullet.mode].some(function (item, index) {
            if (item.id === bullet.id) {
              _i11 = index;
              return true;
            } else {
              return false;
            }
          });
          if (_i11 > -1) {
            channel.queue[bullet.mode].splice(_i11, 1);
          }
          channel.operating[bullet.mode] = false;
        }
      }
      if (bullet.options.loop) {
        this.danmu.bulletBtn.main.playedData.push(bullet.options);
      }
    }
  }, {
    key: 'resetArea',
    value: function resetArea() {
      var container = this.danmu.container;
      var self = this;
      var size = container.getBoundingClientRect();
      self.width = size.width;
      self.height = size.height;
      if (self.danmu.config.area && self.danmu.config.area.start >= 0 && self.danmu.config.area.end >= self.danmu.config.area.start) {
        if (self.direction === 'b2t') {
          self.width = self.width * (self.danmu.config.area.end - self.danmu.config.area.start);
        } else {
          self.height = self.height * (self.danmu.config.area.end - self.danmu.config.area.start);
        }
      }
      self.container = container;
      var fontSize = self.danmu.config.fontSize || (/mobile/ig.test(navigator.userAgent) ? 10 : 12);
      var channelSize = void 0;
      if (self.direction === 'b2t') {
        channelSize = Math.floor(self.width / fontSize);
      } else {
        channelSize = Math.floor(self.height / fontSize);
      }

      var channels = [];
      for (var i = 0; i < channelSize; i++) {
        channels[i] = {
          id: i,
          queue: {
            scroll: [],
            top: [],
            bottom: []
          },
          operating: {
            scroll: false,
            top: false,
            bottom: false
          },
          bookId: {}
        };
      }

      if (self.channels && self.channels.length <= channels.length) {
        var _loop6 = function _loop6(_i12) {
          channels[_i12] = {
            id: _i12,
            queue: {
              scroll: [],
              top: [],
              bottom: []
            },
            operating: {
              scroll: false,
              top: false,
              bottom: false
            },
            bookId: {}
          };
          ['scroll', 'top'].forEach(function (key) {
            self.channels[_i12].queue[key].forEach(function (item) {
              if (item.el) {
                channels[_i12].queue[key].push(item);
                if (!item.resized) {
                  item.pauseMove(self.containerPos, false);
                  item.startMove(self.containerPos);
                  item.resized = true;
                }
              }
            });
          });
          self.channels[_i12].queue['bottom'].forEach(function (item) {
            if (item.el) {
              channels[_i12 + channels.length - self.channels.length].queue['bottom'].push(item);
              if (item.channel_id[0] + item.channel_id[1] - 1 === _i12) {
                var channel_id = [].concat(item.channel_id);
                item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]];
                item.top = item.channel_id[0] * fontSize;
                if (self.danmu.config.area && self.danmu.config.area.start) {
                  item.top += self.containerHeight * self.danmu.config.area.start;
                }
                item.topInit();
              }
              if (!item.resized) {
                item.pauseMove(self.containerPos, false);
                item.startMove(self.containerPos);
                item.resized = true;
              }
            }
          });
        };

        for (var _i12 = 0; _i12 < self.channels.length; _i12++) {
          _loop6(_i12);
        }

        var _loop7 = function _loop7(_i13) {
          ['scroll', 'top', 'bottom'].forEach(function (key) {
            channels[_i13].queue[key].forEach(function (item) {
              // console.log('resized 重置:' + item)
              item.resized = false;
            });
          });
        };

        for (var _i13 = 0; _i13 < channels.length; _i13++) {
          _loop7(_i13);
        }
        self.channels = channels;
        if (self.direction === 'b2t') {
          self.channelWidth = fontSize;
        } else {
          self.channelHeight = fontSize;
        }
      } else if (self.channels && self.channels.length > channels.length) {
        var _loop8 = function _loop8(_i14) {
          channels[_i14] = {
            id: _i14,
            queue: {
              scroll: [],
              top: [],
              bottom: []
            },
            operating: {
              scroll: false,
              top: false,
              bottom: false
            },
            bookId: {}
          };
          ['scroll', 'top', 'bottom'].forEach(function (key) {
            if (key === 'top' && _i14 > Math.floor(channels.length / 2)) {} else if (key === 'bottom' && _i14 <= Math.floor(channels.length / 2)) {} else {
              var num = key === 'bottom' ? _i14 - channels.length + self.channels.length : _i14;
              self.channels[num].queue[key].forEach(function (item, index) {
                if (item.el) {
                  channels[_i14].queue[key].push(item);
                  if (key === 'bottom') {
                    if (item.channel_id[0] + item.channel_id[1] - 1 === num) {
                      var channel_id = [].concat(item.channel_id);
                      item.channel_id = [channel_id[0] - self.channels.length + channels.length, channel_id[1]];
                      item.top = item.channel_id[0] * fontSize;
                      if (self.danmu.config.area && self.danmu.config.area.start) {
                        item.top += self.containerHeight * self.danmu.config.area.start;
                      }
                      item.topInit();
                    }
                  }
                  if (!item.resized) {
                    item.pauseMove(self.containerPos, false);
                    item.startMove(self.containerPos);
                    item.resized = true;
                  }
                }
                self.channels[num].queue[key].splice(index, 1);
              });
            }
          });
        };

        for (var _i14 = 0; _i14 < channels.length; _i14++) {
          _loop8(_i14);
        }
        // for (let i = channels.length; i < self.channels.length; i++) {
        //   ['scroll', 'top', 'bottom'].forEach(key => {
        //     self.channels[i].queue[key].forEach(item => {
        //       item.pauseMove(self.containerPos)
        //       item.remove()
        //     })
        //   })
        // }

        var _loop9 = function _loop9(_i15) {
          ['scroll', 'top', 'bottom'].forEach(function (key) {
            channels[_i15].queue[key].forEach(function (item) {
              // console.log('resized 重置:' + item)
              item.resized = false;
            });
          });
        };

        for (var _i15 = 0; _i15 < channels.length; _i15++) {
          _loop9(_i15);
        }
        self.channels = channels;
        if (self.direction === 'b2t') {
          self.channelWidth = fontSize;
        } else {
          self.channelHeight = fontSize;
        }
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      var container = this.danmu.container;
      var self = this;
      if (self.channels && self.channels.length > 0) {
        ['scroll', 'top', 'bottom'].forEach(function (key) {
          for (var i = 0; i < self.channels.length; i++) {
            self.channels[i].queue[key].forEach(function (item) {
              item.pauseMove(self.containerPos);
              item.remove();
            });
          }
        });
      }
      setTimeout(function () {
        var size = container.getBoundingClientRect();
        self.width = size.width;
        self.height = size.height;
        if (self.danmu.config.area && self.danmu.config.area.start >= 0 && self.danmu.config.area.end >= self.danmu.config.area.start) {
          if (self.direction === 'b2t') {
            self.width = self.width * (self.danmu.config.area.end - self.danmu.config.area.start);
          } else {
            self.height = self.height * (self.danmu.config.area.end - self.danmu.config.area.start);
          }
        }
        self.container = container;
        var fontSize = self.danmu.config.fontSize || (/mobile/ig.test(navigator.userAgent) ? 10 : 12);
        var channelSize = void 0;
        if (self.direction === 'b2t') {
          channelSize = Math.floor(self.width / fontSize);
        } else {
          channelSize = Math.floor(self.height / fontSize);
        }

        var channels = [];
        for (var i = 0; i < channelSize; i++) {
          channels[i] = {
            id: i,
            queue: {
              scroll: [],
              top: [],
              bottom: []
            },
            operating: {
              scroll: false,
              top: false,
              bottom: false
            },
            bookId: {}
          };
        }
        self.channels = channels;
        if (self.direction === 'b2t') {
          self.channelWidth = fontSize;
        } else {
          self.channelHeight = fontSize;
        }
      }, 200);
    }
  }, {
    key: 'resetWithCb',
    value: function resetWithCb(cb, main) {
      var container = this.danmu.container;
      var self = this;
      if (self.channels && self.channels.length > 0) {
        ['scroll', 'top', 'bottom'].forEach(function (key) {
          for (var i = 0; i < self.channels.length; i++) {
            self.channels[i].queue[key].forEach(function (item) {
              item.pauseMove(self.containerPos);
              item.remove();
            });
          }
        });
      }
      var size = container.getBoundingClientRect();
      self.width = size.width;
      self.height = size.height;
      if (self.danmu.config.area && self.danmu.config.area.start >= 0 && self.danmu.config.area.end >= self.danmu.config.area.start) {
        if (self.direction === 'b2t') {
          self.width = self.width * (self.danmu.config.area.end - self.danmu.config.area.start);
        } else {
          self.height = self.height * (self.danmu.config.area.end - self.danmu.config.area.start);
        }
      }
      self.container = container;
      var fontSize = self.danmu.config.fontSize || (/mobile/ig.test(navigator.userAgent) ? 10 : 12);
      var channelSize = void 0;
      if (self.direction === 'b2t') {
        channelSize = Math.floor(self.width / fontSize);
      } else {
        channelSize = Math.floor(self.height / fontSize);
      }
      var channels = [];
      for (var i = 0; i < channelSize; i++) {
        channels[i] = {
          id: i,
          queue: {
            scroll: [],
            top: [],
            bottom: []
          },
          operating: {
            scroll: false,
            top: false,
            bottom: false
          },
          bookId: {}
        };
      }
      self.channels = channels;
      self.channelHeight = fontSize;
      if (cb) {
        cb(true, main);
      }
    }
  }]);

  return Channel;
}();

exports.default = Channel;
module.exports = exports['default'];

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = __webpack_require__(0);

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * [Bullet 弹幕构造类]
 * @type {Class}
 */
var Bullet = function () {
  function Bullet(danmu, options) {
    _classCallCheck(this, Bullet);

    this.danmu = danmu;
    this.options = options;
    this.duration = options.duration;
    this.moveV = options.moveV;
    this.id = options.id;
    this.container = danmu.container;
    this.start = options.start;
    this.prior = options.prior;
    this.color = options.color;
    this.bookChannelId = options.bookChannelId;
    this.direction = danmu.direction;
    var self = this;
    this.danmu.on('changeDirection', function (direction) {
      self.direction = direction;
    });
    var el = void 0;
    this.domObj = _util2.default.domObj;
    if (options.el && options.el.nodeType === 1) {
      el = this.domObj.use();
      el.appendChild(_util2.default.copyDom(options.el));
      // el = util.copyDom(options.el)
    } else {
      el = this.domObj.use();
      // el = document.createElement('div')
      el.textContent = options.txt;
      if (options.style) {
        var style = options.style;
        Object.keys(style).forEach(function (key) {
          el.style[key] = style[key];
        });
      }
    }
    if (options.mode === 'top' || options.mode === 'bottom') {
      this.mode = options.mode;
    } else {
      this.mode = 'scroll';
    }
    this.el = el;
    if (options.like && options.like.el) {
      this.setLikeDom(options.like.el, options.like.style);
    }
    this.status = 'waiting'; // waiting,start,end
    var containerPos = this.container.getBoundingClientRect();
    var random = Math.floor(Math.random() * (containerPos.width / 10 > 100 ? 100 : containerPos.width / 10));
    this.el.style.left = containerPos.width + random + 'px';
  }

  _createClass(Bullet, [{
    key: 'attach',
    value: function attach() {
      var self = this;
      self.container.appendChild(self.el);
      self.elPos = self.el.getBoundingClientRect();
      if (self.direction === 'b2t') {
        self.width = self.elPos.height;
        self.height = self.elPos.width;
      } else {
        self.width = self.elPos.width;
        self.height = self.elPos.height;
      }
      if (self.moveV) {
        var containerPos = self.container.getBoundingClientRect();
        self.duration = (containerPos.width + self.width) / self.moveV * 1000;
      }
      if (self.danmu.config.mouseControl) {
        self.el.addEventListener('mouseover', self.mouseoverFun.bind(self));
      }
    }
  }, {
    key: 'mouseoverFun',
    value: function mouseoverFun(event) {
      var self = this;
      if (self.danmu.mouseControl && self.danmu.config.mouseControlPause || self.status === 'waiting' || self.status === 'end') {
        return;
      }
      self.danmu.emit('bullet_hover', {
        bullet: self,
        event: event
      });
    }
  }, {
    key: 'detach',
    value: function detach() {
      var self = this;
      if (self.container && self.el) {
        self.domObj.unuse(self.el);
      }
      self.danmu.off('changeDirection', function (direction) {
        self.direction = direction;
      });
    }
  }, {
    key: 'topInit',
    value: function topInit() {
      if (this.direction === 'b2t') {
        var containerPos = this.container.getBoundingClientRect();
        this.el.style.transformOrigin = 'left top';
        this.el.style.transform = 'translateX(-' + this.top + 'px) translateY(' + containerPos.height + 'px) translateZ(0px) rotate(90deg)';
        this.el.style.transition = 'transform 0s linear 0s';
      } else {
        this.el.style.top = this.top + 'px';
      }
    }
  }, {
    key: 'pauseMove',
    value: function pauseMove(containerPos) {
      var isFullscreen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      // console.log('pauseMove')
      var self = this;
      if (this.status === 'paused') {
        return;
      }
      if (self.status !== 'forcedPause') {
        this.status = 'paused';
      }
      clearTimeout(self.removeTimer);
      if (!this.el) {
        return;
      }
      this.el.style.willChange = 'auto';
      if (this.mode === 'scroll') {
        if (isFullscreen) {
          var pastDuration = (new Date().getTime() - self.moveTime) / 1000;
          var pastS = pastDuration * this.moveV;
          var ratio = 0;
          var nowS = 0;
          // console.log('self.moveMoreS: ' + self.moveMoreS)
          // console.log('pastS: ' + pastS)
          if (self.moveMoreS - pastS >= 0) {
            if (this.direction === 'b2t') {
              ratio = (self.moveMoreS - pastS) / self.moveContainerHeight;
              nowS = ratio * containerPos.height;
            } else {
              ratio = (self.moveMoreS - pastS) / self.moveContainerWidth;
              nowS = ratio * containerPos.width;
            }
          } else {
            nowS = self.moveMoreS - pastS;
          }
          // console.log('nowS: ' + nowS)
          if (this.direction === 'b2t') {
            this.el.style.transform = 'translateX(-' + this.top + 'px) translateY(' + nowS + 'px) translateZ(0px) rotate(90deg)';
          } else {
            this.el.style.left = nowS + 'px';
          }
        } else {
          if (this.direction === 'b2t') {
            this.el.style.transform = 'translateX(-' + this.top + 'px) translateY(' + (this.el.getBoundingClientRect().top - containerPos.top) + 'px) translateZ(0px) rotate(90deg)';
          } else {
            this.el.style.left = this.el.getBoundingClientRect().left - containerPos.left + 'px';
          }
        }
        if (this.direction === 'b2t') {
          // this.el.style.transform = `translateX(-${this.top}px) translateY(${nowS}px) translateZ(0px) rotate(90deg)`
          this.el.style.transition = 'transform 0s linear 0s';
        } else {
          this.el.style.transform = 'translateX(0px) translateY(0px) translateZ(0px)';
          this.el.style.transition = 'transform 0s linear 0s';
        }
      } else {
        if (!this.pastDuration || !this.startTime) {
          this.pastDuration = 1;
        } else {
          this.pastDuration = this.pastDuration + new Date().getTime() - this.startTime;
        }
      }
    }
  }, {
    key: 'startMove',
    value: function startMove(containerPos, force) {
      var self = this;
      if (!self.hasMove) {
        self.danmu.emit('bullet_start', self);
        self.hasMove = true;
      }
      if (self.status === 'forcedPause' && !force) {
        return;
      }
      if (!this.el) return;
      if (this.status === 'start') return;
      this.status = 'start';
      this.el.style.willChange = 'transform';
      function func() {
        if (self.el) {
          if (self.mode === 'scroll') {
            var containerPos_ = self.danmu.container.getBoundingClientRect();
            var bulletPos = self.el.getBoundingClientRect();
            if (self.direction === 'b2t') {
              if (bulletPos && bulletPos.bottom <= containerPos_.top + 100) {
                self.status = 'end';
                self.remove();
              } else {
                self.pauseMove(containerPos_);
                if (self.danmu.bulletBtn.main.status !== 'paused') {
                  self.startMove(containerPos_);
                }
              }
            } else {
              if (bulletPos && bulletPos.right <= containerPos_.left + 100) {
                self.status = 'end';
                self.remove();
              } else {
                self.pauseMove(containerPos_);
                if (self.danmu.bulletBtn.main.status !== 'paused') {
                  self.startMove(containerPos_);
                }
              }
            }
          } else {
            self.status = 'end';
            self.remove();
          }
        }
      }
      if (this.mode === 'scroll') {
        if (this.direction === 'b2t') {
          this.moveV = (containerPos.height + this.height) / this.duration * 1000;
          var leftDuration = (self.el.getBoundingClientRect().bottom - containerPos.top) / this.moveV;
          this.el.style.transition = 'transform ' + leftDuration + 's linear 0s';
          setTimeout(function () {
            if (self.el) {
              self.el.style.transform = 'translateX(-' + self.top + 'px) translateY(-' + self.height + 'px) translateZ(0px) rotate(90deg)';
              self.moveTime = new Date().getTime();
              self.moveMoreS = self.el.getBoundingClientRect().top - containerPos.top;
              self.moveContainerHeight = containerPos.height;
              self.removeTimer = setTimeout(func, leftDuration * 1000);
            }
          }, 20);
        } else {
          this.moveV = (containerPos.width + this.width) / this.duration * 1000;
          var _leftDuration = (self.el.getBoundingClientRect().right - containerPos.left) / this.moveV;
          this.el.style.transition = 'transform ' + _leftDuration + 's linear 0s';
          setTimeout(function () {
            if (self.el) {
              self.el.style.transform = 'translateX(-' + (self.el.getBoundingClientRect().right - containerPos.left) + 'px) translateY(0px) translateZ(0px)';
              self.moveTime = new Date().getTime();
              self.moveMoreS = self.el.getBoundingClientRect().left - containerPos.left;
              self.moveContainerWidth = containerPos.width;
              self.removeTimer = setTimeout(func, _leftDuration * 1000);
            }
          }, 20);
        }
      } else {
        // this.el.style.width = `${this.width}px`
        // this.el.style.height = `${this.height}px`
        this.el.style.left = '50%';
        this.el.style.margin = '0 0 0 -' + this.width / 2 + 'px';
        if (!this.pastDuration) {
          this.pastDuration = 1;
        }
        var _leftDuration2 = this.duration >= this.pastDuration ? this.duration - this.pastDuration : 0;
        this.removeTimer = setTimeout(func, _leftDuration2);
        this.startTime = new Date().getTime();
      }
    }
  }, {
    key: 'remove',
    value: function remove() {
      // console.log('remove')
      var self = this;
      if (this.removeTimer) {
        clearTimeout(this.removeTimer);
      }
      if (self.el && self.el.parentNode) {
        self.el.style.willChange = 'auto';
        this.danmu.off('changeDirection', function (direction) {
          self.direction = direction;
        });
        // self.el.removeEventListener('mouseover', self.mouseoverFun.bind(self))
        this.domObj.unuse(self.el);
        var parent = self.el.parentNode;
        parent.removeChild(self.el);
        self.el = null;
        self.danmu.emit('bullet_remove', {
          bullet: self
        });
      }
    }
  }, {
    key: 'setFontSize',
    value: function setFontSize(size) {
      if (this.el) {
        this.el.style['fontSize'] = size;
      }
    }
  }, {
    key: 'setLikeDom',
    value: function setLikeDom(el, style) {
      if (el) {
        Object.keys(style).forEach(function (key) {
          el.style[key] = style[key];
        });
        var likeClass = 'danmu-like';
        el.className = likeClass;
        if (this.el) {
          var children = this.el.querySelector('.' + likeClass);
          if (children) {
            this.el.removeChild(children);
          }
          this.el.innerHTML = '' + this.el.innerHTML + el.outerHTML;
        }
      }
      return el;
    }
  }]);

  return Bullet;
}();

exports.default = Bullet;
module.exports = exports['default'];

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(31);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(33)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(32)(false);
// imports


// module
exports.push([module.i, ".danmu{overflow:hidden;-webkit-user-select:none;-moz-user-select:none;user-select:none;-ms-user-select:none}.danmu>*{position:absolute;white-space:nowrap}.danmu-switch{width:32px;height:20px;border-radius:100px;background-color:#ccc;-webkit-box-sizing:border-box;box-sizing:border-box;outline:none;cursor:pointer;position:relative;text-align:center;margin:10px auto}.danmu-switch.danmu-switch-active{padding-left:12px;background-color:#f85959}.danmu-switch span.txt{width:20px;height:20px;line-height:20px;text-align:center;display:block;border-radius:100px;background-color:#ffffff;-webkit-box-shadow:-2px 0 0 0 rgba(0, 0, 0, .04);box-shadow:-2px 0 0 0 rgba(0, 0, 0, .04);font-family:PingFangSC;font-size:10px;font-weight:500;color:#f44336}\n", ""]);

// exports


/***/ }),
/* 32 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(34);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 34 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);
});
//# sourceMappingURL=index.js.map