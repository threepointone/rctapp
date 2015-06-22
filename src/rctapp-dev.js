'use strict';

import { reactPackager, babelTransform, cwdPath } from './utils';
import program from 'commander';

program
.option('-b, --babel', 'precompile js with babel')
.option('-v, --verbose', 'verbose output')
.action((cmd, options) => {
  process.stdin.resume();
  process.stdout.write(`Starting Babel watcher and React Native Packager`);
  if (options.babel) {
      babelTransform('src', cwdPath('lib/'), options.verbose, true);
  }
  reactPackager('start', (code, sig) => {
    process.stdout(`Exited with code: ${code}\n${sig}\n`);
  });

});

program.parse(process.argv);
