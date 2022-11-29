import 'construct-style-sheets-polyfill';

/** Shortcut for making a constructable stylesheet */
export default function makeConstructableCss(css: string): [CSSStyleSheet] {
  const sheet = new CSSStyleSheet();
  sheet
    .replace(css)
    .catch(console.error);

  return [sheet];
}
