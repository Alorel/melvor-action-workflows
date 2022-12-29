import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {useCallback} from 'preact/hooks';
import {WorkflowTrigger} from '../lib/data/workflow-trigger.mjs';
import type {OptionRenderEditCtx} from '../lib/define-option.mjs';
import {defineOption} from '../lib/define-option.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import type {TriggerRefOption} from '../public_api';
import {BlockDiv} from '../ui/components/block';
import Btn from '../ui/components/btn';
import type {TriggerConfigValue} from '../ui/components/trigger-config';
import TriggerConfig from '../ui/components/trigger-config';
import {RenderNodeMedia} from '../ui/pages/workflows-dashboard/render-node-media';
import getEvtTarget from '../ui/util/get-evt-target.mjs';
import {isTriggerRefOption} from './trigger-ref/is-trigger-ref-option.mjs';

defineOption<WorkflowTrigger | WorkflowTrigger[], TriggerRefOption>({
  is: isTriggerRefOption,
  renderEdit({value, onChange, option: {multi}}) {
    return multi
      ? <EditMulti onChange={onChange} value={value as WorkflowTrigger[] | undefined}/>
      : <EditOne border={true} onChange={onChange} trigger={value as WorkflowTrigger | undefined}/>;
  },
  renderView({value}) {
    if (!Array.isArray(value)) {
      return <ViewOne trigger={value}/>;
    }

    return (
      <Fragment>
        {value.map(trigger => (
          <div key={trigger.listId}>
            <ViewOne trigger={trigger}/>
          </div>
        ))}
      </Fragment>
    );
  },
  token: 'TriggerRef',
  validate(value) {
    if (!Array.isArray(value)) {
      return EMPTY_ARR;
    }

    const out: string[] = [];
    for (let i = 0; i < value.length; ++i) {
      if (!value[i]) {
        out.push(`Trigger at index ${i} empty`);
      }
    }

    return out.length ? out : EMPTY_ARR;
  },
});

function EditMulti(
  {value, onChange}: Pick<OptionRenderEditCtx<WorkflowTrigger[], any>, 'value' | 'onChange'>
): VNode | null {
  const onRm = useCallback((evt: Event): void => {
    const idx = getEvtTarget(evt, el => el.tagName === 'DIV')!.dataset.idx!;
    const out = [...value!];

    out.splice(parseInt(idx), 1);
    onChange(out);
  }, [value, onChange]);

  const onAdd = useCallback((evt: Event): void => {
    const idx = parseInt(getEvtTarget(evt, el => el.tagName === 'DIV')!.dataset.idx!);
    if (isNaN(idx)) {
      return;
    }

    const out = value?.slice() ?? [];

    out.splice(idx + 1, 0, new WorkflowTrigger());
    onChange(out);
  }, [value, onChange]);

  if (!value || !Array.isArray(value)) {
    onChange([]);

    return null;
  }

  return (
    <div class={'ActionWorkflowsCore-bordered border-fishing'}>
      {value.map((trigger, idx) => (
        <div key={trigger.listId}>
          <EditOne
            onChange={newTrigger => {
              const out = [...value];
              out[idx] = newTrigger;
              onChange(out);
            }}
            border={idx !== 0}
            trigger={trigger}/>
          <div class={'text-right pr-1 pb-2'}>
            <div class={'btn-group btn-group-sm'} data-idx={idx}>
              <Btn kind={'danger'} onClick={onRm}>Remove condition</Btn>
              <Btn kind={'success'} onClick={onAdd}>Add condition</Btn>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface EditOneProps extends ViewOneProps {
  border?: boolean;

  onChange(val: WorkflowTrigger): void;
}

function EditOne({border, trigger, onChange}: EditOneProps): VNode | null {
  const value: TriggerConfigValue = {
    opts: trigger?.opts ?? trigger?.trigger.def.initOptions?.() ?? {},
    trigger: trigger?.trigger,
  };

  const onChangeInner = useCallback((newVal: TriggerConfigValue): void => {
    if (trigger) {
      trigger.trigger = newVal.trigger!;
      trigger.opts = newVal.opts;
      onChange(trigger);
    } else {
      onChange(new WorkflowTrigger(newVal));
    }

  }, [trigger]);

  return (
    <BlockDiv class={border ? 'border-top border-summoning' : ''}>
      <TriggerConfig value={value} onChange={onChangeInner}/>
    </BlockDiv>
  );
}

interface ViewOneProps {
  trigger: WorkflowTrigger | undefined;
}

function ViewOne({trigger}: ViewOneProps): VNode | null {
  if (!trigger) {
    return null;
  }

  const {trigger: {def}, opts} = trigger;

  return def.compactRender?.(opts) || <RenderNodeMedia media={def.media} label={def.label}/>;
}
