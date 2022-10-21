import {basename} from "node:path";
import * as fs from 'node:fs/promises';

export function assetLoader({reg}) {
  const cache = new Map();

  function emit(ctx, def) {
    ctx.emitFile(def);

    return `const url = ctx.getResourceUrl(${JSON.stringify(def.fileName)});
export default url;`;
  }

  async function loadFromDisk(ctx, id) {
    const def = {
      fileName: basename(id),
      source: await fs.readFile(id),
      type: 'asset',
    };
    cache.set(id, def);

    return emit(ctx, def);
  }

  return {
    name: 'asset-loader',
    load(id) {
      if (!reg.test(id)) {
        return;
      }

      const cached = cache.get(id);

      return cached === undefined
        ? loadFromDisk(this, id)
        : emit(this, cached);
    },
    watchChange(id) {
      cache.delete(id);
    },
  }
}
