export default function iifeWrapPlugin({vars: varsArray}) {
  const vars = varsArray.join(',');

  return {
    name: 'iife-wrap',
    renderChunk: code => `await (async (${vars}) => {\n${code}\n})(${vars});`,
  };
}
