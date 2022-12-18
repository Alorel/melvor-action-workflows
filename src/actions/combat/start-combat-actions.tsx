import type {CombatArea, Dungeon, Game, NamespaceRegistry} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import type {ActionNodeDefinition, NodeOption} from '../../public_api';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';

interface Props {
  area: CombatArea;

  /** Index in the area's monsters array */
  mob?: number;
}

interface Init extends Omit<ActionNodeDefinition<Props>, 'namespace' | 'category' | 'options' | 'execContext'> {
  extraOpts?: NodeOption[];

  optionLabel: string;

  registry: TypedKeys<Game, NamespaceRegistry<CombatArea>>;
}

function execMob({area, mob}: Props) {
  game.stopActiveAction();
  game.combat.selectMonster(area.monsters[mob!], area);
}

function renderMob({area, mob: mobIdx}: Props): VNode | null {
  const mob = area.monsters[mobIdx!];

  return (
    <Fragment>
      <span>{'Kill '}</span>
      <RenderNodeMedia label={mob.name} media={mob.media}/>
    </Fragment>
  );
}

const mkAction = ({extraOpts, registry, optionLabel, ...init}: Init) => {
  const def: Pick<ActionNodeDefinition<Props>, 'category' | 'options'> = {
    category: InternalCategory.COMBAT,
    options: [
      {
        label: optionLabel,
        localID: 'area',
        registry,
        required: true,
        type: 'MediaItem',
      },
      ...(extraOpts || []),
    ],
  };

  const out = {
    ...def,
    ...init,
  } as const;

  defineLocalAction(out);

  return out;
};

const areaMobOption: [NodeOption] = [{
  getAltCostItems: (area: CombatArea) => area.monsters as any[] || EMPTY_ARR,
  label: 'Monster',
  localID: 'mob',
  recipeOption: 'area',
  required: true,
  showIf: ({area}: Props) => Boolean(area),
  type: 'AltRecipeCost',
}];

mkAction({
  compactRender: renderMob,
  execute: execMob,
  extraOpts: areaMobOption,
  label: 'Start Combat Area',
  localID: 'startCombatStd',
  media: game.combat.media,
  optionLabel: 'Area',
  registry: 'combatAreas',
});

mkAction({
  compactRender: renderMob,
  execute: execMob,
  extraOpts: areaMobOption,
  label: 'Start Slayer Area',
  localID: 'startCombatSlayer',
  media: game.slayer.media,
  optionLabel: 'Area',
  registry: 'slayerAreas',
});

mkAction({
  compactRender: ({area}) => (
    <Fragment>
      <span>{'Clear '}</span>
      <RenderNodeMedia label={area.name} media={area.media}/>
    </Fragment>
  ),
  execute({area}) {
    game.stopActiveAction();
    game.combat.selectDungeon(area as Dungeon);
  },
  label: 'Start Dungeon',
  localID: 'startCombatDung',
  media: cdnMedia('assets/media/skills/combat/dungeon.svg'),
  optionLabel: 'Dungeon',
  registry: 'dungeons',
});
