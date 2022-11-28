import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {memo} from 'preact/compat';
import type {NodeDefinition, Obj} from '../../../public_api';
import {RenderNodeMedia} from './render-node-media';
import RenderNodeOptionValue from './render-node-option-value';

interface SectionProps {
  config: Obj<any>;

  node: NodeDefinition;
}

export const DefSection = memo<SectionProps>(({config, node}) => (
  <Fragment>
    <div class={'text-center font-size-sm font-w600 ActionWorkflowsCore-underdot'}>
      <RenderNodeMedia label={node.label} media={node.media}/>
    </div>
    {Boolean(node.options?.length) && <DefSectionOptions opts={node.options!} config={config}/>}
  </Fragment>
));

interface DefProps extends Pick<SectionProps, 'config'> {
  opts: Required<NodeDefinition>['options'];
}

function DefSectionOptions({opts, config}: DefProps): VNode {
  return (
    <table class={'font-size-sm w-100'}>
      <tbody>
        {opts.map(opt => (<RenderNodeOptionValue key={opt.localID}
          value={config[opt.localID]}
          option={opt}
          otherValues={config}/>))}
      </tbody>
    </table>
  );
}
