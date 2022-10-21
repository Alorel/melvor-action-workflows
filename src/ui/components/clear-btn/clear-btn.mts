import iconUrl from '../../assets/broom.png';
import {makeComponent} from '../../common.mjs';
import tplId from './clear-btn.pug';

function onImgInit(img: HTMLElement): void {
  tippy(img, {content: 'Clear field'});
}

export default function ClearBtn() {
  return makeComponent(`#${tplId}`, {iconUrl, onImgInit});
}
