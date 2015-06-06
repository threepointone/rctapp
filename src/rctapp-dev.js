'use strict';

import { spawnSync, fork } from 'child_process';
import { cwdPath, CWD } from './utils';

process.stdout.write(`Starting Babel watcher and React Native Packager`);

fork(cwdPath('node_modules/react-native/packager/packager.js'), null, { cwd: CWD, exePath: CWD, silent: true });
spawnSync('./node_modules/.bin/babel', [
  cwdPath('src'),
  `--out-dir=${cwdPath('lib/')}`,
  '--stage=0',
  '--ignore=/node_modules/',
  '--optional=runtime',
  '--watch',
  ], { stdio: 'inherit' }
);

