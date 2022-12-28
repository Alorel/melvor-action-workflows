import {round} from 'lodash-es';

export const enum HumaniseNum {
  MIN_NUMBER = 100_000,
}

/** Display a big number as "500K", "420.69M" etc */
export function humaniseNum(num: number): string {
  /* eslint-disable @typescript-eslint/no-magic-numbers */
  if (num < HumaniseNum.MIN_NUMBER) {
    return num.toLocaleString();
  }

  let div: number;
  let abbr: string;
  if (num < 10_000_000) {
    div = 1_000;
    abbr = 'K';
  } else {
    div = 1_000_000;
    abbr = 'M';
  }

  return round(num / div, 3).toLocaleString() + abbr;

  /* eslint-enable @typescript-eslint/no-magic-numbers */
}
