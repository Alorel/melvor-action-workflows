import type {VNode} from 'preact';
import {Fragment} from 'preact';
import type {OptionDefinition} from '../../lib/define-option.mjs';
import type {MediaItemNodeOption, MediaSelectable} from '../../public_api';
import type {RenderNodeMediaProps} from '../../ui/pages/workflows-dashboard/render-node-media';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';
import type {MediaOptionValue} from '../media-item-option.mjs';

type PartialMedia = Pick<MediaSelectable, 'name' | 'media'>;

const RenderMediaSelectView: OptionDefinition<MediaOptionValue, MediaItemNodeOption>['renderView']
  = ({value, option: {icon = true}}) => {
    if (Array.isArray(value)) {
      const items: RenderNodeMediaProps[] = [];
      for (const v of value) {
        if (isPartialMediaSelectable(v)) {
          items.push({label: v.name, media: v.media});
        } else {
          return null;
        }
      }

      return (<RenderViewMulti icon={icon} items={items}/>);
    } else if (icon && isPartialMediaSelectable(value)) {
      return <RenderNodeMedia media={value.media} label={value.name}/>;
    } else if (value?.name) {
      return <span>{value.name}</span>;
    }

    return null;
  };

export default RenderMediaSelectView;

function isPartialMediaSelectable(v: any): v is PartialMedia {
  return typeof v?.name === 'string' && typeof v.media === 'string';
}

interface MultiProps {
  icon: boolean;

  items: RenderNodeMediaProps[];
}

const RenderViewMulti = ({items, icon}: MultiProps): VNode => (
  <Fragment>
    {items.map(item => (
      <div key={`${item.media}:${item.label}`}>
        {icon ? <RenderNodeMedia media={item.media} label={item.label}/> : item.label}
      </div>
    ))}
  </Fragment>
);

