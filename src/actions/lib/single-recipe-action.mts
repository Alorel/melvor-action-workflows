import type {ArtisanSkill, GatheringSkill, SingleProductArtisanSkillRecipe} from 'melvor';
import {concat, Observable} from 'rxjs';
import PersistClassName from '../../lib/decorators/PersistClassName.mjs';
import type {RecipeActionBuilder, RecipeOf} from './recipe-action.mjs';
import {RecipeAction} from './recipe-action.mjs';
import type {SkillActionInit} from './skill-action.mjs';

type Gathering = GatheringSkill<any>;
type BarebonesSkill = ArtisanSkill<SingleProductArtisanSkillRecipe>;
type BarebonesThis = SingleRecipeAction<SingleRecipeData<BarebonesSkill>, BarebonesSkill, void>;

export interface SingleRecipeData<S extends Gathering> {
  recipe: RecipeOf<S>;
}

export interface AltRecipeData<S extends Gathering> extends SingleRecipeData<S> {
  alt?: number;
}

@PersistClassName('SingleRecipeAction')
export class SingleRecipeAction<T extends SingleRecipeData<S>, S extends Gathering, R>
  extends RecipeAction<T, S, R> {

  /** Standard exec function for artisan skills */
  public static artisanExec(this: BarebonesThis, {recipe}: Pick<SingleRecipeData<BarebonesSkill>, 'recipe'>): void {
    this.skill.selectRecipeOnClick(recipe);
    this.skill.createButtonOnClick();
  }

  /** Exec for artisan skills with alt recipes */
  public static altArtisanExec(
    this: BarebonesThis,
    {alt, recipe}: Pick<AltRecipeData<BarebonesSkill>, 'alt' | 'recipe'>
  ): void {
    this.skill.selectRecipeOnClick(recipe);

    if (alt != null) {
      this.skill.selectAltRecipeOnClick(alt);
    }

    this.skill.createButtonOnClick();
  }

  /** Type-safe alias for {@link SingleRecipeAction#base} */
  public static new<S extends Gathering>(
    init: SkillActionInit<SingleRecipeData<S>>
  ): RecipeActionBuilder<SingleRecipeData<S>, S>;

  /** Type-safe alias for {@link SingleRecipeAction#base} */
  public static new<T extends SingleRecipeData<S>, S extends Gathering>(
    init: SkillActionInit<T>
  ): RecipeActionBuilder<T, S>

  /** Type-safe alias for {@link SingleRecipeAction#base} */
  public static new<S extends Gathering>(
    init: SkillActionInit<SingleRecipeData<S>>
  ): RecipeActionBuilder<SingleRecipeData<S>, S> {
    return super.base(init);
  }

  /** @inheritDoc */
  public execute(data: T): Observable<void> {
    const check$ = new Observable<void>(subscriber => {
      this.checkRecipe(data.recipe);
      subscriber.complete();
    });

    return concat(check$, super.execute(data));
  }
}
