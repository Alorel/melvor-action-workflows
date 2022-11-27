import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import type {TriggerDefinitionContext} from '../../../../lib/data/trigger-definition-context.mjs';
import type {WorkflowStep} from '../../../../lib/data/workflow-step.mjs';
import useReRender from '../../../hooks/re-render';
import Td from '../../td';
import {TriggerSelect} from '../categorised-node-select/categorised-node-select-impl';
import RenderNodeOption from '../render-node-option/render-node-option';

interface Props {
  step: WorkflowStep;
}

const NewStepHeader = memo<Props>(({step}) => {
  const reRender = useReRender();
  const onTriggerChange = useCallback((newTrigger: TriggerDefinitionContext<any>): void => {
    step.trigger.trigger = newTrigger;
    step.trigger.resetOpts();
    reRender();
  }, [step.trigger]);

  const stepTrigger = step.trigger;
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
              step.trigger.opts = {...stepTrigger.opts, [opt.localID]: value};
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

export default NewStepHeader;


