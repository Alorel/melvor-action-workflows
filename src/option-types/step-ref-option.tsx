import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {useCallback, useEffect, useMemo, useState} from 'preact/hooks';
import type {WorkflowStep} from '../lib/data/workflow-step.mjs';
import {defineOption} from '../lib/define-option.mjs';
import type {StepRefNodeOption, TriggerNodeDefinition} from '../public_api';
import Monospace from '../ui/components/monospace';
import {useActiveWorkflow, useStep, useWorkflow} from '../ui/components/workflow-editor/editor-contexts';
import {RenderNodeMedia} from '../ui/pages/workflows-dashboard/render-node-media';
import {useAutoId} from '../ui/util/id-gen.mjs';
import {useRenderEditTouch} from './_common.mjs';

defineOption<number, StepRefNodeOption>({
  is: (v): v is StepRefNodeOption => v.type === 'StepRef',
  renderEdit({onChange, value}) {
    const name = useAutoId();
    const onTouch = useRenderEditTouch();
    const [steps, stepIdx] = useWorkflowSteps();

    const onRadioChange = useCallback((e: Event) => {
      const idx = parseInt((e.target as HTMLInputElement).dataset.idx!);
      onChange(isNaN(idx) ? undefined : idx);
      onTouch();
    }, [onChange, onTouch]);

    // Unset value if idx becomes invalid
    useEffect(() => {
      if (value === stepIdx) {
        onChange();
      }
    }, [value, stepIdx, onChange]);

    return (
      <Fragment>
        {steps.map((step, idx) => (
          idx === stepIdx
            ? null
            : (
              <RenderCheck idx={idx}
                key={step.listId}
                name={name}
                step={step}
                checked={idx === value}
                onChange={onRadioChange}/>
            )
        ))}
      </Fragment>
    );
  },
  renderView({value}) {
    const steps = useActiveWorkflow().value!.steps;
    const step = value != null && steps[value];

    return step
      ? <RenderItem idx={value} trigger={step.trigger.trigger.def}/>
      : null;
  },
  token: 'StepRef',
});

function useWorkflowSteps(): [WorkflowStep[], number] {
  const workflow$ = useWorkflow();
  const step$ = useStep();

  const wf = workflow$.value;

  const [steps, setSteps] = useState(wf!.steps);

  useEffect(() => {
    const sub = wf!.steps$.subscribe(setSteps);

    return () => {
      sub.unsubscribe();
    };
  }, [wf]);

  const stepIdx = useMemo(() => {
    const stepId = step$.peek().listId;

    return steps.findIndex(s => s.listId === stepId);
  }, [step$.value, steps]);

  return [steps, stepIdx];
}

interface RenderCheckProps {
  checked: boolean;

  idx: number;

  name: string;

  step: WorkflowStep;

  onChange(e: Event): void;
}

function RenderCheck({idx, name, checked, step, onChange}: RenderCheckProps): VNode {
  const id = useAutoId();

  return (
    <div className={'form-check'}>
      <input className={'form-check-input'}
        name={name}
        id={id}
        checked={checked}
        data-idx={idx}
        onChange={onChange}
        type={'radio'}/>
      <label class={'form-check-label ActionWorkflowsCore-form-control-text'}
        for={id}>
        <RenderItem idx={idx} trigger={step.trigger.trigger.def}/>
      </label>
    </div>
  );
}

interface RenderItemProps {
  idx: number;

  trigger: TriggerNodeDefinition;
}

function RenderItem({idx, trigger}: RenderItemProps): VNode {
  return (
    <Fragment>
      <Monospace>{`[${idx + 1}] `}</Monospace>
      <RenderNodeMedia media={trigger.media} label={trigger.label}/>
    </Fragment>
  );
}
