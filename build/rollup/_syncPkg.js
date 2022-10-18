const fs = require('fs');
const {join} = require('path');

const projectDir = join(__dirname, '..', '..', 'projects');

function _buildGetProjects() {
  return fs.readdirSync(projectDir, 'utf8');
}

// eslint-disable-next-line complexity,max-lines-per-function
function _buildSyncPkgJson(fields) {
  if (!fields?.length) {
    return;
  }

  const projects = _buildGetProjects();
  const rootPkgJson = JSON.parse(fs.readFileSync(require.resolve('../../package.json'), 'utf8'));
  const depFields = ['peerDependencies', 'dependencies', 'devDependencies'];

  const pkgJsonFor = (() => {
    const cache = {};

    return projName => {
      if (!cache[projName]) {
        const pkgJsonPath = join(projectDir, projName, 'package.json');
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        cache[projName] = [pkgJson, pkgJsonPath];
      }

      return cache[projName];
    };
  })();
  const packageNames = new Set(projects.map(p => pkgJsonFor(p)[0].name));

  for (const projName of projects) {
    const [pkgJson, pkgJsonPath] = pkgJsonFor(projName);
    let changed = false;

    for (const f of fields) {
      const vRoot = rootPkgJson[f];
      const vPkg = pkgJson[f];
      if (vRoot !== vPkg) {
        changed = true;
        if (!vRoot && vPkg) {
          delete pkgJson[f];
        } else {
          pkgJson[f] = vRoot;
        }
      }
    }

    for (const fPkg of depFields) {
      if (!pkgJson[fPkg]) {
        continue;
      }

      for (const [dep, version] of Object.entries(pkgJson[fPkg])) {
        if (packageNames.has(dep)) {
          changed = true;
          pkgJson[fPkg][dep] = rootPkgJson.version;

          continue;
        }

        depSearch:
        for (const fRoot of depFields) {
          // eslint-disable-next-line max-depth
          if (!rootPkgJson[fRoot]) {
            continue;
          }
          // eslint-disable-next-line max-depth
          for (const [rootDep, rootVersion] of Object.entries(rootPkgJson[fRoot])) {
            // eslint-disable-next-line max-depth
            if (rootDep !== dep) {
              continue;
            }

            // eslint-disable-next-line max-depth
            if (rootVersion !== version) {
              changed = true;
              pkgJson[fPkg][dep] = rootVersion;
            }

            break depSearch;
          }
        }
      }
    }

    if (changed) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2)); // eslint-disable-line no-magic-numbers
    }
  }
}

const _buildPkgDefaultSyncFields = [
  'version',
  'main',
  'module',
  'es2015',
  'esm2015',
  'fesm2015',
  'jsdelivr',
  'browser',
  'repository',
  'types',
  'typings',
  'author',
  'license',
  'publishConfig'
];

module.exports = {
  _buildGetProjects,
  _buildPkgDefaultSyncFields,
  _buildSyncPkgJson
};

Object.defineProperty(exports, '__esModule', {value: true});

if (process.argv[2] === '--run-sync-pkg') {
  _buildSyncPkgJson(_buildPkgDefaultSyncFields);
}
