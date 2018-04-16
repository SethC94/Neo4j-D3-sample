"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ENCRYPTION_OFF = exports.ENCRYPTION_ON = exports.promiseOrTimeout = exports.assertCypherStatement = exports.assertString = exports.isString = exports.isEmptyObjectOrNull = undefined;

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _error = require("../error");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ENCRYPTION_ON = "ENCRYPTION_ON"; /**
                                      * Copyright (c) 2002-2018 "Neo Technology,"
                                      * Network Engine for Objects in Lund AB [http://neotechnology.com]
                                      *
                                      * This file is part of Neo4j.
                                      *
                                      * Licensed under the Apache License, Version 2.0 (the "License");
                                      * you may not use this file except in compliance with the License.
                                      * You may obtain a copy of the License at
                                      *
                                      *     http://www.apache.org/licenses/LICENSE-2.0
                                      *
                                      * Unless required by applicable law or agreed to in writing, software
                                      * distributed under the License is distributed on an "AS IS" BASIS,
                                      * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                      * See the License for the specific language governing permissions and
                                      * limitations under the License.
                                      */

var ENCRYPTION_OFF = "ENCRYPTION_OFF";

function isEmptyObjectOrNull(obj) {
  if (obj === null) {
    return true;
  }

  if (!isObject(obj)) {
    return false;
  }

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return true;
}

function isObject(obj) {
  var type = typeof obj === "undefined" ? "undefined" : (0, _typeof3.default)(obj);
  return type === 'function' || type === 'object' && Boolean(obj);
}

function assertString(obj, objName) {
  if (!isString(obj)) {
    throw new TypeError(objName + ' expected to be string but was: ' + (0, _stringify2.default)(obj));
  }
  return obj;
}

function assertCypherStatement(obj) {
  assertString(obj, 'Cypher statement');
  if (obj.trim().length == 0) {
    throw new TypeError('Cypher statement is expected to be a non-empty string.');
  }
  return obj;
}

function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]';
}

function promiseOrTimeout(timeout, otherPromise, onTimeout) {
  var resultPromise = null;

  var timeoutPromise = new _promise2.default(function (resolve, reject) {
    var id = setTimeout(function () {
      if (onTimeout && typeof onTimeout === 'function') {
        onTimeout();
      }

      reject((0, _error.newError)("Operation timed out in " + timeout + " ms."));
    }, timeout);

    // this "executor" function is executed immediately, even before the Promise constructor returns
    // thus it's safe to initialize resultPromise variable here, where timeout id variable is accessible
    resultPromise = otherPromise.then(function (result) {
      clearTimeout(id);
      return result;
    }).catch(function (error) {
      clearTimeout(id);
      throw error;
    });
  });

  if (resultPromise == null) {
    throw new Error('Result promise not initialized');
  }

  return _promise2.default.race([resultPromise, timeoutPromise]);
}

exports.isEmptyObjectOrNull = isEmptyObjectOrNull;
exports.isString = isString;
exports.assertString = assertString;
exports.assertCypherStatement = assertCypherStatement;
exports.promiseOrTimeout = promiseOrTimeout;
exports.ENCRYPTION_ON = ENCRYPTION_ON;
exports.ENCRYPTION_OFF = ENCRYPTION_OFF;