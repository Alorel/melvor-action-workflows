import type {FunctionComponent} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import type {TriggerDefinitionContext} from '../../../../lib/data/trigger-definition-context.mjs';
import useReRender from '../../../hooks/re-render';
import Td from '../../td';
import {TriggerSelect} from '../categorised-node-select/categorised-node-select-impl';
import {useStep} from '../editor-contexts';
import RenderNodeOption from '../render-node-option/render-node-option';

const NewStepHeader: FunctionComponent = memo(() => {
  const reRender = useReRender();
  const step$ = useStep();
  const onTriggerChange = useCallback((newTrigger: TriggerDefinitionContext<any>): void => {
    const trigger = step$.peek().trigger;
    trigger.trigger = newTrigger;
    trigger.resetOpts();
    reRender();
  }, [step$]);

  const stepTrigger = step$.value.trigger;
  const triggerId = stepTrigger.trigger.id;

  return (
    <table className={'table table-sm font-size-sm'}>
      <tbody>
        <tr>
          <Td class={'font-w600'}>{'Trigger'}</Td>
          <Td>
            <TriggerSelect value={stepTrigger.trigger} onChange={onTriggerChange}/>
          </Td>
        </tr>

        {stepTrigger.trigger.def.options?.map(opt => (
          <RenderNodeOption key={`${opt.localID}@${triggerId}`}
            onChange={value => {
              stepTrigger.opts = {...stepTrigger.opts, [opt.localID]: value};
              reRender();
            }}
            option={opt}
            otherValues={stepTrigger.opts}
            value={stepTrigger.opts[opt.localID]}/>
        ))}
      </tbody>
    </table>
  );
});
NewStepHeader.displayName = 'NewStepHeader';

export default NewStepHeader;


