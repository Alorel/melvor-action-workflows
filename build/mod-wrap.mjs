import MagicString from 'magic-string';

export default function modWrapPlugin({prod}) {
  return {
    name: 'mod-wrap',
    renderChunk: prod ?
      (code => `export async function setup(ctx){${code}}`)
      : (code => {
        const ms = new MagicString(code)
          .prepend('export async function setup(ctx) {\n')
          .append('\n}');

        return {
          code: ms.toString(),
          map: ms.generateMap({hires: true}),
        };
      }),
  };
}
