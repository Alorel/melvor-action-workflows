import * as fs from 'node:fs/promises';

export default function cleanPlugin() {
  let ran = false;

  function noop() {}

  const out = {
    name: 'clean',
    async generateBundle({dir}) {
      if (ran) {
        out.generateBundle = noop;
        return;
      }

      try {
        await fs.rm(dir, {force: true, recursive: true});
      } catch (e) {
        console.warn('Error cleaning output dir', e);
      }

      ran = true;
      out.generateBundle = noop;
    },
  };

  return out;
}
