import 'construct-style-sheets-polyfill';

/** Shortcut for making a constructable stylesheet */
export default function makeConstructableCss(css: string): [CSSStyleSheet] {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);

  return [sheet];
}
