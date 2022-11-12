import type {ArtisanSkill, GatheringSkill, SingleProductArtisanSkillRecipe} from 'melvor';
import type {Observable} from 'rxjs';
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

export class SingleRecipeAction<T extends SingleRecipeData<S>, S extends Gathering, R>
  extends RecipeAction<T, S, R> {

  public static artisanExec(this: BarebonesThis, {recipe}: Pick<SingleRecipeData<BarebonesSkill>, 'recipe'>): boolean {
    if (!this.skill.isActive || this.skill.selectedRecipe?.id !== recipe.id) {
      this.skill.selectRecipeOnClick(recipe);
      this.skill.createButtonOnClick();

      return true;
    }

    return false;
  }

  public static altArtisanExec(this: BarebonesThis, data: Pick<AltRecipeData<BarebonesSkill>, 'alt' | 'recipe'>): void {
    if (data.alt != null) {
      this.skill.selectAltRecipeOnClick(data.alt);
    }

    if (!SingleRecipeAction.artisanExec.call(this, data) && data.alt != null) {
      this.skill.createButtonOnClick();
    }
  }

  public static new<S extends Gathering>(
    init: SkillActionInit<SingleRecipeData<S>>
  ): RecipeActionBuilder<SingleRecipeData<S>, S>;

  public static new<T extends SingleRecipeData<S>, S extends Gathering>(
    init: SkillActionInit<T>
  ): RecipeActionBuilder<T, S>

  public static new<S extends Gathering>(
    init: SkillActionInit<SingleRecipeData<S>>
  ): RecipeActionBuilder<SingleRecipeData<S>, S> {
    return super.base(init);
  }

  /** @inheritDoc */
  public execute(data: T): Observable<void> {
    this.checkRecipe(data.recipe);
    return super.execute(data);
  }
}
