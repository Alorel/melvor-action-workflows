import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import {copyPlugin} from "@alorel/rollup-plugin-copy";
import modWrapPlugin from "./build/mod-wrap.mjs";
import zipperPlugin from "./build/zipper.mjs";

export default function ({watch}) {
  return {
    input: 'src/index.mts',
    output: {
      dir: 'dist',
      entryFileNames: 'setup.mjs',
      format: 'es',
      preferConst: true,
      preserveModules: false,
      sourcemap: false,
    },
    plugins: [
      nodeResolve({
        extensions: [
          '.mjs',
          '.js',
          '.mts',
          '.ts',
        ],
        mainFields: [
          'module',
          'browser',
          'main',
        ],
      }),
      // templateLoadPlugin(isProd),
      typescript({include: ['src/*.mts', 'src/**/*.mts']}),
      modWrapPlugin(),
      copyPlugin({
        copy: [{from: 'manifest.json'}],
        defaultOpts: {
          glob: {cwd: __dirname},
          emitNameKind: 'fileName',
        },
        watch,
      }),
      zipperPlugin(),
    ],
    watch: {
      exclude: 'node_modules/**/*',
    },
  };
}
