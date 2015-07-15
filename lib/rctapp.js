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

var DEVICE_LIST = _utils.IOS_DEVICE_LIST;

var args = process.argv.slice(2);

var _require = require((0, _utils.cwdPath)('package.json'));

var bundleId = _require.bundleId;
var appName = _require.name;

_commander2['default'].allowUnknownOption(true);

_commander2['default'].version(_packageJson.version);

_commander2['default'].command('build-sim').description('launch app on simulator / device').option('-d, --device [device_type]', 'device to install and launch app on').option('-p, --platform [platform_type]', 'platform install and launch app on').option('-s, --sdk [sdk_version]', 'sdk version of simulator to launch. default(9.0)').option('-v, --verbose', 'verbose output').option('-l, --list', 'list available devices').option('-b, --babel', 'use babel to pre-transform code').action(function (options) {
  if (options.list) {
    process.stdout.write('\n  Available Devices\n\n  - ' + DEVICE_LIST.join('\n  - ') + '\n');
    process.exit(0);
  }

  var platform = options.platform || 'iOS Simulator';
  var sdk = options.sdk || '9.0';
  var device = (options.device || 'iPhone_5s').replace(/_/g, ' ') + ' (' + sdk + ' Simulator)';
  var output = options.parent.verbose ? { stdio: 'inherit' } : { stdio: ['ignore', 'ignore', 'ignore'] };
  var template = 'Blank';

  if (options.babel) {
    process.stdout.write('Running Babel Transformers on ' + appName + ' (' + bundleId + ') ...\n');
    (0, _utils.babelTransform)('src', '' + (0, _utils.cwdPath)('lib/'), options.parent.verbose, true);
  }

  // Start React Native Packager
  process.stdout.write('Building ' + appName + ' for ' + platform + ' ' + device + '...\n');
  process.stdout.write('Starting React Packager...\n');
  (0, _utils.reactPackager)('start');

  // Build Xcode Project
  var buildCMD = ['-scheme', '' + appName, '-configuration', 'Debug', '-destination', 'platform=' + platform + ',name=' + device, 'build', '-derivedDataPath', (0, _utils.cwdPath)('build')];
  if (_fs2['default'].statSync((0, _utils.cwdPath)(appName + '.xcworkspace')).isDirectory()) {
    buildCMD.push('-workspace', appName + '.xcworkspace');
  } else {
    buildCMD.push('-project', appName + '.xcodeproj');
  }

  (0, _child_process.spawnSync)('xcodebuild', buildCMD, output);
  (0, _child_process.spawnSync)('xcrun', ['instruments', '-w', '' + device], { stdio: 'ignore' });

  process.stdout.write('Installing ' + appName + ' (' + bundleId + ') on ' + platform + ' ' + device + '...\n');
  (0, _child_process.spawnSync)('xcrun', ['simctl', 'install', 'booted', (0, _utils.cwdPath)('build/Build/Products/Debug-iphonesimulator/' + appName + '.app'), '-t', template], output);

  process.stdout.write('Launching ' + appName + ' (' + bundleId + ') on ' + platform + ' ' + device + '...\n');
  (0, _child_process.spawnSync)('xcrun', ['simctl', 'launch', 'booted', bundleId, '-t', template], output);
});

_commander2['default'].command('launch-sim').description('launch app on simulator').option('-d, --device <device_type>', 'device to launch app on').option('-s, --sdk [sdk_version]', 'sdk version of simulator to launch. default(9.0)').option('-v, --verbose', 'verbose output').action(function (options) {
  var sdk = options.sdk || '9.0';
  var device = (options.device || 'iPhone_5s').replace(/_/g, ' ') + ' (' + sdk + ' Simulator)';
  var output = options.verbose ? { stdio: 'inherit' } : { stdio: ['ignore', 'ignore', 'ignore'] };

  process.stdout.write('Launching ' + appName + ' (' + bundleId + ') on ' + device + '...\n');
  (0, _child_process.spawnSync)('xcrun', ['instruments', '-w', '' + device], output);
  (0, _child_process.spawnSync)('xcrun', ['simctl', 'launch', 'booted', bundleId], output);
});

_commander2['default'].command('clean [type]').description('clean build artifact type (cache, xcodeproj, etc...) defaults to xcodeproj').option('-v, --verbose', 'verbose output').action(function (type, options) {
  var output = options.verbose ? { stdio: 'inherit' } : { stdio: ['ignore', 'ignore', process.stderr] };

  if (type === 'cache') {
    (0, _utils.resetCache)();
    return;
  }

  (0, _child_process.spawnSync)('xcodebuild', ['clean'], { stdio: 'inherit' });
  (0, _child_process.spawnSync)('xcrun', ['instruments', '-w', 'iPhone 5s'], output);
  (0, _child_process.spawnSync)('xcrun', ['simctl', 'uninstall', 'booted', bundleId], output);
});

_commander2['default'].command('build').description('build for release').option('-b, --babel', 'use babel to pre-transform code').option('-v, --verbose', 'verbose output').action(function (options) {
  process.stdin.resume();

  if (options.babel) {
    process.stdout.write('Running Babel Transformers on ' + appName + ' (' + bundleId + ') ...\n');
    (0, _utils.babelTransform)('src', '' + (0, _utils.cwdPath)('lib/'), options.verbose, false);
  }

  process.stdout.write('Bundeling ' + appName + ' (' + bundleId + ') ...\n');
  (0, _utils.reactPackager)('bundle', function () {
    return process.exit(0);
  });
});

_commander2['default'].action(function (cmd, options) {
  _commander2['default'].executeSubCommand(process.argv, process.argv.slice(2), null);
});

_commander2['default'].parse(process.argv);

if (!args.length) {
  _commander2['default'].outputHelp();
}