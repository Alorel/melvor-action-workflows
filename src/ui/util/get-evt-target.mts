/** Get the event target, going up the DOM tree, until the predicate passes */
export default function getEvtTarget(
  e: Pick<Event, 'target'>,
  predicate: (el: HTMLElement) => any
): HTMLElement | null {
  let out: HTMLElement | null = e.target as HTMLElement;
  while (out && !predicate(out)) {
    out = out.parentElement;
  }

  return out;
}
