import type {VNode} from 'preact';
import {createPortal, useMemo} from 'preact/compat';
import {useEffect} from 'preact/hooks';

interface Props {
  children: VNode<any>;

  id: string;
}

export default function PageContainer({children, id}: Props): VNode {
  const el = useMemo(() => makePageContainer(id), [id]);
  useEffect(() => () => el.remove(), [el]);

  return el && createPortal(children, el);
}

function makePageContainer(id: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'content d-none';
  el.id = id;

  document.getElementById('main-container')!.appendChild(el);

  return el;
}
