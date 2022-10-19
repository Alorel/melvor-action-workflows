export default function modWrapPlugin() {
  return {
    name: 'mod-wrap',
    renderChunk: code => `export function setup(ctx){\n${code}\n}\n`,
  };
}
