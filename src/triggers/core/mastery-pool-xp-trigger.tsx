import type {Skill, SkillWithMastery as TSkillWithMastery} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';
import TriggerId from '../trigger-id.mjs';

interface Data {
  pool: number;

  skill: TSkillWithMastery<any>;
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.CORE,
  check: ({pool, skill}) => skill.masteryPoolProgress >= pool,
  compactRender: ({pool, skill}) => (
    <Fragment>
      <RenderNodeMedia label={skill.name} media={skill.media}/>
      <span>{' mastery pool '}</span>
      <span class={'text-primary'}>{`${pool}%`}</span>
    </Fragment>
  ),
  id: TriggerId.CoreMasteryPool,
  init() {
    ctx.patch(SkillWithMastery, 'addMasteryPoolXP').after(function () {
      triggerCtx.notifyListeners();
    });
  },
  label: 'Mastery pool %',
  media: cdnMedia('assets/media/main/mastery_pool.svg'),
  options: [
    {
      id: 'skill',
      label: 'Skill',
      mediaFilter: (skill: Skill) => skill.hasMastery,
      registry: 'skills',
      required: true,
      type: 'MediaItem',
    },
    {
      id: 'pool',
      label: '%',
      max: ({skill}: Partial<Data>) => Math.max(125, skill?.masteryPoolCapPercent ?? 0), // eslint-disable-line @typescript-eslint/no-magic-numbers
      min: 0,
      required: true,
      step: 0.01,
      type: Number,
    },
  ],
});
