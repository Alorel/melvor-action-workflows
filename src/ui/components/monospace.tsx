import {ShadowHost} from '@alorel/preact-shadow-root';
import type {ComponentChildren, VNode} from 'preact';
import {h} from 'preact';
import makeConstructableCss from '../util/make-constructable-css.mjs';

interface Props {
  children: ComponentChildren;

  /** @default span */
  kind?: 'div' | 'span';
}

const styles = makeConstructableCss(':host{font-family:monospace}');

export default function Monospace({children, kind = 'span'}: Props): VNode {
  return h(kind, null, (<ShadowHost adoptedStyleSheets={styles}>
    {children}
  </ShadowHost>
  ));
}

