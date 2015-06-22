'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _utils = require('./utils');

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

_commander2['default'].option('-b, --babel', 'precompile js with babel').option('-v, --verbose', 'verbose output').action(function (cmd, options) {
  process.stdin.resume();
  process.stdout.write('Starting Babel watcher and React Native Packager');
  if (options.babel) {
    (0, _utils.babelTransform)('src', (0, _utils.cwdPath)('lib/'), options.verbose, true);
  }
  (0, _utils.reactPackager)('start', function (code, sig) {
    process.stdout('Exited with code: ' + code + '\n' + sig + '\n');
  });
});

_commander2['default'].parse(process.argv);