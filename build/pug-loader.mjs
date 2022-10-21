import pug from 'pug';
import * as fs from 'node:fs/promises';

export default function pugLoader({prod = false, watch = false} = {}) {
  const defaultOpts = {
    doctype: 'html',
    pretty: !prod,
    self: true,
  };

  let cache = new Map();
  const dependents = new Map();

  const extractHtml = watch
    ? ((code, opts, ctx) => {
      const cmp = pug.compile(code, opts);
      for (const dep of cmp.dependencies) {
        const existingDeps = dependents.get(dep);
        if (existingDeps) {
          existingDeps.push(opts.filename);
        } else {
          dependents.set(dep, [opts.filename]);
        }
        ctx.addWatchFile(dep);
      }

      return cmp();
    })
    : (code, opts) => pug.render(code, opts);

  async function doLoad(ctx, id) {
    const code = await fs.readFile(id, 'utf8');

    const opts = {
      ...defaultOpts,
      filename: id,
    };

    const html = extractHtml(code, opts, ctx);
    cache.set(id, html);

    return html;
  }

  const out = {
    name: 'pug-loader',
    load(id) {
      if (!id.endsWith('.pug')) {
        return;
      } else if (cache.has(id)) {
        return cache.get(id);
      }

      return doLoad(this, id);
    },
  };

  if (watch) {
    const rmFromCache = id => {
      cache.delete(id);
    };
    out.watchChange = id => {
      cache.delete(id);
      dependents.get(id)?.forEach(rmFromCache);
    };
  } else {
    cache = {
      has: () => false,
      set() {
      },
    };
  }

  return out;
}
