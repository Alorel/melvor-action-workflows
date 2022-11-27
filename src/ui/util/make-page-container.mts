export default function makePageContainer(id: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'content d-none';
  el.id = id;

  document.getElementById('main-container')!.appendChild(el);

  return el;
}
