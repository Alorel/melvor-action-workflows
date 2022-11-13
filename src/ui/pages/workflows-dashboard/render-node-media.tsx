import type {VNode} from 'preact';
import {Fragment} from 'preact';
import type {NodeDefinition} from '../../../public_api';

export type RenderNodeMediaProps = Pick<NodeDefinition, 'label' | 'media'>;

export function RenderNodeMedia({label, media}: RenderNodeMediaProps): VNode {
  return (
    <Fragment>
      <img class={'ActionWorkflowsCore-font-sized mr-1'} src={media}/>
      <span>{label}</span>
    </Fragment>
  );
}
