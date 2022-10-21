import JSZip from "jszip";

export default function zipperPlugin({
  compressionLevel = 1,
                                     } = {}) {

  return {
    name: 'zipper',
    async generateBundle(_, bundle) {
      const zip = new JSZip();

      for (const {code, fileName, source, type} of Object.values(bundle)) {
        zip.file(fileName, type === 'chunk' ? code : source);
      }

      const source = await zip.generateAsync({
        compression: 'DEFLATE',
        compressionOptions: {level: compressionLevel},
        type: 'nodebuffer',
      });

      this.emitFile({
        fileName: 'mod.zip',
        source,
        type: 'asset',
      });
    },
  };
}
