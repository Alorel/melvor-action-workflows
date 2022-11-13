import {createReadStream, createWriteStream} from 'node:fs';
import FormData from 'form-data';
import axios, {AxiosError} from 'axios';
import {join} from 'node:path';
import yargs from 'yargs';
import JSZip from "jszip";
import {readdir, readFile} from "node:fs/promises";

const processArgs = process.argv.slice(2);

const shouldPrompt = yargs(processArgs)
  .option('prompt', {
    boolean: true,
    default: false,
    describe: 'Prompt for inputs',
  })
  .parse()
  .prompt;

const baseUrl = 'https://api.mod.io/v1/games/2869/mods/2407492';

function baseHeaders(token) {
  return {Authorization: `Bearer ${token}`};
}

async function loadToken(rawToken) {
  if (rawToken !== 'auto') {
    return rawToken;
  }

  try {
    return (await readFile('./api-token', 'utf8')).trim();
  } catch {
    throw new Error('API token local file not found');
  }
}

yargs(processArgs)
  .option('token', {
    demandOption: false,
    describe: 'mod.io API token',
    string: true,
  })
  // Upload command
  .command({
    builder: {
      active: {
        boolean: true,
        default: false,
        describe: 'Upload as the active version?',
      },
      'mod-version': {
        demandOption: !shouldPrompt,
        describe: 'New version to publish',
        string: true,
      },
    },
    command: 'upload',
    describe: 'Upload a new mod version',
    async handler({active, modVersion: versionOrNull, token}) {
      try {
        let modVersion;
        if (versionOrNull) {
          modVersion = versionOrNull;
        } else if (shouldPrompt) {
          const prompt = (await import('prompt')).default;
          prompt.start();

          modVersion = (await prompt.get({
            properties: {
              version: {
                message: 'Should be 0.0.0 with an optional "-foo" suffix & a further optional ".0"',
                pattern: /\d+\.\d+\.\d+(-\w+(\.\d+)?)?/,
                required: true,
              },
            },
          })).version;
        } else {
          throw new Error(`mod-version input required`);
        }

        const distDir = new URL('../dist', import.meta.url).pathname;

        const zip = new JSZip();
        await Promise.all(
          (await readdir(distDir, 'utf8'))
            .map(async f => {
              const contents = await readFile(join(distDir, f));
              zip.file(f, contents);
            })
        );

        const tmp = await import('tmp');
        tmp.setGracefulCleanup();

        const tmpDir = tmp.dirSync({discardDescriptor: true}).name;
        const modFileLocation = join(tmpDir, `action-workflows-${modVersion}.zip`);

        await new Promise((resolve, reject) => {
          zip
            .generateNodeStream({
              compression: 'DEFLATE',
              compressionOptions: {level: 9},
              type: 'nodebuffer',
            })
            .pipe(createWriteStream(modFileLocation))
            .once('error', reject)
            .once('close', resolve);
        });

        const form = new FormData();
        form.append('filedata', createReadStream(modFileLocation));
        form.append('version', modVersion);
        form.append('active', String(active));

        const {data} = await axios.post(`${baseUrl}/files`, form, {
          headers: {
            ...form.getHeaders(),
            ...baseHeaders(await loadToken(token)),
          },
        });

        console.log('OK');
        console.log(data.version);
        console.log(data.download.binary_url);
      } catch (e) {
        onErr(e);
      }
    },
  })
  // Remove modfile versions
  .command({
    builder: {
      versions: {
        demandOption: true,
        type: 'array',
      },
    },
    command: 'rm-modfiles',
    describe: 'Remove modfile versions',
    async handler({token, versions}) {
      const cfg = {
        headers: {
          ...baseHeaders(await loadToken(token)),
          'content-type': 'application/x-www-form-urlencoded',
        },
      };

      for (const versionId of versions) {
        try {
          await axios.delete(`${baseUrl}/files/${versionId}`, cfg);
          console.log(versionId, 'deleted');
        } catch (e) {
          const msg = e instanceof AxiosError ? e.response.data : e;
          console.error('Error deleting', versionId, msg);
        }
      }
    }
  })
  // Calc next dev version
  .command({
    builder: {
      tag: {
        default: 'alpha',
        type: 'string',
      },
    },
    command: 'next-dev-version',
    describe: 'Fetch the latest published version',
    async handler({tag, token}) {
      try {
        const [inc, parse, rsp] = await Promise.all([
          import('semver/functions/inc.js').then(v => v.default),
          import('semver/functions/parse.js').then(v => v.default),
          loadToken(token)
            .then(tok => (
              axios.get(`${baseUrl}/files?_sort=-date_added&_limit=1`, {headers: baseHeaders(tok)}))
            )
            .then(v => v.data.data[0].version)
        ]);

        const curr = parse(rsp);

        const next = inc(
          curr,
          curr.prerelease.length ? 'prerelease' : 'preminor',
          false,
          tag
        );

        console.log(next);
      } catch (e) {
        onErr(e);
      }
    },
  })
  .demandCommand()
  .strictCommands()
  .parseAsync()
  .catch(onErr);

function onErr(e) {
  console.error('ERR');

  if (e instanceof AxiosError) {
    console.error(e.response.data);
  } else {
    console.error(e);
  }

  process.exit(1);
}
