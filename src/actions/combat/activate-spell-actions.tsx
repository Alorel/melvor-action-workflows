import type {CombatSpell, Game, NamespaceRegistry, Player, SpellSelection} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import type {ActionNodeDefinition} from '../../public_api';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';

interface Props {
  spell: CombatSpell;
}

type Key = keyof SpellSelection;
type ToggleMethod = TypedKeys<Player, (spell: CombatSpell) => void>;
type This = ActionNodeDefinition<Props> & Pick<Init, 'spellSelection' | 'toggleMethod'>;

interface Init extends Omit<ActionNodeDefinition<Props>, 'namespace' | 'category' | 'options' | 'execute' | 'execContext'> {
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
      label: 'Spell',
      localID: 'spell',
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
  label: 'Cast Standard spell',
  localID: 'castStdSpell',
  media: 'combat/spellbook.svg',
  registry: 'standardSpells',
  spellSelection: 'standard',
  toggleMethod: 'toggleSpell',
});

mkAction({
  label: 'Cast Ancient spell',
  localID: 'castAncientSpell',
  media: 'combat/ancient.svg',
  registry: 'ancientSpells',
  spellSelection: 'ancient',
  toggleMethod: 'toggleAncient',
});

mkAction({
  label: 'Cast Archaic spell',
  localID: 'castArchaicSpell',
  media: 'magic/archaic_book.svg',
  registry: 'archaicSpells',
  spellSelection: 'archaic',
  toggleMethod: 'toggleArchaic',
});

mkAction({
  label: 'Cast Aurora',
  localID: 'castAurora',
  media: 'combat/ancient.svg',
  registry: 'auroraSpells',
  spellSelection: 'aurora',
  toggleMethod: 'toggleAurora',
});

mkAction({
  label: 'Cast Curse',
  localID: 'castCurse',
  media: 'combat/curses.svg',
  registry: 'curseSpells',
  spellSelection: 'curse',
  toggleMethod: 'toggleCurse',
});
