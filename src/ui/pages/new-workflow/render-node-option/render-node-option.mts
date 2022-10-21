import type {ComponentProps} from 'melvor';
import type {NodeOption} from '../../../../public_api';
import {makeComponent} from '../../../common.mjs';
import RenderMediaSelect from './media-select/media-select.mjs';
import RenderNumberNodeOption from './number/render-number-node-option.mjs';
import id from './render-node-option.pug';
import RenderStringNodeOption from './string/render-string-node-option.mjs';

export type RenderNodeComponent<T, V = any> = (option: T, value: V, onChange: (v: V) => void) => ComponentProps;

const RenderNodeOption: RenderNodeComponent<NodeOption>
  = function RenderNodeOption(opt, value, onChange) {
    return makeComponent(`#${id}`, {
      component: componentMap.get(opt.type)!,
      onChange,
      opt,
      value,
    });
  };

export default RenderNodeOption;

const componentMap = new Map<NodeOption['type'], RenderNodeComponent<NodeOption>>([
  [String, RenderStringNodeOption],
  [Number, RenderNumberNodeOption],
  ['MediaItem', RenderMediaSelect],
]);

