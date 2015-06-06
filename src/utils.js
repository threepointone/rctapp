'use strict';

import path from 'path';

export const CWD = process.cwd();

export function cwdPath(p) {
  return path.join(CWD, p);
}
