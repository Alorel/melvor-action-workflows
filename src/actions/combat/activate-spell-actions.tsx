import type {CombatSpell, Game, NamespaceRegistry, Player, SpellSelection} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import type {ActionNodeDefinition} from '../../public_api';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';
import ActionId from '../action-id.mjs';

interface Props {
  spell: CombatSpell;
}

type Key = keyof SpellSelection;
type ToggleMethod = TypedKeys<Player, (spell: CombatSpell) => void>;
type This = ActionNodeDefinition<Props> & Pick<Init, 'spellSelection' | 'toggleMethod'>;

interface Init extends Omit<ActionNodeDefinition<Props>, 'category' | 'options' | 'execute' | 'execContext' | 'id'> {
  id: ActionId;

  registry: TypedKeys<Game, NamespaceRegistry<CombatSpell>>;

  spellSelection: Key;

  toggleMethod: ToggleMethod;
}

function execute(this: This, {spell}: Props): void {
  const player = game.combat.player;
  if (player.spellSelection[this.spellSelection]?.id !== spell.id) {
    player[this.toggleMethod](spell);
  }
}

function compactRender({spell}: Props): VNode {
  return (
    <Fragment>
      <span>{'Cast '}</span>
      <RenderNodeMedia label={spell.name} media={spell.media}/>
    </Fragment>
  );
}

const mkAction = ({media, registry, ...init}: Init): void => {
  const def = {
    category: InternalCategory.COMBAT,
    compactRender,
    execute,
    media: cdnMedia(`assets/media/skills/${media}`),
    options: [{
      id: 'spell',
      label: 'Spell',
      registry,
      required: true,
      type: 'MediaItem',
    }],
  } satisfies Partial<ActionNodeDefinition<Props>>;

  defineLocalAction({
    ...def,
    ...init,
  });
};

mkAction({
  id: ActionId.CombatCastSpellStd,
  label: 'Cast Standard spell',
  media: 'combat/spellbook.svg',
  registry: 'standardSpells',
  spellSelection: 'standard',
  toggleMethod: 'toggleSpell',
});

mkAction({
  id: ActionId.CombatCastSpellAncient,
  label: 'Cast Ancient spell',
  media: 'combat/ancient.svg',
  registry: 'ancientSpells',
  spellSelection: 'ancient',
  toggleMethod: 'toggleAncient',
});

mkAction({
  id: ActionId.CombatCastSpellArchaic,
  label: 'Cast Archaic spell',
  media: 'magic/archaic_book.svg',
  registry: 'archaicSpells',
  spellSelection: 'archaic',
  toggleMethod: 'toggleArchaic',
});

mkAction({
  id: ActionId.CombatCastSpellAurora,
  label: 'Cast Aurora',
  media: 'combat/ancient.svg',
  registry: 'auroraSpells',
  spellSelection: 'aurora',
  toggleMethod: 'toggleAurora',
});

mkAction({
  id: ActionId.CombatCastSpellCurse,
  label: 'Cast Curse',
  media: 'combat/curses.svg',
  registry: 'curseSpells',
  spellSelection: 'curse',
  toggleMethod: 'toggleCurse',
});
