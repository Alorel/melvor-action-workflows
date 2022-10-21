import scss from 'sass';
import {basename} from 'path';

export default function scssLoader({prod = false} = {}) {
  const opts = {
    style: prod ? 'compressed' : 'expanded',
    sourceMap: false,
  };

  return {
    name: 'scss-loader',
    transform(code, id) {
      if (!id.endsWith('.scss')) {
        return;
      }

      const source = scss.compileString(code, opts).css;
      this.emitFile({
        fileName: 'styles.css',
        source,
        type: 'asset',
      });

      return `// ${basename(id)}`;
    },
  }
}
