import type {VNode} from 'preact';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import type ActionConfigItem from '../../../lib/data/action-config-item.mjs';
import type {ActionNodeDefinitionImpl} from '../../../lib/registries/action-registry.mjs';
import type {NodeOption} from '../../../public_api';
import useReRender from '../../hooks/re-render';
import type {BorderedBlockProps} from '../block';
import {BorderedBlock} from '../block';
import {ActionSelect} from './categorised-node-select/categorised-node-select-impl';
import RenderNodeOption from './render-node-option/render-node-option';

interface Props extends Omit<BorderedBlockProps, 'kind' | 'size' | 'action'> {
  action: ActionConfigItem;
}

const ActionConfig = memo<Props>(function ActionConfig({action, children, ...rest}) {
  const reRender = useReRender();
  const onActionChange = useCallback((newAction: ActionNodeDefinitionImpl<any>) => {
    action.action = newAction;
    action.resetOpts();
    reRender();
  }, [action]);

  const opts = action.action.def.options;

  return (
    <BorderedBlock kind={'woodcutting'} size={2} {...rest}>
      <ActionSelect value={action.action} onChange={onActionChange}>
        {children}
      </ActionSelect>

      {Boolean(opts?.length) && (<OptsTable action={action} opts={opts!}/>)}
    </BorderedBlock>
  );
});

export default ActionConfig;

interface OptsTableProps {
  action: ActionConfigItem;

  opts: NodeOption[];
}

function OptsTable({action, opts}: OptsTableProps): VNode {
  const reRender = useReRender();

  return (
    <div class={'table-responsive'}>
      <table class={'table table-sm font-size-sm'}>
        <tbody>
          {opts.map(option => {
            const show = option.showIf?.(action.opts);

            return show !== false && (
              <RenderNodeOption
                option={option}
                key={`${option.localID}@${action.action.id}`}
                otherValues={action.opts}
                value={action.opts[option.localID]}
                onChange={value => {
                  action.opts = {...action.opts, [option.localID]: value};
                  reRender();
                }}/>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
OptsTable.displayName = 'ActionConfigOptsTable';
