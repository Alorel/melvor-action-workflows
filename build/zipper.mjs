import JSZip from "jszip";
import * as fs from 'fs';
import {join} from 'path';

export default function zipperPlugin() {
  return {
    name: 'zipper',
    async writeBundle({dir}, bundle) {
      const zip = new JSZip();

      for (const {code, fileName, source, type} of Object.values(bundle)) {
        zip.file(fileName, type === 'chunk' ? code : source);
      }

      await new Promise(function zipperPromise(resolve, reject) {
        zip.generateNodeStream()
          .pipe(fs.createWriteStream(join(dir, 'mod.zip')))
          .once('error', reject)
          .once('close', () => resolve());
      });
    },
  };
}
