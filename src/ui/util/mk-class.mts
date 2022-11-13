import type {HTMLAttributes} from 'preact/compat';

export function mkClass(base: string, ...inClasses: Array<HTMLAttributes['class'] | null | false | 0>): string {
  let out = base;
  for (const inClass of inClasses) {
    if (inClass) {
      const val = typeof inClass === 'string' ? inClass : inClass.value;
      if (val) {
        out += ` ${val}`;
      }
    }
  }

  return out;
}
