'use strict';

import path from 'path';
import { spawn, fork } from 'child_process';

export const IOS_DEVICE_LIST = [
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

export const ANDROID_DEVICE_LIST = [];

export const CWD = process.cwd();

export function cwdPath(p) {
  return path.join(CWD, p);
}

export function babelTransform(inDir, outDir, verbose, watch) {
  let output = verbose ? { stdio: 'inherit' } : {stdio: ['ignore', 'ignore', process.stderr] };
  let opts = [
    cwdPath(`${inDir}`),
    `--out-dir=${outDir}`,
    '--stage=0',
    '--ignore=/node_modules/',
    '--optional=runtime',
  ];

  if (watch) {
    opts.push('--watch');
  }

  spawn('./node_modules/.bin/babel', opts, output);
}

export function reactPackager(cmd, fn) {
  let cb = fn ? fn : () => {};
  let cp = fork(cwdPath('node_modules/react-native/local-cli/cli.js'), [`${cmd}`], { cwd: CWD, exePath: CWD });
  cp.on('close', (code, sig) => cb(code, sig));
}

