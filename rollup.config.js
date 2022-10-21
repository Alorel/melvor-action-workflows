import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import {copyPlugin} from "@alorel/rollup-plugin-copy";
import modWrapPlugin from "./build/mod-wrap.mjs";
import zipperPlugin from "./build/zipper.mjs";
import replacePlugin from "@rollup/plugin-replace";
import iifeWrapPlugin from "./build/iife-wrap.mjs";
import {threadedTerserPlugin} from "@alorel/rollup-plugin-threaded-terser";
import pugLoader from "./build/pug-loader.mjs";
import templateLoadPlugin from "./build/template-load.mjs";
import {assetLoader} from "./build/asset-loader.mjs";
import jsonPlugin from "@rollup/plugin-json";
import cleanPlugin from "./build/clean-plugin.mjs";
import scssLoader from "./build/scss-loader.mjs";

const srcInclude = /src[\\/].+\.m?ts$/;
const srcExclude = /node_modules[\\/]/;

function getOpt(opts, opt) {
  if (opt in opts) {
    const out = opts[opt];
    delete opts[opt];

    return out;
  }
}

export default function (opts) {
  const watch = opts.watch;
  const prod = Boolean(getOpt(opts, 'prod'));

  return {
    input: 'src/index.mts',
    output: {
      dir: 'dist',
      entryFileNames: 'setup.mjs',
      format: 'es',
      preferConst: true,
      preserveModules: false,
      sourcemap: prod ? false : 'inline',
    },
    plugins: [
      cleanPlugin(),
      nodeResolve({
        exportConditions: [
          'es2015',
          'module',
          'import',
          'default',
        ],
        mainFields: [
          'es2015',
          'esm2015',
          'module',
          'browser',
          'main',
        ],
      }),
      jsonPlugin({
        compact: true,
        include: '**/*.json',
        namedExports: true,
        preferConst: true,
      }),
      scssLoader({prod}),
      typescript({exclude: srcExclude, include: srcInclude}),
      replacePlugin({
        exclude: srcExclude,
        include: srcInclude,
        preventAssignment: true,
        values: {
          'process.env.PRODUCTION': String(prod),
        },
      }),
      pugLoader({
        prod,
        watch,
      }),
      templateLoadPlugin({prod}),
      assetLoader({
        reg: /\.png$/,
      }),
      prod && iifeWrapPlugin({
        vars: [
          'game',
          'Object',
          'Array',
          'Error',
          'Map',
          'WeakMap',
          'Symbol',
          'TypeError',
          'Promise',
          'console',
          'RegExp',
          'Number',
          'String',
          'Boolean',
          'undefined',
          'NamespaceRegistry',
          'NamespacedObject',
        ],
      }),
      modWrapPlugin({prod}),
      prod && threadedTerserPlugin({
        terserOpts: {
          output: {
            comments: false,
          },
        },
      }),
      copyPlugin({
        copy: [{
          from: [
            'manifest.json',
            // 'public_api.d.ts',
          ]
        }],
        defaultOpts: {
          glob: {cwd: 'src'},
          emitNameKind: 'fileName',
        },
        watch,
      }),
      zipperPlugin({
        compressionLevel: prod ? 9 : 1,
      }),
    ],
    watch: {
      exclude: 'node_modules/**/*',
    },
  };
}
