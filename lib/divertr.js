/*
**  Divertr -- Text Diversion Filter
**  Copyright (c) 1997-2016 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Divertr = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},_tokenizr=_dereq_("tokenizr"),_tokenizr2=_interopRequireDefault(_tokenizr),divertr=function(e,o){o=Object.assign({},{regexDump:/<<([a-zA-Z][a-zA-Z0-9_]*)>>/,regexEnter:/\.\.(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)>>/,regexLeave:/<<((?:[a-zA-Z][a-zA-Z0-9_]*)?)\.\./},o);var n={location:"main",stack:["null"],buffer:{null:[],main:[]},overwrite:{}},t=new _tokenizr2.default;t.rule(o.regexDump,function(e,o){e.accept("DUMP",{name:o[1]})}),t.rule(o.regexEnter,function(e,o){e.accept("ENTER",{name:o[2],rewindNow:""!==o[1],rewindNext:""!==o[3]})}),t.rule(o.regexLeave,function(e,o){e.accept("LEAVE",{name:o[1]})});var r="";t.before(function(e,o,n){"plaintext"!==n.name&&""!==r&&(e.accept("PLAINTEXT",r),r="")}),t.rule(/./,function(e,o){r+=o[0],e.ignore()},"plaintext"),t.finish(function(e){""!==r&&e.accept("PLAINTEXT",r)}),t.input(e),t.tokens().forEach(function(e){if(e.isA("DUMP")){var o=e.value.name;if(void 0===n.buffer[o]&&(n.buffer[o]=[]),n.buffer[n.location]===n.buffer[o])throw new Error('self-reference of location "'+n.location+'"');n.buffer[n.location].push(n.buffer[o])}else if(e.isA("ENTER")){n.stack.push(n.location),n.location=e.value.name;var t=e.value.rewindNow,r=e.value.rewindNext;if(void 0===n.buffer[n.location]&&(n.buffer[n.location]=[]),n.overwrite[n.location]&&(t=!0,n.overwrite[n.location]=!1),r&&(n.overwrite[n.location]=!0),t)for(;n.buffer[n.location].length>0;)n.buffer[n.location].pop()}else if(e.isA("LEAVE")){if(0===n.stack.length)throw new Error('cannot leave "null" location (already in "null" location)');var a=e.value.name;if("null"===a)throw new Error('cannot leave "null" location (not allowed at all)');if(""!==a&&a!==n.location){var i=n.stack.indexOf(a);if(i===-1)throw new Error('no such entered location "'+a+'"');n.stack.splice(i),n.location=n.stack.pop()}else n.location=n.stack.pop()}else e.isA("PLAINTEXT")&&n.buffer[n.location].push(e.value)});var a=function e(o){n.stack.forEach(function(e){if(e===o){var t="unknown";throw Object.keys(n.buffer).forEach(function(e){n.buffer[e]===o&&(t=e)}),new Error('recursion through location "'+t+'"')}}),n.stack.push(o);var t="";return o.forEach(function(o){t+="object"===("undefined"==typeof o?"undefined":_typeof(o))?e(o):o}),n.stack.pop(),t};n.stack=[];var i=a(n.buffer.main);return i};module.exports=divertr;
},{"tokenizr":"tokenizr"}]},{},[1])(1)
});


//# sourceMappingURL=divertr.map