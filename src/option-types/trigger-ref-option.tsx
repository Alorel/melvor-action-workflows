import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {useCallback} from 'preact/hooks';
import {WorkflowTrigger} from '../lib/data/workflow-trigger.mjs';
import type {OptionRenderEditCtx} from '../lib/define-option.mjs';
import {defineOption} from '../lib/define-option.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import type {TriggerRefOption} from '../public_api';
import {BorderedBlock} from '../ui/components/block';
import Btn from '../ui/components/btn';
import {BinSvg} from '../ui/components/svg';
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
      : <EditOne onChange={onChange} trigger={value as WorkflowTrigger | undefined}/>;
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
    <div>
      {value.map((trigger, idx) => (
        <div key={trigger.listId}>
          <EditOne
            onChange={newTrigger => {
              const out = [...value];
              out[idx] = newTrigger;
              onChange(out);
            }}
            trigger={trigger}/>
          <div class={'text-right'}>
            <div class={'btn-group btn-group-sm'} data-idx={idx}>
              <Btn kind={'danger'} onClick={onRm}><BinSvg/></Btn>
              <Btn kind={'success'} onClick={onAdd}>+</Btn>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface EditOneProps extends ViewOneProps {
  onChange(val: WorkflowTrigger): void;
}

function EditOne({trigger, onChange}: EditOneProps): VNode | null {
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
    <BorderedBlock kind={'summoning'}>
      <TriggerConfig value={value} onChange={onChangeInner}/>
    </BorderedBlock>
  );
}

interface ViewOneProps {
  trigger: WorkflowTrigger | undefined;
}

function ViewOne({trigger}: ViewOneProps): VNode | null {
  const def = trigger?.trigger?.def;

  return def ? <RenderNodeMedia media={def.media} label={def.label}/> : null;
}
