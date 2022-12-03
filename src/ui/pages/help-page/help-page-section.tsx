import type {ComponentChildren, VNode} from 'preact';
import {useCallback, useState} from 'preact/hooks';
import {EMPTY_ARR, isFalsy} from '../../../lib/util.mjs';

interface Props {
  children: ComponentChildren;
  heading: string;
}

export default function HelpPageSection({children, heading}: Props): VNode {
  const [showing, setShowing] = useState(false);
  const toggleShowing = useCallback(() => {
    setShowing(isFalsy);
  }, EMPTY_ARR);

  return (
    <div class={'list-group-item'}>
      <div class={'mb-1 font-size-lg ActionWorkflowsCore-point'} onClick={toggleShowing}>
        <i class={`fa mr-1 ${showing ? 'fa-eye' : 'fa-eye-slash'}`}/>
        <span>{heading}</span>
      </div>
      {showing && children}
    </div>
  );
}
