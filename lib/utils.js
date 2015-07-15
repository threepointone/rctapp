'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.cwdPath = cwdPath;
exports.babelTransform = babelTransform;
exports.reactPackager = reactPackager;
exports.resetCache = resetCache;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

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
  var opts = [cwdPath('' + inDir), '--out-dir=' + outDir, '--stage=0', '--ignore=/node_modules/', '--loose=all', '--optional=runtime'];

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

function resetCache() {
  var tempDir = _os2['default'].tmpdir();

  var cacheFiles = _fs2['default'].readdirSync(tempDir).filter(function (fileName) {
    return fileName.indexOf('react-packager-cache') === 0;
  });

  cacheFiles.forEach(function (cacheFile) {
    var cacheFilePath = _path2['default'].join(tempDir, cacheFile);
    _fs2['default'].unlinkSync(cacheFilePath);
    process.stdout.write('Deleted cache file ' + cacheFilePath + '\n');
  });
}