import type {MediaItemNodeOption, MediaSelectable, OptionDefinition} from '../../public_api';
import {makeComponent} from '../../ui/common.mjs';
import type {RenderNodeMediaProps} from '../../ui/pages/dashboard/render-node-media/render-node-media.mjs';
import RenderNodeMedia from '../../ui/pages/dashboard/render-node-media/render-node-media.mjs';
import type {MediaOptionValue} from './media-item-option.mjs';
import multiMediaId from './render-multi-node-media.pug';

type PartialMedia = Pick<MediaSelectable, 'name' | 'media'>;

const RenderMediaSelectView: OptionDefinition<MediaOptionValue, MediaItemNodeOption>['renderView']
  = ({value}) => {
    if (Array.isArray(value)) {
      const items: RenderNodeMediaProps[] = [];
      for (const v of value) {
        if (isPartialMediaSelectable(v)) {
          items.push({label: v.name, media: v.media});
        } else {
          return {};
        }
      }

      return RenderViewMulti(items);
    } else if (isPartialMediaSelectable(value)) {
      return RenderNodeMedia({label: value.name, media: value.media});
    }

    return {};
  };

export default RenderMediaSelectView;

function isPartialMediaSelectable(v: any): v is PartialMedia {
  return typeof v?.name === 'string' && typeof v.media === 'string';
}

function RenderViewMulti(items: RenderNodeMediaProps[]) {
  return makeComponent(`#${multiMediaId}`, {
    items,
    RenderNodeMedia,
  });
}

