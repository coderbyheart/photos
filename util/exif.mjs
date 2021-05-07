import { run } from './run.mjs';

export const exif = async (f) =>
  (await run('exiv2', '-Pkyct', f))
    .split('\n')
    .filter((s) => s.length > 0)
    .reduce(
      (info, s) => ({
        ...info,
        [s.substr(0, 45).trim()]: s.substr(60).trim(),
      }),
      {},
    );
