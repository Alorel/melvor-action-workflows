import type {VNode} from 'preact';
import {memo} from 'preact/compat';
import {HumaniseNum, humaniseNum} from '../../lib/util/humanise-num.mjs';
import useTippy from '../hooks/tippy.mjs';

interface Props {
  num: number;
}

export const BigNum = memo(function BigNum({num}: Props) {
  return num < HumaniseNum.MIN_NUMBER
    ? <span class={'text-primary'}>{num.toLocaleString()}</span>
    : <ReallyBig num={num}/>;
});

function ReallyBig({num}: Props): VNode {
  const el = useTippy(num.toLocaleString());

  return (
    <abbr
      class={'text-primary ActionWorkflowsCore-undecorate ActionWorkflowsCore-underdot'}
      ref={el}>{humaniseNum(num)}</abbr>
  );
}


