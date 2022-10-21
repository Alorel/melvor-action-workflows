import type {Skill} from 'melvor';
import type {Game, GatheringSkill} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import type {ObservableInput} from 'rxjs';
import {namespace} from '../../manifest.json';
import type {ActionNodeDefinition, NodeOption, Obj} from '../../public_api';
import type {RecipeOf} from './recipe-action.mjs';

export interface SkillActionInit<T extends object>
  extends Pick<ActionNodeDefinition<T>, | 'label' | 'options' | 'localID' | 'initOptions'>,
    Required<Pick<ActionNodeDefinition<T>, | 'category'>> {

  skillKey: string & TypedKeys<Game, Skill>;
}

export default abstract class SkillAction<T extends object, S extends GatheringSkill<any>>
  extends NamespacedObject
  implements ActionNodeDefinition<T> {

  /** @inheritDoc */
  public readonly category: string;

  public readonly initOptions?: () => Obj<any>;

  public readonly label: string;

  public readonly options?: NodeOption[];

  public readonly skill: S;

  public constructor({localID, label, category, options, initOptions, skillKey}: SkillActionInit<T>) {
    super({name: namespace}, localID);
    this.label = label;
    this.category = category;
    this.skill = game[skillKey] as any;
    if (options) {
      this.options = options;
    }

    if (initOptions) {
      this.initOptions = initOptions;
    }
  }

  /** @inheritDoc */
  public abstract execute(data: T): void | ObservableInput<void>;

  /** Throws on validation error */
  public checkRecipe(recipe: RecipeOf<S>): void {
    const skillLevel = this.skill.level;
    if (recipe.level > skillLevel) {
      throw new Error(`Level too low: ${skillLevel}/${recipe.level}`);
    }

    const shopReq = recipe.shopItemPurchased;
    if (shopReq && !game.shop.upgradesPurchased.get(shopReq)) {
      throw new Error(`Requirement not met: ${shopReq.name}`);
    }

    return recipe;
  }
}
