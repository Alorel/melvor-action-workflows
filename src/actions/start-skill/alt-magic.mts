import type {AltMagicSpell, FoodItem, Item, SingleProductArtisanSkillRecipe} from 'melvor';
import {asyncScheduler, Observable, scheduled} from 'rxjs';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {namespace} from '../../manifest.json';

const magic = game.altMagic;

interface Props {
  bar?: SingleProductArtisanSkillRecipe;

  food?: FoodItem;

  item?: Item;

  junk?: Item;

  recipe: AltMagicSpell;

  superGem?: Item;
}

defineAction<Props>({
  category: InternalCategory.START_SKILL,
  execute: ({bar, food, junk, item, recipe, superGem}) => (
    scheduled(
      new Observable<void>(subscriber => {
        game.stopActiveAction();
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

        subscriber.complete();
      }),
      asyncScheduler
    )
  ),
  label: 'Start Alt. Magic',
  localID: 'startAltMagic',
  media: magic.media,
  namespace,
  options: [
    {
      label: 'Spell',
      localID: 'recipe',
      registry: 'altMagic.actions',
      required: true,
      type: 'MediaItem',
    },
    {
      label: 'Bar',
      localID: 'bar',
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
      label: 'Item',
      localID: 'junk',
      mediaFilter: ({type}: Item) => type === 'Junk',
      registry: 'items',
      required: true,
      showIf: ({recipe}: Props) => recipe?.specialCost.type === AltMagicConsumptionID.JunkItem,
      type: 'MediaItem',
    },
    {
      label: 'Item',
      localID: 'item',
      registry: 'items',
      required: true,
      showIf: ({recipe}: Props) => recipe?.specialCost.type === AltMagicConsumptionID.AnyItem,
      type: 'MediaItem',
    },
    {
      label: 'Gem',
      localID: 'superGem',
      mediaFilter: ({type}: Item) => type === 'Superior Gem',
      registry: 'items',
      required: true,
      showIf: ({recipe}: Props) => recipe?.specialCost.type === AltMagicConsumptionID.AnySuperiorGem,
      type: 'MediaItem',
    },
    {
      label: 'Food',
      localID: 'food',
      mediaFilter: ({localID, type}: Item) => type === 'Food' && !localID.endsWith('_Perfect'),
      registry: 'items',
      required: true,
      showIf: ({recipe}: Props) => recipe?.specialCost.type === AltMagicConsumptionID.AnyNormalFood,
      type: 'MediaItem',
    },
  ],
});
