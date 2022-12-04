import type {ReadonlySignal} from '@preact/signals-core';
import {createPortal, memo} from 'preact/compat';
import {useRunning} from '../global-ctx';
import {PauseSvg, PlaySvg} from './svg';

interface Props<T extends Element> {
  container: ReadonlySignal<T | null>;
}

const SidenavIcon = memo(function SidenavIcon<T extends Element>({container: container$}: Props<T>) {
  const container = container$.value;
  const Comp = useRunning().value ? PlaySvg : PauseSvg;

  return container && createPortal(<Comp class={'mr-1'}/>, container);
});

export default SidenavIcon;
