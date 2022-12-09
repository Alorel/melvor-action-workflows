import type {CombatSpell, Game, NamespaceRegistry, Player, SpellSelection} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import type {ActionNodeDefinition} from '../../public_api';

interface Props {
  spell: CombatSpell;
}

type Key = keyof SpellSelection;
type ToggleMethod = TypedKeys<Player, (spell: CombatSpell) => void>;

interface Init extends Omit<ActionNodeDefinition<Props>, 'namespace' | 'category' | 'options' | 'execute' | 'execContext'> {
  registry: TypedKeys<Game, NamespaceRegistry<CombatSpell>>;

  spellSelection: Key;

  toggleMethod: ToggleMethod;
}

function execute(this: ReturnType<typeof mkAction>, {spell}: Props): void {
  const player = game.combat.player;
  if (player.spellSelection[this.spellSelection]?.id !== spell.id) {
    player[this.toggleMethod](spell);
  }
}

const mkAction = ({media, registry, ...init}: Init) => {
  const def: Pick<ActionNodeDefinition<Props>, 'category' | 'media' | 'execute' | 'options'> = {
    category: InternalCategory.COMBAT,
    execute,
    media: cdnMedia(media),
    options: [{
      label: 'Spell',
      localID: 'spell',
      registry,
      required: true,
      type: 'MediaItem',
    }],
  };

  const out = {
    ...def,
    ...init,
  } as const;

  defineLocalAction(out);

  return out;
};

mkAction({
  label: 'Cast Standard spell',
  localID: 'castStdSpell',
  media: 'assets/media/skills/combat/spellbook.svg',
  registry: 'standardSpells',
  spellSelection: 'standard',
  toggleMethod: 'toggleSpell',
});

mkAction({
  label: 'Cast Ancient spell',
  localID: 'castAncientSpell',
  media: 'assets/media/skills/combat/ancient.svg',
  registry: 'ancientSpells',
  spellSelection: 'ancient',
  toggleMethod: 'toggleAncient',
});

mkAction({
  label: 'Cast Archaic spell',
  localID: 'castArchaicSpell',
  media: 'assets/media/skills/magic/archaic_book.svg',
  registry: 'archaicSpells',
  spellSelection: 'archaic',
  toggleMethod: 'toggleArchaic',
});

mkAction({
  label: 'Cast Aurora',
  localID: 'castAurora',
  media: 'assets/media/skills/combat/ancient.svg',
  registry: 'auroraSpells',
  spellSelection: 'aurora',
  toggleMethod: 'toggleAurora',
});

mkAction({
  label: 'Cast Curse',
  localID: 'castCurse',
  media: 'assets/media/skills/combat/curses.svg',
  registry: 'curseSpells',
  spellSelection: 'curse',
  toggleMethod: 'toggleCurse',
});
