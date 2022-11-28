import type {Ref} from 'preact/hooks';
import {useEffect, useRef} from 'preact/hooks';
import type {Content, Instance} from 'tippy.js';
import {EMPTY_ARR} from '../../lib/util.mjs';

function useTippy<E extends HTMLElement>(text: Content | undefined, ref: Ref<E>): void;
function useTippy<E extends HTMLElement = HTMLElement>(text: Content | undefined): Ref<E>;
function useTippy<E extends HTMLElement>(
  text: Content | undefined,
  ref?: Ref<E>
): undefined | Ref<E> {
  const targetRef = ref ?? useRef<E>(null);
  const tip = useRef<Instance>();

  useEffect(() => {
    const el = targetRef?.current;
    if (!el) {
      return;
    }

    if (tip.current) {
      tip.current!.setContent(text!);
    } else {
      tip.current = tippy(el, {content: text});
    }
  }, [text, targetRef]);

  useEffect(() => () => {
    tip.current?.destroy();
  }, EMPTY_ARR);

  if (ref == null) {
    return targetRef;
  }
}

export default useTippy;
