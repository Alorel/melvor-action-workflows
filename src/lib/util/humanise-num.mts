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

  if (num < 10_000_000) {
    return `${round(num / 1_000).toLocaleString()}K`;
  }

  return `${round(num / 1_000_000, 3).toLocaleString()}M`;
  /* eslint-enable @typescript-eslint/no-magic-numbers */
}
