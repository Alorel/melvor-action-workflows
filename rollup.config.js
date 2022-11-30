import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import {copyPlugin} from "@alorel/rollup-plugin-copy";
import modWrapPlugin from "./build/mod-wrap.mjs";
import replacePlugin from "@rollup/plugin-replace";
import iifeWrapPlugin from "./build/iife-wrap.mjs";
import {threadedTerserPlugin} from "@alorel/rollup-plugin-threaded-terser";
import {assetLoader} from "./build/asset-loader.mjs";
import jsonPlugin from "@rollup/plugin-json";
import cleanPlugin from "./build/clean-plugin.mjs";
import scssLoader from "./build/scss-loader.mjs";

const srcInclude = /src[\\/].+\.m?tsx?$/;
const srcExclude = /node_modules[\\/]/;

export default function (opts) {
  const watch = opts.watch;
  const prod = Boolean(getOpt(opts, 'prod'));

  return {
    input: 'src/setup.tsx',
    output: {
      dir: 'dist',
      format: 'es',
      generatedCode: {
        arrowFunctions: true,
        constBindings: true,
        objectShorthand: true,
      },
      preserveModules: false,
      sourcemap: false,
      entryFileNames: 'setup.mjs',
    },
    plugins: [
      cleanPlugin(),
      mkNodeResolve(),
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
          'process.env.MELVOR_MOD_VERSION': JSON.stringify(process.env.MELVOR_MOD_VERSION || 'dev'),
          'process.env.PRODUCTION': String(prod),
        },
      }),
      assetLoader({
        reg: /\.png$/,
      }),
      prod && iifeWrapPlugin({
        async: true,
        vars: [
          'AltMagicConsumptionID',
          'Array',
          'Bank',
          'Boolean',
          'cdnMedia',
          'console',
          'Error',
          'game',
          'isNaN',
          'JSON',
          'Map',
          'NamespacedObject',
          'NamespaceRegistry',
          'Number',
          'Object',
          'Promise',
          'RegExp',
          'SkillWithMastery',
          'String',
          'Symbol',
          'Swal',
          'TypeError',
          'undefined',
          'WeakMap',
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
        copy: [
          {
            from: [
              'manifest.json',
              // 'public_api.d.ts',
            ]
          },
        ],
        defaultOpts: {
          glob: {cwd: 'src'},
          emitNameKind: 'fileName',
        },
        watch,
      }),
    ],
    watch: {
      exclude: 'node_modules/**/*',
    },
  };
}

function getOpt(opts, opt) {
  if (opt in opts) {
    const out = opts[opt];
    delete opts[opt];

    return out;
  }
}

function mkNodeResolve() {
  return  nodeResolve({
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
  });
}
