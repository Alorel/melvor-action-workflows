import type {ComponentChild, VNode} from 'preact';
import {Fragment} from 'preact';
import type {NodeDefinition} from '../../../public_api';

export interface RenderNodeMediaProps extends Pick<NodeDefinition, 'media'> {
  label: ComponentChild;
}

export function RenderNodeMedia({label, media}: RenderNodeMediaProps): VNode {
  return (
    <Fragment>
      <img class={'ActionWorkflowsCore-font-sized mr-1'} src={media}/>
      <span>{label}</span>
    </Fragment>
  );
}
