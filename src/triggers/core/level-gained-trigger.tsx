import type {Skill as TSkill} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';

export interface LevelGainedTriggerData {
  level: number;

  skill: TSkill;
}

const triggerCtx = defineLocalTrigger<LevelGainedTriggerData>({
  category: InternalCategory.CORE,
  check: ({level, skill}) => skill.level >= level,
  compactRender: ({level, skill}) => (
    <Fragment>
      <RenderNodeMedia label={skill.name} media={skill.media}/>
      <span>{' level '}</span>
      <span class={'text-primary'}>{level.toLocaleString()}</span>
    </Fragment>
  ),
  init() {
    ctx.patch(Skill, 'onLevelUp').after(function (this: TSkill): void {
      triggerCtx.notifyListeners();
    });
  },
  label: 'Level gained',
  localID: 'lvGained',
  media: game.pages.getObject('melvorD', 'Statistics')!.media,
  options: [
    {
      label: 'Skill',
      localID: 'skill',
      registry: 'skills',
      required: true,
      type: 'MediaItem',
    },
    {
      label: 'Level',
      localID: 'level',
      max: ({skill}: Partial<LevelGainedTriggerData>) => Math.max(99, skill?.levelCap ?? 0), // eslint-disable-line @typescript-eslint/no-magic-numbers
      min: 2,
      required: true,
      type: Number,
    },
  ],
});
