import type {AltMagicSpell, FoodItem, Item, SingleProductArtisanSkillRecipe} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

const magic = game.altMagic;

interface Props {
  bar?: SingleProductArtisanSkillRecipe;

  food?: FoodItem;

  item?: Item;

  junk?: Item;

  recipe: AltMagicSpell;

  superGem?: Item;
}

defineLocalAction<Props>({
  category: InternalCategory.START_SKILL,
  execute({bar, food, junk, item, recipe, superGem}) {
    magic.selectSpellOnClick(recipe);

    switch (recipe.specialCost.type) {
      case AltMagicConsumptionID.AnyItem:
        magic.selectItemOnClick(item!);
        break;
      case AltMagicConsumptionID.AnyNormalFood:
        magic.selectItemOnClick(food!);
        break;
      case AltMagicConsumptionID.JunkItem:
        magic.selectItemOnClick(junk!);
        break;
      case AltMagicConsumptionID.BarIngredientsWithoutCoal:
      case AltMagicConsumptionID.BarIngredientsWithCoal:
        magic.selectBarOnClick(bar!);
        break;
      case AltMagicConsumptionID.AnySuperiorGem:
        magic.selectItemOnClick(superGem!);
    }

    magic.castButtonOnClick();
  },
  id: ActionId.StartSkillAltMagic,
  label: 'Start Alt. Magic',
  media: magic.media,
  options: [
    {
      id: 'recipe',
      label: 'Spell',
      registry: 'altMagic.actions',
      required: true,
      type: 'MediaItem',
    },
    {
      id: 'bar',
      label: 'Bar',
      mediaFilter: ({category}: SingleProductArtisanSkillRecipe) => category.id === 'melvorD:Bars',
      registry: 'smithing.actions',
      required: true,
      showIf: ({recipe}: Props) => {
        const t = recipe?.specialCost.type;

        return t === AltMagicConsumptionID.BarIngredientsWithoutCoal
          || t === AltMagicConsumptionID.BarIngredientsWithCoal;
      },
      type: 'MediaItem',
    },
    {
      id: 'junk',
      label: 'Item',
      mediaFilter: ({type}: Item) => type === 'Junk',
      registry: 'items',
      required: true,
      showIf: ({recipe}: Props) => recipe?.specialCost.type === AltMagicConsumptionID.JunkItem,
      type: 'MediaItem',
    },
    {
      id: 'item',
      label: 'Item',
      registry: 'items',
      required: true,
      showIf: ({recipe}: Props) => recipe?.specialCost.type === AltMagicConsumptionID.AnyItem,
      type: 'MediaItem',
    },
    {
      id: 'superGem',
      label: 'Gem',
      mediaFilter: ({type}: Item) => type === 'Superior Gem',
      registry: 'items',
      required: true,
      showIf: ({recipe}: Props) => recipe?.specialCost.type === AltMagicConsumptionID.AnySuperiorGem,
      type: 'MediaItem',
    },
    {
      id: 'food',
      label: 'Food',
      mediaFilter: ({localID, type}: Item) => type === 'Food' && !localID.endsWith('_Perfect'),
      registry: 'items',
      required: true,
      showIf: ({recipe}: Props) => recipe?.specialCost.type === AltMagicConsumptionID.AnyNormalFood,
      type: 'MediaItem',
    },
  ],
});
