'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.cwdPath = cwdPath;
exports.babelTransform = babelTransform;
exports.reactPackager = reactPackager;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var IOS_DEVICE_LIST = ['iPhone_4s', 'iPhone_5', 'iPhone_5s', 'iPhone_6_Plus', 'iPhone_6', 'iPad_2', 'iPad_Retina', 'iPad_Air', 'Resizable_iPhone', 'Resizable_iPad'];

exports.IOS_DEVICE_LIST = IOS_DEVICE_LIST;
var ANDROID_DEVICE_LIST = [];

exports.ANDROID_DEVICE_LIST = ANDROID_DEVICE_LIST;
var CWD = process.cwd();

exports.CWD = CWD;

function cwdPath(p) {
  return _path2['default'].join(CWD, p);
}

function babelTransform(inDir, outDir, verbose, watch) {
  var output = verbose ? { stdio: 'inherit' } : { stdio: ['ignore', 'ignore', process.stderr] };
  var opts = [cwdPath('' + inDir), '--out-dir=' + outDir, '--stage=0', '--ignore=/node_modules/', '--optional=runtime'];

  if (watch) {
    opts.push('--watch');
  }

  (0, _child_process.spawn)('./node_modules/.bin/babel', opts, output);
}

function reactPackager(cmd, fn) {
  var cb = fn ? fn : function () {};
  var cp = (0, _child_process.fork)(cwdPath('node_modules/react-native/local-cli/cli.js'), ['' + cmd], { cwd: CWD, exePath: CWD });
  cp.on('close', function (code, sig) {
    return cb(code, sig);
  });
}