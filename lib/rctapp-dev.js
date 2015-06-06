'use strict';

var _child_process = require('child_process');

var _utils = require('./utils');

process.stdout.write('Starting Babel watcher and React Native Packager');

(0, _child_process.fork)((0, _utils.cwdPath)('node_modules/react-native/packager/packager.js'), null, { cwd: _utils.CWD, exePath: _utils.CWD, silent: true });
(0, _child_process.spawnSync)('./node_modules/.bin/babel', [(0, _utils.cwdPath)('src'), '--out-dir=' + (0, _utils.cwdPath)('lib/'), '--stage=0', '--ignore=/node_modules/', '--optional=runtime', '--watch'], { stdio: 'inherit' });