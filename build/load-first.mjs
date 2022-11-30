export default function loadFirstPlugin() {
  const reg = /src[\\/]setup\.tsx$/;

  return {
    name: 'load-first-plugin',
    transform(code, id) {
      return reg.test(id)
        ? `import 'preact/debug';\n${code}`
        : null;
    },
  }
}
