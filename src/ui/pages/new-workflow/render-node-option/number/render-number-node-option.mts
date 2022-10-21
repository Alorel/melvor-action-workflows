import type {NumberNodeOption} from '../../../../../public_api';
import {makeComponent} from '../../../../common.mjs';
import type {RenderNodeComponent} from '../render-node-option.mjs';
import id from './render-number-node-option.pug';

function onInput(this: ReturnType<typeof makeDef>, newVal: string | number): void {
  switch (typeof newVal) {
    case 'number':
      this.value = newVal;
      break;
    case 'string': {
      const asNum = parseFloat(newVal);
      if (isNaN(asNum)) {
        this.value = undefined;
      } else if (newVal.endsWith('.')) {
        this.value = newVal as any;
        return; // don't emit change
      } else {
        this.value = asNum;
      }
      break;
    }
    default:
      this.value = undefined;
  }

  this.onChange(this.value);
}

function makeDef([opt, value, onChange]: Parameters<typeof RenderNumberNodeOption>) {
  return {
    onChange,
    onInput,
    opt,
    value,
  };
}

const RenderNumberNodeOption: RenderNodeComponent<NumberNodeOption, number | undefined> =
  (...args) => makeComponent(`#${id}`, makeDef(args));

export default RenderNumberNodeOption;
