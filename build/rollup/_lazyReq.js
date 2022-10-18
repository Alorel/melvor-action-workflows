const {join} = require('path');

exports._buildLazyReq = {
  bannerFn() {
    return require('fs').promises.readFile(join(__dirname, '..', '..', 'LICENSE'), 'utf8')
      .then(f => `/*\n${f.trim()}\n*/\n`);
  },
  nodeResolve(cfg) {
    return require('@rollup/plugin-node-resolve').default({
      extensions: cfg.extensions,
      mainFields: cfg.mainFields
    });
  },
  get threadedTerser() {
    return require('@alorel/rollup-plugin-threaded-terser').threadedTerserPlugin;
  }
};
Object.defineProperty(exports, '__esModule', {value: true});
