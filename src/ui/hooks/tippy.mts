import type {Ref} from 'preact/hooks';
import {useEffect, useRef} from 'preact/hooks';
import type {Instance} from 'tippy.js';
import {EMPTY_ARR} from '../../lib/util.mjs';

export default function useTippy<E extends HTMLElement>(text: string | undefined, ref: Ref<E>): void {
  const tip = useRef<Instance>();

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    if (tip.current) {
      tip.current!.setContent(text!);
    } else {
      tip.current = tippy(el, {content: text});
    }
  }, [ref, text]);

  useEffect(() => () => {
    tip.current?.destroy();
  }, EMPTY_ARR);
}
