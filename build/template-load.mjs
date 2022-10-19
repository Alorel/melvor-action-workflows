export default function templateLoadPlugin(isProd) {
  if (isProd) {
    return null;
  }

  return {
    name: 'template-loader',
    transform(code, id) {
      if (id.endsWith('.html')) {
        const base64 = Buffer.from(code, 'utf8').toString('base64');
        const data = `data:text/html;base64,${base64}`;

        return `export default ${JSON.stringify(data)};`;
      }
    },
  };
}
