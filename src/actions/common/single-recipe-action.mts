import type {GatheringSkill} from 'melvor';
import type {Observable} from 'rxjs';
import type {RecipeActionBuilder, RecipeOf} from './recipe-action.mjs';
import {RecipeAction} from './recipe-action.mjs';
import type {SkillActionInit} from './skill-action.mjs';

type Gathering = GatheringSkill<any>;

export interface SingleRecipeData<S extends Gathering> {
  recipe: RecipeOf<S>;
}

export class SingleRecipeAction<T extends SingleRecipeData<S>, S extends Gathering, R>
  extends RecipeAction<T, S, R> {

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
