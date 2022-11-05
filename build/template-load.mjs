import {basename, extname} from 'node:path';
import {namespace} from '../src/manifest.json';
import pug from 'pug';

export default function templateLoadPlugin({prod = true} = {}) {
  const reg = /\.(pug|html)$/;
  const templates = new Map();

  let cacheClean = false;
  let cachedHtml;

  function emit(ctx) {
    ctx.emitFile({
      fileName: 'templates.html',
      source: cachedHtml,
      type: 'asset',
    });
  }

  const compiledTpl = pug.compile(`each tpl in self.templates\n  template(id=tpl.id) !{tpl.html}`, {
    doctype: 'html',
    pretty: !prod,
    self: true,
  });

  const dupeSet = new Set();

  return {
    name: 'template-loader',
    buildStart() {
      dupeSet.clear();
    },
    generateBundle() {
      if (!cacheClean) {
        cachedHtml = compiledTpl({templates: [...templates.values()]});
        cacheClean = true;
      }

      emit(this);
    },
    transform(html, path) {
      if (!reg.test(path)) {
        return;
      }

      const id = `${namespace}_core_${basename(path, extname(path))}`;
      if (dupeSet.has(id)) {
        throw new Error(`Duplicate template ID: ${id}`);
      }

      dupeSet.add(id);
      templates.set(path, {id, html});
      cacheClean = false;

      return {
        code: `export default "${id}"`,
        map: null,
      };
    },
    watchChange(id, {event}) {
      if (!reg.test(id)) {
        return;
      }

      cacheClean = false;
      if (event === 'delete') {
        templates.delete(id);
      }
    },
  };
}
