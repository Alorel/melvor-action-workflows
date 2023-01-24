import JSZip from "jszip";
import {readdir, readFile} from "node:fs/promises";
import {join} from "node:path";
import {createReadStream, createWriteStream} from "node:fs";
import FormData from "form-data";
import axios from "axios";
import {baseHeaders, baseUrl, loadToken, onErr, shouldPrompt} from "./common.mjs";
import * as tmp from 'tmp';
import {v4 as uuid} from 'uuid';

tmp.setGracefulCleanup();

export default {
  builder: {
    active: {
      boolean: true,
      default: false,
      describe: 'Upload as the active version?',
    },
    changelog: {
      describe: 'Optional changelog string',
    },
    'mod-version': {
      demandOption: !shouldPrompt,
      describe: 'New version to publish',
      string: true,
    },
  },
  command: 'upload',
  describe: 'Upload a new mod version',
  async handler({active, changelog, modVersion: versionOrNull, token}) {
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

      const distDir = new URL('../../dist', import.meta.url).pathname;

      const zip = new JSZip();
      await Promise.all(
        (await readdir(distDir, 'utf8'))
          .map(async f => {
            const contents = await readFile(join(distDir, f));
            zip.file(f, contents);
          })
      );

      const tmpDir = tmp.dirSync({discardDescriptor: true}).name;
      const modFileLocation = join(tmpDir, `action-workflows-${modVersion}-${uuid()}.zip`);

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
      if (changelog) {
        form.append('changelog', changelog);
      }

      const {data} = await axios.post(`${baseUrl}/files`, form, {
        headers: {
          ...form.getHeaders(),
          ...baseHeaders(await loadToken(token)),
        },
      });

      console.log('OK', new Date().toLocaleString());
      console.log(data.version);
      console.log(data.download.binary_url);
    } catch (e) {
      onErr(e);
    }
  },
};
