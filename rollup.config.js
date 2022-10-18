const {join} = require('path');
const {_buildBaseExternals, _buildUmdExternals} = require('./build/rollup/_baseExternals');
const {_buildLazyReq} = require('./build/rollup/_lazyReq');
const replacePlugin = require('@rollup/plugin-replace');

// ########## BEGIN SETUP

const CONFIG = {
  assetFileNames: '[name][extname]',
  get cjsPluginSettings() {
    /*
     *   return {
     *   extensions: CONFIG.extensions,
     *   include: null,
     *   sourceMap: CONFIG.sourcemap
     * }
     */

    return null;
  },
  distDir: join(__dirname, 'dist'),
  entryFileNames: '[name].js',
  extensions: [
    '.js',
    '.ts'
  ],
  mainFields: [
    'fesm2015',
    'es2015',
    'esm2015',
    'module',
    'browser',
    'main'
  ],
  sourcemap: false,
  srcDir: join(__dirname, 'projects'),
  umd: {
    globals: {},
    name: {
      core: 'MyLibrary'
    }
  }
};

// ########## END SETUP

function createConfig(rollupConfig) {
  const {
    project,
    cjs2015 = false,
    fcjs2015 = false,
    esm2015 = false,
    fesm2015 = false,
    stdumd = false,
    dts = false,
    minumd = false,
    tsconfig = 'tsconfig.json',
    watch = false
  } = rollupConfig;

  if ([cjs2015, fcjs2015].filter(Boolean).length > 1) {
    throw new Error('These options are mutually exclusive: cjs2015, fcjs2015');
  } else if (![cjs2015, fcjs2015, esm2015, fesm2015, stdumd, minumd].some(Boolean)) {
    throw new Error('At least one option required: cjs2015, fcjs2015, esm2015, fesm2015, minumd, stdumd');
  }


  const distDir = join(CONFIG.distDir, project);
  const projectDir = join(CONFIG.srcDir, project);

  const baseSettings = {
    external: _buildBaseExternals,
    input: join(projectDir, 'index.ts'),
    watch: {
      exclude: 'node_modules/**/*'
    }
  };

  const baseOutput = {
    assetFileNames: CONFIG.assetFileNames,
    dir: distDir,
    entryFileNames: CONFIG.entryFileNames,
    sourcemap: CONFIG.sourcemap
  };

  const tryAddCopyPlugin = (() => {
    let added = false;

    return () => {
      if (added) {
        return [];
      }

      added = true;

      return [
        require('@alorel/rollup-plugin-copy-pkg-json').copyPkgJsonPlugin({
          pkgJsonPath: join(projectDir, 'package.json')
        }),
        require('@alorel/rollup-plugin-copy').copyPlugin({
          copy: [
            {
              from: 'LICENSE',
              opts: {glob: {cwd: __dirname}}
            },
            {
              from: 'README.md',
              opts: {glob: {cwd: projectDir}}
            }
          ],
          defaultOpts: {
            emitNameKind: 'fileName'
          },
          watch
        })
      ]
    };
  })();

  let dtsEmitted = !dts;
  function tryEmitDts(compilerOptions) {
    if (dtsEmitted) {
      return compilerOptions;
    }

    dtsEmitted = true;
    return {
      ...compilerOptions,
      declaration: true,
    };
  }

  function getBasePlugins(ecma, compilerOpts) {
    const cjsSettings = CONFIG.cjsPluginSettings;

    return [
      _buildLazyReq.nodeResolve(CONFIG),
      cjsSettings && require('@rollup/plugin-commonjs').default(cjsSettings),
      require('rollup-plugin-typescript2')({
        tsconfig,
        tsconfigOverride: {
          compilerOptions: {
            rootDir: `projects/${project}`,
            ...compilerOpts
          },
        },
      }),
      replacePlugin({
        exclude: /node_modules[\\/]/,
        include: /src[\\/].+\.ts/,
        preventAssignment: true,
        values: {
          'process.env.ES_TARGET': JSON.stringify(ecma)
        }
      })
    ].filter(Boolean);
  }

  const outConfig = [];

  if (cjs2015 || esm2015) {
    const es6BaseOutput = {
      ...baseOutput,
      preferConst: true
    };

    if (cjs2015) {
      outConfig.push({
        ...baseSettings,
        output: {
          ...es6BaseOutput,
          format: 'cjs'
        },
        plugins: [
          ...getBasePlugins('es2015', tryEmitDts()),
          ...tryAddCopyPlugin()
        ],
        preserveModules: true
      })
    }
    if (esm2015) {
      outConfig.push({
        ...baseSettings,
        output: {
          ...es6BaseOutput,
          dir: dtsEmitted ? join(distDir, '_esm2015') : distDir,
          format: 'es'
        },
        plugins: [
          ...getBasePlugins('es2015', tryEmitDts()),
          ...tryAddCopyPlugin()
        ],
        preserveModules: true
      })
    }
  }

  if (fcjs2015 || fesm2015) {
    const fesm2015BaseOutput = {
      ...baseOutput,
      banner: _buildLazyReq.bannerFn,
      preferConst: true
    };

    if (fcjs2015) {
      outConfig.push({
        ...baseSettings,
        output: {
          ...fesm2015BaseOutput,
          format: 'cjs'
        },
        plugins: [
          ...getBasePlugins('es2015', tryEmitDts()),
          ...tryAddCopyPlugin(),
        ],
        preserveModules: false
      });
    }

    if (fesm2015) {
      outConfig.push({
        ...baseSettings,
        output: {
          ...fesm2015BaseOutput,
          dir: dtsEmitted ? join(distDir, '_fesm2015') : distDir,
          format: 'es'
        },
        plugins: [
          ...getBasePlugins('es2015', tryEmitDts()),
          ...tryAddCopyPlugin(),
        ],
        preserveModules: false,
      });
    }
  }

  if (stdumd || minumd) {
    if (!CONFIG.umd.name[project]) {
      throw new Error(`Umd name missing for ${project}`);
    }
    const umdBaseOutput = {
      ...baseOutput,
      banner: _buildLazyReq.bannerFn,
      dir: dtsEmitted ? join(distDir, '_umd') : distDir,
      format: 'umd',
      globals: CONFIG.umd.globals,
      name: CONFIG.umd.name[project],
      preferConst: true,
    };

    outConfig.push({
      ...baseSettings,
      external: _buildUmdExternals,
      output: [
        stdumd && {
          ...umdBaseOutput,
          entryFileNames: 'index.js'
        },
        minumd && {
          ...umdBaseOutput,
          entryFileNames: 'index.min.js',
          plugins: [
            _buildLazyReq.threadedTerser({
              terserOpts: {
                compress: {
                  drop_console: true,
                  ecma: 5,
                  keep_infinity: true,
                  typeofs: false
                },
                ecma: 2017,
                ie8: true,
                mangle: {
                  safari10: true
                },
                output: {
                  comments: false,
                  ie8: true,
                  safari10: true
                },
                safari10: true,
                sourceMap: false
              }
            })
          ]
        }
      ].filter(Boolean),
      plugins: [
        ...getBasePlugins('es2015', tryEmitDts()),
        ...tryAddCopyPlugin(),
      ]
    });
  }

  return outConfig;
}

module.exports = function (inConfig) {
  const projects = inConfig.projects ?
    inConfig.projects.split(',') :
    require('./build/rollup/_syncPkg')._buildGetProjects();
  delete inConfig.projects;

  const out = projects.flatMap(project => createConfig({...inConfig, project}));

  for (const p of ['dts', 'projects', 'cjs2015', 'fcjs2015', 'esm2015', 'fesm2015', 'stdumd', 'minumd', 'tsconfig']) {
    delete inConfig[p];
  }

  return out;
};

Object.defineProperty(module.exports, '__esModule', {value: true});
module.exports.default = module.exports;
