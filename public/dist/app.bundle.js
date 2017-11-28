/******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Logging utility function.
function trace(args) {
  var now = (window.performance.now() / 1000).toFixed(3);
  args.push(',-->', now);
  console.log.apply(console, args);
}

function random(start, end) {
  return Math.floor(Math.random() * (end - start) + start);
}

function traceNs(ns) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    args.unshift('[' + ns + ']');
    trace(args);
  };
}

module.exports = {
  random: random,
  traceNs: traceNs
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var App = __webpack_require__(2);

var _require = __webpack_require__(0),
    random = _require.random;

function genName() {
  return [0, 0, 0, 0, 0].map(function (v, i) {
    return i < 3 ? String.fromCharCode(random(97, 122)) : random(1, 10);
  }).join('');
}

var url = new URL(location.href);
var rid = url.searchParams.rid || 'room1';
var uid = url.searchParams.uid || 'uid1';
var name = url.searchParams.uname || genName();

new App({
  url: 'ws://' + url.host + '/?rid=' + encodeURIComponent(rid) + '&uid=' + encodeURIComponent(uid),
  user: {
    rid: rid,
    uid: uid,
    name: name
  }
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Signaler = __webpack_require__(3);
var trace = __webpack_require__(0).traceNs('app');

var App = function () {
  function App(options) {
    _classCallCheck(this, App);

    this.signaler = new Signaler(options.url, this.handleMessage.bind(this));
    this.localStream = null;
    this.signaler.join(options.user);
  }

  _createClass(App, [{
    key: 'handleMessage',
    value: function handleMessage(message) {
      switch (message.type) {
        case 'joinok':
          break;
        case 'answer':
          break;
        case 'offer':
          break;
      }
    }
  }, {
    key: 'initMedia',
    value: function initMedia() {
      navigator.getUserMedia();
    }
  }]);

  return App;
}();

module.exports = App;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var trace = __webpack_require__(0).traceNs('signaler');

var Signaler = function () {
  function Signaler(url, handle) {
    _classCallCheck(this, Signaler);

    this.ws = new WebSocket(url);
    this.ws.addEventListener('open', this.onopen.bind(this));
    this.ws.addEventListener('message', this.onmessage.bind(this));
    this.ws.addEventListener('error', this.onerror.bind(this));
    this.ws.addEventListener('close', this.onclose.bind(this));
    this.handle = handle;
    this.peers = new Map();
    this.offlineQueue = [];
  }

  _createClass(Signaler, [{
    key: 'join',
    value: function join(user) {
      this.send({ type: 'join', payload: user });
    }
  }, {
    key: 'send',
    value: function send(message) {
      trace('send message,', message);
      if (typeof message != 'string') {
        message = JSON.stringify(message);
      }
      if (this.ws.readyState != this.ws.OPEN) {
        this.pushQueue(message);
      } else {
        this.ws.send(message);
      }
    }
  }, {
    key: 'pushQueue',
    value: function pushQueue(message) {
      trace('push to queue', message);
      if (this.offlineQueue.length > 10) {
        this.offlineQueue.splice(0, 5);
      }
      this.offlineQueue.push(message);
    }
  }, {
    key: 'onopen',
    value: function onopen() {
      var _this = this;

      trace('open');
      this.offlineQueue.forEach(function (message) {
        _this.ws.send(message);
      });
    }
  }, {
    key: 'onmessage',
    value: function onmessage(m) {
      trace('recv message:', m);
      this.handle(JSON.parse(m));
    }
  }, {
    key: 'onclose',
    value: function onclose(r) {
      //todo reconnect
      trace('close:', r);
    }
  }, {
    key: 'onerror',
    value: function onerror(err) {
      //todo reconnect
      trace('error:', err);
    }
  }]);

  return Signaler;
}();

module.exports = Signaler;

/***/ })
/******/ ]);