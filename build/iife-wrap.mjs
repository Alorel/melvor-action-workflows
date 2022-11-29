export default function iifeWrapPlugin({vars: varsArray, async}) {
  const vars = varsArray.join(',');
  const renderChunk = async
    ? (code => `await (async (${vars}) => {\n${code}\n})(${vars});`)
    : (code => `((${vars}) => {\n${code}\n})(${vars});`);

  return {
    name: 'iife-wrap',
    renderChunk,
  };
}
