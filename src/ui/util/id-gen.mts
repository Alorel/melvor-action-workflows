import {namespace} from '../../manifest.json';

let counter = -1;

/** Autogenerate a DOM ID */
export default function autoId(): string {
  return `${namespace}-auto-${(++counter).toString(36)}`; // eslint-disable-line @typescript-eslint/no-magic-numbers
}
