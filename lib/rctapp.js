#!/usr/bin/env node

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _packageJson = require('../package.json');

var _child_process = require('child_process');

var _utils = require('./utils');

var args = process.argv.slice(2);

var _require = require((0, _utils.cwdPath)('package.json'));

var bundleId = _require.bundleId;
var appName = _require.name;

var DEVICE_LIST = ['iPhone_4s', 'iPhone_5', 'iPhone_5s', 'iPhone_6_Plus', 'iPhone_6', 'iPad_2', 'iPad_Retina', 'iPad_Air', 'Resizable_iPhone', 'Resizable_iPad'];

_commander2['default'].version(_packageJson.version);

_commander2['default'].command('dev', 'start react dev server and babel transpiler').option('-v, --verbose', 'verbose output');

_commander2['default'].command('build-sim').description('launch app on simulator / device').option('-d, --device [device_type]', 'device to install and launch app on').option('-p, --platform [platform_type]', 'platform install and launch app on').option('-v, --verbose', 'verbose output').option('-l, --list', 'list available devices').action(function (options) {
  if (options.list) {
    process.stdout.write('\n  Available Devices\n\n  - ' + DEVICE_LIST.join('\n  - ') + '\n');
    process.exit(0);
  }

  var platform = options.platform || 'iOS Simulator';
  var device = (options.device || 'iPhone_5s').replace(/_/g, ' ');
  var output = options.parent.verbose ? { stdio: 'inherit' } : { stdio: ['ignore', 'ignore', process.stderr] };
  var template = 'Blank';

  //spawnSync('killall', ['iOS Simulator'], output);

  process.stdout.write('Building ' + appName + ' for ' + platform + ' ' + device + '...\n');
  (0, _child_process.spawn)('./node_modules/.bin/babel', [(0, _utils.cwdPath)('src'), '--out-dir=' + (0, _utils.cwdPath)('lib/'), '--stage=0', '--ignore=/node_modules/', '--optional=runtime', '--watch'], output);

  // Start React Native Packager
  process.stdout.write('Starting React Packager...\n');
  (0, _child_process.fork)((0, _utils.cwdPath)('node_modules/react-native/packager/packager.js'), null, { cwd: _utils.CWD, exePath: _utils.CWD, silent: true });

  // Build Xcode Project
  var buildCMD = ['-scheme', 'demo', '-configuration', 'Debug', '-destination', 'platform=' + platform + ',name=' + device, 'build', '-derivedDataPath', (0, _utils.cwdPath)('build')];
  if (_fs2['default'].statSync((0, _utils.cwdPath)('' + appName + '.xcworkspace')).isDirectory()) {
    buildCMD.push('-workspace', '' + appName + '.xcworkspace');
  }

  (0, _child_process.spawnSync)('xcodebuild', buildCMD, output);
  (0, _child_process.spawnSync)('xcrun', ['instruments', '-w', '' + device], { stdio: 'ignore' });

  process.stdout.write('Installing ' + appName + ' (' + bundleId + ') on ' + platform + ' ' + device + '...\n');
  (0, _child_process.spawnSync)('xcrun', ['simctl', 'install', 'booted', (0, _utils.cwdPath)('build/Build/Products/Debug-iphonesimulator/' + appName + '.app'), '-t', template], output);

  process.stdout.write('Launching ' + appName + ' (' + bundleId + ') on ' + platform + ' ' + device + '...\n');
  (0, _child_process.spawnSync)('xcrun', ['simctl', 'launch', 'booted', bundleId, '-t', template], output);
});

_commander2['default'].command('launch-sim').option('-d, --device <device_type>', 'device to launch app on').option('-v, --verbose', 'verbose output').description('launch app on simulator').action(function (cmd, options) {
  var device = (options.device || 'iPhone_5s').replace(/_/g, ' ');
  var output = options.verbose ? { stdio: 'inherit' } : { stdio: ['ignore', 'ignore', process.stderr] };

  (0, _child_process.spawnSync)('xcrun', ['instruments', '-w', '' + device], output);
  (0, _child_process.spawnSync)('xcrun', ['simctl', 'launch', 'booted', bundleId], output);
});

_commander2['default'].command('clean').description('clean build').option('-v, --verbose', 'verbose output').action(function (cmd, options) {
  var output = options.verbose ? { stdio: 'inherit' } : { stdio: ['ignore', 'ignore', process.stderr] };

  (0, _child_process.spawnSync)('xcodebuild', ['clean'], { stdio: 'inherit' });
  (0, _child_process.spawnSync)('xcrun', ['instruments', '-w', 'iPhone 5s'], output);
  (0, _child_process.spawnSync)('xcrun', ['simctl', 'uninstall', 'booted', bundleId], output);
});

_commander2['default'].command('build').description('build for release').option('-v, --verbose', 'verbose output').action(function (cmd) {
  var options = arguments[1] === undefined ? {} : arguments[1];

  // Start listening for bogus input
  // to keep process alive
  process.stdin.resume();
  var output = options.verbose ? { stdio: 'inherit' } : { stdio: ['ignore', null, process.stderr] };

  process.stdout.write('Bundeling ' + appName + ' (' + bundleId + ') ...\n');
  (0, _child_process.spawn)('./node_modules/.bin/babel', [(0, _utils.cwdPath)('src'), '--out-dir=' + (0, _utils.cwdPath)('lib/'), '--stage=0', '--ignore=/node_modules/', '--optional=runtime'], output);

  //TODO: create production builder
  var cp = (0, _child_process.fork)((0, _utils.cwdPath)('node_modules/react-native/local-cli/cli.js'), ['bundle'], { cwd: _utils.CWD, exePath: _utils.CWD });
  cp.on('close', function () {
    return process.exit(0);
  });
});

_commander2['default'].parse(process.argv);

if (!args.length) {
  _commander2['default'].outputHelp();
}