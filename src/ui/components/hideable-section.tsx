import type {ComponentChildren, VNode} from 'preact';
import {Fragment} from 'preact';
import {useCallback, useState} from 'preact/hooks';
import {EMPTY_ARR, isFalsy} from '../../lib/util.mjs';

export interface HideableSectionProps {
  children: ComponentChildren;

  heading: ComponentChildren;

  startOpen?: boolean;
}

export default function HideableSection({children, heading, startOpen}: HideableSectionProps): VNode {
  const [showing, setShowing] = useState(startOpen === true);
  const toggleShowing = useCallback(() => {
    setShowing(isFalsy);
  }, EMPTY_ARR);

  return (
    <Fragment>
      <div class={'mb-1 ActionWorkflowsCore-point'} onClick={toggleShowing}>
        <i class={`fa mr-1 ${showing ? 'fa-eye' : 'fa-eye-slash'}`}/>
        <span>{heading}</span>
      </div>
      {showing && children}
    </Fragment>
  );
}
