import type {Game, GatheringSkill, Skill} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import type {ObservableInput} from 'rxjs';
import {namespace} from '../../manifest.json';
import type {ActionNodeDefinition, NodeOption, Obj} from '../../public_api';
import type {RecipeOf} from './recipe-action.mjs';

export interface SkillActionInit<T extends object>
  extends Pick<ActionNodeDefinition<T>, | 'options' | 'localID' | 'initOptions'>,
    Partial<Pick<ActionNodeDefinition<T>, | 'media' | 'label'>>,
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

  public media: string;

  public constructor({localID, label, category, media, options, initOptions, skillKey}: SkillActionInit<T>) {
    super({name: namespace}, localID);
    this.category = category;
    this.skill = game[skillKey] as any;
    this.media = media ?? this.skill.media;
    this.label = label ?? this.skill.name;
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
    if (shopReq && !game.shop.getPurchaseCount(shopReq)) {
      throw new Error(`Requirement not met: ${shopReq.name}`);
    }

    return recipe;
  }
}
