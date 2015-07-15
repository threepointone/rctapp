#!/usr/bin/env node
'use strict';

import program from 'commander';
import fs from 'fs';
import { version } from '../package.json';
import { spawnSync } from 'child_process';
import {
  reactPackager,
  babelTransform,
  cwdPath,
  IOS_DEVICE_LIST,
} from './utils';

const DEVICE_LIST = IOS_DEVICE_LIST;

const  args = process.argv.slice(2);
const { bundleId, name: appName } = require(cwdPath('package.json'));

program.allowUnknownOption(true);

program
.version(version);

program
.command('build-sim')
.description('launch app on simulator / device')
.option('-d, --device [device_type]', 'device to install and launch app on')
.option('-p, --platform [platform_type]', 'platform install and launch app on')
.option('-s, --sdk [sdk_version]', 'sdk version of simulator to launch. default(9.0)')
.option('-v, --verbose', 'verbose output')
.option('-l, --list', 'list available devices')
.option('-b, --babel', 'use babel to pre-transform code')
.action((options) => {
  if (options.list) {
    process.stdout.write(`\n  Available Devices\n\n  - ${DEVICE_LIST.join('\n  - ')}\n`);
    process.exit(0);
  }

  let platform = options.platform || 'iOS Simulator';
  let sdk = options.sdk || '9.0';
  let device = `${(options.device || 'iPhone_5s').replace(/_/g, ' ')} (${sdk} Simulator)`;
  let output = options.parent.verbose ? { stdio: 'inherit' } : {stdio: ['ignore', 'ignore', 'ignore'] };
  let template = 'Blank';

  if (options.babel) {
    process.stdout.write(`Running Babel Transformers on ${appName} (${bundleId}) ...\n`);
    babelTransform('src', `${cwdPath('lib/')}`, options.parent.verbose, true);
  }

  // Start React Native Packager
  process.stdout.write(`Building ${appName} for ${platform} ${device}...\n`);
  process.stdout.write(`Starting React Packager...\n`);
  reactPackager('start');

  // Build Xcode Project
  let buildCMD = ['-scheme', `${appName}`, '-configuration', 'Debug', '-destination', `platform=${platform},name=${device}`, 'build', '-derivedDataPath', cwdPath('build')];
  if (fs.statSync(cwdPath(`${appName}.xcworkspace`)).isDirectory()) {
    buildCMD.push('-workspace', `${appName}.xcworkspace`);
  } else {
    buildCMD.push('-project', `${appName}.xcodeproj`);
  }

  spawnSync('xcodebuild', buildCMD, output);
  spawnSync('xcrun', ['instruments', '-w', `${device}`], {stdio: 'ignore'});

  process.stdout.write(`Installing ${appName} (${bundleId}) on ${platform} ${device}...\n`);
  spawnSync('xcrun', ['simctl', 'install', 'booted', cwdPath(`build/Build/Products/Debug-iphonesimulator/${appName}.app`), '-t', template], output);

  process.stdout.write(`Launching ${appName} (${bundleId}) on ${platform} ${device}...\n`);
  spawnSync('xcrun', ['simctl', 'launch', 'booted', bundleId, '-t', template], output);
});

program
.command('launch-sim')
.description('launch app on simulator')
.option('-d, --device <device_type>', 'device to launch app on')
.option('-s, --sdk [sdk_version]', 'sdk version of simulator to launch. default(9.0)')
.option('-v, --verbose', 'verbose output')
.action((options) => {
  let sdk = options.sdk || '9.0';
  let device = `${(options.device || 'iPhone_5s').replace(/_/g, ' ')} (${sdk} Simulator)`;
  let output = options.verbose ? { stdio: 'inherit' } : {stdio: ['ignore', 'ignore', 'ignore'] };

  process.stdout.write(`Launching ${appName} (${bundleId}) on ${device}...\n`);
  spawnSync('xcrun', ['instruments', '-w', `${device}`], output);
  spawnSync('xcrun', ['simctl', 'launch', 'booted', bundleId], output);
});

program
.command('clean')
.description('clean build')
.option('-v, --verbose', 'verbose output')
.action((options) => {
  let output = options.verbose ? { stdio: 'inherit' } : {stdio: ['ignore', 'ignore', process.stderr] };

  spawnSync('xcodebuild', ['clean'], { stdio: 'inherit' });
  spawnSync('xcrun', ['instruments', '-w', `iPhone 5s`], output);
  spawnSync('xcrun', ['simctl', 'uninstall', 'booted', bundleId], output);
});

program
.command('build')
.description('build for release')
.option('-b, --babel', 'use babel to pre-transform code')
.option('-v, --verbose', 'verbose output')
.action((options) => {
  process.stdin.resume();

  if (options.babel) {
    process.stdout.write(`Running Babel Transformers on ${appName} (${bundleId}) ...\n`);
    babelTransform('src', `${cwdPath('lib/')}`, options.verbose, false);
  }

  process.stdout.write(`Bundeling ${appName} (${bundleId}) ...\n`);
  reactPackager('bundle', () => process.exit(0));
});

program
.action((cmd, options) => {
  program.executeSubCommand(process.argv,process.argv.slice(2), null);
});

program
.parse(process.argv);

if (!args.length) {
  program.outputHelp();
}

