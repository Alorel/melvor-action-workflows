const {builtinModules} = require('module');
const pkgJson = require('../../package.json');

exports._buildBaseExternals = Array.from(
  new Set(
    Object.keys(pkgJson.dependencies || {})
      .concat(Object.keys(pkgJson.peerDependencies || {}))
      .filter(p => !p.startsWith('@types/'))
      .concat(builtinModules)
  )
);

exports._buildUmdExternals = exports._buildBaseExternals
  .filter(e => e !== 'tslib');

Object.defineProperty(exports, '__esModule', {value: true});
