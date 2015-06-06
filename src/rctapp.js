#!/usr/bin/env node
'use strict';

import program from 'commander';
import fs from 'fs';
import { version } from '../package.json';
import { spawnSync, spawn, fork } from 'child_process';
import { cwdPath, CWD } from './utils';

const  args = process.argv.slice(2);
const { bundleId, name: appName } = require(cwdPath('package.json'));
const DEVICE_LIST = [
  'iPhone_4s',
  'iPhone_5',
  'iPhone_5s',
  'iPhone_6_Plus',
  'iPhone_6',
  'iPad_2',
  'iPad_Retina',
  'iPad_Air',
  'Resizable_iPhone',
  'Resizable_iPad',
];

program
  .version(version);

program
  .command('dev','start react dev server and babel transpiler')
  .option('-v, --verbose', 'verbose output');

program
  .command('build-sim')
  .description('launch app on simulator / device')
  .option('-d, --device [device_type]', 'device to install and launch app on')
  .option('-p, --platform [platform_type]', 'platform install and launch app on')
  .option('-v, --verbose', 'verbose output')
  .option('-l, --list', 'list available devices')
  .action((options) => {
    if (options.list) {
      process.stdout.write(`\n  Available Devices\n\n  - ${DEVICE_LIST.join('\n  - ')}\n`);
      process.exit(0);
    }

     let platform = options.platform || 'iOS Simulator';
     let device = (options.device || 'iPhone_5s').replace(/_/g, ' ');
     let output = options.parent.verbose ? { stdio: 'inherit' } : {stdio: ['ignore', 'ignore', process.stderr] };
     let template = 'Blank';

     //spawnSync('killall', ['iOS Simulator'], output);

     process.stdout.write(`Building ${appName} for ${platform} ${device}...\n`);
     spawn('./node_modules/.bin/babel', [
      cwdPath('src'),
      `--out-dir=${cwdPath('lib/')}`,
      '--stage=0',
      '--ignore=/node_modules/',
      '--optional=runtime',
      '--watch',
    ], output);

     // Start React Native Packager
     process.stdout.write(`Starting React Packager...\n`);
     fork(cwdPath('node_modules/react-native/packager/packager.js'), null, { cwd: CWD, exePath: CWD, silent: true });

     // Build Xcode Project
     let buildCMD = ['-scheme', 'demo', '-configuration', 'Debug', '-destination', `platform=${platform},name=${device}`, 'build', '-derivedDataPath', cwdPath('build')];
     if (fs.statSync(cwdPath(`${appName}.xcworkspace`)).isDirectory()) {
       buildCMD.push('-workspace', `${appName}.xcworkspace`);
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
  .option('-d, --device <device_type>', 'device to launch app on')
  .option('-v, --verbose', 'verbose output')
  .description('launch app on simulator')
  .action((cmd, options) => {
    let device = (options.device || 'iPhone_5s').replace(/_/g, ' ');
    let output = options.verbose ? { stdio: 'inherit' } : {stdio: ['ignore', 'ignore', process.stderr] };

    spawnSync('xcrun', ['instruments', '-w', `${device}`], output);
    spawnSync('xcrun', ['simctl', 'launch', 'booted', bundleId], output);
  });

program
  .command('clean')
  .description('clean build')
  .option('-v, --verbose', 'verbose output')
  .action((cmd, options) => {
    let output = options.verbose ? { stdio: 'inherit' } : {stdio: ['ignore', 'ignore', process.stderr] };

   spawnSync('xcodebuild', ['clean'], { stdio: 'inherit' });
   spawnSync('xcrun', ['instruments', '-w', `iPhone 5s`], output);
   spawnSync('xcrun', ['simctl', 'uninstall', 'booted', bundleId], output);
  });

program
  .command('build')
  .description('build for release')
  .option('-v, --verbose', 'verbose output')
  .action((cmd, options = {}) => {
    // Start listening for bogus input
    // to keep process alive
    process.stdin.resume();
    let output = options.verbose ? { stdio: 'inherit' } : {stdio: ['ignore', null, process.stderr] };

    process.stdout.write(`Bundeling ${appName} (${bundleId}) ...\n`);
    spawn('./node_modules/.bin/babel', [
      cwdPath('src'),
      `--out-dir=${cwdPath('lib/')}`,
      '--stage=0',
      '--ignore=/node_modules/',
      '--optional=runtime',
    ], output);

    //TODO: create production builder
    let cp = fork(cwdPath('node_modules/react-native/local-cli/cli.js'), ['bundle'], { cwd: CWD, exePath: CWD });
    cp.on('close', () => process.exit(0));
  });

program.parse(process.argv);

if (!args.length) {
  program.outputHelp();
}

