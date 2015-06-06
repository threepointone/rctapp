'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.cwdPath = cwdPath;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var CWD = process.cwd();

exports.CWD = CWD;

function cwdPath(p) {
  return _path2['default'].join(CWD, p);
}